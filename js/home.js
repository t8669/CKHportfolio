/**
 * showPage(pageId)
 * 切換顯示的頁面，更新 nav pill active 狀態
 * @param {string} pageId - 'about' | 'work' | 'project'
 */
var CURRENT_PAGE_ID = "about";

function showPage(pageId) {
  var fromId = CURRENT_PAGE_ID;
  if (fromId === pageId) {
    updateNavIndicator();
    return;
  }

  // ──────────────────────────────────────────
  // 切頁動畫參數（想調手感只改這裡）
  // - X 位移距離：about → work 時 about 往 -X，work 從 +X 進來（反向亦然）
  // - SCALE_MIN：你提到的 0.985 縮放就在這個變數（覺得怪可直接改成 1）
  // ──────────────────────────────────────────
  var TRANSITION_X_PX = 300;
  var SCALE_MIN = 0.5; // ← 保留的縮放參數（要拿掉就改成 1）
  var DURATION_MS = 700;
  var EASING = "cubic-bezier(0.2, 0.9, 0.2, 1)";

  var fromPage = document.getElementById("page-" + fromId);
  var toPage = document.getElementById("page-" + pageId);
  if (!toPage) {
    return;
  }

  document.querySelectorAll(".nav-pill").forEach(function (pill) {
    pill.classList.remove("active");
  });

  var activePill = document.getElementById("nav-" + pageId);
  if (activePill) {
    activePill.classList.add("active");
  }

  var breadcrumb = document.getElementById("nav-breadcrumb");
  if (breadcrumb) {
    if (pageId === "project") {
      breadcrumb.style.display = "inline-flex";
    } else {
      breadcrumb.style.display = "none";
    }
  }

  updateNavIndicator();

  // 切頁時先回頂，避免動畫時捲動干擾
  window.scrollTo({ top: 0, behavior: "auto" });

  // Reduced motion：直接切換
  if (prefersReducedMotion()) {
    if (fromPage) fromPage.classList.remove("active");
    toPage.classList.add("active");
    CURRENT_PAGE_ID = pageId;
    return;
  }

  // 方向：about -> work 向左；work -> about 向右（其餘 fallback）
  var dir = 0;
  if (fromId === "about" && pageId === "work") dir = -1;
  else if (fromId === "work" && pageId === "about") dir = 1;
  else dir = -1;

  // 準備目標頁可見以便動畫（但先保持透明）
  toPage.style.display = "block";
  toPage.style.opacity = "0";
  toPage.style.transform =
    "translateX(" + -dir * TRANSITION_X_PX + "px) scale(" + SCALE_MIN + ")";

  // 出場頁面：用 absolute 疊在上面，避免影響新頁布局
  if (fromPage) {
    fromPage.style.position = "absolute";
    fromPage.style.left = "0";
    fromPage.style.right = "0";
    fromPage.style.top = "0";
    fromPage.style.width = "100%";
  }

  var outAnim = fromPage
    ? fromPage.animate(
        [
          { opacity: 1, transform: "translateX(0px) scale(1)" },
          {
            opacity: 0,
            transform:
              "translateX(" +
              dir * TRANSITION_X_PX +
              "px) scale(" +
              SCALE_MIN +
              ")",
          },
        ],
        { duration: DURATION_MS, easing: EASING, fill: "forwards" }
      )
    : null;

  var inAnim = toPage.animate(
    [
      {
        opacity: 0,
        transform:
          "translateX(" +
          -dir * TRANSITION_X_PX +
          "px) scale(" +
          SCALE_MIN +
          ")",
      },
      { opacity: 1, transform: "translateX(0px) scale(1)" },
    ],
    { duration: DURATION_MS, easing: EASING, fill: "forwards" }
  );

  function cleanup() {
    if (fromPage) {
      fromPage.classList.remove("active");
      fromPage.style.display = "none";
      fromPage.style.position = "";
      fromPage.style.left = "";
      fromPage.style.right = "";
      fromPage.style.top = "";
      fromPage.style.width = "";
      fromPage.getAnimations().forEach(function (a) {
        a.cancel();
      });
    }

    toPage.classList.add("active");
    toPage.style.display = "";
    toPage.style.opacity = "";
    toPage.style.transform = "";
    toPage.getAnimations().forEach(function (a) {
      a.cancel();
    });

    CURRENT_PAGE_ID = pageId;
  }

  var doneCount = 0;
  function markDone() {
    doneCount += 1;
    if (doneCount >= (outAnim ? 2 : 1)) cleanup();
  }

  if (outAnim) outAnim.addEventListener("finish", markDone);
  inAnim.addEventListener("finish", markDone);
}

function updateNavIndicator() {
  var group = document.querySelector(".nav-pill-group");
  if (!group) return;
  var indicator = group.querySelector(".nav-indicator");
  if (!indicator) return;

  var active = group.querySelector(".nav-pill.active");
  if (!active) return;

  // 使用 offsetLeft/offsetWidth（以 .nav-pill-group 為座標系）
  // 可避免 getBoundingClientRect 在 border/padding/sub-pixel 下造成左右不對稱
  var left = active.offsetLeft;
  var width = active.offsetWidth;

  // rAF 確保讀寫分離，動畫更順
  window.requestAnimationFrame(function () {
    indicator.style.width = width + "px";
    indicator.style.transform = "translate3d(" + left + "px, 0, 0)";
  });
}

/**
 * setBreadcrumb(title)
 * @param {string} title - 作品名稱
 */
function setBreadcrumb(title) {
  var breadcrumb = document.getElementById("nav-breadcrumb");
  if (breadcrumb) {
    breadcrumb.textContent = title;
  }
}

/* ─── About 頁：打字機 token（順序與空白需與原版程式碼區塊一致） ─── */
var PROFILE_PARTS = [
  { t: "// developer profile\n", c: "code-comment" },
  { t: "const", c: "code-key" },
  { t: " developer = {\n  ", c: null },
  { t: "name:", c: "code-key" },
  { t: "  ", c: null },
  { t: '"Chan Kwok Hin"', c: "code-string" },
  { t: ",\n  ", c: null },
  { t: "role:", c: "code-key" },
  { t: "  ", c: null },
  { t: '"Interactive Media Dev"', c: "code-string" },
  { t: ",\n  ", c: null },
  { t: "skills:", c: "code-key" },
  { t: " [\n    ", c: null },
  { t: '"Frontend Engineering"', c: "code-string" },
  { t: ",\n    ", c: null },
  { t: '"Hardware Prototyping"', c: "code-string" },
  { t: ",\n    ", c: null },
  { t: '"Game Development"', c: "code-string" },
  { t: ",\n    ", c: null },
  { t: '"Creative Coding"', c: "code-string" },
  { t: "\n  ],\n  ", c: null },
  { t: "status:", c: "code-key" },
  { t: " ", c: null },
  { t: '"Building the future"', c: "code-status" },
  { t: "\n};", c: null },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fillProfileCodeInstant(codeEl) {
  codeEl.textContent = "";
  PROFILE_PARTS.forEach(function (part) {
    if (part.c) {
      var span = document.createElement("span");
      span.className = part.c;
      span.textContent = part.t;
      codeEl.appendChild(span);
    } else {
      codeEl.appendChild(document.createTextNode(part.t));
    }
  });
}

var CODE_RESTART_DELAY_MS = 5000;

function computeProfileFinalBlockHeight(codeBlock) {
  // 用「隱形完整文字」先撐出最終高度，再鎖定 min-height，避免打字時框高逐步增加
  var measurePre = document.createElement("pre");
  var measureCode = document.createElement("code");
  measurePre.style.visibility = "hidden";
  measurePre.style.pointerEvents = "none";
  measurePre.style.margin = "0";
  measurePre.setAttribute("aria-hidden", "true");

  fillProfileCodeInstant(measureCode);
  measurePre.appendChild(measureCode);
  codeBlock.appendChild(measurePre);

  var h = Math.ceil(codeBlock.getBoundingClientRect().height);
  codeBlock.removeChild(measurePre);
  return h;
}

function runProfileTypewriter(codeEl, onComplete) {
  var block = document.getElementById("profile-code-block");
  if (block) {
    block.classList.add("code-block--typing");
    block.setAttribute("aria-busy", "true");
  }

  var partIndex = 0;
  var charIndex = 0;
  var currentSpan = null;
  var delayMs = 13;

  function finish() {
    if (block) {
      block.classList.remove("code-block--typing");
      block.setAttribute("aria-busy", "false");
    }
    if (onComplete) {
      onComplete();
    }
  }

  function tick() {
    if (partIndex >= PROFILE_PARTS.length) {
      finish();
      return;
    }

    var part = PROFILE_PARTS[partIndex];
    var text = part.t;

    if (charIndex === 0) {
      if (part.c) {
        currentSpan = document.createElement("span");
        currentSpan.className = part.c;
        codeEl.appendChild(currentSpan);
      } else {
        currentSpan = null;
      }
    }

    if (charIndex < text.length) {
      var ch = text.charAt(charIndex);
      if (currentSpan) {
        currentSpan.appendChild(document.createTextNode(ch));
      } else {
        codeEl.appendChild(document.createTextNode(ch));
      }
      charIndex += 1;
      window.setTimeout(tick, delayMs);
    } else {
      partIndex += 1;
      charIndex = 0;
      currentSpan = null;
      window.setTimeout(tick, 0);
    }
  }

  tick();
}

function loopProfileCode(codeEl) {
  var codeBlock = document.getElementById("profile-code-block");

  function afterPauseRestart() {
    window.setTimeout(function () {
      codeEl.textContent = "";
      loopProfileCode(codeEl);
    }, CODE_RESTART_DELAY_MS);
  }

  if (prefersReducedMotion()) {
    fillProfileCodeInstant(codeEl);
    if (codeBlock) {
      codeBlock.setAttribute("aria-busy", "false");
    }
    afterPauseRestart();
    return;
  }

  runProfileTypewriter(codeEl, afterPauseRestart);
}

var EMAIL_CTA_COPY_RESET_MS = 2200;

function copyTextWithLegacy(text) {
  return new Promise(function (resolve, reject) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "2em";
    textarea.style.height = "2em";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    try {
      var ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (ok) {
        resolve();
      } else {
        reject(new Error("copy failed"));
      }
    } catch (err) {
      if (textarea.parentNode) {
        document.body.removeChild(textarea);
      }
      reject(err);
    }
  });
}

function copyTextToClipboard(text) {
  /* file:// 等非安全環境：clipboard API 存在但會 reject，需 fallback */
  if (window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(function () {
      return copyTextWithLegacy(text);
    });
  }
  return copyTextWithLegacy(text);
}

function initEmailCtaBanner() {
  var copyBtn = document.querySelector(".cta-banner__copy-btn[data-email]");
  if (!copyBtn) {
    return;
  }

  var banner = copyBtn.closest(".cta-banner");
  var email = copyBtn.getAttribute("data-email");
  var hint = banner ? banner.querySelector(".cta-banner__hint") : null;
  var defaultHint = hint ? hint.textContent : "Click the copy button";
  var defaultAria = copyBtn.getAttribute("aria-label") || "Copy email to clipboard";
  var resetTimer = null;

  function setCopiedState(on) {
    copyBtn.classList.toggle("cta-banner__copy-btn--copied", on);
    if (banner) {
      banner.classList.toggle("cta-banner--copied", on);
    }
    if (hint) {
      hint.textContent = on ? "Copied to clipboard" : defaultHint;
    }
    copyBtn.setAttribute(
      "aria-label",
      on ? "Email copied to clipboard" : defaultAria
    );
  }

  function handleCopy(event) {
    event.stopPropagation();
    copyTextToClipboard(email)
      .then(function () {
        setCopiedState(true);
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          setCopiedState(false);
        }, EMAIL_CTA_COPY_RESET_MS);
      })
      .catch(function () {
        if (hint) {
          hint.textContent = "Copy failed — select email manually";
        }
      });
  }

  copyBtn.addEventListener("click", handleCopy);
}

function initAboutAnimations() {
  var tagline = document.querySelector(".tagline-banner");
  if (tagline && prefersReducedMotion()) {
    tagline.classList.add("tagline-banner--visible");
  } else if (tagline) {
    var tagObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tagline.classList.add("tagline-banner--visible");
            tagObs.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    tagObs.observe(tagline);
  }

  var codeBlock = document.getElementById("profile-code-block");
  var codeEl = document.getElementById("profile-code");
  if (!codeBlock || !codeEl) {
    return;
  }

  function lockCodeBlockHeight() {
    var h = computeProfileFinalBlockHeight(codeBlock);
    if (h > 0) {
      codeBlock.style.minHeight = h + "px";
    }
  }

  // 等字體載入後再量測，避免可變字體載入導致高度變動
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(lockCodeBlockHeight).catch(lockCodeBlockHeight);
  } else {
    // 後備：下一個 tick 量測一次
    window.setTimeout(lockCodeBlockHeight, 0);
  }

  var started = false;

  function startCodeAnimation() {
    if (started) {
      return;
    }
    started = true;
    loopProfileCode(codeEl);
  }

  if (prefersReducedMotion()) {
    startCodeAnimation();
    return;
  }

  var codeObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startCodeAnimation();
          codeObs.disconnect();
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  codeObs.observe(codeBlock);

  // 初始 indicator 定位（以及載入時 Active pill 尺寸已就緒）
  updateNavIndicator();
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(updateNavIndicator, 80);
  });
}

/* URL Hash：index.html#work 直接開啟 My Work */
(function () {
  var hash = window.location.hash.replace("#", "");
  if (hash === "work") {
    showPage("work");
  } else {
    showPage("about");
  }
})();

(function () {
  function initHome() {
    initEmailCtaBanner();
    initAboutAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHome);
  } else {
    initHome();
  }
})();
