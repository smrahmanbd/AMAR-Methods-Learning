/* Seven animated, interactive tools. All data are simulated for teaching. */
(function () {
  var raf = window.requestAnimationFrame;
  function animate(ms, step, done) { if (REDUCED) { step(1); if (done) done(); return; } var t0 = null; raf(function f(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / ms); step(k); if (k < 1) raf(f); else if (done) done(); }); }

  /* ---------- 1. unobserved heterogeneity: mixing distributions ---------- */
  var HN = 300, hz = [], hu = [], hShown = HN;
  for (var i = 0; i < HN; i++) { hz.push(randn()); hu.push([Math.random(), Math.random()]); }
  function hSample(i) {
    var d = $('h-dist').value, c = +$('h-c').value, s = +$('h-s').value;
    if (d === 'normal') return c + s * hz[i];
    if (d === 'uniform') return c + s * Math.sqrt(3) * (2 * hu[i][0] - 1);
    if (d === 'triangular') return c + s * Math.sqrt(6) * (hu[i][0] + hu[i][1] - 1);
    return Math.max(Math.abs(c), 0.05) * Math.exp(s * hz[i] - s * s / 2);          // lognormal: always positive
  }
  function het() {
    var c = +$('h-c').value, s = +$('h-s').value, nb = 32, bins = [], k, pos = 0, sum = 0, X = function (v) { return 60 + (v + 4) / 8 * 700; }, base = 250;
    $('h-cv').textContent = f2(c); $('h-sv').textContent = s.toFixed(2);
    for (k = 0; k < nb; k++) bins.push(0);
    for (k = 0; k < hShown; k++) { var v = hSample(k); sum += v; if (v > 0) pos++; var b = Math.floor((v + 4) / 0.25); if (b >= 0 && b < nb) bins[b]++; }
    var mx = Math.max(20, Math.max.apply(null, bins)), o = '<line x1="60" x2="760" y1="' + base + '" y2="' + base + '" stroke="' + css('--muted') + '"/>';
    bins.forEach(function (n, j) { var h = n / mx * 200, v0 = -4 + j * 0.25; o += '<rect x="' + (X(v0) + 1) + '" y="' + (base - h) + '" width="' + (700 / nb - 2) + '" height="' + h + '" rx="2" fill="' + css(v0 >= 0 ? '--amber-fill' : '--accent') + '"/>'; });
    for (k = -4; k <= 4; k += 2) o += txt(X(k), base + 22, k === 0 ? '0' : (k > 0 ? '+' : '−') + Math.abs(k), { c: css('--muted') });
    o += '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="30" y2="' + base + '" stroke="' + css('--fg') + '" stroke-dasharray="5 5"/>';
    o += txt(410, 292, 'effect of the variable for each person (negative lowers risk, positive raises it)', { size: 13, c: css('--muted') });
    if (hShown) { var m = sum / hShown; o += '<line x1="' + X(m) + '" x2="' + X(m) + '" y1="44" y2="' + base + '" stroke="' + css('--fg') + '" stroke-width="2.5"/>' + txt(X(m), 34, 'the single value a fixed-parameter model reports', { size: 13 }); }
    $('h-svg').innerHTML = o;
    var share = hShown ? pos / hShown : 0, d = $('h-dist').value;
    $('h-read').innerHTML = !hShown ? 'Sampling…' : s < 0.03 ? 'With no spread, all ' + hShown + ' people share one effect. That is the fixed-parameter assumption.'
      : 'Of ' + hShown + ' people, the variable <b>raises</b> risk for <b>' + Math.round(share * 100) + '%</b> and <b>lowers</b> it for <b>' + Math.round((1 - share) * 100) + '%</b>.' + (d === 'lognormal' ? ' A lognormal distribution keeps every effect on one side of zero. Analysts choose it when the sign must be the same for everyone.' : ' A fixed-parameter model would hide this split behind one average.');
  }
  ['h-dist', 'h-c', 'h-s'].forEach(function (id) { $(id).oninput = function () { hShown = HN; het(); }; });
  $('h-go').onclick = function () { for (var i = 0; i < HN; i++) { hz[i] = randn(); hu[i] = [Math.random(), Math.random()]; } animate(1500, function (k) { hShown = Math.round(k * HN); het(); }); };

  /* ---------- 2. simulated maximum likelihood ---------- */
  var SM = 0.5, SS = 1, sDraws = [], sMode = 'random', sTimer = null, sTrue = (function () { var t = 0, w = 0; for (var z = -6; z <= 6; z += 0.01) { var p = Math.exp(-z * z / 2); t += p / (1 + Math.exp(-(SM + SS * z))); w += p; } return t / w; })();
  function sAdd(n) { for (var i = 0; i < n && sDraws.length < 200; i++) { var z = sMode === 'halton' ? invNorm(halton(sDraws.length + 1, 2)) : randn(); sDraws.push(1 / (1 + Math.exp(-(SM + SS * z)))); } sml(); }
  function sml() {
    var X = function (n) { return 70 + n / 200 * 690; }, Y = function (p) { return 250 - (p - 0.35) / 0.5 * 210; }, o = '', run = 0, path = '', i;
    for (var g = 0.4; g <= 0.81; g += 0.1) o += '<line x1="70" x2="760" y1="' + Y(g) + '" y2="' + Y(g) + '" stroke="' + css('--line') + '"/>' + txt(62, Y(g) + 5, g.toFixed(1), { a: 'end', c: css('--muted'), size: 13 });
    for (i = 0; i <= 200; i += 50) o += txt(X(i), 272, i, { c: css('--muted'), size: 13 });
    o += txt(415, 293, 'number of draws', { size: 13, c: css('--muted') });
    o += '<line x1="70" x2="760" y1="' + Y(sTrue) + '" y2="' + Y(sTrue) + '" stroke="' + css('--amber') + '" stroke-width="3" stroke-dasharray="8 6"/>' + txt(756, Y(sTrue) - 8, 'exact answer ' + sTrue.toFixed(3), { a: 'end', c: css('--amber'), w: 700, size: 13 });
    sDraws.forEach(function (p, k) { run += p; var avg = run / (k + 1); path += (k ? ' L' : 'M') + X(k + 1).toFixed(1) + ',' + Y(Math.max(0.35, Math.min(0.85, avg))).toFixed(1); o += '<circle cx="' + X(k + 1).toFixed(1) + '" cy="' + Y(Math.max(0.35, Math.min(0.85, p))).toFixed(1) + '" r="2.5" fill="' + css('--muted') + '" opacity=".45"/>'; });
    if (path) o += '<path d="' + path + '" fill="none" stroke="' + css('--accent') + '" stroke-width="3"/>';
    $('s-svg').innerHTML = o;
    var n = sDraws.length, avg = n ? run / n : 0;
    $('s-read').innerHTML = !n ? 'No draws yet. Each draw is one possible value of the effect; its grey dot is the probability that value gives.'
      : 'After <b>' + n + '</b> ' + (sMode === 'halton' ? 'Halton' : 'random') + ' draw' + (n > 1 ? 's' : '') + ', the simulated probability is <b>' + avg.toFixed(3) + '</b>. The exact value is ' + sTrue.toFixed(3) + ', so the error is <b>' + Math.abs(avg - sTrue).toFixed(3) + '</b>.' + (n >= 200 ? ' That is the limit of this chart.' : '');
  }
  $('s-1').onclick = function () { sAdd(1); }; $('s-10').onclick = function () { sAdd(10); };
  $('s-reset').onclick = function () { clearInterval(sTimer); sTimer = null; $('s-play').textContent = 'Play'; sDraws = []; sml(); };
  $('s-play').onclick = function () { if (sTimer) { clearInterval(sTimer); sTimer = null; this.textContent = 'Play'; return; } var b = this; b.textContent = 'Pause'; sTimer = setInterval(function () { sAdd(2); if (sDraws.length >= 200) { clearInterval(sTimer); sTimer = null; b.textContent = 'Play'; } }, 60); };
  $('s-mode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sMode = b.dataset.m; [].forEach.call(this.children, function (c) { c.setAttribute('aria-pressed', c === b); }); $('s-reset').onclick(); });

  /* ---------- 3. endogeneity: ice-warning signs ---------- */
  var eMode = 'risk', eSeg = [], eShown = 0, COLS = 20, ROWS = 8;
  function eNew() {
    var n = COLS * ROWS, i; eSeg = [];
    for (i = 0; i < n; i++) eSeg.push({ ice: Math.exp(0.7 * randn()), i: i });
    var order = eSeg.slice().sort(function (a, b) { return b.ice - a.ice; });
    eSeg.forEach(function (s) { var rank = order.indexOf(s); s.sign = eMode === 'risk' ? (rank < n * 0.3 ? Math.random() < 0.9 : Math.random() < 0.05) : Math.random() < 0.3; s.rank = rank; });
    eSeg.forEach(function (s) { var mean = 6 * s.ice * (s.sign ? 0.8 : 1); s.y = Math.max(0, Math.round(mean + Math.sqrt(mean) * randn())); });
    var signs = eSeg.filter(function (s) { return s.sign; }).sort(function (a, b) { return eMode === 'risk' ? a.rank - b.rank : a.i - b.i; });
    signs.forEach(function (s, k) { s.ord = k; });
    animate(1200, function (k) { eShown = Math.round(k * signs.length); endo(); });
  }
  function endo() {
    var showIce = $('e-ice').checked, o = '', a = [], b = [];
    eSeg.forEach(function (s) {
      var x = 20 + (s.i % COLS) * 26, y = 44 + Math.floor(s.i / COLS) * 26, t = Math.min(1, Math.log(s.ice + 1) / 1.6);
      o += '<rect x="' + x + '" y="' + y + '" width="23" height="23" rx="4" fill="' + (showIce ? css('--accent') : css('--line')) + '" opacity="' + (showIce ? (0.15 + 0.85 * t).toFixed(2) : 1) + '"/>';
      var on = s.sign && s.ord < eShown; if (on) o += '<path d="M' + (x + 11.5) + ' ' + (y + 4) + ' l8 14 h-16 z" fill="' + css('--amber-fill') + '" stroke="' + css('--fg') + '" stroke-width="1"/>';
      (s.sign ? a : b).push(s.y);
    });
    o += txt(20, 30, showIce ? 'Road segments: darker = icier (hidden from the analyst)' : 'Road segments (the analyst sees no ice information). Triangles are warning signs.', { a: 'start', size: 13, c: css('--muted') });
    var avg = function (l) { return l.reduce(function (t, v) { return t + v; }, 0) / Math.max(1, l.length); }, ya = avg(a), yb = avg(b), mx = Math.max(ya, yb, 8) * 1.2, base = 252, Y = function (v) { return base - v / mx * 180; };
    o += '<rect x="590" y="' + Y(yb) + '" width="70" height="' + (base - Y(yb)) + '" rx="5" fill="' + css('--accent') + '"/>' + txt(625, Y(yb) - 8, yb.toFixed(1), { w: 700 }) + txt(625, base + 18, 'no sign', { size: 13, c: css('--muted') });
    o += '<rect x="690" y="' + Y(ya) + '" width="70" height="' + (base - Y(ya)) + '" rx="5" fill="' + css('--amber-fill') + '"/>' + txt(725, Y(ya) - 8, ya.toFixed(1), { w: 700 }) + txt(725, base + 18, 'sign', { size: 13, c: css('--muted') });
    o += txt(675, 292, 'average crashes per segment', { size: 13, c: css('--muted') });
    $('e-svg').innerHTML = o;
    var naive = (ya / yb - 1) * 100;
    $('e-read').innerHTML = 'Naive comparison: segments with a sign have <b>' + (naive >= 0 ? naive.toFixed(0) + '% more' : Math.abs(naive).toFixed(0) + '% fewer') + '</b> crashes. The true effect of a sign is <b>20% fewer</b>. ' +
      (eMode === 'risk' ? 'Signs were put where ice is worst, so the comparison mixes the sign’s effect with the ice nobody recorded. Tick “Show the hidden ice” to see it.' : 'With random placement the two groups are alike in iciness, so the comparison lands near the truth.');
  }
  $('e-mode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; eMode = b.dataset.m; [].forEach.call(this.children, function (c) { c.setAttribute('aria-pressed', c === b); }); eNew(); });
  $('e-run').onclick = eNew; $('e-ice').onchange = endo;

  /* ---------- 4. spatial correlation ---------- */
  var PC = 16, PR = 6, pNoise = [], pVal = [], pOld = null;
  function pField(rho) {
    var v = pNoise.slice(), it, i;
    for (it = 0; it < 12; it++) { var w = v.slice(); for (i = 0; i < PC * PR; i++) { var x = i % PC, y = Math.floor(i / PC), s = 0, n = 0; if (x > 0) { s += v[i - 1]; n++; } if (x < PC - 1) { s += v[i + 1]; n++; } if (y > 0) { s += v[i - PC]; n++; } if (y < PR - 1) { s += v[i + PC]; n++; } w[i] = (1 - rho) * pNoise[i] + rho * s / n * 1.9; } v = w; }
    var m = v.reduce(function (a, c) { return a + c; }, 0) / v.length, sd = Math.sqrt(v.reduce(function (a, c) { return a + (c - m) * (c - m); }, 0) / v.length) || 1;
    return v.map(function (c) { return (c - m) / sd; });
  }
  function pCorr(v) { var sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0, n = 0; function add(a, b) { sx += a; sy += b; sxy += a * b; sxx += a * a; syy += b * b; n++; } for (var i = 0; i < PC * PR; i++) { if (i % PC < PC - 1) add(v[i], v[i + 1]); if (i + PC < PC * PR) add(v[i], v[i + PC]); } return (sxy - sx * sy / n) / Math.sqrt((sxx - sx * sx / n) * (syy - sy * sy / n)); }
  function pDraw(v) {
    var o = '';
    v.forEach(function (c, i) { var x = 32 + (i % PC) * 46, y = 16 + Math.floor(i / PC) * 46, t = Math.max(-1, Math.min(1, c / 1.8)); o += '<rect x="' + x + '" y="' + y + '" width="42" height="42" rx="7" fill="' + (t >= 0 ? css('--amber-fill') : css('--accent')) + '" opacity="' + (0.12 + 0.88 * Math.abs(t)).toFixed(2) + '"/>'; });
    $('p-svg').innerHTML = o;
  }
  function spatial(anim) {
    var rho = +$('p-r').value; $('p-rv').textContent = rho.toFixed(2);
    var nv = pField(rho), from = pOld || nv;
    if (anim) animate(350, function (k) { pDraw(nv.map(function (c, i) { return from[i] + (c - from[i]) * k; })); }); else pDraw(nv);
    pOld = nv; var r = pCorr(nv);
    $('p-read').innerHTML = 'Each square is a road segment; amber means more crashes than the model explained, teal means fewer. Neighbouring squares have a correlation of <b>' + f2(r) + '</b>. ' + (r < 0.15 ? 'That is close to random scatter, which is what a model assumes when it treats segments as independent.' : r < 0.5 ? 'Patches are forming: neighbours share something the model left out.' : 'Strong patches. Treating these 96 segments as 96 independent pieces of evidence would overstate how much we know.');
  }
  function pNew() { pNoise = []; for (var i = 0; i < PC * PR; i++) pNoise.push(randn()); spatial(true); }
  $('p-r').oninput = function () { spatial(false); }; $('p-new').onclick = pNew;

  /* ---------- 5. temporal instability ---------- */
  var tNoise = [], tShown = 10; for (i = 0; i < 10; i++) tNoise.push(randn());
  function tmp() {
    var d = +$('t-d').value, nz = +$('t-n').value, yrs = 10, b = [], k;
    $('t-dv').textContent = f2(d); $('t-nv').textContent = nz.toFixed(2);
    for (k = 0; k < yrs; k++) b.push(0.5 + d * k + nz * tNoise[k]);
    var pooled = b.reduce(function (a, c) { return a + c; }, 0) / yrs, X = function (k) { return 90 + k * 70; }, Y = function (v) { return 190 - v * 95; };
    var o = '<line x1="60" x2="760" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="' + css('--muted') + '" stroke-dasharray="4 5"/>' + txt(56, Y(0) + 5, '0', { a: 'end', c: css('--muted') });
    if (tShown >= yrs) o += '<line x1="70" x2="740" y1="' + Y(pooled) + '" y2="' + Y(pooled) + '" stroke="' + css('--amber') + '" stroke-width="3"/>' + txt(744, Y(pooled) - 8, 'pooled: ' + f2(pooled), { a: 'end', c: css('--amber'), w: 700 });
    var path = ''; b.slice(0, tShown).forEach(function (v, k) { path += (k ? ' L' : 'M') + X(k) + ',' + Y(v).toFixed(1); });
    if (path) o += '<path d="' + path + '" fill="none" stroke="' + css('--accent') + '" stroke-width="2.5"/>';
    b.forEach(function (v, k) { if (k < tShown) o += '<circle cx="' + X(k) + '" cy="' + Y(v).toFixed(1) + '" r="7" fill="' + css('--accent') + '"/>'; o += txt(X(k), 286, 'Year ' + (k + 1), { size: 12, c: css('--muted') }); });
    $('t-svg').innerHTML = o;
    var gap = b[yrs - 1] - pooled, flip = b[0] * b[yrs - 1] < 0;
    $('t-read').innerHTML = tShown < yrs ? 'Estimating year ' + tShown + ' of 10…' : Math.abs(d) < 0.005 ? 'No drift: the pooled estimate, <b>' + f2(pooled) + '</b>, describes every year about equally well.'
      : 'The effect moved from <b>' + f2(b[0]) + '</b> in year 1 to <b>' + f2(b[yrs - 1]) + '</b> in year 10. The pooled estimate, ' + f2(pooled) + ', is off by <b>' + f2(Math.abs(gap)) + '</b> for the most recent year, the one a forecast depends on.' + (flip ? ' The effect even changed sign.' : '');
  }
  $('t-d').oninput = tmp; $('t-n').oninput = tmp;
  $('t-play').onclick = function () { animate(2200, function (k) { tShown = Math.round(k * 10); tmp(); }); };

  /* ---------- 6. prediction vs. causality: who drives in the snow? ---------- */
  function pc() {
    var h = +$('pc-h').value / 100; $('pc-hv').textContent = Math.round(h * 100) + '%';
    var cOn = 500 * (1 - h), clear = (500 * 0.005 + 500 * 0.02) / 1000, snow = (cOn * 0.01 + 500 * 0.04) / (cOn + 500), ratio = snow / clear, o = '', k;
    o += txt(30, 34, 'On the road on a snow day', { a: 'start', w: 700 });
    for (k = 0; k < 50; k++) { var x = 36 + (k % 25) * 19, y = 62 + Math.floor(k / 25) * 20; o += '<circle cx="' + x + '" cy="' + y + '" r="7.5" fill="' + css('--accent') + '" opacity="' + (k < Math.round(50 * (1 - h)) ? 1 : 0.13) + '"/>'; }
    for (k = 0; k < 50; k++) { x = 36 + (k % 25) * 19; y = 122 + Math.floor(k / 25) * 20; o += '<circle cx="' + x + '" cy="' + y + '" r="7.5" fill="' + css('--amber-fill') + '"/>'; }
    o += txt(30, 180, 'Teal: cautious drivers (faded = stayed home). Amber: risk-takers, who drive anyway.', { a: 'start', size: 13, c: css('--muted') });
    var base = 262, Y = function (v) { return base - v / 0.045 * 190; };
    o += '<rect x="560" y="' + Y(clear) + '" width="72" height="' + (base - Y(clear)) + '" rx="5" fill="' + css('--muted') + '"/>' + txt(596, Y(clear) - 8, (clear * 100).toFixed(2) + '%', { w: 700 }) + txt(596, base + 18, 'clear day', { size: 13, c: css('--muted') });
    o += '<rect x="668" y="' + Y(snow) + '" width="72" height="' + (base - Y(snow)) + '" rx="5" fill="' + css('--fg') + '"/>' + txt(704, Y(snow) - 8, (snow * 100).toFixed(2) + '%', { w: 700 }) + txt(704, base + 18, 'snow day', { size: 13, c: css('--muted') });
    o += txt(650, 300, 'crash rate among drivers on the road', { size: 13, c: css('--muted') });
    $('pc-svg').innerHTML = o;
    $('pc-read').innerHTML = 'Snow truly <b>doubles</b> every driver’s crash risk. The data show a snow-day crash rate <b>' + ratio.toFixed(1) + ' times</b> the clear-day rate. ' + (h < 0.03 ? 'With everyone still driving, the data show the true effect.' : 'The extra comes from who is left on the road. A forecasting model that learns “snow day → ' + (snow * 100).toFixed(1) + '%” predicts well. It would still mislead anyone asking what snow does to a given driver.');
  }
  $('pc-h').oninput = pc;

  /* ---------- 7. conflicts to crashes ---------- */
  var cSeed = []; for (i = 0; i < 20000; i++) cSeed.push([Math.random(), Math.random(), Math.random()]);
  var SC = 0.3, TOP = 3.5, xT = TOP / SC, TRUE_P = Math.exp(-xT) * (1 + xT + xT * xT / 2), cCar = null;
  function conf() {
    var u = +$('c-u').value, n = +$('c-n').value, k, bins = [], W = 0.25, nb = 14, exc = [];
    $('c-uv').textContent = u.toFixed(1) + ' s'; $('c-nv').textContent = n.toLocaleString();
    for (k = 0; k < nb; k++) bins.push(0);
    for (k = 0; k < n; k++) { var r = cSeed[k], t = TOP - (-Math.log(r[0]) - Math.log(r[1]) - Math.log(r[2])) * SC; if (t <= 0) continue; bins[Math.min(nb - 1, Math.floor(t / W))]++; if (t < u) exc.push(u - t); }
    var mx = Math.max.apply(null, bins), X = function (t) { return 60 + t / TOP * 700; }, base = 300, o = '';
    /* the little road on top */
    o += '<rect x="60" y="14" width="700" height="44" rx="6" fill="' + css('--line') + '"/>';
    var gap = cCar ? cCar.gap : 260, lead = 560, fol = lead - 46 - gap;
    o += '<rect x="' + lead + '" y="24" width="46" height="24" rx="6" fill="' + css('--muted') + '"/><rect x="' + fol + '" y="24" width="46" height="24" rx="6" fill="' + css(cCar && cCar.ttc < u ? '--amber-fill' : '--accent') + '"/>';
    o += txt(64, 78, cCar ? 'This interaction: smallest time-to-collision so far ' + cCar.ttc.toFixed(1) + ' s' + (cCar.done ? (cCar.min < u ? ' → a conflict' : ' → ordinary') : '') : 'Press “Play one interaction” to watch a follower close in on a braking leader.', { a: 'start', size: 13, c: css('--muted') });
    o += '<line x1="60" x2="760" y1="' + base + '" y2="' + base + '" stroke="' + css('--muted') + '"/>';
    bins.forEach(function (c, j) { var h = c / mx * 190, t0 = j * W, tail = t0 + W <= u + 1e-9; o += '<rect x="' + (X(t0) + 1) + '" y="' + (base - h) + '" width="' + (X(W) - X(0) - 2) + '" height="' + h + '" fill="' + css(tail ? '--amber-fill' : '--accent') + '" opacity="' + (tail ? 1 : .55) + '"/>'; });
    for (var s = 0; s <= 3; s++) o += txt(X(s), base + 20, s + ' s', { c: css('--muted'), size: 13 });
    o += '<line x1="' + X(u) + '" x2="' + X(u) + '" y1="100" y2="' + base + '" stroke="' + css('--fg') + '" stroke-dasharray="5 5"/>' + txt(X(u) + 6, 112, 'conflict threshold', { a: 'start', size: 13 });
    o += '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="100" y2="' + base + '" stroke="' + css('--bad') + '" stroke-width="3"/>' + txt(X(0) + 6, 130, 'crash (TTC = 0)', { a: 'start', size: 13, c: css('--bad') });
    o += txt(410, 338, 'smallest time-to-collision in each interaction', { size: 13, c: css('--muted') });
    var out, truth = ' In this simulation the true rate is about 1 per ' + Math.round(1 / TRUE_P).toLocaleString() + '.';
    if (exc.length < 5) out = 'Only ' + exc.length + ' interactions fall below the threshold. That is too few to fit a tail: raise the threshold or observe more.';
    else {
      var mean = exc.reduce(function (a, c) { return a + c; }, 0) / exc.length, pTail = exc.length / n, pCrash = pTail * Math.exp(-u / mean), per = Math.round(1 / pCrash), path = '', sc = 190 / mx * (n * pTail * W / mean);
      for (var t2 = 0; t2 <= u + 1e-9; t2 += 0.05) path += (path ? ' L' : 'M') + X(t2).toFixed(1) + ',' + (base - sc * Math.exp(-(u - t2) / mean)).toFixed(1);
      o += '<path d="' + path + '" fill="none" stroke="' + css('--fg') + '" stroke-width="3"/>';
      out = '<b>' + exc.length.toLocaleString() + '</b> of ' + n.toLocaleString() + ' interactions are conflicts (' + (pTail * 100).toFixed(1) + '%). Extending the fitted tail to TTC = 0 gives about <b>1 crash per ' + per.toLocaleString() + ' interactions</b>, estimated from near misses alone.' + truth + (exc.length < 60 ? ' With so few conflicts the estimate is unstable.' : ' Move the threshold and the answer changes: choosing where the tail starts is one of the hard parts of this research.');
    }
    $('c-svg').innerHTML = o; $('c-read').innerHTML = out;
  }
  $('c-u').oninput = conf; $('c-n').oninput = conf;
  $('c-play').onclick = function () {
    var r = [Math.random(), Math.random(), Math.random()], min = Math.max(0.15, TOP - (-Math.log(r[0]) - Math.log(r[1]) - Math.log(r[2])) * SC);
    cCar = { gap: 260, ttc: 3.5, min: min, done: false };
    animate(2400, function (k) { var close = k < 0.6 ? k / 0.6 : 1 - (k - 0.6) / 0.4 * 0.5, g = 260 - (260 - min / 3.5 * 250) * close; cCar.gap = Math.max(6, g); cCar.ttc = Math.min(cCar.ttc, 3.5 - (3.5 - min) * Math.min(1, k / 0.6)); conf(); }, function () { cCar.done = true; conf(); });
  };

  function all() { het(); sml(); endo(); pDraw(pOld); spatial(false); tmp(); pc(); conf(); }
  for (i = 0; i < PC * PR; i++) pNoise.push(randn());
  pOld = pField(+$('p-r').value); eNew(); all(); initSteps(); onTheme(all);
})();
