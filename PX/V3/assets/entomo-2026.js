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

  /* ---- 4. The strata graph --------------------------------------------------
     Draws Role -> Responsibility -> Task -> KPI -> Skill as a real connected
     graph. Paths are computed from measured node positions rather than
     hard-coded, so wrapping, zoom, and reflow cannot desynchronise them. */
  function initStrataGraph() {
    var root = doc.querySelector("[data-strata-graph]");
    if (!root) return;

    var svg = root.querySelector(".sg-links");
    var nodes = {};
    root.querySelectorAll(".sg-node").forEach(function (n, i) {
      nodes[n.getAttribute("data-node")] = n;
      n.style.setProperty("--sg-i", i);
    });

    var edges = (root.getAttribute("data-edges") || "")
      .split(",")
      .map(function (pair) {
        var s = pair.split(">");
        return { from: s[0], to: s[1] };
      })
      .filter(function (e) { return nodes[e.from] && nodes[e.to]; });

    var paths = [];

    function draw() {
      var box = root.getBoundingClientRect();
      if (!box.width) return;
      svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      paths = [];

      edges.forEach(function (e) {
        var a = nodes[e.from].getBoundingClientRect();
        var b = nodes[e.to].getBoundingClientRect();
        // exit the right edge of the source, enter the left edge of the target
        var x1 = a.right - box.left, y1 = a.top - box.top + a.height / 2;
        var x2 = b.left - box.left,  y2 = b.top - box.top + b.height / 2;
        var dx = Math.max(28, (x2 - x1) * 0.5);
        var d = "M" + x1 + "," + y1 +
                " C" + (x1 + dx) + "," + y1 +
                " " + (x2 - dx) + "," + y2 +
                " " + x2 + "," + y2;

        var path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("class", "sg-link");
        path.dataset.from = e.from;
        path.dataset.to = e.to;
        svg.appendChild(path);
        try {
          var len = path.getTotalLength();
          path.style.setProperty("--len", len);
        } catch (err) {}
        paths.push(path);
      });
    }

    /* Light the full chain through a node, in both directions. This is the
       whole point of the component: one click proves the model is connected. */
    function lit(id) {
      /* Directed on purpose. A naive both-ways flood would light the entire
         component (every node is reachable from every other), which shows
         nothing. Walking upstream and downstream separately traces the actual
         chain this node sits on. */
      var keep = {};
      keep[id] = true;

      var frontier = [id], changed = true;
      while (changed) {                       // downstream: follow edges forward
        changed = false;
        edges.forEach(function (e) {
          if (keep[e.from] && !keep[e.to]) { keep[e.to] = true; changed = true; }
        });
      }
      var up = {};
      up[id] = true;
      changed = true;
      while (changed) {                       // upstream: follow edges backward
        changed = false;
        edges.forEach(function (e) {
          if (up[e.to] && !up[e.from]) { up[e.from] = true; changed = true; }
        });
      }
      Object.keys(up).forEach(function (k) { keep[k] = true; });
      root.classList.add("is-focused");
      Object.keys(nodes).forEach(function (k) {
        nodes[k].classList.toggle("is-lit", !!keep[k]);
      });
      paths.forEach(function (p) {
        p.classList.toggle("is-lit", !!(keep[p.dataset.from] && keep[p.dataset.to]));
      });
    }

    function clear() {
      root.classList.remove("is-focused");
      Object.keys(nodes).forEach(function (k) { nodes[k].classList.remove("is-lit"); });
      paths.forEach(function (p) { p.classList.remove("is-lit"); });
    }

    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      n.addEventListener("mouseenter", function () { lit(id); });
      n.addEventListener("focus", function () { lit(id); });
      n.addEventListener("mouseleave", clear);
      n.addEventListener("blur", clear);
    });
    root.addEventListener("mouseleave", clear);

    draw();
    // Fonts land after first paint and change node heights; redraw when they do.
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(draw).catch(function () {});

    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(draw, 140);
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          draw();
          root.classList.add("is-drawn");
          obs.disconnect();
        });
      }, { threshold: 0.18 }).observe(root);
    } else {
      root.classList.add("is-drawn");
    }
  }

  /* ---- 5. Liquid Glass displacement filter ----------------------------------
     Apple's Liquid Glass refracts rather than merely blurring. Only Chrome can
     run an SVG filter as part of backdrop-filter, so this injects the
     displacement pass the CSS opts into; every other browser keeps the
     pure-CSS lens (sheen, rim, chromatic fringe) and simply skips the bend. */
  function injectGlassFilter() {
    if (doc.getElementById("eq-lg-defs")) return;
    if (!doc.querySelector(".coach-demo, .ww-demo, .dia-demo, .sss-svg")) return;

    var NS = "http://www.w3.org/2000/svg";
    var svg = doc.createElementNS(NS, "svg");
    svg.setAttribute("id", "eq-lg-defs");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";

    // Low-frequency fractal noise, softened, drives a gentle displacement.
    // R drives X and G drives Y; 128 is the neutral value in that encoding.
    svg.innerHTML =
      '<filter id="eq-liquid" x="-25%" y="-25%" width="150%" height="150%" ' +
      'color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.005 0.009" ' +
          'numOctaves="2" seed="11" result="noise"/>' +
        '<feGaussianBlur in="noise" stdDeviation="1.8" result="soft"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="soft" scale="11" ' +
          'xChannelSelector="R" yChannelSelector="G"/>' +
      "</filter>" +
      /* Gradients for the inline SVG product mockups (ask / shape / scale).
         Those are drawn as SVG with flat hardcoded fills, so CSS repoints
         their fill at these instead — same material language as the HTML
         widgets, expressed in the only way SVG allows. */
      "<defs>" +
        /* userSpaceOnUse is load-bearing. The title bar is TWO overlapping
           rects - a rounded one plus a square one that flattens the bottom
           corners. With the default objectBoundingBox each rect gets its own
           gradient box, so the ramp restarts at y=14 and draws a bright seam
           across the bar. Mapping both to the same absolute 0->40 span makes
           the fill continuous. All three mockups share this geometry. */
        '<linearGradient id="eq-sss-bar" gradientUnits="userSpaceOnUse" ' +
          'x1="0" y1="0" x2="0" y2="40">' +
          '<stop offset="0%"   stop-color="#39424f"/>' +
          '<stop offset="45%"  stop-color="#242b35"/>' +
          '<stop offset="100%" stop-color="#1a1f26"/>' +
        "</linearGradient>" +
        '<linearGradient id="eq-sss-body" gradientUnits="userSpaceOnUse" ' +
          'x1="0" y1="0" x2="0" y2="280">' +
          '<stop offset="0%"   stop-color="#ffffff"/>' +
          '<stop offset="100%" stop-color="#f5f8fc"/>' +
        "</linearGradient>" +
        '<linearGradient id="eq-sss-panel" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%"   stop-color="#ffffff"/>' +
          '<stop offset="100%" stop-color="#fafbfd"/>' +
        "</linearGradient>" +
      "</defs>";

    doc.body.appendChild(svg);
  }

  function boot() {
    try { guardMotion(); } catch (e) {}
    try { injectGlassFilter(); } catch (e) {}
    try { initNav(); } catch (e) {}
    try { initVisibility(); } catch (e) {}
    try { initStrataGraph(); } catch (e) {}
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
