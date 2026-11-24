(function () {
  "use strict";
  var btn = document.getElementById("snd");
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!btn || !AC) { if (btn) btn.hidden = true; return; }
  var ctx, master, on = false, lastHit = 0;

  function init() {
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    /* ветер: коричневый шум через фильтр с медленным дыханием */
    var n = ctx.sampleRate * 4, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < n; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    var src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 180;
    lfo.connect(lg); lg.connect(lp.frequency);
    var wg = ctx.createGain(); wg.gain.value = 0.55;
    src.connect(lp); lp.connect(wg); wg.connect(master);
    /* низкий гул */
    [55, 55.7].forEach(function (f) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.value = 0.07;
      o.connect(g); g.connect(master); o.start();
    });
    src.start(); lfo.start();
  }
  function set(v) {
    on = v;
    if (v) { if (!ctx) init(); ctx.resume(); master.gain.setTargetAtTime(0.35, ctx.currentTime, 0.5); }
    else if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    btn.setAttribute("aria-pressed", v ? "true" : "false");
    try { localStorage.setItem("snd", v ? "1" : "0"); } catch (e) {}
  }
  /* металлический лязг: несколько неточных обертонов с быстрым затуханием */
  function clang(s, x) {
    if (!on) return;
    var t = ctx.currentTime, base = 150 + Math.random() * 260, pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    var out = ctx.createGain(); out.gain.value = 0.5 * (0.3 + s); 
    if (pan) { pan.pan.value = (x - 0.5) * 1.6; out.connect(pan); pan.connect(master); } else out.connect(master);
    [1, 2.76, 5.4, 8.93].forEach(function (r, k) {
      var o = ctx.createOscillator(), g = ctx.createGain(), dur = (0.9 - k * 0.18) * (0.5 + s);
      o.type = "sine"; o.frequency.value = base * r;
      g.gain.setValueAtTime(0.16 / (k + 1), t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function tick() {
    if (!on) return; var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "square"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.06);
    g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.1);
  }
  btn.addEventListener("click", function () { set(!on); });
  addEventListener("sf-impact", function (e) {
    var n = performance.now(); if (n - lastHit < 140) return; lastHit = n; clang(e.detail.s, e.detail.x);
  });
  document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".btn")) tick(); });
  /* браузер не даёт включить звук без жеста: если звук был включён раньше — запускаем на первое касание */
  try {
    if (localStorage.getItem("snd") === "1") {
      var go = function () { removeEventListener("pointerdown", go); removeEventListener("keydown", go); set(true); };
      addEventListener("pointerdown", go); addEventListener("keydown", go);
    }
  } catch (e) {}
})();
