(function () {
  "use strict";
  var bar = document.getElementById("bar");
  var links = [].slice.call(document.querySelectorAll(".menu a"));
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  function onScroll() { bar.classList.toggle("on", window.scrollY > 24); }
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  if (!("IntersectionObserver" in window)) {
    [].forEach.call(document.querySelectorAll(".rv"), function (e) { e.classList.add("in"); });
    return;
  }
  var rv = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  [].forEach.call(document.querySelectorAll(".rv"), function (e, i) {
    e.style.transitionDelay = (i % 3) * 80 + "ms";
    rv.observe(e);
  });

  var spy = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.classList.toggle("act", a.getAttribute("href") === "#" + e.target.id); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  [].forEach.call(document.querySelectorAll("section[id]"), function (s) { spy.observe(s); });
})();
