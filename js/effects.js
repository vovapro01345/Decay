(function () {
  "use strict";
  var rm = matchMedia("(prefers-reduced-motion: reduce)");
  if (rm.matches) return;

  /* тряска экрана и пыль при крупных обломках */
  var main = document.querySelector("main"), busy = false, puffs = 0;
  function shake(s) {
    if (!main || !main.animate || busy) return; busy = true;
    var a = 1 + 5 * s, r = function () { return (Math.random() * 2 - 1) * a; };
    main.animate([{ transform: "translate(0,0)" }, { transform: "translate(" + r() + "px," + r() + "px)" },
      { transform: "translate(" + r() + "px," + r() + "px)" }, { transform: "translate(" + r() * .5 + "px," + r() * .5 + "px)" },
      { transform: "translate(0,0)" }], { duration: 340, easing: "ease-out" }).onfinish = function () { busy = false; };
  }
  function puff(x, s) {
    if (puffs > 5) return; puffs++;
    var d = document.createElement("div"), w = 70 + 130 * s;
    d.className = "dust"; d.style.left = x * 100 + "%"; d.style.width = w + "px"; d.style.height = w * .55 + "px";
    document.body.appendChild(d);
    d.animate([{ opacity: .6, transform: "translate(-50%,0) scale(.35)" },
      { opacity: 0, transform: "translate(-50%," + -(30 + 70 * s) + "px) scale(1.7)" }],
      { duration: 1300 + 900 * s, easing: "ease-out" }).onfinish = function () { d.remove(); puffs--; };
  }
  addEventListener("sf-impact", function (e) {
    var s = e.detail.s; if (s > 0.55) shake(s); if (s > 0.4) puff(e.detail.x, s);
  });

  /* фонарик и прицел на первом экране (только мышь) */
  var hero = document.getElementById("hero"), fl = document.getElementById("flash");
  if (hero && fl && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    var px = 0, py = 0, raf = 0;
    function paint() { raf = 0; fl.style.setProperty("--x", px + "px"); fl.style.setProperty("--y", py + "px"); }
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top;
      fl.classList.add("on"); if (!raf) raf = requestAnimationFrame(paint);
    });
    hero.addEventListener("pointerleave", function () { fl.classList.remove("on"); });
    hero.addEventListener("pointerdown", function (e) {
      if (e.target.closest("a,button")) return;
      var r = hero.getBoundingClientRect(), o = document.createElement("div");
      o.className = "ring"; o.style.left = e.clientX - r.left + "px"; o.style.top = e.clientY - r.top + "px";
      hero.appendChild(o);
      o.animate([{ opacity: .9, transform: "translate(-50%,-50%) scale(.2)" }, { opacity: 0, transform: "translate(-50%,-50%) scale(1.6)" }],
        { duration: 450, easing: "ease-out" }).onfinish = function () { o.remove(); };
    });
  }
})();
