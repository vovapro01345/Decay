(() => {
  'use strict';
  const cv = document.getElementById('fx');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d', { alpha: true });
  const INT = Math.max(0.1, +(cv.dataset.intensity || 1));
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const R = Math.random, rr = (a, b) => a + R() * (b - a), TAU = Math.PI * 2;

  let W = 0, H = 0, DPR = 1, groundY = 0, scale = 1;
  let quality = mqReduce.matches ? .6 : 1; // адаптивно падает, если кадры тяжёлые; при reduced-motion меньше объектов
  let speed = mqReduce.matches ? .6 : 1;    // при reduced-motion анимация не выключается, а замедляется
  const WIND = -0.2;                    // наклон падения (vx = vy * WIND)

  const KINDS = ['nut', 'gear', 'beam', 'bolt', 'plate', 'washer', 'rebar', 'gear', 'nut', 'plate'];
  const TONES = [ // дальний, средний, ближний, раскалённый
    { a: '#4b463f', b: '#26231f', e: '#15130f', hi: 'rgba(255,214,150,.18)', rust: .10 },
    { a: '#6e665a', b: '#2f2b26', e: '#141210', hi: 'rgba(255,220,160,.35)', rust: .22 },
    { a: '#8a8072', b: '#3a342d', e: '#110f0c', hi: 'rgba(255,226,170,.55)', rust: .3 },
    { a: '#b2865a', b: '#4a2f1c', e: '#ff7a1a', hi: 'rgba(255,190,90,.9)', rust: 0, hot: true },
  ];
  const SPR = 128; // базовый размер спрайта, форма вписана в радиус ~44
  const sprites = {};

  function shapePath(c, kind, seed) {
    const p = new Path2D();
    const rnd = mulberry(seed);
    switch (kind) {
      case 'nut': {
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; const x = Math.cos(a) * 40, y = Math.sin(a) * 40; i ? p.lineTo(x, y) : p.moveTo(x, y); }
        p.closePath(); p.moveTo(17, 0); p.arc(0, 0, 17, 0, TAU, true); break;
      }
      case 'washer': p.arc(0, 0, 38, 0, TAU); p.moveTo(18, 0); p.arc(0, 0, 18, 0, TAU, true); break;
      case 'gear': {
        const n = 9; for (let i = 0; i < n * 2; i++) {
          const a0 = i / (n * 2) * TAU, a1 = (i + 1) / (n * 2) * TAU, r = i % 2 ? 31 : 42;
          const am = (a0 + a1) / 2, w = (a1 - a0) * .42;
          p.lineTo(Math.cos(am - w) * r, Math.sin(am - w) * r); p.lineTo(Math.cos(am + w) * r, Math.sin(am + w) * r);
        }
        p.closePath(); p.moveTo(12, 0); p.arc(0, 0, 12, 0, TAU, true); break;
      }
      case 'beam': {
        p.rect(-56, -13, 112, 26);
        for (const x of [-34, 0, 34]) { p.moveTo(x + 6, 0); p.arc(x, 0, 6, 0, TAU, true); }
        break;
      }
      case 'bolt': {
        p.rect(-12, -40, 24, 16); p.rect(-6, -24, 12, 64); break;
      }
      case 'rebar': {
        const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([-46 + t * 92, Math.sin(t * 3.2 + seed) * 14]); }
        const up = pts.map(([x, y]) => [x, y - 5]), dn = pts.map(([x, y]) => [x, y + 5]).reverse();
        [...up, ...dn].forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); break;
      }
      default: { // plate: рваный лист с заклёпками
        const n = 7; for (let i = 0; i < n; i++) { const a = i / n * TAU + rnd() * .5, r = 26 + rnd() * 18; const x = Math.cos(a) * r, y = Math.sin(a) * r * .8; i ? p.lineTo(x, y) : p.moveTo(x, y); }
        p.closePath();
      }
    }
    return p;
  }

  function makeSprite(kind, tone, seed) {
    const c = document.createElement('canvas'); c.width = c.height = SPR;
    const g = c.getContext('2d'); g.translate(SPR / 2, SPR / 2);
    const p = shapePath(g, kind, seed);
    if (tone.hot) { g.shadowColor = 'rgba(255,120,30,.9)'; g.shadowBlur = 16; }
    const gr = g.createLinearGradient(-40, -40, 40, 40); gr.addColorStop(0, tone.a); gr.addColorStop(1, tone.b);
    g.fillStyle = gr; g.fill(p, 'evenodd'); g.shadowBlur = 0;
    g.save(); g.clip(p, 'evenodd');
    const rnd = mulberry(seed * 7 + 3);
    if (tone.rust) for (let i = 0; i < 14; i++) {
      g.fillStyle = `rgba(${120 + rnd() * 40 | 0},${60 + rnd() * 20 | 0},26,${tone.rust * rnd()})`;
      g.beginPath(); g.arc(rnd() * 90 - 45, rnd() * 90 - 45, 2 + rnd() * 9, 0, TAU); g.fill();
    }
    if (tone.hot) { const rg = g.createRadialGradient(0, 0, 4, 0, 0, 52); rg.addColorStop(0, 'rgba(255,190,90,.0)'); rg.addColorStop(1, 'rgba(255,110,20,.75)'); g.fillStyle = rg; g.fillRect(-64, -64, 128, 128); }
    g.restore();
    g.lineWidth = 2; g.strokeStyle = tone.e; g.stroke(p);
    g.save(); g.translate(-1.5, -1.5); g.lineWidth = 1.5; g.strokeStyle = tone.hi; g.globalCompositeOperation = 'source-atop'; g.stroke(p); g.restore();
    return c;
  }
  function sprite(kind, ti, v) {
    const k = kind + ti + '_' + v; if (!sprites[k]) sprites[k] = makeSprite(kind, TONES[ti], v * 13 + kind.length); return sprites[k];
  }
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function gradSprite(w, h, stops) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, w, h); return c; }
  function radSprite(n, stops) { const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'); const gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; }
  const TRAIL_HOT = gradSprite(16, 256, [[0, 'rgba(255,90,20,0)'], [.55, 'rgba(255,120,30,.28)'], [.9, 'rgba(255,190,90,.7)'], [1, 'rgba(255,230,170,.9)']]);
  const TRAIL_COLD = gradSprite(16, 256, [[0, 'rgba(200,190,170,0)'], [1, 'rgba(200,190,170,.16)']]);
  const GLOW = radSprite(128, [[0, 'rgba(255,200,110,.9)'], [.25, 'rgba(255,130,30,.45)'], [1, 'rgba(255,90,10,0)']]);
  const DUST = radSprite(128, [[0, 'rgba(120,108,88,.55)'], [.6, 'rgba(90,80,64,.18)'], [1, 'rgba(70,62,50,0)']]);

  const LAYERS = [
    { n: 38, size: [10, 20], vy: [55, 100], tone: 0, alpha: .6, par: .15, trail: 0, impact: false },
    { n: 16, size: [24, 44], vy: [150, 240], tone: 1, alpha: .9, par: .45, trail: .6, impact: true, hot: .12 },
    { n: 5, size: [54, 96], vy: [320, 460], tone: 2, alpha: 1, par: 1, trail: 1, impact: true, hot: .6 },
  ];
  let pieces = [], sparks = [], puffs = [], motes = [], streaks = [], smoke = [];
  let ground = null, groundBack = null;

  function newPiece(L, li, warm) {
    const sz = rr(L.size[0], L.size[1]) * scale;
    const hot = L.hot && R() < L.hot;
    const vy = rr(L.vy[0], L.vy[1]) * Math.max(.75, scale);
    const kind = KINDS[(R() * KINDS.length) | 0];
    return {
      li, L, kind, hot, sz,
      spr: sprite(kind, hot ? 3 : L.tone, (R() * 3) | 0),
      x: rr(-0.1, 1.35) * W, y: warm ? rr(-0.1, 1) * groundY : -sz * rr(2, 8),
      vy, vx: vy * WIND * rr(.8, 1.2), rot: R() * TAU, vr: rr(-2.4, 2.4) * (li === 0 ? .6 : 1),
      emberT: 0,
    };
  }
  function populate(warm) {
    pieces = [];
    const area = Math.min(1.3, Math.max(.5, Math.sqrt((W * H) / (1600 * 900))));
    LAYERS.forEach((L, li) => {
      const n = Math.max(li === 2 ? 2 : 3, Math.round(L.n * area * INT * quality));
      for (let i = 0; i < n; i++) pieces.push(newPiece(L, li, warm));
    });
    smoke = [];
    for (let i = 0; i < 7; i++) smoke.push({ x: R() * W, y: i < 4 ? rr(.72, .95) * H : rr(.05, .4) * H, r: rr(.25, .5) * Math.max(W, H), vx: rr(6, 16) * (R() < .5 ? -1 : 1), a: i < 4 ? rr(.10, .18) : rr(.04, .08) });
    motes = [];
    const nm = Math.round(46 * area * INT * quality);
    for (let i = 0; i < nm; i++) motes.push({ x: R() * W, y: R() * H, r: rr(.6, 1.8) * Math.max(1, scale), d: rr(.2, 1), ph: R() * TAU, vx: rr(-8, 8), vy: rr(-4, 6) });
  }

  function buildGround() {
    const gw = W + 140, gh = Math.round(H - groundY + 40);
    const mk = (col, hMul, seed, junk) => {
      const c = document.createElement('canvas'); c.width = Math.ceil(gw * DPR); c.height = Math.ceil(gh * DPR);
      const g = c.getContext('2d'); g.scale(DPR, DPR); const rnd = mulberry(seed);
      g.fillStyle = col; g.beginPath(); g.moveTo(0, gh);
      let x = 0; const base = 40;
      while (x <= gw) { const y = base - (Math.sin(x * .004 + seed) * .5 + .5) * 26 * hMul - rnd() * 16 * hMul; g.lineTo(x, y); x += rr(14, 38); }
      g.lineTo(gw, gh); g.closePath(); g.fill();
      for (let i = 0; i < junk; i++) {
        const jx = rnd() * gw, jy = base - 10 * hMul - rnd() * 10, a = (rnd() - .5) * 1.4, len = (20 + rnd() * 50) * hMul, th = 4 + rnd() * 7;
        g.save(); g.translate(jx, jy); g.rotate(a); g.fillRect(-th / 2, -len, th, len + 10);
        if (rnd() < .4) { g.fillRect(-th * 1.6, -len, th * 3.2, th * .6); }
        g.restore();
      }
      return c;
    };
    groundBack = mk('#17140f', 1.5, 11, Math.round(gw / 90));
    ground = mk('#0a0907', 1, 29, Math.round(gw / 130));
  }

  function resize() {
    const cw = cv.clientWidth || innerWidth, ch = cv.clientHeight || innerHeight;
    W = cw; H = ch;
    DPR = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 2) * (quality < 1 ? .8 : 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    scale = Math.max(.6, Math.min(1.15, Math.min(W * 1.25, H * 1.4) / 1100));
    groundY = H - Math.max(46, H * .085);
    buildGround(); populate(true);
    if (!running) drawFrame(0);
  }

  function impact(p) {
    const x = p.x, y = groundY + rr(-4, 10), big = p.li === 2;
    const n = Math.round((big ? rr(16, 26) : rr(5, 10)) * quality);
    for (let i = 0; i < n && sparks.length < 260; i++) {
      const a = -Math.PI / 2 + rr(-1.25, 1.25), s = rr(160, big ? 560 : 300) * scale;
      sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rr(.35, big ? 1.1 : .6), t: 0, w: rr(1, 2.2) * scale });
    }
    puffs.push({ x, y: y - 6, r: (big ? 60 : 26) * scale, t: 0, life: big ? 1.8 : 1.1, flash: big ? 1 : .45 });
    if (big) window.dispatchEvent(new CustomEvent('sf-impact', { detail: { x: x / W, s: Math.min(1, p.sz / 60) } }));
  }

  let nextStreak = rr(2, 5), nextFlash = rr(5, 10), flash = 0;
  function spawnStreak() {
    const fromL = R() < .5, y = rr(.04, .3) * H;
    streaks.push({ x: fromL ? -60 : W + 60, y, vx: (fromL ? 1 : -1) * rr(380, 620) * scale, vy: rr(60, 140) * scale, t: 0, life: rr(1.6, 2.6), len: rr(120, 240) * scale });
  }

  let px = 0, py = 0, tx = 0, ty = 0, scrollY = 0, autoT = 0;
  const finePointer = matchMedia('(pointer:fine)').matches;
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { tx = (e.clientX / W - .5) * 2; ty = (e.clientY / H - .5) * 2; } }, { passive: true });
  addEventListener('scroll', () => { scrollY = window.scrollY || 0; }, { passive: true });

  let running = false, last = 0, acc = 0, frames = 0, slow = 0;
  function step(dt) {
    autoT += dt;
    if (!finePointer) { tx = Math.sin(autoT * .23) * .6; ty = Math.cos(autoT * .17) * .3; }
    px += (tx - px) * Math.min(1, dt * 2.2); py += (ty - py) * Math.min(1, dt * 2.2);

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.hot) { p.emberT -= dt; if (p.emberT <= 0 && sparks.length < 260) { p.emberT = rr(.04, .12) / quality; sparks.push({ x: p.x, y: p.y, vx: -p.vx * .2 + rr(-30, 30), vy: -p.vy * .15 + rr(-30, 10), life: rr(.25, .6), t: 0, w: rr(.8, 1.6) * scale, ember: 1 }); } }
      const floor = p.li === 0 ? groundY - 20 : groundY + p.sz * .25;
      if (p.y > floor || p.x < -p.sz * 4) {
        if (p.L.impact && p.y > floor && p.x > -20 && p.x < W + 20) impact(p);
        pieces[i] = newPiece(p.L, p.li, false);
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.t += dt; if (s.t > s.life) { sparks.splice(i, 1); continue; }
      s.vy += (s.ember ? 120 : 900) * dt; s.vx *= (1 - dt * 1.2); s.x += s.vx * dt; s.y += s.vy * dt;
      if (!s.ember && s.y > groundY + 14) { s.y = groundY + 14; s.vy *= -.35; s.vx *= .6; }
    }
    for (let i = puffs.length - 1; i >= 0; i--) { const u = puffs[i]; u.t += dt; if (u.t > u.life) puffs.splice(i, 1); }
    for (const k of smoke) { k.x += k.vx * dt; if (k.x < -k.r) k.x = W + k.r; if (k.x > W + k.r) k.x = -k.r; }
    for (const m of motes) { m.x += (m.vx + Math.sin(autoT * .5 + m.ph) * 6) * dt; m.y += m.vy * dt; if (m.x < -5) m.x = W + 5; if (m.x > W + 5) m.x = -5; if (m.y > H + 5) m.y = -5; if (m.y < -5) m.y = H + 5; }
    nextStreak -= dt; if (nextStreak <= 0) { spawnStreak(); nextStreak = rr(3.5, 8) / INT; }
    for (let i = streaks.length - 1; i >= 0; i--) { const s = streaks[i]; s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; if (s.t > s.life) streaks.splice(i, 1); }
    nextFlash -= dt; if (nextFlash <= 0) { flash = 1; nextFlash = rr(7, 14); }
    flash = Math.max(0, flash - dt * 1.6);
  }

  function drawFrame() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const offY = -scrollY;

    if (flash > 0) {
      const a = flash * flash * .22;
      ctx.globalAlpha = a; ctx.drawImage(GLOW, W * .62 - W * .5, -H * .45, W, H * .8); ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const s of streaks) {
      const k = Math.sin(Math.min(1, s.t / s.life) * Math.PI), ang = Math.atan2(s.vy, s.vx);
      ctx.save(); ctx.translate(s.x - px * 6, s.y - py * 4 + offY * .05); ctx.rotate(ang - Math.PI / 2);
      ctx.globalAlpha = .55 * k; ctx.drawImage(TRAIL_HOT, -1.5 * scale, -s.len, 3 * scale, s.len);
      ctx.globalAlpha = .8 * k; ctx.drawImage(GLOW, -7 * scale, -7 * scale, 14 * scale, 14 * scale);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

    for (const k of smoke) { ctx.globalAlpha = k.a; ctx.drawImage(DUST, k.x - k.r - px * 10, k.y - k.r * .5 + offY * .05, k.r * 2, k.r); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#d8c9a6';
    for (const m of motes) {
      ctx.globalAlpha = (.08 + .14 * (.5 + .5 * Math.sin(autoT * 1.3 + m.ph))) * m.d;
      const x = m.x - px * 18 * m.d, y = m.y - py * 10 * m.d + offY * .08 * m.d;
      ctx.fillRect(x, y, m.r, m.r);
    }
    ctx.globalAlpha = 1;

    for (let li = 0; li < 3; li++) {
      const L = LAYERS[li], ox = -px * 26 * L.par, oy = -py * 12 * L.par + offY * .12 * L.par;
      if (li === 1) { ctx.drawImage(groundBack, -70 - px * 14, groundY - 40 - py * 5 + offY * .1, groundBack.width / DPR, groundBack.height / DPR); }
      for (const p of pieces) {
        if (p.li !== li) continue;
        const x = p.x + ox, y = p.y + oy;
        if (y < -p.sz * 3 || y > H + p.sz) continue;
        if (L.trail) {
          const sp = Math.hypot(p.vx, p.vy), len = Math.min(p.sz * (p.hot ? 7 : 3.2), sp * .45) * L.trail;
          ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.vy, p.vx) - Math.PI / 2);
          if (p.hot) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .75; ctx.drawImage(TRAIL_HOT, -p.sz * .28, -len, p.sz * .56, len); ctx.globalAlpha = .5; ctx.drawImage(GLOW, -p.sz * 1.1, -p.sz * 1.1, p.sz * 2.2, p.sz * 2.2); ctx.globalCompositeOperation = 'source-over'; }
          else { ctx.globalAlpha = .6; ctx.drawImage(TRAIL_COLD, -p.sz * .3, -len, p.sz * .6, len); }
          ctx.restore();
        }
        ctx.globalAlpha = L.alpha;
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot);
        const s = p.sz * (SPR / 88); ctx.drawImage(p.spr, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (li === 1) {
        for (const u of puffs) {
          const k = u.t / u.life, r = u.r * (1 + k * 2.2);
          ctx.globalAlpha = (1 - k) * .55; ctx.drawImage(DUST, u.x - r - px * 20, u.y - r * .7 + offY * .1, r * 2, r * 1.4);
        }
        ctx.globalAlpha = 1;
      }
    }
    ctx.drawImage(ground, -70 - px * 30, groundY - 40 - py * 8 + offY * .12, ground.width / DPR, ground.height / DPR);

    ctx.globalCompositeOperation = 'lighter';
    for (const u of puffs) {
      if (u.t < .3) { const k = 1 - u.t / .3, r = u.r * 1.6 * u.flash; ctx.globalAlpha = k * .9 * u.flash; ctx.drawImage(GLOW, u.x - r - px * 30, u.y - r + offY * .12, r * 2, r * 2); }
    }
    ctx.lineCap = 'round';
    for (const s of sparks) {
      const k = 1 - s.t / s.life;
      ctx.globalAlpha = k;
      ctx.strokeStyle = k > .6 ? '#fff1c2' : (k > .3 ? '#ffc04a' : '#ff6a14');
      ctx.lineWidth = s.w;
      const x = s.x - (s.ember ? 26 : 30) * px, y = s.y + offY * .12;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - s.vx * .03, y - s.vy * .03); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(.05, Math.max(0, (t - last) / 1000)); last = t;
    acc += dt; frames++;
    if (acc > 2) { const avg = acc / frames; if (avg > .03 && quality > .5) { slow++; if (slow >= 1) { quality = Math.max(.5, quality - .25); resize(); } } else slow = 0; acc = 0; frames = 0; }
    step(dt * speed); drawFrame();
    requestAnimationFrame(loop);
  }
  function start() { if (running || document.hidden) return; running = true; last = performance.now(); requestAnimationFrame(loop); }
  function stop() { running = false; }


  addEventListener('resize', () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 120); });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  (mqReduce.addEventListener ? mqReduce.addEventListener.bind(mqReduce, 'change') : mqReduce.addListener.bind(mqReduce))(() => { speed = mqReduce.matches ? .6 : 1; });

  resize();
  step(.016); start();
  window.__fxReady = true;
})();
