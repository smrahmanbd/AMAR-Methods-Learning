/* The logit ladder: shared interactive widgets.
   Mount with <div class="lw" data-w="NAME" data-level="..."></div> and LW.mountAll(root).
   Teaching example used everywhere (invented numbers):
     outcomes 0 No injury (base), 1 Minor injury, 2 Severe injury
     Minor:  V = −0.5 + 0.8 × Unbelted        Severe: V = −1.5 + 1.6 × Unbelted
     Random parameter (severe, unbelted): β = 1.6 + 0.5·Z + 1.2·exp(−0.4·W)·ν,  Z = young driver, W = night */
(function () {
  'use strict';
  var LW = window.LW = {};
  var NAMES = ['No injury', 'Minor injury', 'Severe injury'];
  function C(v) { return css(v) || '#888'; }
  function OC() { return [C('--accent'), C('--amber-fill'), C('--bad')]; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sg(v, d) { return (v > 0 ? '+' : '') + f2(v, d === undefined ? 3 : d); }
  function sci(v) { if (v >= 1e-3) return v.toFixed(5); if (v === 0) return '0'; var p = v.toExponential(3).split('e'); return p[0] + ' × 10<sup>' + p[1].replace('-', '−') + '</sup>'; }
  function pct(v, d) { return (100 * v).toFixed(d === undefined ? 1 : d) + '%'; }

  /* ---------- maths ---------- */
  var M = LW.math = {};
  M.softmax = function (v) { var mx = Math.max.apply(null, v), e = v.map(function (x) { return Math.exp(x - mx); }), s = e.reduce(function (a, b) { return a + b; }, 0); return e.map(function (x) { return x / s; }); };
  M.npdf = function (x, m, s) { var z = (x - m) / s; return Math.exp(-0.5 * z * z) / (s * Math.sqrt(2 * Math.PI)); };
  M.rng = function (seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  M.randn = function (r) { var u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  M.gumbel = function (r) { var u = 0; while (!u) u = r(); return -Math.log(-Math.log(u)); };
  M.lgamma = function (x) { var g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - M.lgamma(1 - x);
    x -= 1; var a = c[0], t = x + g + 0.5; for (var i = 1; i < 9; i++) a += c[i] / (x + i); return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a); };
  M.gammaP = function (a, x) { if (x <= 0) return 0; var i;
    if (x < a + 1) { var s = 1 / a, d = s, ap = a; for (i = 0; i < 300; i++) { ap += 1; d *= x / ap; s += d; if (Math.abs(d) < Math.abs(s) * 1e-14) break; } return s * Math.exp(-x + a * Math.log(x) - M.lgamma(a)); }
    var b = x + 1 - a, cc = 1e300, dd = 1 / b, h = dd; for (i = 1; i < 300; i++) { var an = -i * (i - a); b += 2; dd = an * dd + b; if (Math.abs(dd) < 1e-300) dd = 1e-300; cc = b + an / cc; if (Math.abs(cc) < 1e-300) cc = 1e-300; dd = 1 / dd; var del = dd * cc; h *= del; if (Math.abs(del - 1) < 1e-14) break; }
    return 1 - Math.exp(-x + a * Math.log(x) - M.lgamma(a)) * h; };
  M.chi2cdf = function (x, k) { return M.gammaP(k / 2, x / 2); };
  M.chi2pdf = function (x, k) { if (x <= 0) return 0; return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - M.lgamma(k / 2)); };
  M.chi2inv = function (p, k) { var lo = 0, hi = 200; for (var i = 0; i < 100; i++) { var m = (lo + hi) / 2; if (M.chi2cdf(m, k) < p) lo = m; else hi = m; } return (lo + hi) / 2; };
  /* probabilities for an unbelted driver whose severe-injury coefficient on Unbelted is b */
  M.probUnbelted = function (b) { return M.softmax([0, -0.5 + 0.8, -1.5 + b]); };
  M.probBelted = function () { return M.softmax([0, -0.5, -1.5]); };
  /* average the probabilities over β ~ Normal(m, s) by quadrature */
  M.avgProb = function (m, s) { if (s < 1e-6) return M.probUnbelted(m); var acc = [0, 0, 0], wt = 0, K = 241;
    for (var i = 0; i < K; i++) { var z = -6 + 12 * i / (K - 1), w = Math.exp(-0.5 * z * z), p = M.probUnbelted(m + s * z); acc[0] += w * p[0]; acc[1] += w * p[1]; acc[2] += w * p[2]; wt += w; }
    return acc.map(function (a) { return a / wt; }); };

  /* ---------- drawing ---------- */
  function T(c, s, x, y, o) { o = o || {}; c.save(); c.fillStyle = o.c || C('--fg'); c.font = (o.w || 500) + ' ' + (o.size || 13) + 'px ' + (o.f || 'Inter, system-ui, sans-serif'); c.textAlign = o.a || 'center'; c.textBaseline = o.b || 'middle'; c.fillText(s, x, y); c.restore(); }
  LW.T = T;
  function Frame(c, L, Tp, W, H, xr, yr) { this.c = c; this.L = L; this.T = Tp; this.W = W; this.H = H; this.xr = xr; this.yr = yr; }
  Frame.prototype.X = function (x) { return this.L + (x - this.xr[0]) / (this.xr[1] - this.xr[0]) * this.W; };
  Frame.prototype.Y = function (y) { return this.T + this.H - (y - this.yr[0]) / (this.yr[1] - this.yr[0]) * this.H; };
  Frame.prototype.axes = function (o) { var c = this.c, s = this, i; o = o || {}; var fx = o.fx || function (v) { return String(+v.toFixed(2)); }, fy = o.fy || fx;
    c.save(); c.strokeStyle = C('--line'); c.lineWidth = 1;
    (o.yt || []).forEach(function (v) { var y = s.Y(v); c.beginPath(); c.moveTo(s.L, y); c.lineTo(s.L + s.W, y); c.stroke(); T(c, fy(v), s.L - 6, y, { a: 'right', size: 11, c: C('--muted') }); });
    (o.xt || []).forEach(function (v) { var x = s.X(v); c.beginPath(); c.moveTo(x, s.T + s.H); c.lineTo(x, s.T + s.H + 4); c.stroke(); T(c, fx(v), x, s.T + s.H + 14, { size: 11, c: C('--muted') }); });
    c.strokeStyle = C('--muted'); c.beginPath(); c.moveTo(s.L, s.T); c.lineTo(s.L, s.T + s.H); c.lineTo(s.L + s.W, s.T + s.H); c.stroke();
    if (o.xl) T(c, o.xl, s.L + s.W / 2, s.T + s.H + 30, { size: 12, c: C('--muted'), w: 600 });
    if (o.yl) { c.translate(s.L - 38, s.T + s.H / 2); c.rotate(-Math.PI / 2); T(c, o.yl, 0, 0, { size: 12, c: C('--muted'), w: 600 }); }
    c.restore(); };
  Frame.prototype.fn = function (f, color, width, fill, dash) { var c = this.c, n = Math.max(80, Math.round(this.W)), i, x, y, pts = [];
    for (i = 0; i <= n; i++) { x = this.xr[0] + (this.xr[1] - this.xr[0]) * i / n; y = f(x); if (!isFinite(y)) continue; y = Math.max(this.yr[0], Math.min(this.yr[1], y)); pts.push([this.X(x), this.Y(y)]); }
    if (!pts.length) return; c.save(); c.beginPath(); pts.forEach(function (p, j) { if (j) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); });
    if (fill) { var y0 = this.Y(Math.max(this.yr[0], 0)); c.lineTo(pts[pts.length - 1][0], y0); c.lineTo(pts[0][0], y0); c.closePath(); c.fillStyle = fill; c.fill(); c.beginPath(); pts.forEach(function (p, j) { if (j) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); }
    c.strokeStyle = color; c.lineWidth = width || 2; if (dash) c.setLineDash(dash); c.stroke(); c.restore(); };
  Frame.prototype.area = function (f, a, b, color) { var c = this.c, n = 120, i, x; a = Math.max(a, this.xr[0]); b = Math.min(b, this.xr[1]); if (b <= a) return;
    c.save(); c.beginPath(); c.moveTo(this.X(a), this.Y(0)); for (i = 0; i <= n; i++) { x = a + (b - a) * i / n; c.lineTo(this.X(x), this.Y(Math.min(this.yr[1], f(x)))); } c.lineTo(this.X(b), this.Y(0)); c.closePath(); c.fillStyle = color; c.fill(); c.restore(); };
  Frame.prototype.line = function (x0, y0, x1, y1, color, w, dash) { var c = this.c; c.save(); c.strokeStyle = color; c.lineWidth = w || 1.5; if (dash) c.setLineDash(dash); c.beginPath(); c.moveTo(this.X(x0), this.Y(y0)); c.lineTo(this.X(x1), this.Y(y1)); c.stroke(); c.restore(); };
  Frame.prototype.dot = function (x, y, r, color, ring) { var c = this.c; c.save(); c.beginPath(); c.arc(this.X(x), this.Y(y), r, 0, 7); c.fillStyle = color; c.fill(); if (ring) { c.strokeStyle = ring; c.lineWidth = 2; c.stroke(); } c.restore(); };
  function alpha(hex, a) { if (!hex || hex[0] !== '#') return hex; var h = hex.slice(1); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  LW.alpha = alpha;
  function rrect(c, x, y, w, h, r, fill) { if (w < 0) { x += w; w = -w; } if (h < 0) { y += h; h = -h; } r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fillStyle = fill; c.fill(); }

  /* ---------- controls ---------- */
  function stage(parent, aspect, minH) {
    var wrap = el('div', 'lw-stage'), cv = el('canvas'); wrap.appendChild(cv); parent.appendChild(wrap);
    var s = { cv: cv, c: cv.getContext('2d'), w: 0, h: 0, draw: null };
    s.size = function () { var w = wrap.clientWidth; if (!w) return; var a = typeof aspect === 'function' ? aspect(w) : aspect, h = Math.max(minH || 220, Math.round(w * a)), d = window.devicePixelRatio || 1;
      if (w === s.w && h === s.h) return; cv.width = w * d; cv.height = h * d; cv.style.height = h + 'px'; s.c.setTransform(d, 0, 0, d, 0, 0); s.w = w; s.h = h; if (s.draw) s.draw(); };
    s.clear = function () { s.c.clearRect(0, 0, s.w, s.h); };
    if (window.ResizeObserver) new ResizeObserver(function () { s.size(); }).observe(wrap); else window.addEventListener('resize', s.size);
    onTheme(function () { if (s.draw) s.draw(); }); setTimeout(s.size, 0);
    return s;
  }
  function ctl(parent) { var d = el('div', 'ctl'); parent.appendChild(d); return d; }
  function slider(parent, label, min, max, step, val, fmt, on) {
    var lab = el('label'), sp = el('span', null, label + ' '), b = el('b'), r = el('input'); sp.appendChild(b); lab.appendChild(sp);
    r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = val; lab.appendChild(r); parent.appendChild(lab);
    function upd() { b.innerHTML = fmt ? fmt(+r.value) : r.value; }
    r.addEventListener('input', function () { upd(); on(+r.value); }); upd();
    return { el: r, lab: lab, get: function () { return +r.value; }, set: function (v) { r.value = v; upd(); } };
  }
  function row(parent) { var d = el('div', 'row'); parent.appendChild(d); return d; }
  function btn(parent, text, on, ghost) { var b = el('button', 'go' + (ghost ? ' ghost' : ''), text); b.type = 'button'; b.addEventListener('click', on); parent.appendChild(b); return b; }
  function tog(parent, text, val, on) { var b = btn(parent, '', function () { val = !val; upd(); on(val); }, true); b.classList.add('tog'); function upd() { b.innerHTML = text + ': <b>' + (val ? 'yes' : 'no') + '</b>'; b.setAttribute('aria-pressed', val); } upd(); return { el: b, set: function (v) { val = v; upd(); }, get: function () { return val; } }; }
  function seg(parent, opts, val, on) { var d = el('div', 'seg'); parent.appendChild(d); var bs = opts.map(function (o) { var b = el('button', null, o[1]); b.type = 'button'; b.onclick = function () { set(o[0]); on(o[0]); }; d.appendChild(b); return b; });
    function set(v) { val = v; bs.forEach(function (b, i) { b.setAttribute('aria-pressed', opts[i][0] === v); }); } set(val); return { el: d, set: set }; }
  function readout(parent) { var d = el('div', 'read'); d.setAttribute('aria-live', 'polite'); parent.appendChild(d); return d; }
  function Loop(step) { var on = false, last = 0; var o = { running: false };
    function f(t) { if (!on) return; var dt = Math.min(0.05, (t - last) / 1000); last = t; if (step(dt) === false) { on = false; o.running = false; if (o.onstop) o.onstop(); return; } requestAnimationFrame(f); }
    o.start = function () { if (on) return; on = true; o.running = true; last = performance.now(); requestAnimationFrame(f); };
    o.stop = function () { on = false; o.running = false; }; return o; }
  function ease(cur, tgt, dt, k) { return cur + (tgt - cur) * Math.min(1, dt * (k || 8)); }

  /* ======================================================================
     1. Binary logit: the S-curve
     ====================================================================== */
  LW.logit = function (root) {
    var st = { b0: -1, b1: 0.9, x: 2 }, c = ctl(root);
    slider(c, 'Intercept β₀', -4, 4, 0.1, st.b0, function (v) { return f2(v, 1); }, function (v) { st.b0 = v; draw(); });
    slider(c, 'Slope β₁', -3, 3, 0.1, st.b1, function (v) { return f2(v, 1); }, function (v) { st.b1 = v; draw(); });
    slider(c, 'Value of x', -5, 5, 0.1, st.x, function (v) { return f2(v, 1); }, function (v) { st.x = v; draw(); });
    var s = stage(root, 0.42, 240), rd = readout(root);
    function P(x) { return 1 / (1 + Math.exp(-(st.b0 + st.b1 * x))); }
    function draw() { if (!s.w) return; s.clear(); var c = s.c, F = new Frame(c, 52, 14, s.w - 70, s.h - 58, [-5, 5], [0, 1]);
      F.axes({ xt: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], yt: [0, 0.25, 0.5, 0.75, 1], xl: 'x (for example, speed above the limit)', yl: 'P(severe)' });
      F.line(-5, 0.5, 5, 0.5, C('--muted'), 1, [4, 4]);
      F.fn(P, C('--accent'), 3);
      var p = P(st.x); F.line(st.x, 0, st.x, p, C('--amber'), 1.5, [3, 3]); F.line(-5, p, st.x, p, C('--amber'), 1.5, [3, 3]); F.dot(st.x, p, 7, C('--amber-fill'), C('--fg'));
      T(c, 'P = ' + p.toFixed(3), F.X(st.x) + (st.x > 2.5 ? -12 : 12), F.Y(p) - 14, { a: st.x > 2.5 ? 'right' : 'left', w: 700 });
      var z = st.b0 + st.b1 * st.x, od = Math.exp(z);
      rd.innerHTML = '<span class="eq">Score z = β₀ + β₁x = ' + f2(st.b0, 1) + ' + ' + f2(st.b1, 1) + ' × ' + f2(st.x, 1) + ' = ' + f2(z, 2) + '</span><br>Odds = e<sup>z</sup> = ' + od.toFixed(3) + ' &nbsp;→&nbsp; <b>P = odds ÷ (1 + odds) = ' + p.toFixed(3) + '</b>' +
        '<br><span class="note">Slope β₁ ' + (st.b1 > 0 ? 'positive: larger x raises the probability.' : st.b1 < 0 ? 'negative: larger x lowers the probability.' : 'zero: x has no effect, so the curve is flat.') + ' Odds ratio e<sup>β₁</sup> = ' + Math.exp(st.b1).toFixed(2) + ': each extra unit of x multiplies the odds by this.</span>'; }
    s.draw = draw;
  };

  /* ======================================================================
     2. Likelihood and log-likelihood for k severe crashes out of n
     ====================================================================== */
  LW.likelihood = function (root) {
    var st = { n: 10, k: 3, p: 0.5 }, c = ctl(root), anim = null, kS;
    slider(c, 'Crashes observed n', 1, 40, 1, st.n, null, function (v) { st.n = v; kS.el.max = v; if (st.k > v) { st.k = v; kS.set(v); } draw(); });
    kS = slider(c, 'Of which severe k', 0, 10, 1, st.k, null, function (v) { st.k = v; draw(); });
    var pS = slider(c, 'Guess for p = P(severe)', 0.01, 0.99, 0.01, st.p, function (v) { return v.toFixed(2); }, function (v) { st.p = v; if (anim) anim.stop(); draw(); });
    var r = row(root); btn(r, 'Find the best p for me', function () { var tgt = Math.min(0.99, Math.max(0.01, st.k / st.n)); anim = Loop(function (dt) { st.p = ease(st.p, tgt, dt, 4); if (Math.abs(st.p - tgt) < 0.002) st.p = tgt; pS.set(+st.p.toFixed(2)); draw(); return st.p !== tgt; }); anim.start(); });
    var s = stage(root, function (w) { return w < 560 ? 0.95 : 0.6; }, 300), rd = readout(root);
    function L(p) { return Math.pow(p, st.k) * Math.pow(1 - p, st.n - st.k); }
    function LL(p) { return st.k * Math.log(p) + (st.n - st.k) * Math.log(1 - p); }
    function draw() { if (!s.w) return; s.clear(); var c = s.c, ph = st.k / st.n, Lmax = L(Math.min(0.999, Math.max(0.001, ph))), LLmax = LL(Math.min(0.999, Math.max(0.001, ph))), h2 = (s.h - 20) / 2;
      var A = new Frame(c, 64, 22, s.w - 82, h2 - 44, [0, 1], [0, Lmax * 1.15]);
      A.axes({ xt: [0, 0.2, 0.4, 0.6, 0.8, 1], yt: [0, Lmax / 2, Lmax], fy: function (v) { return v === 0 ? '0' : v.toExponential(1); } });
      T(c, 'Likelihood L(p) = p^k (1 − p)^(n − k)', A.L + 6, 10, { a: 'left', w: 700, c: C('--accent') });
      A.fn(L, C('--accent'), 3, alpha(C('--accent'), 0.15)); A.line(st.p, 0, st.p, L(st.p), C('--amber'), 1.5, [3, 3]); A.dot(st.p, L(st.p), 6, C('--amber-fill'), C('--fg'));
      var top = Math.ceil(LLmax), lo = top - 14, B = new Frame(c, 64, h2 + 28, s.w - 82, h2 - 50, [0, 1], [lo, top + 0.5]);
      B.axes({ xt: [0, 0.2, 0.4, 0.6, 0.8, 1], yt: [lo, lo + 7, top], fy: function (v) { return String(v).replace('-', '−'); }, xl: 'p, the probability of a severe crash' });
      T(c, 'Log-likelihood LL(p) = k ln p + (n − k) ln(1 − p)', B.L + 6, h2 + 16, { a: 'left', w: 700, c: C('--bad') });
      B.fn(LL, C('--bad'), 3); var y = Math.max(lo, LL(st.p)); B.line(st.p, lo, st.p, y, C('--amber'), 1.5, [3, 3]); B.dot(st.p, y, 6, C('--amber-fill'), C('--fg'));
      A.line(ph, 0, ph, Lmax, C('--muted'), 1, [2, 4]); B.line(ph, lo, ph, LLmax, C('--muted'), 1, [2, 4]);
      rd.innerHTML = '<span class="eq">At p = ' + st.p.toFixed(2) + ':</span> L = ' + st.p.toFixed(2) + '<sup>' + st.k + '</sup> × ' + (1 - st.p).toFixed(2) + '<sup>' + (st.n - st.k) + '</sup> = <b>' + sci(L(st.p)) + '</b> &nbsp;·&nbsp; LL = ' + st.k + ' × ln ' + st.p.toFixed(2) + ' + ' + (st.n - st.k) + ' × ln ' + (1 - st.p).toFixed(2) + ' = <b>' + f2(LL(st.p), 3) + '</b><br>' +
        '<span class="note">Both curves peak at the same place, p̂ = k ÷ n = ' + st.k + ' ÷ ' + st.n + ' = ' + ph.toFixed(3) + ' (dotted line). That is the maximum likelihood estimate. The log does not move the peak; it only turns a tiny product into a manageable sum.</span>'; }
    s.draw = draw;
  };

  /* ======================================================================
     3. Why logs: a product of probabilities collapses, a sum of logs does not
     ====================================================================== */
  LW.logs = function (root) {
    var N = 60, r0 = M.rng(7), probs = [], i; for (i = 0; i < N; i++) probs.push(0.35 + 0.55 * r0());
    var k = 0, acc = 0, r = row(root), loop;
    var play = btn(r, 'Play: add crashes one by one', function () { if (loop.running) { loop.stop(); play.textContent = 'Play'; } else { if (k >= N) k = 0; loop.start(); play.textContent = 'Pause'; } });
    btn(r, 'Reset', function () { loop.stop(); k = 0; play.textContent = 'Play: add crashes one by one'; draw(); }, true);
    btn(r, 'Show all 60', function () { loop.stop(); k = N; draw(); }, true);
    var s = stage(root, function (w) { return w < 560 ? 0.9 : 0.42; }, 280), rd = readout(root);
    loop = Loop(function (dt) { acc += dt; if (acc > 0.12) { acc = 0; k++; draw(); } if (k >= N) { play.textContent = 'Play again'; return false; } });
    function draw() { if (!s.w) return; s.clear(); var c = s.c, narrow = s.w < 560, W = narrow ? s.w - 80 : (s.w - 140) / 2, H = narrow ? (s.h - 110) / 2 : s.h - 80;
      var A = new Frame(c, 60, 30, W, H, [0, N], [0, 1]), B = narrow ? new Frame(c, 60, H + 90, W, H, [0, N], [-40, 0]) : new Frame(c, 60 + W + 70, 30, W, H, [0, N], [-40, 0]);
      A.axes({ xt: [0, 20, 40, 60], yt: [0, 0.5, 1], xl: 'crashes multiplied so far' }); B.axes({ xt: [0, 20, 40, 60], yt: [-40, -20, 0], xl: 'crashes added so far' });
      T(c, 'Product of probabilities', A.L, A.T - 14, { a: 'left', w: 700, c: C('--accent') }); T(c, 'Sum of log-probabilities', B.L, B.T - 14, { a: 'left', w: 700, c: C('--bad') });
      var prod = 1, sum = 0, j; c.save(); c.lineWidth = 3;
      c.strokeStyle = C('--accent'); c.beginPath(); c.moveTo(A.X(0), A.Y(1)); for (j = 0; j < k; j++) { prod *= probs[j]; c.lineTo(A.X(j + 1), A.Y(prod)); } c.stroke();
      c.strokeStyle = C('--bad'); c.beginPath(); c.moveTo(B.X(0), B.Y(0)); for (j = 0; j < k; j++) { sum += Math.log(probs[j]); c.lineTo(B.X(j + 1), B.Y(Math.max(-40, sum))); } c.stroke(); c.restore();
      if (k) { A.dot(k, prod, 5, C('--amber-fill')); B.dot(k, Math.max(-40, sum), 5, C('--amber-fill')); }
      rd.innerHTML = k === 0 ? 'Each crash has a probability (between 0.35 and 0.90) that the model gave to what really happened. Press play.' :
        'After <b>' + k + '</b> crashes (latest probability ' + probs[k - 1].toFixed(2) + '): product = <b>' + sci(prod) + '</b>, sum of logs = <b>' + f2(sum, 2) + '</b>. Check: ln(' + sci(prod) + ') = ' + f2(Math.log(prod), 2) + '.<br><span class="note">With thousands of crashes the product underflows to zero on a computer; the sum of logs stays an ordinary number. Same information, same best parameters.</span>'; }
    s.draw = draw;
  };

  /* ======================================================================
     4. Maximum likelihood: watching the estimator climb
     ====================================================================== */
  LW.climb = function (root) {
    var seed = 3, data, grid, gmin, gmax, b, path, it, loop, r = row(root);
    var play = btn(r, 'Climb', function () { if (loop.running) { loop.stop(); play.textContent = 'Climb'; } else { loop.start(); play.textContent = 'Pause'; } });
    btn(r, 'One step', function () { step(); draw(); }, true);
    btn(r, 'Start again', function () { loop.stop(); play.textContent = 'Climb'; reset(); draw(); }, true);
    btn(r, 'New data', function () { loop.stop(); play.textContent = 'Climb'; seed++; make(); draw(); }, true);
    var s = stage(root, function (w) { return w < 620 ? 1.25 : 0.5; }, 320), rd = readout(root);
    var X0 = [-3, 1.5], X1 = [-1, 3.5];
    function LLat(b0, b1) { var ll = 0; data.forEach(function (d) { var z = b0 + b1 * d[0]; ll += d[1] ? -Math.log(1 + Math.exp(-z)) : -Math.log(1 + Math.exp(z)); }); return ll; }
    function make() { var r = M.rng(seed * 101); data = []; for (var i = 0; i < 300; i++) { var x = M.randn(r), p = 1 / (1 + Math.exp(-(-1 + 1.5 * x))); data.push([x, r() < p ? 1 : 0]); }
      grid = []; gmin = Infinity; gmax = -Infinity; for (var a = 0; a < 50; a++) { grid.push([]); for (var c2 = 0; c2 < 50; c2++) { var v = LLat(X0[0] + (X0[1] - X0[0]) * (a + 0.5) / 50, X1[0] + (X1[1] - X1[0]) * (c2 + 0.5) / 50); grid[a].push(v); gmin = Math.min(gmin, v); gmax = Math.max(gmax, v); } } reset(); }
    function reset() { b = [1.0, -0.6]; path = [b.slice()]; it = 0; }
    function step() { var g0 = 0, g1 = 0; data.forEach(function (d) { var p = 1 / (1 + Math.exp(-(b[0] + b[1] * d[0]))); g0 += d[1] - p; g1 += (d[1] - p) * d[0]; });
      var n = data.length; if (Math.hypot(g0, g1) / n < 2e-4) return false; b[0] += 3 * g0 / n; b[1] += 3 * g1 / n; it++; path.push(b.slice()); return true; }
    loop = Loop(function () { var ok = step() && step(); draw(); if (!ok) { play.textContent = 'Reached the top'; return false; } });
    function draw() { if (!s.w) return; s.clear(); var c = s.c, narrow = s.w < 620, W = narrow ? s.w - 80 : (s.w - 150) / 2, H = narrow ? (s.h - 120) / 2 : s.h - 80;
      var A = new Frame(c, 60, 28, W, H, X0, X1), B = narrow ? new Frame(c, 60, H + 100, W, H, [-3, 3], [-0.08, 1.08]) : new Frame(c, 60 + W + 80, 28, W, H, [-3, 3], [-0.08, 1.08]);
      var off = document.createElement('canvas'), oc, a, k; off.width = 50; off.height = 50; oc = off.getContext('2d');
      for (a = 0; a < 50; a++) for (k = 0; k < 50; k++) { var t = Math.pow((grid[a][k] - gmin) / (gmax - gmin), 6); oc.fillStyle = alpha(C('--accent'), 0.08 + 0.8 * t); oc.fillRect(a, 49 - k, 1, 1); }
      c.save(); c.imageSmoothingEnabled = true; c.drawImage(off, A.L, A.T, A.W, A.H); c.restore();
      A.axes({ xt: [-3, -2, -1, 0, 1], yt: [-1, 0, 1, 2, 3], xl: 'β₀ (intercept)', yl: 'β₁ (slope)' });
      T(c, 'The log-likelihood hill (darker = higher)', A.L, 14, { a: 'left', w: 700 });
      c.save(); c.strokeStyle = C('--amber'); c.lineWidth = 2.5; c.beginPath(); path.forEach(function (p, j) { var x = A.X(p[0]), y = A.Y(p[1]); if (j) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); c.restore();
      A.dot(path[0][0], path[0][1], 5, C('--surface'), C('--amber')); A.dot(b[0], b[1], 7, C('--amber-fill'), C('--fg'));
      B.axes({ xt: [-3, -2, -1, 0, 1, 2, 3], yt: [0, 0.5, 1], xl: 'x' }); T(c, 'The data and the current curve', B.L, B.T - 14, { a: 'left', w: 700 });
      var jr = M.rng(9); data.forEach(function (d) { B.dot(d[0], d[1] ? 1 - 0.05 * jr() : 0.05 * jr(), 2.4, alpha(d[1] ? C('--bad') : C('--accent'), 0.55)); });
      B.fn(function (x) { return 1 / (1 + Math.exp(-(b[0] + b[1] * x))); }, C('--amber'), 3);
      B.fn(function (x) { return 1 / (1 + Math.exp(-(-1 + 1.5 * x))); }, C('--muted'), 1.5, null, [5, 4]);
      rd.innerHTML = '<span class="eq">Step ' + it + ': β₀ = ' + f2(b[0]) + ', β₁ = ' + f2(b[1]) + ', LL = ' + f2(LLat(b[0], b[1]), 2) + '</span><br><span class="note">300 simulated crashes (red dots at the top were severe). Each step moves uphill along the slope of LL. The dashed grey curve is the truth used to simulate (β₀ = −1, β₁ = 1.5); the climber finds something close to it, not exactly it, because the sample is finite.</span>'; }
    make(); s.draw = draw;
  };

  /* ======================================================================
     5. Multinomial logit: score → weight → share
     ====================================================================== */
  LW.softmax = function (root) {
    var st = { v: [0, 0.3, 0.1], split: false }, disp = [0, 0.3, 0.1, 0.1], loop, c = ctl(root), sM, sS;
    sM = slider(c, 'Score of Minor injury V<sub>minor</sub>', -3, 3, 0.1, st.v[1], function (v) { return f2(v, 1); }, function (v) { st.v[1] = v; go(); });
    sS = slider(c, 'Score of Severe injury V<sub>severe</sub>', -3, 3, 0.1, st.v[2], function (v) { return f2(v, 1); }, function (v) { st.v[2] = v; go(); });
    var r = row(root);
    btn(r, 'Belted driver (−0.5, −1.5)', function () { st.v[1] = -0.5; st.v[2] = -1.5; sM.set(-0.5); sS.set(-1.5); go(); }, true);
    btn(r, 'Unbelted driver (0.3, 0.1)', function () { st.v[1] = 0.3; st.v[2] = 0.1; sM.set(0.3); sS.set(0.1); go(); }, true);
    var sp = tog(r, 'Split Severe into two identical copies (IIA test)', false, function (v) { st.split = v; go(); });
    var s = stage(root, function (w) { return w < 560 ? 0.75 : 0.42; }, 250), rd = readout(root);
    loop = Loop(function (dt) { var done = true; for (var i = 0; i < 3; i++) { disp[i] = ease(disp[i], st.v[i], dt); if (Math.abs(disp[i] - st.v[i]) > 1e-3) done = false; } disp[3] = ease(disp[3], st.split ? st.v[2] : -8, dt); if (Math.abs(disp[3] - (st.split ? st.v[2] : -8)) > 1e-3) done = false; draw(); return !done; });
    function go() { loop.start(); }
    function draw() { if (!s.w) return; s.clear(); var c = s.c, rows = st.split || disp[3] > -7.9 ? 4 : 3, names = NAMES.concat(['Severe (copy)']), cols = OC().concat([C('--bad')]);
      var v = disp.slice(0, rows), e = v.map(Math.exp), S = e.reduce(function (a, b) { return a + b; }, 0), P = e.map(function (x) { return x / S; }), emax = Math.max(4, Math.max.apply(null, e) * 1.1);
      var lab = Math.min(130, s.w * 0.22), colW = (s.w - lab - 30) / 3, top = 40, rh = (s.h - top - 14) / rows;
      ['1. Score V', '2. Weight e^V', '3. Share P = weight ÷ total'].forEach(function (t, i) { T(c, t, lab + 10 + colW * i + colW / 2, 16, { w: 700, size: s.w < 560 ? 11 : 13 }); });
      for (var i = 0; i < rows; i++) { var y = top + rh * i, mid = y + rh / 2, bh = Math.min(26, rh * 0.55), al = i === 3 ? Math.max(0, Math.min(1, (disp[3] + 8) / 8)) : 1;
        c.globalAlpha = al; T(c, names[i], 8, mid, { a: 'left', w: 600, size: s.w < 560 ? 11 : 13 });
        var x0 = lab + 10, zx = x0 + colW * 0.5, sc = colW * 0.45 / 3; c.fillStyle = C('--line'); c.fillRect(zx, y + 4, 1, rh - 8);
        rrect(c, zx, mid - bh / 2, v[i] * sc, bh, 4, cols[i]); T(c, f2(v[i], 2), zx + v[i] * sc + (v[i] >= 0 ? 6 : -6), mid, { a: v[i] >= 0 ? 'left' : 'right', size: 12, w: 600 });
        var x1 = x0 + colW + 6, ww = (colW - 60) * e[i] / emax; rrect(c, x1, mid - bh / 2, Math.max(2, ww), bh, 4, cols[i]); T(c, e[i].toFixed(3), x1 + ww + 6, mid, { a: 'left', size: 12, w: 600 });
        var x2 = x0 + 2 * colW + 6, pw = (colW - 64) * P[i]; rrect(c, x2, mid - bh / 2, Math.max(2, pw), bh, 4, cols[i]); T(c, pct(P[i]), x2 + pw + 6, mid, { a: 'left', size: 12, w: 700 });
        c.globalAlpha = 1; }
      var Pt = M.softmax(st.split ? [st.v[0], st.v[1], st.v[2], st.v[2]] : st.v), Et = st.v.map(Math.exp), St = Et.reduce(function (a, b) { return a + b; }, 0) + (st.split ? Et[2] : 0);
      rd.innerHTML = '<span class="eq">P(severe) = e<sup>V<sub>severe</sub></sup> ÷ (e<sup>0</sup> + e<sup>V<sub>minor</sub></sup> + e<sup>V<sub>severe</sub></sup>' + (st.split ? ' + e<sup>V<sub>copy</sub></sup>' : '') + ') = ' + Et[2].toFixed(4) + ' ÷ ' + St.toFixed(4) + ' = ' + Pt[2].toFixed(4) + '</span>' +
        (st.split ? '<br><span class="note">IIA at work: the copy steals share from every outcome in proportion, so Severe + copy = ' + pct(Pt[2] + Pt[3]) + ' instead of ' + pct(M.softmax(st.v)[2]) + '. Real people would see the copy as the same outcome; the multinomial logit cannot.</span>' : '<br><span class="note">No injury is the base outcome: its score is fixed at 0, so its weight is e<sup>0</sup> = 1. Shares always add up to 100%.</span>'); }
    s.draw = draw; go();
  };

  /* ======================================================================
     6. Where the logit formula comes from: random Gumbel errors
     ====================================================================== */
  LW.gumbel = function (root) {
    var st = { v: [0, 0.3, 0.1], rate: 30 }, cnt = [0, 0, 0], tot = 0, parts = [], last = null, acc = 0, rng = M.rng(11), c = ctl(root), loop;
    slider(c, 'V<sub>minor</sub>', -2, 2, 0.1, st.v[1], function (v) { return f2(v, 1); }, function (v) { st.v[1] = v; clear(); });
    slider(c, 'V<sub>severe</sub>', -2, 2, 0.1, st.v[2], function (v) { return f2(v, 1); }, function (v) { st.v[2] = v; clear(); });
    slider(c, 'Crashes per second', 2, 300, 1, st.rate, null, function (v) { st.rate = v; });
    var r = row(root), play = btn(r, 'Play', function () { if (loop.running) { loop.stop(); play.textContent = 'Play'; } else { loop.start(); play.textContent = 'Pause'; } });
    btn(r, 'Reset', function () { clear(); }, true);
    var s = stage(root, function (w) { return w < 560 ? 0.8 : 0.45; }, 260), rd = readout(root);
    function clear() { cnt = [0, 0, 0]; tot = 0; parts = []; last = null; draw(); }
    function one() { var u = st.v.map(function (v) { return v + M.gumbel(rng); }), k = u.indexOf(Math.max.apply(null, u)); cnt[k]++; tot++; last = u; if (parts.length < 120) parts.push({ k: k, t: 0, x: Math.random() }); }
    loop = Loop(function (dt) { acc += dt * st.rate; while (acc >= 1) { one(); acc -= 1; } parts.forEach(function (p) { p.t += dt * 1.6; }); parts = parts.filter(function (p) { return p.t < 1; }); draw(); });
    function draw() { if (!s.w) return; s.clear(); var c = s.c, P = M.softmax(st.v), cols = OC(), bw = (s.w - 80) / 3, base = s.h - 40, top = 70, H = base - top - 20;
      T(c, 'Each crash: total = V + random error ε (Gumbel); the largest total is what happens', s.w / 2, 16, { w: 600, size: s.w < 560 ? 11 : 13 });
      for (var i = 0; i < 3; i++) { var x = 40 + bw * i, sh = tot ? cnt[i] / tot : 0;
        rrect(c, x + bw * 0.15, base - H * sh, bw * 0.7, H * sh, 6, alpha(cols[i], 0.85));
        c.save(); c.strokeStyle = C('--fg'); c.lineWidth = 2.5; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(x + bw * 0.08, base - H * P[i]); c.lineTo(x + bw * 0.92, base - H * P[i]); c.stroke(); c.restore();
        T(c, NAMES[i], x + bw / 2, base + 16, { w: 600, size: 12 }); T(c, (tot ? pct(sh) : '–') + ' simulated · ' + pct(P[i]) + ' formula', x + bw / 2, base - H * Math.max(sh, P[i]) - 12, { size: 11, w: 600 });
        if (last) T(c, 'V+ε = ' + f2(last[i], 2), x + bw / 2, 44, { size: 12, c: last[i] === Math.max.apply(null, last) ? cols[i] : C('--muted'), w: 700 }); }
      parts.forEach(function (p) { var x = 40 + bw * p.k + bw * (0.25 + 0.5 * p.x), y = 56 + (base - 60) * p.t; c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fillStyle = cols[p.k]; c.fill(); });
      c.fillStyle = C('--muted'); c.fillRect(30, base, s.w - 60, 1);
      rd.innerHTML = '<b>' + tot + '</b> simulated crashes. Coloured bars: share from the simulation. Dashed lines: the multinomial logit formula. <span class="note">With many crashes they match: if the errors are independent Gumbel draws, the chance that an outcome has the largest total is exactly e<sup>V</sup> ÷ Σ e<sup>V</sup>.</span>'; }
    s.draw = draw;
  };

  /* ======================================================================
     7. The ladder of the coefficient: fixed → spread → shift → stretch
        data-level: mnl | rpl | hm | hmv | all
     ====================================================================== */
  LW.dist = function (root) {
    var lvl0 = root.getAttribute('data-level') || 'all', st = { lvl: lvl0 === 'all' ? 'hmv' : lvl0, b: 1.6, s: 1.2, th: 0.5, om: -0.4, Z: false, W: false };
    var LV = { mnl: 0, rpl: 1, hm: 2, hmv: 3 }, ladder;
    if (lvl0 === 'all') { ladder = el('div', 'ladder'); root.appendChild(ladder); [['mnl', 'MNL'], ['rpl', 'RPL'], ['hm', 'RPLHM'], ['hmv', 'RPLHMV']].forEach(function (o, i) { if (i) ladder.appendChild(el('span', 'arr', '→')); var b = el('button', 'rung' + (i === 3 ? ' last' : ''), o[1]); b.type = 'button'; b.dataset.l = o[0]; b.onclick = function () { st.lvl = o[0]; sync(); }; ladder.appendChild(b); }); }
    var c = ctl(root);
    var sB = slider(c, 'Mean effect β', -1, 3, 0.1, st.b, function (v) { return f2(v, 1); }, function (v) { st.b = v; go(); });
    var sSd = slider(c, 'Spread σ (standard deviation)', 0.1, 2.5, 0.1, st.s, function (v) { return v.toFixed(1); }, function (v) { st.s = v; go(); });
    var sTh = slider(c, 'Θ: shift in the mean for young drivers', -1.5, 1.5, 0.1, st.th, function (v) { return f2(v, 1); }, function (v) { st.th = v; go(); });
    var sOm = slider(c, 'ω: stretch of the spread at night', -1.2, 1.2, 0.1, st.om, function (v) { return f2(v, 1) + ' (×' + Math.exp(v).toFixed(2) + ')'; }, function (v) { st.om = v; go(); });
    var r = row(root), tZ = tog(r, 'Young driver (Z = 1)', false, function (v) { st.Z = v; go(); }), tW = tog(r, 'Night-time crash (W = 1)', false, function (v) { st.W = v; go(); });
    var s = stage(root, function (w) { return w < 560 ? 0.75 : 0.42; }, 260), rd = readout(root);
    var dr = M.rng(5), om = []; for (var i = 0; i < 60; i++) om.push([M.randn(dr), dr()]);
    var disp = { m: st.b, sd: 0.001 }, loop = Loop(function (dt) { var t = target(); disp.m = ease(disp.m, t.m, dt, 5); disp.sd = ease(disp.sd, t.sd, dt, 5); draw(); return Math.abs(disp.m - t.m) > 1e-3 || Math.abs(disp.sd - t.sd) > 1e-3; });
    function L() { return LV[st.lvl]; }
    function target() { var l = L(); return { m: st.b + (l >= 2 && st.Z ? st.th : 0), sd: l === 0 ? 0.001 : st.s * (l >= 3 && st.W ? Math.exp(st.om) : 1) }; }
    function go() { loop.start(); }
    function sync() { var l = L(); sSd.lab.hidden = l < 1; sTh.lab.hidden = l < 2; sOm.lab.hidden = l < 3; tZ.el.hidden = l < 2; tW.el.hidden = l < 3; if (ladder) [].forEach.call(ladder.querySelectorAll('.rung'), function (b) { b.setAttribute('aria-pressed', b.dataset.l === st.lvl); }); go(); }
    function draw() { if (!s.w) return; s.clear(); var c = s.c, l = L(), F = new Frame(c, 50, 30, s.w - 66, s.h - 74, [-3, 6], [0, 0.72]);
      F.axes({ xt: [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6], yt: [], xl: 'β: effect of being unbelted on the severe-injury score, crash by crash' });
      F.line(0, 0, 0, 0.72, C('--muted'), 1, [3, 3]); T(c, '← protective', F.X(0) - 6, 40, { a: 'right', size: 11, c: C('--muted') }); T(c, 'harmful →', F.X(0) + 6, 40, { a: 'left', size: 11, c: C('--muted') });
      var m = disp.m, sd = disp.sd, t = target();
      if (l === 0 || sd < 0.05) { F.line(m, 0, m, 0.66, C('--accent'), 4); T(c, 'every crash: β = ' + m.toFixed(2), F.X(m) + 8, F.Y(0.62), { a: 'left', w: 700 }); }
      else {
        if (l >= 2 && (st.Z || (l >= 3 && st.W))) F.fn(function (x) { return M.npdf(x, st.b, st.s); }, C('--muted'), 1.5, null, [5, 4]);
        F.area(function (x) { return M.npdf(x, m, sd); }, -3, 0, alpha(C('--bad'), 0.35));
        F.fn(function (x) { return M.npdf(x, m, sd); }, C('--accent'), 3, alpha(C('--accent'), 0.12));
        F.line(m, 0, m, M.npdf(m, m, sd), C('--accent'), 1.5, [4, 3]);
        om.forEach(function (o) { var bx = m + sd * o[0]; if (bx > -3 && bx < 6) F.dot(bx, 0.02 + 0.06 * o[1], 3, alpha(bx < 0 ? C('--bad') : C('--fg'), 0.7)); });
        if (l >= 2 && (st.Z || (l >= 3 && st.W))) T(c, 'dashed: the reference group (Z = 0, W = 0)', s.w - 16, 16, { a: 'right', size: 11, c: C('--muted') });
      }
      var neg = l === 0 ? (t.m < 0 ? 1 : 0) : Phi(-t.m / t.sd), P = l === 0 ? M.probUnbelted(t.m) : M.avgProb(t.m, t.sd), eq;
      if (l === 0) eq = 'β = ' + f2(st.b, 1) + ' (one number for every crash)';
      else if (l === 1) eq = 'β<sub>n</sub> = ' + f2(st.b, 1) + ' + ' + st.s.toFixed(1) + ' × ν<sub>n</sub>';
      else if (l === 2) eq = 'β<sub>n</sub> = ' + f2(st.b, 1) + ' + ' + f2(st.th, 1) + ' × Z<sub>n</sub> + ' + st.s.toFixed(1) + ' × ν<sub>n</sub>';
      else eq = 'β<sub>n</sub> = ' + f2(st.b, 1) + ' + ' + f2(st.th, 1) + ' × Z<sub>n</sub> + ' + st.s.toFixed(1) + ' × e<sup>' + f2(st.om, 1) + ' × W<sub>n</sub></sup> × ν<sub>n</sub>';
      var tag = ['MNL: fixed', 'RPL: spread', 'RPLHM: spread + shift', 'RPLHMV: spread + shift + stretch'][l];
      rd.innerHTML = '<span class="pill' + (l === 3 ? ' g' : '') + '">' + tag + '</span> <span class="eq">' + eq + '</span>' + (l ? ' &nbsp;<span class="note">(ν<sub>n</sub> is a standard normal draw)</span>' : '') +
        '<br>For this crash group: mean = <b>' + t.m.toFixed(2) + '</b>' + (l ? ', spread = <b>' + t.sd.toFixed(3) + '</b>, share of crashes where being unbelted lowers severity = Φ(−mean ÷ spread) = <b>' + pct(neg) + '</b>' : '') +
        '<br>Average probability of severe injury for an unbelted driver: <b>' + pct(P[2]) + '</b> (belted: ' + pct(M.probBelted()[2]) + ')'; }
    s.draw = draw; sync();
  };

  /* ======================================================================
     8. Simulated probability: average over draws (random or Halton)
     ====================================================================== */
  LW.sim = function (root) {
    var st = { kind: 'random', draws: [] }, rng = M.rng(21), truth = M.avgProb(1.6, 1.2)[2], queue = 0, r = row(root), loop;
    seg(r, [['random', 'Random draws'], ['halton', 'Halton draws']], 'random', function (v) { st.kind = v; st.draws = []; rng = M.rng(21); draw(); });
    btn(r, '+1 draw', function () { add(1); }); btn(r, '+10', function () { add(10); }, true); btn(r, '+200', function () { add(200); }, true); btn(r, 'Reset', function () { queue = 0; st.draws = []; rng = M.rng(21); draw(); }, true);
    var s = stage(root, function (w) { return w < 620 ? 1.2 : 0.45; }, 300), rd = readout(root);
    function nextOmega() { var i = st.draws.length + 1; return st.kind === 'halton' ? invNorm(halton(i, 2)) : M.randn(rng); }
    function add(k) { queue += k; loop.start(); }
    loop = Loop(function () { var k = Math.max(1, Math.ceil(queue / 12)); for (var i = 0; i < k && queue > 0; i++, queue--) { var w = nextOmega(), b = 1.6 + 1.2 * w; st.draws.push({ w: w, b: b, p: M.probUnbelted(b)[2] }); } draw(); return queue > 0; });
    function draw() { if (!s.w) return; s.clear(); var c = s.c, narrow = s.w < 620, W = narrow ? s.w - 80 : (s.w - 150) / 2, H = narrow ? (s.h - 120) / 2 : s.h - 80;
      var A = new Frame(c, 60, 28, W, H, [-3, 6], [0, 1]), R = Math.max(20, st.draws.length), B = narrow ? new Frame(c, 60, H + 100, W, H, [0, R], [0, 0.8]) : new Frame(c, 60 + W + 80, 28, W, H, [0, R], [0, 0.8]);
      A.axes({ xt: [-3, -1, 1, 3, 5], yt: [0, 0.5, 1], xl: 'drawn β = 1.6 + 1.2 × ν', yl: 'P(severe | β)' }); T(c, 'Each draw gives one logit probability', A.L, 14, { a: 'left', w: 700 });
      A.fn(function (x) { return M.npdf(x, 1.6, 1.2) * 1.8; }, C('--line'), 1, alpha(C('--accent'), 0.1));
      A.fn(function (x) { return M.probUnbelted(x)[2]; }, C('--bad'), 2.5);
      st.draws.slice(-300).forEach(function (d, i, a) { A.dot(d.b, d.p, i === a.length - 1 ? 6 : 3, i === a.length - 1 ? C('--amber-fill') : alpha(C('--fg'), 0.45)); });
      B.axes({ xt: [0, Math.round(R / 2), R], yt: [0, 0.2, 0.4, 0.6, 0.8], xl: 'number of draws R' }); T(c, 'Running average = simulated probability', B.L, B.T - 14, { a: 'left', w: 700 });
      B.line(0, truth, R, truth, C('--fg'), 1.5, [6, 4]);
      var sum = 0; c.save(); c.strokeStyle = C('--amber'); c.lineWidth = 2.5; c.beginPath(); st.draws.forEach(function (d, i) { sum += d.p; var x = B.X(i + 1), y = B.Y(sum / (i + 1)); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); c.restore();
      var n = st.draws.length, avg = n ? sum / n : NaN;
      rd.innerHTML = n ? '<span class="eq">P̃(severe) = (1/R) Σ P(severe | β<sub>r</sub>) = ' + avg.toFixed(4) + '</span> with R = ' + n + ' ' + (st.kind === 'halton' ? 'Halton' : 'random') + ' draws. Exact (by quadrature): ' + truth.toFixed(4) + '; error ' + f2(avg - truth, 4) + '.<br><span class="note">Halton draws spread evenly over the bell, so they settle down with far fewer draws than random ones. Try 10 of each.</span>'
        : 'The probability of a severe injury is an integral over the bell of β, with no closed form. Add draws: each one is a single "possible crash", and the average of their probabilities approximates the integral.'; }
    s.draw = draw;
  };

  /* ======================================================================
     9. Marginal effects: what switching Unbelted 0 → 1 does
     ====================================================================== */
  LW.me = function (root) {
    var st = { lvl: root.getAttribute('data-level') === 'rpl' ? 'rpl' : 'mnl', t: 0, tgt: 1 }, r = row(root), loop;
    seg(r, [['mnl', 'Multinomial logit (fixed β)'], ['rpl', 'Random parameters (β ~ N(1.6, 1.2²))']], st.lvl, function (v) { st.lvl = v; st.t = 0; loop.start(); });
    btn(r, 'Replay 0 → 1', function () { st.t = 0; loop.start(); }, true);
    var s = stage(root, function (w) { return w < 560 ? 0.7 : 0.4; }, 250), rd = readout(root);
    loop = Loop(function (dt) { st.t = Math.min(1, st.t + dt * 0.9); draw(); return st.t < 1; });
    function draw() { if (!s.w) return; s.clear(); var c = s.c, P0 = M.probBelted(), P1 = st.lvl === 'mnl' ? M.probUnbelted(1.6) : M.avgProb(1.6, 1.2), cols = OC(), gw = (s.w - 60) / 3, base = s.h - 44, H = base - 50, k = st.t * st.t * (3 - 2 * st.t);
      for (var i = 0; i < 3; i++) { var x = 30 + gw * i, bw = gw * 0.28, p1 = P0[i] + (P1[i] - P0[i]) * k;
        rrect(c, x + gw * 0.16, base - H * P0[i], bw, H * P0[i], 5, alpha(cols[i], 0.4)); rrect(c, x + gw * 0.56, base - H * p1, bw, H * p1, 5, cols[i]);
        T(c, pct(P0[i]), x + gw * 0.16 + bw / 2, base - H * P0[i] - 10, { size: 12, w: 600 }); T(c, pct(p1), x + gw * 0.56 + bw / 2, base - H * p1 - 10, { size: 12, w: 700 });
        T(c, 'belted', x + gw * 0.16 + bw / 2, base + 12, { size: 11, c: C('--muted') }); T(c, 'unbelted', x + gw * 0.56 + bw / 2, base + 12, { size: 11, c: C('--muted') });
        T(c, NAMES[i] + '  Δ = ' + (k > 0.99 ? sg(P1[i] - P0[i]) : '…'), x + gw / 2, base + 30, { w: 700, size: 12 }); }
      c.fillStyle = C('--muted'); c.fillRect(20, base, s.w - 40, 1);
      rd.innerHTML = '<span class="eq">Marginal effect of Unbelted = P(outcome | Unbelted = 1) − P(outcome | Unbelted = 0)</span><br>No injury ' + sg(P1[0] - P0[0]) + ' · Minor ' + sg(P1[1] - P0[1]) + ' · Severe ' + sg(P1[2] - P0[2]) + ' (they add to zero)' +
        (st.lvl === 'rpl' ? '<br><span class="note">With a random parameter the unbelted probabilities are averaged over the bell of β (here by quadrature; software uses draws). The effect on Severe grows from +0.198 to ' + sg(P1[2] - P0[2]) + ' because the logit curve is not a straight line.</span>' : '<br><span class="note">In a real study this difference is computed for every crash in the data and then averaged: the average marginal effect.</span>'); }
    s.draw = draw; setTimeout(function () { loop.start(); }, 300);
  };

  /* ======================================================================
     10. Likelihood ratio test: restricted vs unrestricted
     ====================================================================== */
  LW.lr = function (root) {
    var PRE = [['Coin: p = 0.5 vs p̂ = 0.3', -6.931, -6.109, 1], ['MNL → RPL', -2450.3, -2431.8, 2], ['RPL → RPLHM', -2431.8, -2422.5, 2], ['RPLHM → RPLHMV', -2422.5, -2418.1, 2]];
    var st = { r: -2450.3, u: -2431.8, df: 2, shown: 0 }, r = row(root), c, loop;
    PRE.forEach(function (p) { btn(r, p[0], function () { st.r = p[1]; st.u = p[2]; st.df = p[3]; iR.value = p[1]; iU.value = p[2]; iD.value = p[3]; st.shown = 0; loop.start(); }, true); });
    c = ctl(root);
    function num(label, v, on) { var lab = el('label', null, '<span>' + label + '</span>'), i = el('input'); i.type = 'number'; i.step = 'any'; i.value = v; i.oninput = function () { on(+i.value); st.shown = 0; loop.start(); }; lab.appendChild(i); c.appendChild(lab); return i; }
    var iR = num('LL of the restricted (simpler) model', st.r, function (v) { st.r = v; }), iU = num('LL of the unrestricted (richer) model', st.u, function (v) { st.u = v; }), iD = num('Degrees of freedom (extra parameters)', st.df, function (v) { st.df = Math.max(1, Math.round(v)); });
    var s = stage(root, function (w) { return w < 560 ? 0.7 : 0.38; }, 240), rd = readout(root);
    loop = Loop(function (dt) { var stat = Math.max(0, -2 * (st.r - st.u)); st.shown = ease(st.shown, stat, dt, 3); if (Math.abs(st.shown - stat) < 0.01) st.shown = stat; draw(); return st.shown !== stat; });
    function draw() { if (!s.w) return; s.clear(); var c = s.c, stat = Math.max(0, -2 * (st.r - st.u)), crit = M.chi2inv(0.95, st.df), xmax = Math.max(12, crit * 2, stat * 1.15), ymax = st.df === 1 ? 0.6 : Math.min(0.6, M.chi2pdf(Math.max(0.01, st.df - 2), st.df) * 1.3);
      var F = new Frame(c, 50, 24, s.w - 66, s.h - 68, [0, xmax], [0, ymax]);
      var stp = xmax > 60 ? 20 : xmax > 30 ? 10 : xmax > 14 ? 5 : 2, xt = []; for (var q = 0; q <= xmax; q += stp) xt.push(q); F.axes({ xt: xt, yt: [], xl: 'χ² with ' + st.df + ' degree' + (st.df > 1 ? 's' : '') + ' of freedom: the size of LR that luck alone produces' });
      F.area(function (x) { return M.chi2pdf(x, st.df); }, crit, xmax, alpha(C('--amber-fill'), 0.5));
      F.fn(function (x) { return M.chi2pdf(x, st.df); }, C('--accent'), 2.5);
      F.line(crit, 0, crit, ymax * 0.8, C('--amber'), 2, [5, 4]); T(c, '95% line = ' + crit.toFixed(2), F.X(crit) + 6, F.Y(ymax * 0.82), { a: 'left', size: 12, w: 700, c: C('--amber') });
      var x = Math.min(st.shown, xmax); F.line(x, 0, x, ymax * 0.6, stat > crit ? C('--bad') : C('--fg'), 3); T(c, 'LR = ' + st.shown.toFixed(2), F.X(x) + (x > xmax * 0.7 ? -6 : 6), F.Y(ymax * 0.64), { a: x > xmax * 0.7 ? 'right' : 'left', w: 700 });
      var p = 1 - M.chi2cdf(stat, st.df);
      rd.innerHTML = '<span class="eq">LR = −2 × [LL<sub>restricted</sub> − LL<sub>unrestricted</sub>] = −2 × [' + f2(st.r, 3).replace(/\.?0+$/, '') + ' − (' + f2(st.u, 3).replace(/\.?0+$/, '') + ')] = ' + stat.toFixed(2) + '</span><br>Critical value (95%, ' + st.df + ' df) = ' + crit.toFixed(2) + ' · p-value = ' + (p < 1e-4 ? p.toExponential(2) : p.toFixed(4)) +
        '<br><b>' + (stat > crit ? 'LR is beyond the line: the extra parameters improve the fit by more than luck would. Keep the richer model.' : 'LR is inside the line: the improvement is the size luck alone often gives. Keep the simpler model.') + '</b>'; }
    s.draw = draw; loop.start();
  };

  /* ---------- mounting ---------- */
  LW.mount = function (box) { if (box.dataset.mounted) return; var w = box.getAttribute('data-w'); if (LW[w]) { box.dataset.mounted = 1; box.classList.add('lw'); LW[w](box); } };
  LW.mountAll = function (root) { [].forEach.call((root || document).querySelectorAll('[data-w]'), LW.mount); };
})();
