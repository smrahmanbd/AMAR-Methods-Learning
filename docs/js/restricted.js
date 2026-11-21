/* Animated tools for "restricted and unrestricted models". Self-contained. Numbers are invented for teaching. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cv = function (n, fb) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || (fb ? cv(fb) : '#888'); };
  var AMB = function () { return cv('--amber-fill', '--amber'); };
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function T(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '" font-size="' + (o.size || 14) + '" font-weight="' + (o.w || 500) + '" fill="' + (o.c || cv('--fg')) + '" font-family="Inter,system-ui,sans-serif"' + (o.op !== undefined ? ' opacity="' + o.op + '"' : '') + '>' + s + '</text>'; }
  var mn = function (v, d) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d === undefined ? 2 : d); };
  function tween(ms, step, done) { if (REDUCED) { step(1); if (done) done(); return; } var t0 = null; requestAnimationFrame(function f(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / ms); step(k * k * (3 - 2 * k)); if (k < 1) requestAnimationFrame(f); else if (done) done(); }); }
  function lgam(x) { var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5], y = x, t = x + 5.5, s = 1.000000000190015; t -= (x + 0.5) * Math.log(t); for (var j = 0; j < 6; j++) s += c[j] / ++y; return -t + Math.log(2.5066282746310005 * s / x); }
  function gammp(a, x) { if (x <= 0) return 0; var n, gl = lgam(a); if (x < a + 1) { var ap = a, sum = 1 / a, del = sum; for (n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-12) break; } return sum * Math.exp(-x + a * Math.log(x) - gl); }
    var b = x + 1 - a, c = 1e300, d = 1 / b, h = d; for (n = 1; n < 500; n++) { var an = -n * (n - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; var de = d * c; h *= de; if (Math.abs(de - 1) < 1e-12) break; } return 1 - Math.exp(-x + a * Math.log(x) - gl) * h; }
  var chiCdf = function (x, k) { return gammp(k / 2, x / 2); };
  function chiCrit(k, conf) { var lo = 0, hi = 10 * k + 60; for (var i = 0; i < 70; i++) { var m = (lo + hi) / 2; if (chiCdf(m, k) < conf) lo = m; else hi = m; } return (lo + hi) / 2; }
  function chiPdf(x, k) { return x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.LN2 - lgam(k / 2)); }
  var xl = function (k, n) { return k <= 0 || k >= n ? 0 : k * Math.log(k / n) + (n - k) * Math.log(1 - k / n); };

  /* ---------- A. one line or two? ---------- */
  var DATA = { clear: [30, 45], small: [36, 40] }, fd = 'clear', fs = 0, ft = 1;
  var FCAP = ['<b>The data.</b> 100 crashes with a seat belt and 100 without. The bars show the share that ended in injury. Two models will now try to describe these two bars.',
    '<b>The restricted model</b> is allowed only one number: a single injury share for everybody. The best it can do is the overall average. The red gaps show what it gets wrong.',
    '<b>The unrestricted model</b> is allowed two numbers: one share per group. It can sit exactly on each bar. It always fits at least as well, because it can copy the restricted model if it wants to.',
    '<b>How much better?</b> Each model has a log-likelihood (closer to zero is better). The statistic is −2 times the difference: zero if the extra freedom bought nothing, large if it bought a lot.',
    '<b>The verdict.</b> One extra number was allowed, so there is 1 degree of freedom, and chance alone rarely pushes the statistic beyond 3.84.'];
  function fit() {
    var d = DATA[fd], pool = (d[0] + d[1]) / 2, base = 250, Y = function (p) { return base - p / 60 * 200; }, o = '', k = ft, llr = xl(d[0] + d[1], 200), llu = xl(d[0], 100) + xl(d[1], 100), stat = -2 * (llr - llu);
    o += '<line x1="60" x2="430" y1="' + base + '" y2="' + base + '" stroke="' + cv('--muted') + '"/>';
    [0, 20, 40, 60].forEach(function (g) { o += T(52, Y(g) + 5, g + '%', { a: 'end', size: 12, c: cv('--muted') }); });
    [[110, d[0], 'seat belt', cv('--accent')], [280, d[1], 'no seat belt', AMB()]].forEach(function (b) { o += '<rect x="' + b[0] + '" y="' + Y(b[1]) + '" width="100" height="' + (base - Y(b[1])) + '" rx="6" fill="' + b[3] + '"/>' + T(b[0] + 50, base + 20, b[2], { size: 13, c: cv('--muted') }) + T(b[0] + 50, Y(b[1]) + 22, b[1] + '%', { w: 700, c: b[0] === 110 ? cv('--accent-fg', '--surface') : cv('--fg') }); });
    if (fs >= 1) { var yr = fs === 1 ? Y(55 + (pool - 55) * k) : Y(pool), op = fs === 2 ? 1 - 0.65 * k : fs > 2 ? 0.35 : 1;
      o += '<g opacity="' + op + '"><line x1="85" x2="405" y1="' + yr + '" y2="' + yr + '" stroke="' + cv('--fg') + '" stroke-width="3" stroke-dasharray="9 6"/>' ;
      if (fs === 1) o += T(245, 38, 'one share for everyone: ' + pool.toFixed(1) + '%', { size: 12, w: 700, op: k });
      if (fs > 1 || k > 0.95) [[160, d[0]], [330, d[1]]].forEach(function (g) { o += '<line x1="' + g[0] + '" x2="' + g[0] + '" y1="' + Y(pool) + '" y2="' + Y(g[1]) + '" stroke="' + cv('--bad') + '" stroke-width="5"/>'; });
      o += '</g>'; }
    if (fs >= 2) { var kk = fs === 2 ? k : 1; [[110, d[0]], [280, d[1]]].forEach(function (g) { var y = Y(pool + (g[1] - pool) * kk); o += '<line x1="' + (g[0] - 8) + '" x2="' + (g[0] + 108) + '" y1="' + y + '" y2="' + y + '" stroke="' + cv('--fg') + '" stroke-width="4"/>'; }); o += T(245, 38, 'two shares: ' + d[0] + '% and ' + d[1] + '%', { size: 12, w: 700, op: kk }); }
    /* right-hand panel: the two log-likelihoods and the statistic */
    var X0 = 480, W = 300, sc = function (ll) { return (ll + 140) / 20 * W; };
    if (fs >= 1) o += T(X0, 60, 'Restricted: log-likelihood', { a: 'start', size: 13 }) + '<rect x="' + X0 + '" y="70" width="' + Math.max(4, sc(llr) * (fs === 1 ? k : 1)) + '" height="20" rx="4" fill="' + cv('--muted') + '"/>' + T(X0 + sc(llr) + 8, 85, mn(llr), { a: 'start', w: 700 });
    if (fs >= 2) o += T(X0, 125, 'Unrestricted: log-likelihood', { a: 'start', size: 13 }) + '<rect x="' + X0 + '" y="135" width="' + Math.max(4, sc(llu) * (fs === 2 ? k : 1)) + '" height="20" rx="4" fill="' + cv('--accent') + '"/>' + T(X0 + sc(llu) + 8, 150, mn(llu), { a: 'start', w: 700 });
    if (fs >= 3) { var kk3 = fs === 3 ? k : 1; o += '<rect x="' + (X0 + sc(llr)) + '" y="162" width="' + Math.max(2, (sc(llu) - sc(llr)) * kk3) + '" height="12" fill="' + cv('--bad') + '"/>' + T(X0 + sc(llr) - 6, 173, 'the gap', { a: 'end', size: 12, c: cv('--bad') }) + T(X0, 200, 'statistic = −2 × [' + mn(llr) + ' − (' + mn(llu) + ')] = ' + (stat * kk3).toFixed(2), { a: 'start', w: 700 }); }
    if (fs >= 4) { var RX = function (v) { return X0 + Math.min(v, 8) / 8 * W; }; o += '<line x1="' + X0 + '" x2="' + (X0 + W) + '" y1="250" y2="250" stroke="' + cv('--muted') + '"/><rect x="' + RX(3.84) + '" y="240" width="' + (X0 + W - RX(3.84)) + '" height="10" fill="' + cv('--bad') + '" opacity=".5"/>' + T(RX(3.84), 232, '3.84', { size: 12 }) + T(X0, 268, '0', { size: 12, c: cv('--muted') }) + '<path d="M' + RX(stat * k) + ' 252 l-8 14 h16 z" fill="' + AMB() + '" stroke="' + cv('--fg') + '"/>' + T(RX(stat * k), 282, stat.toFixed(2), { size: 13, w: 700 }); }
    $('ft-svg').innerHTML = o;
    $('ft-read').innerHTML = '<b>Step ' + (fs + 1) + ' of 5.</b> ' + FCAP[fs] + (fs === 4 ? (stat > 3.84 ? ' Here the statistic is ' + stat.toFixed(2) + ': <b>rejected</b>. One share is not enough; the groups differ.' : ' Here the statistic is ' + stat.toFixed(2) + ': <b>not rejected</b>. One share describes both groups about as well as two.') : '');
    $('ft-next').textContent = fs === 4 ? 'Start again' : 'Next step';
  }
  function fgo(s) { fs = s; ft = 0; tween(900, function (k) { ft = k; fit(); }); }
  $('ft-next').onclick = function () { fgo(fs === 4 ? 0 : fs + 1); };
  $('ft-data').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fd = b.dataset.d; [].forEach.call(this.children, function (c) { c.setAttribute('aria-pressed', c === b); }); fs = 0; ft = 1; fit(); });

  /* ---------- B. restrictions are locks ---------- */
  var EX = {
    zero: { q: 'Does adverse weather matter at all?', slots: ['constant', 'rollover', '140 km/h', 'weather'], locks: { 3: '= 0' }, df: '1 lock → 1 degree of freedom', rej: 'the lock does not hold: weather matters, keep it in the model.', not: 'weather can be dropped.' },
    random: { q: 'Should two effects be random parameters?', slots: ['β rollover', 'σ rollover', 'β weather', 'σ weather'], locks: { 1: '= 0', 3: '= 0' }, df: '2 locks → 2 degrees of freedom', rej: 'the spreads are needed: keep the random parameters.', not: 'fixed parameters are enough.' },
    merge: { q: 'Can dual and single carriageways share one model?', slots: ['constant D', 'rollover D', 'speed D', 'constant S', 'rollover S', 'speed S'], locks: { 3: '= D', 4: '= D', 5: '= D' }, df: '3 locks → 3 degrees of freedom (K₁ + K₂ − K pooled = 3 + 3 − 3)', rej: 'the road classes differ: model them separately.', not: 'the two classes can be merged.' },
    years: { q: 'Is the rollover effect the same in all three years?', slots: ['rollover 2020', 'rollover 2021', 'rollover 2022', 'weather 2020', 'weather 2021', 'weather 2022'], locks: { 1: '= 2020', 2: '= 2020' }, df: '2 locks → 2 degrees of freedom (weather stays free: “partially” constrained)', rej: 'the rollover effect changed over the years.', not: 'the rollover effect is temporally stable.' },
    transfer: { q: 'Does the expressway model describe dual-carriageway crashes?', slots: ['constant', 'rollover', '140 km/h', 'weather'], locks: { 0: '= A', 1: '= A', 2: '= A', 3: '= A' }, df: '4 locks → 4 degrees of freedom (every parameter is fixed at model A’s value)', rej: 'model A does not transfer to data B.', not: 'model A transfers.' } };
  var le = 'zero', lt = 1;
  function locks() {
    var E = EX[le], n = E.slots.length, w = Math.min(118, 700 / n - 8), x0 = 410 - (n * (w + 8) - 8) / 2, o = '', ids = Object.keys(E.locks), shown = lt * ids.length;
    function row(y, title, locked) { var s = T(x0, y - 12, title, { a: 'start', w: 700, size: 13 }); E.slots.forEach(function (lab, i) { var x = x0 + i * (w + 8), li = ids.indexOf(String(i)), on = locked && li >= 0, k = on ? Math.max(0, Math.min(1, shown - li)) : 0;
        s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="70" rx="8" fill="' + cv('--surface') + '" stroke="' + (k > 0.5 ? AMB() : cv('--accent')) + '" stroke-width="2.5"/>' + T(x + w / 2, y + 19, lab, { size: 12 });
        if (!locked || li < 0) s += T(x + w / 2, y + 50, 'free', { size: 13, w: 700, c: cv('--accent') });
        else { var ly = y + 40 - (1 - k) * 40; s += '<g opacity="' + k + '"><path d="M' + (x + w / 2 - 8) + ' ' + (ly + 1) + ' v-5 a8 8 0 0 1 16 0 v5" fill="none" stroke="' + AMB() + '" stroke-width="3.5"/><rect x="' + (x + w / 2 - 30) + '" y="' + ly + '" width="60" height="24" rx="6" fill="' + AMB() + '"/>' + T(x + w / 2, ly + 17, E.locks[i], { size: 12, w: 700, c: '#14213D' }) + '</g>'; } });
      return s; }
    o += row(44, 'Unrestricted model: every parameter is free to take its best value', false) + row(168, 'Restricted model: some parameters are locked', true);
    o += T(410, 272, 'degrees of freedom = number of locks = ' + Math.round(shown) + (lt >= 1 ? '' : ' …'), { w: 700 });
    $('lk-svg').innerHTML = o;
    $('lk-read').innerHTML = '<b>' + E.q + '</b> ' + E.df + '. If the test is <b>rejected</b>, ' + E.rej + ' If it is <b>not rejected</b>, ' + E.not;
  }
  function lgo() { lt = 0; tween(1100 + 250 * Object.keys(EX[le].locks).length, function (k) { lt = k; locks(); }); }
  $('lk-ex').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; le = b.dataset.e; [].forEach.call(this.children, function (c) { c.setAttribute('aria-pressed', c === b); }); lgo(); });
  $('lk-go').onclick = lgo;

  /* ---------- C. what chance alone looks like ---------- */
  var sims = [], simT = null;
  function one() { var a = 0, b = 0; for (var i = 0; i < 100; i++) { if (Math.random() < 0.375) a++; if (Math.random() < 0.375) b++; } return Math.max(0, -2 * (xl(a + b, 200) - xl(a, 100) - xl(b, 100))); }
  function sim() {
    var mine = +$('sm-s').value, bw = 0.5, nb = 24, bins = [], i, X = function (v) { return 60 + Math.min(v, 12) / 12 * 700; }, base = 230, o = '', n = sims.length, over = 0, overMine = 0;
    $('sm-sv').textContent = mine.toFixed(2);
    for (i = 0; i < nb; i++) bins.push(0);
    sims.forEach(function (s) { bins[Math.min(nb - 1, Math.floor(s / bw))]++; if (s > 3.841) over++; if (s > mine) overMine++; });
    var top = Math.max(1, n * 0.56), H = 180;
    bins.forEach(function (c, j) { var h = Math.min(H + 10, c / top * H); o += '<rect x="' + (X(j * bw) + 1) + '" y="' + (base - h) + '" width="' + (700 / nb - 2) + '" height="' + h + '" rx="2" fill="' + (j * bw >= 3.84 - 0.34 ? cv('--bad') : cv('--accent')) + '" opacity=".8"/>'; });
    var d = ''; for (var v = 0.25; v <= 12; v += 0.1) { var p = (chiCdf(v + bw / 2, 1) - chiCdf(Math.max(0, v - bw / 2), 1)); d += (d ? ' L' : 'M') + X(v).toFixed(1) + ',' + (base - Math.min(H + 10, p / 0.56 * H)).toFixed(1); }
    o += '<path d="' + d + '" fill="none" stroke="' + cv('--fg') + '" stroke-width="2" stroke-dasharray="6 5"/><line x1="60" x2="760" y1="' + base + '" y2="' + base + '" stroke="' + cv('--muted') + '"/>';
    for (i = 0; i <= 12; i += 2) o += T(X(i), base + 18, i, { size: 12, c: cv('--muted') });
    o += '<line x1="' + X(3.841) + '" x2="' + X(3.841) + '" y1="34" y2="' + base + '" stroke="' + cv('--fg') + '" stroke-dasharray="4 4"/>' + T(X(3.841) + 6, 44, 'critical value 3.84', { a: 'start', size: 12 });
    o += '<path d="M' + X(mine) + ' ' + (base + 22) + ' l-8 14 h16 z" fill="' + AMB() + '" stroke="' + cv('--fg') + '"/>' + T(X(mine), base + 52, 'your statistic', { size: 12, w: 700 }) + T(560, 70, 'dashed curve: the chi-square distribution', { size: 12, c: cv('--muted') }) + T(410, 296, 'likelihood ratio statistic in each imaginary study', { size: 12, c: cv('--muted') });
    $('sm-svg').innerHTML = o;
    $('sm-read').innerHTML = !n ? 'No imaginary studies yet. In each one, the seat belt <b>truly makes no difference</b> (both groups have a 37.5% injury chance), 200 crashes are drawn by chance, and both models are fitted.' :
      '<b>' + n.toLocaleString() + '</b> imaginary studies in which the restriction is true. Chance alone pushed the statistic above 3.84 in <b>' + (over / n * 100).toFixed(1) + '%</b> of them (theory: 5%). It exceeded your statistic of ' + mine.toFixed(2) + ' in <b>' + (overMine / n * 100).toFixed(1) + '%</b> of them: that share is the <b>p-value</b> (theory: ' + ((1 - chiCdf(mine, 1)) * 100).toFixed(1) + '%).';
  }
  $('sm-go').onclick = function () { if (simT) return; var left = 500; if (REDUCED) { while (left--) sims.push(one()); sim(); return; } simT = setInterval(function () { for (var i = 0; i < 10 && left > 0; i++, left--) sims.push(one()); sim(); if (left <= 0) { clearInterval(simT); simT = null; } }, 40); };
  $('sm-reset').onclick = function () { clearInterval(simT); simT = null; sims = []; sim(); };
  $('sm-s').oninput = sim;

  /* ---------- D. degrees of freedom move the ruler ---------- */
  function dfr() {
    var k = +$('df-k').value, xmax = Math.max(14, k + 5 * Math.sqrt(2 * k)), X = function (v) { return 60 + v / xmax * 700; }, base = 220, peak = 0, v, d = '', o = '', c90 = chiCrit(k, 0.90), c95 = chiCrit(k, 0.95), c99 = chiCrit(k, 0.99);
    $('df-kv').textContent = k;
    for (v = 0.05; v <= xmax; v += xmax / 300) peak = Math.max(peak, Math.min(chiPdf(v, k), 0.5));
    for (v = 0.05; v <= xmax; v += xmax / 300) d += (d ? ' L' : 'M') + X(v).toFixed(1) + ',' + (base - Math.min(chiPdf(v, k), peak) / peak * 160).toFixed(1);
    o += '<path d="' + d + '" fill="none" stroke="' + cv('--accent') + '" stroke-width="3"/><line x1="60" x2="760" y1="' + base + '" y2="' + base + '" stroke="' + cv('--muted') + '"/>';
    [[c90, '90%'], [c95, '95%'], [c99, '99%']].forEach(function (c, i) { o += '<line x1="' + X(c[0]) + '" x2="' + X(c[0]) + '" y1="' + (70 + i * 18) + '" y2="' + base + '" stroke="' + (i === 1 ? cv('--bad') : cv('--muted')) + '" stroke-width="' + (i === 1 ? 2.5 : 1.5) + '" stroke-dasharray="5 4"/>' + T(X(c[0]) + 5, 66 + i * 18, c[1] + ': ' + c[0].toFixed(2), { a: 'start', size: 12, w: i === 1 ? 700 : 500 }); });
    var step = xmax > 40 ? 10 : xmax > 20 ? 5 : 2; for (v = 0; v <= xmax; v += step) o += T(X(v), base + 18, v, { size: 12, c: cv('--muted') });
    $('df-svg').innerHTML = o;
    $('df-read').innerHTML = 'With <b>' + k + '</b> degree' + (k > 1 ? 's' : '') + ' of freedom, the critical values are <b>' + c90.toFixed(2) + '</b> (90%), <b>' + c95.toFixed(2) + '</b> (95%) and <b>' + c99.toFixed(2) + '</b> (99%). Every lock you add gives chance one more way to produce a gap, so the bar the statistic must clear moves to the right. The curve is centred near the number of locks: on average, chance alone produces a statistic of about ' + k + '.';
  }
  $('df-k').oninput = dfr;

  function all() { fit(); locks(); sim(); dfr(); }
  all(); if (window.initSteps) window.initSteps();
  new MutationObserver(all).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', all);
})();
