/* Мини-игра «Уворачивайся от обломков» — страница 404 */
(function () {
  "use strict";
  var cv = document.getElementById("game"); if (!cv) return;
  var cx = cv.getContext("2d"), W = cv.width, H = cv.height;
  var elS = document.getElementById("gScore"), elB = document.getElementById("gBest");
  var best = 0; try { best = +localStorage.getItem("gbest") || 0; } catch (e) {}
  var keys = {}, P, items, score, over, last, spawn, t0, started = false;

  function reset() { P = { x: W / 2, y: H - 30, w: 30, v: 0 }; items = []; score = 0; spawn = 0; over = false; t0 = performance.now(); last = t0; started = true; hud(); }
  function hud() {
    elS.textContent = t("Счёт ", "Score ") + Math.floor(score);
    elB.textContent = t("Рекорд ", "Best ") + Math.floor(best);
  }
  function add() {
    var k = ["gear", "bolt", "plate"][Math.floor(Math.random() * 3)], r = k === "plate" ? 0 : 10 + Math.random() * 12;
    var w = k === "plate" ? 40 + Math.random() * 40 : r * 2, h = k === "plate" ? 12 : r * 2;
    var lvl = Math.min(1, score / 600);
    items.push({ k: k, x: Math.random() * (W - w) + w / 2, y: -20, w: w, h: h, r: r, vy: 110 + lvl * 190 + Math.random() * 70, a: 0, va: (Math.random() - .5) * 5 });
  }
  function hit(o) {
    var dx = Math.abs(o.x - P.x), dy = Math.abs(o.y - (P.y - 4));
    return dx < o.w / 2 + P.w / 2 - 6 && dy < o.h / 2 + 14;
  }
  function gear(r) {
    cx.beginPath();
    for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8, q = i % 2 ? r * .78 : r; cx.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
    cx.closePath(); cx.fill(); cx.globalCompositeOperation = "destination-out"; cx.beginPath(); cx.arc(0, 0, r * .3, 0, 7); cx.fill(); cx.globalCompositeOperation = "source-over";
  }
  function draw() {
    cx.clearRect(0, 0, W, H);
    var g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#1a1510"); g.addColorStop(1, "#0b0a08"); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.fillStyle = "#14110c"; cx.fillRect(0, H - 14, W, 14);
    for (var x = -20; x < W; x += 28) { cx.fillStyle = "#f2b705"; cx.beginPath(); cx.moveTo(x, H); cx.lineTo(x + 14, H); cx.lineTo(x + 24, H - 10); cx.lineTo(x + 10, H - 10); cx.fill(); }
    items.forEach(function (o) {
      cx.save(); cx.translate(o.x, o.y); cx.rotate(o.a); cx.fillStyle = o.k === "gear" ? "#a59e8f" : o.k === "bolt" ? "#8a6a3a" : "#6e685d";
      if (o.k === "gear") gear(o.r);
      else if (o.k === "bolt") { cx.beginPath(); for (var i = 0; i < 6; i++) cx.lineTo(Math.cos(i * Math.PI / 3) * o.r, Math.sin(i * Math.PI / 3) * o.r); cx.fill(); }
      else cx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h);
      cx.restore();
    });
    cx.save(); cx.translate(P.x, P.y); cx.fillStyle = "#14110c"; cx.beginPath(); cx.moveTo(0, -22); cx.lineTo(18, 12); cx.lineTo(-18, 12); cx.fill();
    cx.fillStyle = "#f2b705"; cx.beginPath(); cx.moveTo(0, -16); cx.lineTo(13, 8); cx.lineTo(-13, 8); cx.fill();
    cx.fillStyle = "#14110c"; cx.fillRect(-1.8, -6, 3.6, 8); cx.fillRect(-1.8, 4, 3.6, 3); cx.restore();
    if (over || !started) {
      cx.fillStyle = "rgba(0,0,0,.6)"; cx.fillRect(0, 0, W, H); cx.textAlign = "center"; cx.fillStyle = "#f2b705";
      cx.font = "600 34px Oswald, Impact, sans-serif"; cx.fillText(over ? t("РАЗДАВИЛО", "CRUSHED") : t("СТАРТ", "START"), W / 2, H / 2 - 6);
      cx.fillStyle = "#e9e3d4"; cx.font = "500 16px Oswald, Arial, sans-serif"; cx.fillText(t("Пробел или касание", "Space or tap"), W / 2, H / 2 + 22);
    }
  }
  function tick(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (started && !over) {
      var dir = (keys.ArrowRight || keys.d || keys.D ? 1 : 0) - (keys.ArrowLeft || keys.a || keys.A ? 1 : 0);
      if (dir) P.x += dir * 300 * dt;
      P.x = Math.max(18, Math.min(W - 18, P.x));
      spawn -= dt; if (spawn <= 0) { add(); spawn = Math.max(.16, .7 - score / 1400) * (.6 + Math.random() * .8); }
      items.forEach(function (o) { o.y += o.vy * dt; o.a += o.va * dt; });
      items = items.filter(function (o) { if (o.y > H + 30) { score += 5; return false; } return true; });
      score += dt * 10;
      if (items.some(hit)) { over = true; if (score > best) { best = score; try { localStorage.setItem("gbest", String(Math.floor(best))); } catch (e) {} } }
      hud();
    }
    draw(); requestAnimationFrame(tick);
  }
  function go() { if (!started || over) reset(); }
  addEventListener("keydown", function (e) {
    keys[e.key] = true;
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); go(); }
    if (e.key.indexOf("Arrow") === 0) e.preventDefault();
  });
  addEventListener("keyup", function (e) { keys[e.key] = false; });
  function moveTo(e) { var r = cv.getBoundingClientRect(); P && (P.x = (e.clientX - r.left) / r.width * W); }
  cv.addEventListener("pointerdown", function (e) { if (!started || over) { reset(); } cv.setPointerCapture(e.pointerId); moveTo(e); });
  cv.addEventListener("pointermove", function (e) { if (e.buttons || e.pointerType === "touch") moveTo(e); });
  P = { x: W / 2, y: H - 30, w: 30 }; items = []; score = 0; over = false; hud();
  addEventListener("langchange", hud);
  requestAnimationFrame(function (n) { last = n; tick(n); });
})();
