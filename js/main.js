(function () {
  "use strict";
  var C = window.DECAY || {};
  var bar = document.getElementById("bar");
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* шапка */
  function onScroll() { bar.classList.toggle("on", window.scrollY > 24); }
  onScroll(); addEventListener("scroll", onScroll, { passive: true });

  /* появление блоков */
  var rvs = $$(".rv");
  if ("IntersectionObserver" in window) {
    var rv = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rvs.forEach(function (e, i) { e.style.transitionDelay = (i % 3) * 80 + "ms"; rv.observe(e); });
    /* подсветка пункта меню на главной */
    var hash = $$(".menu a").filter(function (a) { return a.getAttribute("href").charAt(0) === "#"; });
    if (hash.length) {
      var spy = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id === "platforms" || e.target.id === "start" ? "features" : e.target.id;
          hash.forEach(function (a) { a.classList.toggle("act", a.getAttribute("href") === "#" + id); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $$("section[id]").forEach(function (s) { spy.observe(s); });
    }
  } else rvs.forEach(function (e) { e.classList.add("in"); });

  /* знак вздрагивает, когда рядом падает обломок */
  var sh = document.getElementById("shake"), busy = false;
  var rm = matchMedia("(prefers-reduced-motion: reduce)");
  if (sh && sh.animate) addEventListener("sf-impact", function (e) {
    if (rm.matches || busy) return; busy = true; var s = 2 + 4 * e.detail.s;
    sh.animate([{ transform: "translate(0,0)" }, { transform: "translate(" + (-s) + "px," + s * .6 + "px)" },
      { transform: "translate(" + s * .7 + "px," + (-s * .3) + "px)" }, { transform: "translate(0,0)" }],
      { duration: 380, easing: "ease-out" }).onfinish = function () { busy = false; };
  });

  /* версия лаунчера с GitHub */
  var ver = document.getElementById("ver"), dlV = document.getElementById("dlVer"), rel = null;
  function asset(re) { return ((rel && rel.assets) || []).filter(function (x) { return re.test(x.name); })[0]; }
  function line() {
    var a = asset(/\.exe$/i) || ((rel.assets || [])[0]), loc = window.DECAY_LANG === "en" ? "en-GB" : "ru-RU", p = [];
    p.push(t("Версия", "Version") + " <b>" + String(rel.tag_name || "").replace(/[<>&]/g, "") + "</b>");
    if (a && a.size) p.push((a.size / 1048576).toFixed(1) + " " + t("МБ", "MB"));
    if (rel.published_at) p.push(new Date(rel.published_at).toLocaleDateString(loc, { day: "numeric", month: "short", year: "numeric" }));
    return p.join(" · ");
  }
  function draw() {
    if (!rel) return;
    if (ver) { ver.innerHTML = line(); ver.hidden = false; }
    if (dlV) {
      dlV.innerHTML = line();
      var w = asset(/\.exe$/i), k = asset(/\.apk$/i), lg = document.getElementById("dlLog");
      if (w) document.getElementById("dlWin").href = w.browser_download_url;
      if (k) { var ak = document.getElementById("dlApk"); ak.href = k.browser_download_url; ak.removeAttribute("target"); }
      if (lg && rel.body) { lg.removeAttribute("data-i"); lg.textContent = rel.body.replace(/\r/g, "").replace(/[#*`]/g, "").trim().slice(0, 1500); }
    }
  }
  if ((ver || dlV) && C.repo) {
    try { var c = JSON.parse(sessionStorage.getItem("rel") || "null"); if (c && Date.now() - c.at < 6e5) { rel = c.r; draw(); } } catch (e) {}
    if (!rel) fetch("https://api.github.com/repos/" + C.repo + "/releases/latest").then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { rel = j; draw(); try { sessionStorage.setItem("rel", JSON.stringify({ at: Date.now(), r: j })); } catch (e) {} })
      .catch(function () {});
    addEventListener("langchange", draw);
  }

  /* статистика посещений (GoatCounter, без cookie; уважает Do Not Track) */
  if (C.goatcounter && navigator.doNotTrack !== "1") {
    var gc = document.createElement("script"); gc.async = true; gc.src = "https://gc.zgo.at/count.js";
    gc.setAttribute("data-goatcounter", "https://" + C.goatcounter + ".goatcounter.com/count"); document.head.appendChild(gc);
  }

  /* форма отзыва -> GitHub Issues */
  var f = document.getElementById("fbform");
  if (f && C.issues) {
    var iss = document.getElementById("fbIssues"); if (iss) iss.href = "https://github.com/" + C.issues + "/issues";
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var type = document.getElementById("fbType").value, title = document.getElementById("fbTitle").value.trim(), text = document.getElementById("fbText").value.trim();
      var body = text + "\n\n---\n" + navigator.userAgent;
      window.open("https://github.com/" + C.issues + "/issues/new?title=" + encodeURIComponent("[" + type + "] " + title) + "&body=" + encodeURIComponent(body), "_blank", "noopener");
    });
  }
})();
