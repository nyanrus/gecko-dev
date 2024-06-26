/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

/**
 * Tests that we use the correct snapshot aggregate value
 * in `utils.getSnapshotTotals(snapshot)`
 */

const {
  censusDisplays,
  viewState,
  censusState,
} = require("resource://devtools/client/memory/constants.js");
const {
  getSnapshotTotals,
} = require("resource://devtools/client/memory/utils.js");
const {
  takeSnapshotAndCensus,
} = require("resource://devtools/client/memory/actions/snapshot.js");
const {
  setCensusDisplayAndRefresh,
} = require("resource://devtools/client/memory/actions/census-display.js");
const {
  changeView,
} = require("resource://devtools/client/memory/actions/view.js");

add_task(async function () {
  const front = new StubbedMemoryFront();
  const heapWorker = new HeapAnalysesClient();
  await front.attach();
  const store = Store();
  const { getState, dispatch } = store;

  dispatch(changeView(viewState.CENSUS));

  await dispatch(
    setCensusDisplayAndRefresh(heapWorker, censusDisplays.allocationStack)
  );

  dispatch(takeSnapshotAndCensus(front, heapWorker));
  await waitUntilCensusState(store, s => s.census, [censusState.SAVED]);

  ok(
    !getState().snapshots[0].census.display.inverted,
    "Snapshot is not inverted"
  );

  const census = getState().snapshots[0].census;
  let result = aggregate(census.report);
  const totalBytes = result.bytes;
  const totalCount = result.count;

  Assert.greater(totalBytes, 0, "counted up bytes in the census");
  Assert.greater(totalCount, 0, "counted up count in the census");

  result = getSnapshotTotals(getState().snapshots[0].census);
  equal(
    totalBytes,
    result.bytes,
    "getSnapshotTotals reuslted in correct bytes"
  );
  equal(
    totalCount,
    result.count,
    "getSnapshotTotals reuslted in correct count"
  );

  dispatch(
    setCensusDisplayAndRefresh(
      heapWorker,
      censusDisplays.invertedAllocationStack
    )
  );

  await waitUntilCensusState(store, s => s.census, [censusState.SAVING]);
  await waitUntilCensusState(store, s => s.census, [censusState.SAVED]);
  ok(getState().snapshots[0].census.display.inverted, "Snapshot is inverted");

  result = getSnapshotTotals(getState().snapshots[0].census);
  equal(
    totalBytes,
    result.bytes,
    "getSnapshotTotals reuslted in correct bytes when inverted"
  );
  equal(
    totalCount,
    result.count,
    "getSnapshotTotals reuslted in correct count when inverted"
  );
});

function aggregate(report) {
  let totalBytes = report.bytes;
  let totalCount = report.count;
  for (const child of report.children || []) {
    const { bytes, count } = aggregate(child);
    totalBytes += bytes;
    totalCount += count;
  }
  return { bytes: totalBytes, count: totalCount };
}
