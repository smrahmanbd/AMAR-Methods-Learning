/* Tools for "logit and likelihood from zero". Self-contained. Numbers are invented for teaching. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cv = function (n, fb) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || (fb ? cv(fb) : '#888'); };
  var AMB = function () { return cv('--amber-fill', '--amber'); };
  function T(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '" font-size="' + (o.size || 14) + '" font-weight="' + (o.w || 500) + '" fill="' + (o.c || cv('--fg')) + '" font-family="Inter,system-ui,sans-serif">' + s + '</text>'; }
  var mn = function (v, d) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d === undefined ? 2 : d); };
  function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); }

  /* 1. probability, odds, log-odds */
  function odds() {
    var p = +$('od-p').value / 100, add = +$('od-a').value, o = p / (1 - p), lo = Math.log(o), lo2 = lo + add, p2 = 1 / (1 + Math.exp(-lo2)), X = function (v) { return 60 + (v + 6) / 12 * 700; }, Y = function (q) { return 230 - q * 190; }, d = '', s = '';
    $('od-pv').textContent = Math.round(p * 100) + '%'; $('od-av').textContent = (add >= 0 ? '+' : '−') + Math.abs(add).toFixed(1);
    for (var v = -6; v <= 6.001; v += 0.1) d += (d ? ' L' : 'M') + X(v).toFixed(1) + ',' + Y(1 / (1 + Math.exp(-v))).toFixed(1);
    s += '<line x1="60" x2="760" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="' + cv('--muted') + '"/><line x1="60" x2="760" y1="' + Y(1) + '" y2="' + Y(1) + '" stroke="' + cv('--line') + '"/><line x1="60" x2="760" y1="' + Y(.5) + '" y2="' + Y(.5) + '" stroke="' + cv('--line') + '" stroke-dasharray="4 5"/>';
    s += T(52, Y(0) + 5, '0%', { a: 'end', size: 13, c: cv('--muted') }) + T(52, Y(.5) + 5, '50%', { a: 'end', size: 13, c: cv('--muted') }) + T(52, Y(1) + 5, '100%', { a: 'end', size: 13, c: cv('--muted') });
    for (var k = -6; k <= 6; k += 2) s += T(X(k), 250, k === 0 ? '0' : mn(k, 0), { size: 13, c: cv('--muted') });
    s += '<path d="' + d + '" fill="none" stroke="' + cv('--accent') + '" stroke-width="3"/>';
    var cl = function (z) { return Math.max(-6, Math.min(6, z)); };
    if (Math.abs(add) > 0.04) s += '<line x1="' + X(cl(lo)) + '" x2="' + X(cl(lo2)) + '" y1="' + (Y(p) ) + '" y2="' + Y(p) + '" stroke="' + cv('--fg') + '" stroke-dasharray="3 4"/><line x1="' + X(cl(lo2)) + '" x2="' + X(cl(lo2)) + '" y1="' + Y(p) + '" y2="' + Y(p2) + '" stroke="' + cv('--fg') + '" stroke-dasharray="3 4"/><circle cx="' + X(cl(lo2)) + '" cy="' + Y(p2) + '" r="9" fill="' + AMB() + '" stroke="' + cv('--fg') + '"/>';
    s += '<circle cx="' + X(cl(lo)) + '" cy="' + Y(p) + '" r="9" fill="' + cv('--fg') + '"/>' + T(410, 276, 'score = log-odds (the scale the model works on)', { size: 13, c: cv('--muted') });
    $('od-svg').innerHTML = s;
    $('od-read').innerHTML = 'Probability <b>' + (p * 100).toFixed(0) + '%</b> → odds = ' + p.toFixed(2) + ' ÷ ' + (1 - p).toFixed(2) + ' = <b>' + o.toFixed(2) + '</b> → log-odds = ln(' + o.toFixed(2) + ') = <b>' + mn(lo) + '</b>.' + (Math.abs(add) > 0.04 ? '<br>Add a coefficient of ' + mn(add, 1) + ': log-odds ' + mn(lo2) + ' → odds × e<sup>' + mn(add, 1) + '</sup> = × ' + Math.exp(add).toFixed(2) + ' = <b>' + Math.exp(lo2).toFixed(2) + '</b> → probability <b>' + (p2 * 100).toFixed(1) + '%</b> (amber dot). The same coefficient always multiplies the odds by the same amount, but the change in probability depends on where you start.' : ' Move the second slider to add a coefficient.');
  }

  /* 2. the likelihood ratio test on a tiny data set */
  function lrc() {
    var a = +$('lc-a').value, b = +$('lc-b').value, N = 100, xl = function (k, n) { return k <= 0 || k >= n ? 0 : k * Math.log(k / n) + (n - k) * Math.log(1 - k / n); };
    $('lc-av').textContent = a + ' of 100'; $('lc-bv').textContent = b + ' of 100';
    var llu = xl(a, N) + xl(b, N), llr = xl(a + b, 2 * N), stat = Math.max(0, -2 * (llr - llu)), crit = +$('lc-c').value === 0.9 ? 2.706 : +$('lc-c').value === 0.99 ? 6.635 : 3.841, pv = 1 - erf(Math.sqrt(stat / 2));
    var s = '', base = 150;
    function bar(x, k, lab, col) { var h = k / N * 110; return '<rect x="' + x + '" y="' + (base - h) + '" width="70" height="' + h + '" rx="5" fill="' + col + '"/>' + T(x + 35, base - h - 8, k + '%', { w: 700 }) + T(x + 35, base + 18, lab, { size: 13, c: cv('--muted') }); }
    s += T(150, 22, 'Share injured', { w: 700 }) + bar(70, a, 'seat belt', cv('--accent')) + bar(160, b, 'no seat belt', AMB()) + '<line x1="50" x2="250" y1="' + base + '" y2="' + base + '" stroke="' + cv('--muted') + '"/>';
    var yp = base - (a + b) / 2 / N * 110; s += '<line x1="50" x2="250" y1="' + yp + '" y2="' + yp + '" stroke="' + cv('--fg') + '" stroke-dasharray="5 5"/>' + T(150, 196, 'dashed: the one share the', { size: 12, c: cv('--muted') }) + T(150, 211, 'restricted model must use', { size: 12, c: cv('--muted') });
    var xmax = Math.max(12, crit * 1.6), X = function (v) { return 330 + Math.min(v, xmax) / xmax * 430; }, pdf = function (v) { return Math.exp(-v / 2) / Math.sqrt(2 * Math.PI * v); }, Y = function (q) { return base + 20 - Math.min(q, 0.9) / 0.9 * 130; }, d = '', ar = '';
    for (var v = 0.08; v <= xmax; v += xmax / 250) { d += (d ? ' L' : 'M') + X(v).toFixed(1) + ',' + Y(pdf(v)).toFixed(1); if (v >= crit) ar += (ar ? ' L' : 'M' + X(crit).toFixed(1) + ',' + (base + 20) + ' L') + X(v).toFixed(1) + ',' + Y(pdf(v)).toFixed(1); }
    s += '<path d="' + ar + ' L' + X(xmax) + ',' + (base + 20) + ' Z" fill="' + cv('--bad') + '" opacity=".45"/><path d="' + d + '" fill="none" stroke="' + cv('--accent') + '" stroke-width="3"/><line x1="330" x2="760" y1="' + (base + 20) + '" y2="' + (base + 20) + '" stroke="' + cv('--muted') + '"/>';
    s += '<line x1="' + X(crit) + '" x2="' + X(crit) + '" y1="36" y2="' + (base + 20) + '" stroke="' + cv('--fg') + '" stroke-dasharray="5 5"/>' + T(X(crit), 28, 'critical value ' + crit.toFixed(2), { size: 13 });
    var sx = X(stat); s += '<path d="M' + sx + ' ' + (base + 24) + ' l-9 16 h18 z" fill="' + AMB() + '" stroke="' + cv('--fg') + '"/>' + T(sx, base + 58, 'statistic ' + stat.toFixed(2) + (stat > xmax ? ' →' : ''), { size: 13, w: 700, a: sx > 690 ? 'end' : sx < 380 ? 'start' : 'middle' });
    s += T(545, 228, 'what the statistic would look like if the seat belt truly made no difference', { size: 12, c: cv('--muted') });
    $('lc-svg').innerHTML = s;
    $('lc-read').innerHTML = '<b>Restricted model</b> (one injury share for everyone, ' + ((a + b) / 2).toFixed(1) + '%): log-likelihood <b>' + mn(llr) + '</b>. <b>Unrestricted model</b> (a separate share for each group): <b>' + mn(llu) + '</b>.<br>Statistic = −2 × [' + mn(llr) + ' − (' + mn(llu) + ')] = <b>' + stat.toFixed(2) + '</b>; 1 degree of freedom (one extra parameter); p-value ' + (pv < 0.001 ? 'below 0.001' : pv.toFixed(3)) + '.<br>' + (stat > crit ? '<b>Rejected:</b> the restricted model fits too much worse. The data support a seat-belt effect.' : '<b>Not rejected:</b> the simpler model fits almost as well. These data do not show a seat-belt effect. That is not proof that there is none.');
  }

  function all() { odds(); lrc(); }
  $('od-p').oninput = odds; $('od-a').oninput = odds; $('lc-a').oninput = lrc; $('lc-b').oninput = lrc; $('lc-c').onchange = lrc;
  all(); if (window.initSteps) window.initSteps();
  new MutationObserver(all).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', all);
})();
