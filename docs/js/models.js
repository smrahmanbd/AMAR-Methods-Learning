/* Tools for the model family page. All numbers are illustrative. */
(function () {
  var L = function (v) { return 1 / (1 + Math.exp(-v)); };
  function bars(items, x0, w, base, hmax, vmax) {   // items: [label, value, colourVar, text]
    var o = '', step = w / items.length;
    items.forEach(function (it, i) { var h = it[1] / vmax * hmax, x = x0 + i * step + step * 0.18, bw = step * 0.64;
      o += '<rect x="' + x.toFixed(1) + '" y="' + (base - h).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="5" fill="' + css(it[2]) + '"/>' + txt(x + bw / 2, base - h - 8, it[3], { w: 700 }) + txt(x + bw / 2, base + 19, it[0], { size: 13, c: css('--muted') }); });
    return o + '<line x1="' + x0 + '" x2="' + (x0 + w) + '" y1="' + base + '" y2="' + base + '" stroke="' + css('--muted') + '"/>';
  }
  var pct = function (p) { return (p * 100).toFixed(1) + '%'; };

  /* 1. multinomial logit */
  function mnl() {
    var s = [+$('m-1').value, +$('m-2').value, +$('m-3').value], e = s.map(Math.exp), sum = e[0] + e[1] + e[2], p = e.map(function (v) { return v / sum; }), names = ['no injury', 'injury', 'fatal'], cols = ['--accent', '--amber-fill', '--bad'];
    s.forEach(function (v, i) { $('m-' + (i + 1) + 'v').textContent = f2(v, 1); });
    var o = txt(200, 30, 'Step 1 · weight = e^score', { w: 700 }) + txt(610, 30, 'Step 2 · probability = weight ÷ total', { w: 700 });
    o += bars(names.map(function (n, i) { return [n, e[i], cols[i], e[i].toFixed(2)]; }), 40, 320, 240, 170, Math.max(3, Math.max.apply(null, e)));
    o += bars(names.map(function (n, i) { return [n, p[i], cols[i], pct(p[i])]; }), 450, 320, 240, 170, 1);
    o += txt(410, 150, '→', { size: 30, c: css('--muted') });
    $('m-svg').innerHTML = o;
    $('m-read').innerHTML = 'Weights: ' + e.map(function (v) { return v.toFixed(2); }).join(' + ') + ' = <b>' + sum.toFixed(2) + '</b>. Probabilities: <b>' + p.map(pct).join('</b>, <b>') + '</b>. They always add to 100%. Adding the same number to all three scores changes nothing: only the differences between scores matter.';
  }
  ['m-1', 'm-2', 'm-3'].forEach(function (id) { $(id).oninput = mnl; });

  /* 2. nested logit: where does the lost share go? */
  function nestP(v, lam) { var a = 1, b = Math.exp(v / lam), I = Math.log(a + b), top = Math.exp(lam * I), pn = top / (1 + top); return [1 - pn, pn * a / (a + b), pn * b / (a + b)]; }
  function nest() {
    var v = +$('n-v').value, lam = +$('n-l').value, b0 = nestP(0, lam), p = nestP(v, lam), names = ['no injury', 'minor injury', 'severe injury'], cols = ['--accent', '--amber-fill', '--bad'];
    $('n-vv').textContent = f2(v, 1); $('n-lv').textContent = lam.toFixed(2);
    var o = txt(200, 30, 'Before (all scores equal)', { w: 700 }) + txt(610, 30, 'After the change', { w: 700 });
    o += bars(names.map(function (n, i) { return [n, b0[i], cols[i], pct(b0[i])]; }), 40, 320, 240, 170, 1) + bars(names.map(function (n, i) { return [n, p[i], cols[i], pct(p[i])]; }), 450, 320, 240, 170, 1) + txt(410, 150, '→', { size: 30, c: css('--muted') });
    o += '<path d="M' + (40 + 320 / 3 + 10) + ' 268 v10 h' + (2 * 320 / 3 - 20) + ' v-10" fill="none" stroke="' + css('--muted') + '"/>' + txt(40 + 320 * 2 / 3, 294, 'the “injury” nest', { size: 13, c: css('--muted') });
    $('n-svg').innerHTML = o;
    var lost = b0[2] - p[2], toMinor = p[1] - b0[1], share = lost > 0.002 ? toMinor / lost : null;
    $('n-read').innerHTML = Math.abs(v) < 0.05 ? 'Nothing has changed yet. Lower the score of severe injury, as a new safety feature might.' :
      'Severe injury ' + (lost > 0 ? 'lost' : 'gained') + ' <b>' + pct(Math.abs(lost)) + '</b>. ' + (share === null ? '' : '<b>' + Math.round(share * 100) + '%</b> of that went to minor injury and ' + Math.round((1 - share) * 100) + '% to no injury. ') +
      (lam > 0.97 ? 'With the similarity setting at 1.00 this is exactly the plain multinomial logit: the lost share is split in proportion to the other two outcomes.' : 'Because the two injury outcomes share unrecorded causes, most of the lost share stays inside the nest. A plain multinomial logit would send too much of it to “no injury”.');
  }
  $('n-v').oninput = nest; $('n-l').oninput = nest;

  /* 3. ordered logit */
  function ord() {
    var x = +$('o-x').value, t1 = 0, t2 = 2, X = function (v) { return 60 + (v + 6) / 14 * 700; }, base = 230, dens = function (z) { var e = Math.exp(-(z - x)); return e / ((1 + e) * (1 + e)); }, Y = function (d) { return base - d / 0.25 * 170; };
    $('o-xv').textContent = f2(x, 1);
    function area(a, b, col) { var d = 'M' + X(a) + ',' + base; for (var z = a; z <= b + 1e-9; z += 0.1) d += ' L' + X(z).toFixed(1) + ',' + Y(dens(z)).toFixed(1); return '<path d="' + d + ' L' + X(b) + ',' + base + ' Z" fill="' + css(col) + '" opacity=".85"/>'; }
    var p = [L(t1 - x), L(t2 - x) - L(t1 - x), 1 - L(t2 - x)], o = area(-6, t1, '--accent') + area(t1, t2, '--amber-fill') + area(t2, 8, '--bad');
    o += '<line x1="60" x2="760" y1="' + base + '" y2="' + base + '" stroke="' + css('--muted') + '"/>';
    [t1, t2].forEach(function (t, i) { o += '<line x1="' + X(t) + '" x2="' + X(t) + '" y1="40" y2="' + base + '" stroke="' + css('--fg') + '" stroke-dasharray="5 5"/>' + txt(X(t) + (i ? 6 : -6), 32, 'threshold ' + (i + 1) + ' = ' + t, { size: 13, a: i ? 'start' : 'end' }); });
    o += txt(X(-3), base + 22, 'no injury ' + pct(p[0]), { c: css('--accent'), w: 700 }) + txt(X(1), base + 22, 'injury ' + pct(p[1]), { c: css('--amber'), w: 700 }) + txt(X(5), base + 22, 'fatal ' + pct(p[2]), { c: css('--bad'), w: 700 });
    o += txt(410, 282, 'hidden “severity tendency” of a crash; the bump is centred on the crash’s score', { size: 13, c: css('--muted') });
    $('o-svg').innerHTML = o;
    $('o-read').innerHTML = 'With a score of <b>' + f2(x, 1) + '</b>: no injury <b>' + pct(p[0]) + '</b>, injury <b>' + pct(p[1]) + '</b>, fatal <b>' + pct(p[2]) + '</b>. One score moves the whole bump. Raising it always lowers the lowest level and raises the highest; the middle level can go either way.';
  }
  $('o-x').oninput = ord;

  /* 4. mixed (random parameters) logit */
  var xz = []; for (var i = 0; i < 300; i++) xz.push(randn());
  function mix() {
    var mu = +$('x-m').value, sd = +$('x-s').value, nb = 20, bins = [], k, t = 0, w = 0;
    $('x-mv').textContent = f2(mu, 1); $('x-sv').textContent = sd.toFixed(1);
    for (k = 0; k < nb; k++) bins.push(0);
    xz.forEach(function (z) { bins[Math.min(nb - 1, Math.floor(L(mu + sd * z) * nb))]++; });
    for (var z = -6; z <= 6; z += 0.02) { var g = Math.exp(-z * z / 2); t += g * L(mu + sd * z); w += g; }
    var avg = t / w, fixed = L(mu), X = function (p) { return 60 + p * 700; }, base = 240, mx = Math.max(40, Math.max.apply(null, bins)), o = '';
    bins.forEach(function (n, j) { var h = n / mx * 180; o += '<rect x="' + (X(j / nb) + 1) + '" y="' + (base - h) + '" width="' + (700 / nb - 2) + '" height="' + h + '" rx="2" fill="' + css('--accent') + '" opacity=".75"/>'; });
    o += '<line x1="60" x2="760" y1="' + base + '" y2="' + base + '" stroke="' + css('--muted') + '"/>';
    for (k = 0; k <= 4; k++) o += txt(X(k / 4), base + 20, (k * 25) + '%', { size: 13, c: css('--muted') });
    o += '<line x1="' + X(fixed) + '" x2="' + X(fixed) + '" y1="52" y2="' + base + '" stroke="' + css('--fg') + '" stroke-width="2.5" stroke-dasharray="6 5"/>' + txt(X(fixed), 44, 'fixed-parameter model', { size: 13, a: fixed > avg ? 'start' : 'end' });
    o += '<line x1="' + X(avg) + '" x2="' + X(avg) + '" y1="28" y2="' + base + '" stroke="' + css('--amber') + '" stroke-width="3"/>' + txt(X(avg), 20, 'mixed logit (average)', { size: 13, c: css('--amber'), w: 700, a: fixed > avg ? 'end' : 'start' });
    o += txt(410, 284, 'each person’s own probability of a severe outcome (300 simulated people)', { size: 13, c: css('--muted') });
    $('x-svg').innerHTML = o;
    $('x-read').innerHTML = 'Each person has their own probability. The mixed logit reports their average, <b>' + pct(avg) + '</b>. A fixed-parameter logit that uses only the mean effect would say <b>' + pct(fixed) + '</b>.' + (sd < 0.05 ? ' With no spread the two agree: the mixed logit becomes the ordinary logit.' : ' The wider the spread, the further apart the two answers.');
  }
  $('x-m').oninput = mix; $('x-s').oninput = mix;

  /* 5. latent class */
  function lc() {
    var sh = +$('l-s').value / 100, pa = +$('l-a').value / 100, pb = +$('l-b').value / 100, p = sh * pa + (1 - sh) * pb, o = '', k, nA = Math.round(sh * 100);
    $('l-sv').textContent = Math.round(sh * 100) + '%'; $('l-av').textContent = Math.round(pa * 100) + '%'; $('l-bv').textContent = Math.round(pb * 100) + '%';
    for (k = 0; k < 100; k++) { var a = k < nA, x = 40 + (k % 20) * 25, y = 50 + Math.floor(k / 20) * 25, sev = a ? (k / Math.max(1, nA) < pa) : ((k - nA) / Math.max(1, 100 - nA) < pb);
      o += '<circle cx="' + x + '" cy="' + y + '" r="9" fill="' + css(a ? '--accent' : '--amber-fill') + '"/>' + (sev ? '<circle cx="' + x + '" cy="' + y + '" r="4" fill="' + css('--fg') + '"/>' : ''); }
    o += txt(40, 30, '100 crashes: teal = hidden class A, amber = hidden class B, dark centre = severe', { a: 'start', size: 13, c: css('--muted') });
    o += bars([['class A', pa, '--accent', pct(pa)], ['class B', pb, '--amber-fill', pct(pb)], ['all crashes', p, '--fg', pct(p)]], 560, 230, 170, 110, 1);
    o += txt(675, 212, 'probability of a severe outcome', { size: 13, c: css('--muted') });
    $('l-svg').innerHTML = o;
    $('l-read').innerHTML = 'Overall probability = ' + sh.toFixed(2) + ' × ' + pa.toFixed(2) + ' + ' + (1 - sh).toFixed(2) + ' × ' + pb.toFixed(2) + ' = <b>' + p.toFixed(3) + '</b>. The analyst never sees which class a crash belongs to. The model estimates the class shares and one set of effects per class, all at once.';
  }
  ['l-s', 'l-a', 'l-b'].forEach(function (id) { $(id).oninput = lc; });

  function all() { mnl(); nest(); ord(); mix(); lc(); }
  all(); initSteps(); onTheme(all);
})();
/* count models: Poisson against negative binomial */
(function () {
  if (!$('k-m')) return;
  function draw() {
    var m = +$('k-m').value, a = +$('k-a').value, N = 13, po = [], nb = [], k, X = function (i) { return 70 + i * 54; }, base = 240;
    $('k-mv').textContent = m.toFixed(1); $('k-av').textContent = a.toFixed(1);
    po[0] = Math.exp(-m); for (k = 1; k < N; k++) po[k] = po[k - 1] * m / k;
    if (a < 0.01) nb = po.slice(); else { var r = 1 / a, p = r / (r + m); nb[0] = Math.pow(p, r); for (k = 1; k < N; k++) nb[k] = nb[k - 1] * (k - 1 + r) / k * (1 - p); }
    var mx = Math.max(0.3, Math.max.apply(null, po.concat(nb))), o = '<line x1="60" x2="770" y1="' + base + '" y2="' + base + '" stroke="' + css('--muted') + '"/>';
    for (k = 0; k < N; k++) { var h1 = po[k] / mx * 190, h2 = nb[k] / mx * 190; o += '<rect x="' + X(k) + '" y="' + (base - h1) + '" width="20" height="' + h1 + '" rx="3" fill="' + css('--accent') + '"/><rect x="' + (X(k) + 22) + '" y="' + (base - h2) + '" width="20" height="' + h2 + '" rx="3" fill="' + css('--amber-fill') + '"/>' + txt(X(k) + 21, base + 19, k, { size: 13, c: css('--muted') }); }
    o += '<rect x="520" y="22" width="14" height="14" rx="3" fill="' + css('--accent') + '"/>' + txt(540, 34, 'Poisson', { a: 'start', size: 13 }) + '<rect x="620" y="22" width="14" height="14" rx="3" fill="' + css('--amber-fill') + '"/>' + txt(640, 34, 'negative binomial', { a: 'start', size: 13 }) + txt(415, 282, 'number of crashes on a segment in a year', { size: 13, c: css('--muted') });
    $('k-svg').innerHTML = o;
    $('k-read').innerHTML = 'Both models have a mean of <b>' + m.toFixed(1) + '</b> crashes. Poisson variance = mean = <b>' + m.toFixed(1) + '</b>. Negative binomial variance = mean + α × mean² = <b>' + (m + a * m * m).toFixed(1) + '</b>. Chance of zero crashes: Poisson <b>' + (po[0] * 100).toFixed(1) + '%</b>, negative binomial <b>' + (nb[0] * 100).toFixed(1) + '%</b>.' + (a < 0.01 ? ' With α = 0 the two models are the same.' : ' Extra spread means more segments with zero crashes and more with very many, which is what real crash counts look like.');
  }
  $('k-m').oninput = draw; $('k-a').oninput = draw; draw(); onTheme(draw);
})();
