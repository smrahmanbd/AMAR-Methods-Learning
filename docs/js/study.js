/* Tools for "a full severity study, step by step". Self-contained. All numbers are invented for teaching. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cv = function (n, fb) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || (fb ? cv(fb) : '#888'); };
  var AMB = function () { return cv('--amber-fill', '--amber'); };
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function T(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '" font-size="' + (o.size || 14) + '" font-weight="' + (o.w || 500) + '" fill="' + (o.c || cv('--fg')) + '" font-family="Inter,system-ui,sans-serif">' + s + '</text>'; }
  var mn = function (v, d) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d === undefined ? 2 : d); };
  var pct = function (p, d) { return (p * 100).toFixed(d === undefined ? 1 : d) + '%'; };
  function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); }
  var Phi = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  function lgam(x) { var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5], y = x, t = x + 5.5, s = 1.000000000190015; t -= (x + 0.5) * Math.log(t); for (var j = 0; j < 6; j++) s += c[j] / ++y; return -t + Math.log(2.5066282746310005 * s / x); }
  function gammp(a, x) { if (x <= 0) return 0; var n, gl = lgam(a); if (x < a + 1) { var ap = a, sum = 1 / a, del = sum; for (n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-12) break; } return sum * Math.exp(-x + a * Math.log(x) - gl); }
    var b = x + 1 - a, c = 1e300, d = 1 / b, h = d; for (n = 1; n < 500; n++) { var an = -n * (n - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; var de = d * c; h *= de; if (Math.abs(de - 1) < 1e-12) break; } return 1 - Math.exp(-x + a * Math.log(x) - gl) * h; }
  var chiCdf = function (x, k) { return gammp(k / 2, x / 2); };
  function chiCrit(k, conf) { var lo = 0, hi = 10 * k + 60; for (var i = 0; i < 70; i++) { var m = (lo + hi) / 2; if (chiCdf(m, k) < conf) lo = m; else hi = m; } return (lo + hi) / 2; }
  function chiPdf(x, k) { return x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.LN2 - lgam(k / 2)); }
  function chiChart(stat, k, crit, w) { // density curve with the rejection region shaded and the statistic marked
    var xmax = Math.max(crit * 1.9, k + 4 * Math.sqrt(2 * k), 8), X = function (v) { return 50 + Math.min(v, xmax) / xmax * (w - 90); }, base = 200, peak = 0, v, d = '', a = '';
    for (v = 0.02; v <= xmax; v += xmax / 300) peak = Math.max(peak, chiPdf(v, k));
    var Y = function (p) { return base - Math.min(p / peak, 1) * 150; };
    for (v = 0.02; v <= xmax; v += xmax / 300) { d += (d ? ' L' : 'M') + X(v).toFixed(1) + ',' + Y(chiPdf(v, k)).toFixed(1); if (v >= crit) a += (a ? ' L' : 'M' + X(crit).toFixed(1) + ',' + base + ' L') + X(v).toFixed(1) + ',' + Y(chiPdf(v, k)).toFixed(1); }
    var o = (a ? '<path d="' + a + ' L' + X(xmax) + ',' + base + ' Z" fill="' + cv('--bad') + '" opacity=".45"/>' : '') + '<path d="' + d + '" fill="none" stroke="' + cv('--accent') + '" stroke-width="3"/><line x1="50" x2="' + (w - 40) + '" y1="' + base + '" y2="' + base + '" stroke="' + cv('--muted') + '"/>';
    o += '<line x1="' + X(crit) + '" x2="' + X(crit) + '" y1="46" y2="' + base + '" stroke="' + cv('--fg') + '" stroke-dasharray="5 5"/>' + T(X(crit), 38, 'critical value ' + crit.toFixed(2), { size: 13 });
    var over = stat > xmax, sx = X(Math.max(0, stat));
    o += '<path d="M' + sx + ' ' + (base + 4) + ' l-9 16 h18 z" fill="' + AMB() + '" stroke="' + cv('--fg') + '"/>' + T(sx, base + 38, 'your statistic ' + stat.toFixed(2) + (over ? ' (off the chart →)' : ''), { size: 13, w: 700, a: sx > w - 180 ? 'end' : sx < 140 ? 'start' : 'middle' });
    return o + T(w / 2, 258, 'chi-square distribution with ' + k + ' degrees of freedom; red area = “too large to be chance”', { size: 13, c: cv('--muted') });
  }

  /* ---------- 1. random parameter with heterogeneity in the mean and the variance ---------- */
  function rp() {
    var m = +$('rp-m').value, th = +$('rp-t').value, s = +$('rp-s').value, w = +$('rp-w').value, m2 = m + th, s2 = s * Math.exp(w), X = function (v) { return 60 + (v + 4) / 8 * 700; }, base = 230;
    $('rp-mv').textContent = mn(m); $('rp-tv').textContent = mn(th); $('rp-sv').textContent = s.toFixed(2); $('rp-wv').textContent = mn(w);
    var pk = 1 / (Math.max(0.12, Math.min(s, s2)) * 2.5066);
    function curve(mu, sd, col, fill) { if (sd < 0.03) return '<line x1="' + X(mu) + '" x2="' + X(mu) + '" y1="40" y2="' + base + '" stroke="' + col + '" stroke-width="4"/>'; var d = ''; for (var v = -4; v <= 4.001; v += 0.04) { var p = Math.exp(-0.5 * Math.pow((v - mu) / sd, 2)) / (sd * 2.5066); d += (d ? ' L' : 'M') + X(v).toFixed(1) + ',' + (base - p / pk * 180).toFixed(1); } return '<path d="' + d + ' L' + X(4) + ',' + base + ' L' + X(-4) + ',' + base + ' Z" fill="' + col + '" opacity="' + fill + '"/><path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.5"/>'; }
    var o = curve(m, s, cv('--accent'), 0.25) + curve(m2, s2, AMB(), 0.3) + '<line x1="60" x2="760" y1="' + base + '" y2="' + base + '" stroke="' + cv('--muted') + '"/><line x1="' + X(0) + '" x2="' + X(0) + '" y1="30" y2="' + base + '" stroke="' + cv('--fg') + '" stroke-dasharray="5 5"/>';
    for (var k = -4; k <= 4; k += 2) o += T(X(k), base + 20, k === 0 ? '0' : mn(k, 0), { c: cv('--muted'), size: 13 });
    o += '<rect x="70" y="20" width="14" height="14" rx="3" fill="' + cv('--accent') + '"/>' + T(90, 32, 'ordinary crashes', { a: 'start', size: 13 }) + '<rect x="230" y="20" width="14" height="14" rx="3" fill="' + AMB() + '"/>' + T(250, 32, 'crashes where Z = 1 and W = 1', { a: 'start', size: 13 }) + T(410, 278, 'effect of the variable in each crash (right of the dashed line = raises severity)', { size: 13, c: cv('--muted') });
    $('rp-svg').innerHTML = o;
    var p1 = s < 0.03 ? (m > 0 ? 1 : 0) : 1 - Phi(-m / s), p2 = s2 < 0.03 ? (m2 > 0 ? 1 : 0) : 1 - Phi(-m2 / s2);
    $('rp-read').innerHTML = 'Ordinary crashes: mean <b>' + mn(m) + '</b>, spread <b>' + s.toFixed(2) + '</b>, so the effect is positive in <b>' + pct(p1, 0) + '</b> of them. Crashes with Z = 1 and W = 1: mean ' + mn(m) + ' + ' + mn(th) + ' = <b>' + mn(m2) + '</b>, spread ' + s.toFixed(2) + ' × e<sup>' + mn(w) + '</sup> = <b>' + s2.toFixed(2) + '</b>, positive in <b>' + pct(p2, 0) + '</b>.' + (Math.abs(th) < 0.03 && Math.abs(w) < 0.03 ? ' With Θ = 0 and ω = 0 the two groups are identical: an ordinary random parameter.' : ' Θ slides the amber curve sideways; ω makes it wider or narrower.');
  }

  /* ---------- 2. average marginal effect ---------- */
  var CO = { injury: { c: -0.7, roll: 0.8, fast: 0.3, adv: 0.4 }, fatal: { c: -2.6, roll: 1.4, fast: 0.9, adv: 0.5 } }, NM = { roll: 'rollover', fast: '140 km/h limit', adv: 'adverse weather' };
  var CR = [[0, 0, 0], [0, 1, 0], [1, 1, 1], [0, 0, 1], [1, 0, 0], [0, 1, 1]];   // each crash: roll, fast, adv as recorded
  function P3(x) { var si = CO.injury.c + x.roll * CO.injury.roll + x.fast * CO.injury.fast + x.adv * CO.injury.adv, sf = CO.fatal.c + x.roll * CO.fatal.roll + x.fast * CO.fatal.fast + x.adv * CO.fatal.adv, w = [1, Math.exp(si), Math.exp(sf)], t = w[0] + w[1] + w[2]; return { pdo: w[0] / t, injury: w[1] / t, fatal: w[2] / t }; }
  function ame() {
    var q = $('am-q').value, out = $('am-o').value, o = '', sum = 0, rows = [], base;
    CR.forEach(function (c, i) { var x = { roll: c[0], fast: c[1], adv: c[2] }, x1 = Object.assign({}, x), x0 = Object.assign({}, x); x1[q] = 1; x0[q] = 0; var a = P3(x1)[out], b = P3(x0)[out]; rows.push([a, b, a - b]); sum += a - b; });
    var mx = Math.max(0.05, Math.max.apply(null, rows.map(function (r) { return Math.abs(r[2]); }))) * 1.1, avg = sum / CR.length, SH = { roll: 'rollover', fast: '140 km/h', adv: 'bad weather' };
    base = 160; o += '<line x1="60" x2="760" y1="' + base + '" y2="' + base + '" stroke="' + cv('--muted') + '"/>';
    var ya = base - avg / mx * 95; o += '<line x1="60" x2="760" y1="' + ya + '" y2="' + ya + '" stroke="' + AMB() + '" stroke-width="3" stroke-dasharray="8 6"/>';
    rows.forEach(function (r, i) { var x = 110 + i * 108, h = r[2] / mx * 95, others = Object.keys(SH).filter(function (k) { return k !== q; }).map(function (k) { return SH[k] + ': ' + (CR[i][['roll', 'fast', 'adv'].indexOf(k)] ? 'yes' : 'no'); });
      o += '<rect x="' + x + '" y="' + (h >= 0 ? base - h : base) + '" width="60" height="' + Math.abs(h) + '" rx="4" fill="' + cv('--accent') + '"/><rect x="' + (x + 6) + '" y="' + (h >= 0 ? base - h + 6 : base - h - 26) + '" width="48" height="20" rx="4" fill="' + cv('--surface') + '"/>' + T(x + 30, h >= 0 ? base - h + 21 : base - h - 11, (r[2] >= 0 ? '+' : '−') + Math.abs(r[2] * 100).toFixed(1), { w: 700, size: 13 }) + T(x + 30, 286, 'crash ' + (i + 1), { size: 13, w: 700 }) + T(x + 30, 303, others[0], { size: 11.5, c: cv('--muted') }) + T(x + 30, 318, others[1], { size: 11.5, c: cv('--muted') }); });
    o += T(410, 26, 'change in the probability of “' + (out === 'pdo' ? 'property damage only' : out) + '” when “' + NM[q] + '” goes from 0 to 1 (percentage points)', { size: 13, c: cv('--muted') }) + T(410, 48, 'dashed line: the average of the six changes = ' + (avg >= 0 ? '+' : '−') + Math.abs(avg * 100).toFixed(1) + ' points', { w: 700, c: cv('--amber'), size: 13 });
    $('am-svg').innerHTML = o;
    $('am-read').innerHTML = 'For crash 1 the probability is <b>' + pct(rows[0][0]) + '</b> with “' + NM[q] + '” and <b>' + pct(rows[0][1]) + '</b> without: a change of ' + mn(rows[0][2] * 100, 1) + ' points. The change is different for every crash, because it depends on everything else about the crash. The <b>average marginal effect</b> is the mean of the six changes: <b>' + mn(avg * 100, 1) + ' percentage points</b>.';
  }

  /* ---------- 3. likelihood ratio test calculator ---------- */
  var MODES = {
    transfer: { f: [['LL when model A’s parameters are applied to data B', -612.4], ['LL of model B on its own data', -588.1], ['Number of parameters in model A', 14]], calc: function (v) { return [-2 * (v[0] - v[1]), v[2]]; }, form: 'χ² = −2 × [LL(β<sub>A→B</sub>) − LL(β<sub>B</sub>)]', yes: 'Rejected: model A does not describe data B. The parameters are <b>not transferable</b>, so the two road classes (or years) need separate models.', no: 'Not rejected: model A describes data B about as well as B’s own model. The parameters transfer.' },
    merge: { f: [['LL of the pooled model (both classes together)', -1105.0], ['LL of the first class alone', -640.2], ['LL of the second class alone', -447.5], ['Parameters: first class', 13], ['Parameters: second class', 12], ['Parameters: pooled model', 15]], calc: function (v) { return [-2 * (v[0] - v[1] - v[2]), v[3] + v[4] - v[5]]; }, form: 'χ² = −2 × [LL(β<sub>pooled</sub>) − LL(β<sub>1</sub>) − LL(β<sub>2</sub>)]', yes: 'Rejected: pooling loses too much fit. The two classes <b>must be modelled separately</b>.', no: 'Not rejected: the two classes can be merged into one model.' },
    pc: { f: [['LL of the partially constrained model (years pooled)', -1640.0], ['Sum of LL of the separate yearly models', -1631.5], ['Total parameters in the yearly models', 40], ['Parameters in the constrained model', 28]], calc: function (v) { return [-2 * (v[0] - v[1]), v[2] - v[3]]; }, form: 'χ² = −2 × [LL(β<sub>constrained</sub>) − Σ LL(β<sub>year</sub>)]', yes: 'Rejected: too many parameters were forced to be equal across years. Free some of them and test again.', no: 'Not rejected: the constrained model fits about as well with fewer parameters. The parameters held equal are the <b>temporally stable</b> effects.' },
    rand: { f: [['LL of the fixed-parameter model', -598.3], ['LL of the random-parameter model', -591.0], ['Extra parameters (spreads, Θ, ω)', 2]], calc: function (v) { return [-2 * (v[0] - v[1]), v[2]]; }, form: 'χ² = −2 × [LL(β<sub>fixed</sub>) − LL(β<sub>random</sub>)]', yes: 'Rejected: the random-parameter model fits significantly better. <b>Keep the random parameters.</b>', no: 'Not rejected: the extra parameters do not earn their place. Keep the simpler fixed-parameter model.' } };
  var lrMode = 'transfer';
  function lrBuild() { $('lr-in').innerHTML = MODES[lrMode].f.map(function (f, i) { return '<label>' + f[0] + '<input type="number" step="any" id="lr-' + i + '" value="' + f[1] + '" style="font:inherit;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--fg);width:100%"></label>'; }).join(''); MODES[lrMode].f.forEach(function (f, i) { $('lr-' + i).oninput = lr; }); lr(); }
  function lr() {
    var M = MODES[lrMode], v = M.f.map(function (f, i) { return parseFloat($('lr-' + i).value); }), conf = +$('lr-c').value;
    if (v.some(isNaN)) { $('lr-read').textContent = 'Fill in every box with a number.'; return; }
    var r = M.calc(v), stat = r[0], df = Math.round(r[1]);
    if (df < 1) { $('lr-svg').innerHTML = ''; $('lr-read').innerHTML = 'The degrees of freedom came out as ' + df + '. They must be at least 1: check the parameter counts.'; return; }
    if (stat < 0) { $('lr-svg').innerHTML = ''; $('lr-read').innerHTML = 'The statistic is negative (' + stat.toFixed(2) + '). The restricted model cannot fit better than the unrestricted one, so check which log-likelihood is in which box.'; return; }
    var crit = chiCrit(df, conf), p = 1 - chiCdf(stat, df);
    $('lr-svg').innerHTML = chiChart(stat, df, crit, 820);
    $('lr-read').innerHTML = M.form + ' = <b>' + stat.toFixed(2) + '</b>, with <b>' + df + '</b> degrees of freedom. Critical value at ' + Math.round(conf * 100) + '% confidence: <b>' + crit.toFixed(2) + '</b>; p-value ' + (p < 0.0001 ? 'below 0.0001' : p.toFixed(4)) + '.<br>' + (stat > crit ? M.yes : M.no);
  }

  /* ---------- 4. how many tests? ---------- */
  function cnt() {
    var c = +$('ct-c').value, y = +$('ct-y').value, sp = c * (c - 1) * y, tp = y * (y - 1) * c, mg = y, pc = c, tot = sp + tp + mg + pc, o = '', k = 0;
    $('ct-cv').textContent = c; $('ct-yv').textContent = y;
    [[sp, '--accent', 'between road classes'], [tp, AMB(), 'between years'], [mg, '--bad', 'merge tests'], [pc, '--muted', 'constrained vs free']].forEach(function (g, gi) { for (var i = 0; i < g[0]; i++, k++) o += '<rect x="' + (40 + (k % 30) * 25) + '" y="' + (44 + Math.floor(k / 30) * 25) + '" width="21" height="21" rx="4" fill="' + (g[1].charAt(0) === '-' ? cv(g[1]) : g[1]) + '"/>'; o += '<rect x="' + (40 + gi * 185) + '" y="14" width="14" height="14" rx="3" fill="' + (g[1].charAt(0) === '-' ? cv(g[1]) : g[1]) + '"/>' + T(60 + gi * 185, 26, g[2] + ': ' + g[0], { a: 'start', size: 13 }); });
    $('ct-svg').innerHTML = o;
    $('ct-read').innerHTML = '<b>' + (c * y) + '</b> yearly models (' + c + ' road classes × ' + y + ' years). Between road classes: ' + (c * (c - 1) / 2) + ' pairs × 2 directions × ' + y + ' years = <b>' + sp + '</b>. Between years: ' + (y * (y - 1) / 2) + ' pairs × 2 directions × ' + c + ' classes = <b>' + tp + '</b>. Merging one pair of classes, once per year: <b>' + mg + '</b>. Constrained against unconstrained, once per class: <b>' + pc + '</b>. Total: <b>' + tot + ' likelihood ratio tests</b>.';
  }

  /* ---------- 5. backward selection ---------- */
  var SEL = [[['Rollover', 4.21], ['Multi-vehicle', 3.10], ['140 km/h limit', 2.45], ['Adverse weather', 1.92], ['Weekend', 1.20], ['Winter', 0.48]], [['Rollover', 4.25], ['Multi-vehicle', 3.08], ['140 km/h limit', 2.47], ['Adverse weather', 1.95], ['Weekend', 1.31]], [['Rollover', 4.30], ['Multi-vehicle', 3.12], ['140 km/h limit', 2.50], ['Adverse weather', 1.88]]], selStep = 0;
  function sel() {
    var rows = SEL[selStep], X = function (t) { return 230 + t / 5 * 520; }, o = '', weak = rows[rows.length - 1];
    rows.forEach(function (r, i) { var y = 40 + i * 36, bad = r[1] < 1.645; o += T(220, y + 17, r[0], { a: 'end' }) + '<rect x="230" y="' + y + '" width="' + (X(r[1]) - 230) + '" height="24" rx="4" fill="' + (bad ? cv('--bad') : cv('--accent')) + '"/>' + T(X(r[1]) + 8, y + 17, r[1].toFixed(2), { a: 'start', w: 700, size: 13 }); });
    o += '<line x1="' + X(1.645) + '" x2="' + X(1.645) + '" y1="24" y2="262" stroke="' + cv('--fg') + '" stroke-dasharray="5 5"/>' + T(X(1.645), 280, 'keep if |t| ≥ 1.645', { size: 13 }) + T(600, 280, '|t| = estimate ÷ standard error', { size: 13, c: cv('--muted') });
    $('sl-svg').innerHTML = o;
    var done = weak[1] >= 1.645;
    $('sl-go').disabled = done; $('sl-go').style.opacity = done ? .5 : 1;
    $('sl-read').innerHTML = 'Round ' + (selStep + 1) + ': ' + rows.length + ' variables in the model. ' + (done ? 'Every variable now has |t| of at least 1.645, so the search stops. This is the final fixed-parameter model. Notice that the t-values of the remaining variables moved a little each time one was removed, which is why only one variable is removed per round.' : 'The weakest is <b>' + weak[0] + '</b> with |t| = ' + weak[1].toFixed(2) + ', below 1.645. Remove it and estimate the model again.');
  }

  /* ---------- 6. chi-square test of a two-way table ---------- */
  function chi() {
    var a = [], i, j, ok = true; for (i = 0; i < 2; i++) { a.push([]); for (j = 0; j < 3; j++) { var v = parseFloat($('ch-' + i + j).value); if (isNaN(v) || v < 0) ok = false; a[i].push(v); } }
    if (!ok) { $('ch-read').textContent = 'Fill in all six counts.'; return; }
    var rt = a.map(function (r) { return r[0] + r[1] + r[2]; }), ctot = [0, 1, 2].map(function (j) { return a[0][j] + a[1][j]; }), n = rt[0] + rt[1], stat = 0, ex = [[], []];
    if (!n || ctot.some(function (c) { return !c; }) || rt.some(function (r) { return !r; })) { $('ch-read').textContent = 'Every row and column needs at least one crash.'; return; }
    for (i = 0; i < 2; i++) for (j = 0; j < 3; j++) { ex[i][j] = rt[i] * ctot[j] / n; stat += Math.pow(a[i][j] - ex[i][j], 2) / ex[i][j]; }
    var crit = chiCrit(2, 0.95), p = 1 - chiCdf(stat, 2);
    $('ch-svg').innerHTML = chiChart(stat, 2, crit, 820);
    $('ch-read').innerHTML = 'If severity had nothing to do with road class, the expected counts would be <b>' + ex[0].map(function (v) { return v.toFixed(1); }).join(', ') + '</b> in the first row and <b>' + ex[1].map(function (v) { return v.toFixed(1); }).join(', ') + '</b> in the second. χ² = sum of (observed − expected)² ÷ expected = <b>' + stat.toFixed(2) + '</b>, with (2 − 1) × (3 − 1) = 2 degrees of freedom; p ' + (p < 0.001 ? '&lt; 0.001' : '= ' + p.toFixed(3)) + '. ' + (stat > crit ? 'The severity mix <b>differs</b> between the two groups.' : 'No evidence that the severity mix differs between the two groups.');
  }

  function all() { rp(); ame(); lr(); cnt(); sel(); chi(); }
  ['rp-m', 'rp-t', 'rp-s', 'rp-w'].forEach(function (id) { $(id).oninput = rp; });
  $('am-q').onchange = ame; $('am-o').onchange = ame;
  $('lr-c').onchange = lr;
  $('lr-mode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; lrMode = b.dataset.m; [].forEach.call(this.children, function (c) { c.setAttribute('aria-pressed', c === b); }); lrBuild(); });
  $('ct-c').oninput = cnt; $('ct-y').oninput = cnt;
  $('sl-go').onclick = function () { if (selStep < SEL.length - 1) { selStep++; sel(); } }; $('sl-reset').onclick = function () { selStep = 0; sel(); };
  for (var i = 0; i < 2; i++) for (var j = 0; j < 3; j++) $('ch-' + i + j).oninput = chi;
  lrBuild(); all();
  if (window.initSteps) window.initSteps();
  new MutationObserver(all).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', all);
})();
