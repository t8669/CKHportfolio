/**
 * 專案內頁 Meta Bottom Sheet（≤768px）：peek 列展開／收起。
 */
(function () {
  var MOBILE_MQ = window.matchMedia("(max-width: 768px)");
  var SCROLL_CLOSE_THRESHOLD = 48;
  var SWIPE_CLOSE_THRESHOLD = 40;

  var root = null;
  var toggle = null;
  var panel = null;
  var scrim = null;
  var expanded = false;
  var touchStartY = 0;
  var lastScrollY = 0;

  function isMobile() {
    return MOBILE_MQ.matches;
  }

  function firstFocusableInPanel() {
    if (!panel) return null;
    return panel.querySelector(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function open() {
    if (!isMobile() || expanded) return;
    expanded = true;
    root.classList.add("is-meta-expanded");
    toggle.setAttribute("aria-expanded", "true");
    panel.removeAttribute("hidden");
    scrim.removeAttribute("hidden");
    scrim.setAttribute("aria-hidden", "false");
    lastScrollY = window.scrollY;
    var focusTarget = firstFocusableInPanel();
    if (focusTarget) {
      setTimeout(function () {
        focusTarget.focus();
      }, 50);
    }
  }

  function close() {
    if (!expanded) return;
    expanded = false;
    root.classList.remove("is-meta-expanded");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("hidden", "");
    scrim.setAttribute("hidden", "");
    scrim.setAttribute("aria-hidden", "true");
    toggle.focus();
  }

  function onToggleClick() {
    if (!isMobile()) return;
    if (expanded) close();
    else open();
  }

  function onScrimClick() {
    close();
  }

  function onKeyDown(event) {
    if (event.key === "Escape" && expanded) {
      event.preventDefault();
      close();
    }
  }

  function onTouchStart(event) {
    if (!expanded || !toggle.contains(event.target)) return;
    touchStartY = event.touches[0].clientY;
  }

  function onTouchEnd(event) {
    if (!expanded || touchStartY === 0) return;
    var endY = event.changedTouches[0].clientY;
    if (endY - touchStartY > SWIPE_CLOSE_THRESHOLD) close();
    touchStartY = 0;
  }

  function onScroll() {
    if (!expanded || !isMobile()) return;
    var delta = window.scrollY - lastScrollY;
    if (delta > SCROLL_CLOSE_THRESHOLD) close();
    lastScrollY = window.scrollY;
  }

  function applyDesktopState() {
    root.classList.remove("is-meta-expanded");
    toggle.setAttribute("aria-expanded", "false");
    panel.removeAttribute("hidden");
    scrim.setAttribute("hidden", "");
    scrim.setAttribute("aria-hidden", "true");
    expanded = false;
  }

  function applyMobileState() {
    if (!expanded) {
      panel.setAttribute("hidden", "");
      scrim.setAttribute("hidden", "");
      scrim.setAttribute("aria-hidden", "true");
    }
  }

  function onMediaChange() {
    if (isMobile()) applyMobileState();
    else applyDesktopState();
  }

  function init() {
    root = document.getElementById("project-meta-card");
    if (!root) return;

    toggle = root.querySelector(".meta-sheet-toggle");
    panel = document.getElementById("meta-sheet-panel");
    scrim = root.querySelector(".meta-sheet-scrim");
    if (!toggle || !panel || !scrim) return;

    toggle.addEventListener("click", onToggleClick);
    scrim.addEventListener("click", onScrimClick);
    document.addEventListener("keydown", onKeyDown);
    toggle.addEventListener("touchstart", onTouchStart, { passive: true });
    toggle.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    if (typeof MOBILE_MQ.addEventListener === "function") {
      MOBILE_MQ.addEventListener("change", onMediaChange);
    } else if (typeof MOBILE_MQ.addListener === "function") {
      MOBILE_MQ.addListener(onMediaChange);
    }

    if (isMobile()) applyMobileState();
    else applyDesktopState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
