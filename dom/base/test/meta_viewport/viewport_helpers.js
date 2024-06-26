function scaleRatio(scale) {
  return {
    set: [
      ["layout.css.devPixelsPerPx", "" + scale],
      ["dom.meta-viewport.enabled", true],
    ],
  };
}

function getViewportInfo(aDisplayWidth, aDisplayHeight) {
  let defaultZoom = {},
    allowZoom = {},
    minZoom = {},
    maxZoom = {},
    width = {},
    height = {},
    autoSize = {};

  let cwu = SpecialPowers.getDOMWindowUtils(window);
  cwu.getViewportInfo(
    aDisplayWidth,
    aDisplayHeight,
    defaultZoom,
    allowZoom,
    minZoom,
    maxZoom,
    width,
    height,
    autoSize
  );
  return {
    defaultZoom: defaultZoom.value,
    minZoom: minZoom.value,
    maxZoom: maxZoom.value,
    width: width.value,
    height: height.value,
    autoSize: autoSize.value,
    allowZoom: allowZoom.value,
  };
}

function fuzzeq(a, b, msg) {
  // eslint-disable-next-line mozilla/no-comparison-or-assignment-inside-ok
  ok(Math.abs(a - b) < 1e-6, msg);
}
