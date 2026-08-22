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
      var willOpen = !doc.documentElement.classList.contains("eq-nav-open");
      setOpen(willOpen);
      // .nav-links sits before .nav-toggle in the DOM, so a plain Tab from the
      // open drawer walked forward into the page body and skipped every link
      // in it. Move focus in explicitly, then hold it there.
      if (willOpen) {
        var first = links.querySelector("a, button, [tabindex]:not([tabindex='-1'])");
        if (first) first.focus();
      }
    });

    // Tab cycles within the open drawer rather than escaping into the page.
    links.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      if (!doc.documentElement.classList.contains("eq-nav-open")) return;
      var f = Array.prototype.filter.call(
        links.querySelectorAll("a, button, [tabindex]:not([tabindex='-1'])"),
        function (el) { return el.offsetParent !== null; }
      );
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); toggle.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); toggle.focus(); }
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

  /* ---- 2. Mega-menu state ---------------------------------------------------
     The five dropdown triggers are href="#" anchors whose menus open on CSS
     :focus-within. Nothing told assistive tech the menu existed or whether it
     was open, so 33 of ~45 destinations were invisible to a screen reader.
     The markup now carries role/aria-haspopup; this keeps aria-expanded true. */
  function initMegaAria() {
    doc.querySelectorAll(".nav-dropdown-wrap").forEach(function (wrap) {
      var trigger = wrap.querySelector(":scope > a");
      var mega = wrap.querySelector(".nav-mega");
      if (!trigger || !mega) return;
      if (!mega.id) mega.id = "eq-mega-" + Math.abs(
        (trigger.textContent || "menu").split("").reduce(function (a, c) {
          return ((a << 5) - a + c.charCodeAt(0)) | 0;
        }, 0)
      );
      trigger.setAttribute("aria-controls", mega.id);
      /* Set here rather than relying on the markup: the "AI lab" trigger wraps
         its label in <span class="keep-case">, so the pass that added these
         attributes statically matched only 4 of the 5 anchors. */
      if (!trigger.hasAttribute("role")) trigger.setAttribute("role", "button");
      if (!trigger.hasAttribute("aria-haspopup")) trigger.setAttribute("aria-haspopup", "true");
      if (!trigger.hasAttribute("aria-expanded")) trigger.setAttribute("aria-expanded", "false");

      /* The panel is absolutely positioned under its trigger and is a fixed
         720px wide, so the rightmost menus run off-screen on narrower desktops
         — measured 54px past the edge at 1024px. Which panel overflows depends
         on viewport width and how many items the nav has, so CSS cannot select
         it; it has to be measured. */
      function clamp() {
        mega.style.left = "";
        var cs = getComputedStyle(mega);
        var cur = parseFloat(cs.left);
        // The panel's containing block is not the dropdown wrapper, so its
        // rendered offset cannot be used as a `left` value. Shift the existing
        // computed left by a delta instead, and only when that left is a real
        // length — `auto` yields NaN and must be left alone rather than
        // coerced to 0, which threw panels hundreds of px off-screen.
        if (isNaN(cur)) return;
        var r = mega.getBoundingClientRect();
        var pad = 12;
        var overR = r.right - (window.innerWidth - pad);
        var overL = pad - r.left;
        var delta = 0;
        // Each correction is capped by the slack on the opposite edge, so
        // fixing one side can never push the other side out.
        if (overR > 0) delta = -Math.min(overR, Math.max(0, r.left - pad));
        else if (overL > 0) delta = Math.min(overL, Math.max(0, (window.innerWidth - pad) - r.right));
        if (delta !== 0) mega.style.left = (cur + delta) + "px";
      }
      clamp();
      var rt;
      window.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(clamp, 120);
      });

      function set(open) {
        if (open) clamp();
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
      }
      wrap.addEventListener("mouseenter", function () { set(true); });
      wrap.addEventListener("mouseleave", function () { set(false); });
      wrap.addEventListener("focusin", function () { set(true); });
      wrap.addEventListener("focusout", function (e) {
        if (!wrap.contains(e.relatedTarget)) set(false);
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          set(false);
          trigger.blur();
        }
      });
    });
  }

  /* ---- 2b. Marquee clones are duplicates, not content -----------------------
     Each track repeats its full logo set so the loop can be seamless. Both
     copies were exposed, so a screen reader read all 14 client names, then
     read the same 14 again. The visual loop is unaffected by hiding the clone. */
  function initMarquees() {
    doc.querySelectorAll(".marquee-track, .perf-mq-track, .agent-marquee-track")
      .forEach(function (track) {
        var kids = Array.prototype.slice.call(track.children);
        if (kids.length < 2 || kids.length % 2 !== 0) return;
        kids.slice(kids.length / 2).forEach(function (el) {
          el.setAttribute("aria-hidden", "true");
        });
      });
  }

  /* ---- 2b2. Gradient-clipped text -------------------------------------------
     Marks only the elements that genuinely clip their background to their
     glyphs. Anything else keeps its own `color`, because for those an
     unscoped background-image would paint a visible block behind the text
     rather than colour the letters. */
  function initGradientText() {
    doc.querySelectorAll(
      ".section-eyebrow, .arch-color-foundation, .arch-color-agents, " +
      ".arch-color-data-sources, .hero-eyebrow, .metric-number, .proof-text"
    ).forEach(function (el) {
      var cs = getComputedStyle(el);
      var clip = cs.webkitBackgroundClip || cs.backgroundClip;
      if (clip === "text" && cs.webkitTextFillColor === "rgba(0, 0, 0, 0)") {
        el.classList.add("eq-gradient-text");
      }
    });
  }

  /* ---- 2b3. Dark-ground detection -------------------------------------------
     Dark bands are named per page here — .newsletter-section, .videos-section,
     .final-cta-section and others — so no fixed class list finds them all.
     The darkened brand red is the right colour for a label on a light ground
     and the wrong one on a dark band, so the backdrop is measured instead of
     guessed, and the element is tagged for CSS to act on. */
  function initContrastContext() {
    function chan(v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    function lumOf(str) {
      var m = (str || "").match(/[\d.]+/g);
      if (!m || m.length < 3) return null;
      if (m[3] !== undefined && parseFloat(m[3]) < 0.9) return null;
      return 0.2126 * chan(+m[0]) + 0.7152 * chan(+m[1]) + 0.0722 * chan(+m[2]);
    }
    function backdrop(el) {
      var n = el.parentElement;
      while (n && n !== doc.documentElement) {
        var cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== "none") {
          var first = cs.backgroundImage.match(/rgba?\([^)]+\)|#[0-9a-f]{6}/i);
          if (first) {
            var l = first[0].charAt(0) === "#"
              ? 0.2126 * chan(parseInt(first[0].substr(1, 2), 16)) +
                0.7152 * chan(parseInt(first[0].substr(3, 2), 16)) +
                0.0722 * chan(parseInt(first[0].substr(5, 2), 16))
              : lumOf(first[0]);
            if (l !== null) return l;
          }
        }
        var s2 = lumOf(cs.backgroundColor);
        if (s2 !== null) return s2;
        n = n.parentElement;
      }
      return 1;
    }
    doc.querySelectorAll(".section-eyebrow, .hero-eyebrow, .pill, .tag, .proof-chip")
      .forEach(function (el) {
        if (backdrop(el) < 0.22) el.classList.add("eq-on-dark");
      });
  }

  /* ---- 2c. Tab semantics ----------------------------------------------------
     These are real <button> elements, which is right, but the selected one was
     marked only by an .active class. Nothing announced which panel was showing. */
  function initTabs() {
    [".persona-tabs", ".features-tabs", ".case-tabs", ".tabbar"].forEach(function (sel) {
      doc.querySelectorAll(sel).forEach(function (bar) {
        var tabs = bar.querySelectorAll("button");
        if (tabs.length < 2) return;
        bar.setAttribute("role", "tablist");
        tabs.forEach(function (t) {
          t.setAttribute("role", "tab");
          t.setAttribute("aria-selected", t.classList.contains("active") ? "true" : "false");
        });
        bar.addEventListener("click", function (e) {
          var hit = e.target.closest ? e.target.closest("button") : null;
          if (!hit) return;
          tabs.forEach(function (t) {
            t.setAttribute("aria-selected", t === hit ? "true" : "false");
          });
        });
      });
    });
  }

  /* ---- 2d. Scroll state -----------------------------------------------------
     Lets the navbar firm up once content is passing behind it, instead of
     floating at one opacity over both the hero and dense body copy. */
  function initScrollState() {
    var root = doc.documentElement;
    var ticking = false;
    function apply() {
      root.classList.toggle("eq-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }, { passive: true });
    apply();
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

    /* A sticky selection, so the graph can be read without holding focus.
       role="button" was already on these nodes but nothing was bound to it:
       Enter appeared to work only because focus had lit the node on the way
       in, and Space did nothing at all. */
    var pinned = null;
    function pin(id) {
      pinned = id;
      Object.keys(nodes).forEach(function (k) {
        nodes[k].setAttribute("aria-pressed", k === id ? "true" : "false");
      });
      if (id) lit(id); else clear();
    }

    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      n.setAttribute("aria-pressed", "false");
      n.addEventListener("mouseenter", function () { if (!pinned) lit(id); });
      n.addEventListener("focus", function () { if (!pinned) lit(id); });
      n.addEventListener("mouseleave", function () { if (!pinned) clear(); });
      n.addEventListener("blur", function () { if (!pinned) clear(); });
      n.addEventListener("click", function () { pin(pinned === id ? null : id); });
      n.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          pin(pinned === id ? null : id);
        } else if (e.key === "Escape" && pinned) {
          e.preventDefault();
          pin(null);
        }
      });
    });
    root.addEventListener("mouseleave", function () { if (!pinned) clear(); });

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
    if (!doc.querySelector(".coach-demo, .ww-demo, .dia-demo")) return;

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
      "</filter>";

    doc.body.appendChild(svg);
  }

  function boot() {
    try { injectGlassFilter(); } catch (e) {}
    try { initNav(); } catch (e) {}
    try { initMegaAria(); } catch (e) {}
    try { initMarquees(); } catch (e) {}
    try { initGradientText(); } catch (e) {}
    try { initContrastContext(); } catch (e) {}
    try { initTabs(); } catch (e) {}
    try { initScrollState(); } catch (e) {}
    try { initVisibility(); } catch (e) {}
    try { initStrataGraph(); } catch (e) {}
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
