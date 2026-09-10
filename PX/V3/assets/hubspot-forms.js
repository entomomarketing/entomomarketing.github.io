/* entomo website forms -> HubSpot (hub 1750400, na2 data centre). One script for every form.
   A form opts in with data-hs-form="<intent>" (demo, contact, content_download, partner,
   community, subscribe). Its named fields carry HubSpot internal property names; any
   data-hs-field-<name>="value" attribute is sent as a hidden field; <template class="hs-success">
   is the success state (replaces the form's content), or data-hs-done="text" swaps the button
   label. Fields left empty are not sent; checkbox groups are joined with ";" as HubSpot expects. */
(function () {
  "use strict";
  var HUB = "1750400";
  var API = "https://api-na2.hsforms.com/submissions/v3/integration/submit/" + HUB + "/";
  var FORMS = {
    demo: "8327010b-3d79-4d9b-9217-3c35cf3c17fc",
    contact: "d4c4678c-6433-4d38-adde-b3f5a2807d98",
    content_download: "51dcf1de-4c4d-47b5-aad1-453081cf9be3",
    partner: "944c585f-ff16-4d54-bcc7-6d1271880eb0",
    community: "511fca21-ea41-4632-8710-179f7c624764",
    subscribe: "c646538e-9aa6-4416-87a0-7062478244d7"
  };
  var HONEYPOT = "hs_website";            // bots fill it, people never see it
  var FALLBACK = "info@entomo.co";        // offered when a submission cannot be sent
  var REMEMBER = "entomo-hs-contact";     // localStorage: details from one form prefill the next download form
  var REMEMBER_FIELDS = ["firstname", "lastname", "email", "company", "jobtitle"];
  var REMEMBER_DAYS = 30;

  function cookie(name) {
    var m = document.cookie.match("(?:^|; )" + name + "=([^;]*)");
    return m ? decodeURIComponent(m[1]) : "";
  }

  function fields(form) {
    var out = {}, order = [];
    function add(name, value) {
      if (!name || name === HONEYPOT) return;
      value = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
      if (!value) return;
      if (name in out) out[name] += ";" + value; else { out[name] = value; order.push(name); }
    }
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if (el.type === "submit" || el.type === "button" || el.type === "reset") return;
      if (el.type === "checkbox" || el.type === "radio") { if (el.checked) add(el.name, el.value); return; }
      if (el.tagName === "SELECT") {
        var o = el.options[el.selectedIndex];
        add(el.name, o ? (o.hasAttribute("value") ? o.value : o.text) : "");
        return;
      }
      add(el.name, el.value);
    });
    Object.keys(form.dataset).forEach(function (k) {
      if (k.indexOf("hsField") === 0 && k.length > 7) {
        add(k.slice(7).replace(/[A-Z]/g, function (c) { return "_" + c.toLowerCase(); }).replace(/^_/, ""), form.dataset[k]);
      }
    });
    add("website_form_intent", form.dataset.hsForm);
    return order.map(function (n) { return { objectTypeId: "0-1", name: n, value: out[n] }; });
  }

  function statusEl(form) {
    var el = form.querySelector(".hs-status");
    if (!el && form.nextElementSibling && form.nextElementSibling.classList.contains("hs-status")) el = form.nextElementSibling;
    return el;
  }
  function submitButton(form) { return form.querySelector('[type="submit"]') || form.querySelector("button"); }

  function remember(form) {
    try {
      var data = { until: Date.now() + REMEMBER_DAYS * 864e5 };
      REMEMBER_FIELDS.forEach(function (n) {
        var el = form.elements[n];
        if (el && el.tagName === "INPUT" && el.value.trim()) data[n] = el.value.trim();
      });
      if (data.email) localStorage.setItem(REMEMBER, JSON.stringify(data));
    } catch (e) {}
  }
  function prefill(form) {
    if (form.dataset.hsForm !== "content_download") return;
    try {
      var data = JSON.parse(localStorage.getItem(REMEMBER) || "null");
      if (!data || !data.until || data.until < Date.now()) return;
      REMEMBER_FIELDS.forEach(function (n) {
        var el = form.elements[n];
        if (el && el.tagName === "INPUT" && !el.value && data[n]) el.value = data[n];
      });
    } catch (e) {}
  }

  function succeed(form) {
    var tpl = form.querySelector("template.hs-success");
    form.classList.add("hs-sent");
    if (tpl) {
      form.innerHTML = tpl.innerHTML;
      var first = form.querySelector("h3, p");
      if (first) { first.setAttribute("tabindex", "-1"); first.focus({ preventScroll: true }); }
      return;
    }
    var btn = submitButton(form);
    if (btn) { btn.textContent = form.dataset.hsDone || "thank you"; btn.disabled = true; }
    Array.prototype.forEach.call(form.querySelectorAll("input:not([type=hidden])"), function (i) { i.value = ""; });
  }

  function fail(form, err) {
    var st = statusEl(form);
    var msg = 'something went wrong and nothing was sent. please try again, or email <a href="mailto:' + FALLBACK + '">' + FALLBACK + "</a>.";
    var type = err && err.errors && err.errors.length ? (err.errors[0].errorType || "") : "";
    if (type === "INVALID_EMAIL") msg = "please check the email address and try again.";
    else if (type === "BLOCKED_EMAIL") msg = "please use your work email address.";
    else if (type === "REQUIRED_FIELD") msg = "please fill in every required field.";
    if (st) { st.innerHTML = msg; st.hidden = false; } else { alert(msg.replace(/<[^>]+>/g, "")); }
    if (window.console && console.warn) console.warn("hubspot form submission failed", err);
  }

  function send(form) {
    var btn = submitButton(form), st = statusEl(form);
    var label = btn ? btn.innerHTML : "";
    var body = { submittedAt: Date.now(), fields: fields(form), context: { pageUri: location.href.split("#")[0], pageName: document.title } };
    var hutk = cookie("hubspotutk");
    if (hutk) body.context.hutk = hutk;
    if (btn) { btn.disabled = true; btn.textContent = "sending…"; }
    if (st) { st.hidden = true; st.textContent = ""; }
    fetch(API + FORMS[form.dataset.hsForm], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok) throw data;
          return data;
        });
      })
      .then(function () { remember(form); succeed(form); })
      .catch(function (err) {
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
        fail(form, err);
      });
  }

  function bind(form) {
    if (!FORMS[form.dataset.hsForm]) return;
    form.setAttribute("data-hs-do-not-collect", "true"); // HubSpot's own collected-forms script must not capture it a second time
    form.setAttribute("aria-live", "polite");
    prefill(form);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (form.classList.contains("hs-sent")) return;
      if (typeof form.reportValidity === "function" && !form.reportValidity()) return;
      var hp = form.elements[HONEYPOT];
      if (hp && hp.value) { succeed(form); return; } // a bot: pretend it worked, send nothing
      send(form);
    });
  }

  function init() { Array.prototype.forEach.call(document.querySelectorAll("form[data-hs-form]"), bind); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
