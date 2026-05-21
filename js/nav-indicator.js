/**
 * 專案內頁等：將 .nav-indicator 對齊到 .nav-pill-group 內的 .nav-pill.active
 *（與 index 的 home.js 邏輯一致；首頁仍由 home.js 負責）
 */
function updateNavIndicator() {
  var group = document.querySelector(".nav-pill-group");
  if (!group) return;
  var indicator = group.querySelector(".nav-indicator");
  if (!indicator) return;
  var active = group.querySelector(".nav-pill.active");
  if (!active) return;

  var left = active.offsetLeft;
  var width = active.offsetWidth;

  window.requestAnimationFrame(function () {
    indicator.style.width = width + "px";
    indicator.style.transform = "translate3d(" + left + "px, 0, 0)";
  });
}

function initNavIndicator() {
  updateNavIndicator();

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(updateNavIndicator, 80);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateNavIndicator).catch(updateNavIndicator);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavIndicator);
} else {
  initNavIndicator();
}
