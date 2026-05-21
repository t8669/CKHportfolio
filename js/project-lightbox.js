/**
 * 專案案例頁 Lightbox。請在各頁載入前設定 window.lbImages：
 * [{ src: string|null, alt: string }, ...]
 */
(function () {
  var lbCurrent = 0;

  function openLightbox(startIndex) {
    lbCurrent = startIndex || 0;
    lbShow();
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      var btn = document.querySelector(".lb-close");
      if (btn) btn.focus();
    }, 50);
  }

  function lbShow() {
    var images = window.lbImages || [];
    var overlay = document.getElementById("lightbox");
    var imgEl = document.getElementById("lb-image");
    var counter = document.getElementById("lb-counter");
    if (!overlay || !imgEl) return;
    var item = images[lbCurrent];
    if (item && item.src) {
      imgEl.src = item.src;
      imgEl.alt = item.alt || "";
      imgEl.style.display = "block";
    } else {
      imgEl.style.display = "none";
    }
    if (counter) counter.textContent = lbCurrent + 1 + " / " + images.length;
    overlay.removeAttribute("hidden");
  }

  function lbNavigate(direction) {
    var images = window.lbImages || [];
    lbCurrent = (lbCurrent + direction + images.length) % images.length;
    lbShow();
  }

  function closeLightbox() {
    var el = document.getElementById("lightbox");
    if (el) el.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  window.openLightbox = openLightbox;
  window.lbNavigate = lbNavigate;
  window.closeLightbox = closeLightbox;

  document.addEventListener("keydown", function (e) {
    var box = document.getElementById("lightbox");
    if (!box || box.hasAttribute("hidden")) return;
    if (e.key === "ArrowLeft") lbNavigate(-1);
    if (e.key === "ArrowRight") lbNavigate(1);
    if (e.key === "Escape") closeLightbox();
  });
})();
