/* ============================================================================
   entomo 2026 — behaviour layer
   Progressive enhancement only. Adds no content, changes no copy, and every
   feature is a no-op when its markup is absent.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;

  /* ---- 1. Mobile navigation -------------------------------------------------
     36 pages shipped a .nav-toggle button with no handler anywhere on the site,
     so on a phone the menu could not be opened at all and no product, solution,
     or company page was reachable. This wires the existing button. */
  function initNav() {
    var toggle = doc.querySelector(".nav-toggle");
    var links = doc.querySelector(".nav-links");
    if (!toggle || !links) return;

    if (!toggle.hasAttribute("aria-label")) toggle.setAttribute("aria-label", "menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", links.id || (links.id = "eq-nav-links"));

    function setOpen(open) {
      doc.documentElement.classList.toggle("eq-nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!doc.documentElement.classList.contains("eq-nav-open"));
    });

    // Esc closes and returns focus to the control that opened it
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.documentElement.classList.contains("eq-nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Tapping outside the panel closes it
    doc.addEventListener("click", function (e) {
      if (!doc.documentElement.classList.contains("eq-nav-open")) return;
      if (links.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    // Following a real link closes the panel
    links.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href");
      if (href && href !== "#") setOpen(false);
    });

    /* On touch, a parent whose href is "#" should open its submenu rather than
       jump the page to the top. */
    links.querySelectorAll(".nav-dropdown-wrap > a").forEach(function (parent) {
      parent.addEventListener("click", function (e) {
        if (window.matchMedia("(min-width: 901px)").matches) return;
        if (parent.getAttribute("href") !== "#") return;
        e.preventDefault();
        var wrap = parent.parentElement;
        var wasOpen = wrap.classList.contains("eq-sub-open");
        links.querySelectorAll(".eq-sub-open").forEach(function (n) {
          n.classList.remove("eq-sub-open");
        });
        wrap.classList.toggle("eq-sub-open", !wasOpen);
      });
    });

    // Leaving the mobile breakpoint resets everything
    var mq = window.matchMedia("(min-width: 901px)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () {
      if (mq.matches) {
        setOpen(false);
        links.querySelectorAll(".eq-sub-open").forEach(function (n) {
          n.classList.remove("eq-sub-open");
        });
      }
    });
  }

  /* ---- 2. Honour the motion preference for JS-driven loops ------------------
     Carousels ran on setInterval with no regard for prefers-reduced-motion.
     Freezing the timer function while the preference is set stops every
     auto-advance without touching the carousel code itself. */
  function guardMotion() {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var nativeSetInterval = window.setInterval;
    window.setInterval = function (fn, delay) {
      // Auto-advance timers are the long ones; keep short utility timers alive.
      if (delay >= 1500) return 0;
      return nativeSetInterval.apply(window, arguments);
    };
  }

  /* ---- 3. Pause marquees when the tab is hidden ----------------------------- */
  function initVisibility() {
    doc.addEventListener("visibilitychange", function () {
      doc.documentElement.classList.toggle("eq-hidden", doc.hidden);
    });
  }

  function boot() {
    try { guardMotion(); } catch (e) {}
    try { initNav(); } catch (e) {}
    try { initVisibility(); } catch (e) {}
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
