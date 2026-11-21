/* Multinomial logit from zero. Coefficients are invented for teaching. */
(function () {
  var B = { injury: { c: -0.6, belt: 0.9, speed: 0.5, night: 0.3 }, fatal: { c: -2.5, belt: 1.6, speed: 1.1, night: 0.6 } };
  var pct = function (p) { return (p * 100).toFixed(1) + '%'; }, sg = function (v) { return (v < 0 ? '− ' : '+ ') + Math.abs(v).toFixed(1); };
  function probs(x) { var si = B.injury.c + x.belt * B.injury.belt + x.speed * B.injury.speed + x.night * B.injury.night, sf = B.fatal.c + x.belt * B.fatal.belt + x.speed * B.fatal.speed + x.night * B.fatal.night, w = [1, Math.exp(si), Math.exp(sf)], t = w[0] + w[1] + w[2]; return { s: [0, si, sf], w: w, t: t, p: w.map(function (v) { return v / t; }) }; }
  function bars(items, x0, w, base, hmax, vmax) { var o = '', step = w / items.length; items.forEach(function (it, i) { var h = it[1] / vmax * hmax, x = x0 + i * step + step * 0.18, bw = step * 0.64; o += '<rect x="' + x.toFixed(1) + '" y="' + (base - h).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="5" fill="' + css(it[2]) + '"/>' + txt(x + bw / 2, base - h - 8, it[3], { w: 700 }) + txt(x + bw / 2, base + 19, it[0], { size: 13, c: css('--muted') }); }); return o + '<line x1="' + x0 + '" x2="' + (x0 + w) + '" y1="' + base + '" y2="' + base + '" stroke="' + css('--muted') + '"/>'; }

  function build() {
    var x = { belt: $('b-belt').checked ? 1 : 0, speed: $('b-speed').checked ? 1 : 0, night: $('b-night').checked ? 1 : 0 }, r = probs(x), names = ['no injury', 'injury', 'fatal'], cols = ['--accent', '--amber-fill', '--bad'];
    function line(k) { var b = B[k], s = b.c.toFixed(1).replace('-', '−'); if (x.belt) s += ' ' + sg(b.belt); if (x.speed) s += ' ' + sg(b.speed); if (x.night) s += ' ' + sg(b.night); return s + ' = <b>' + f2(r.s[k === 'injury' ? 1 : 2], 1) + '</b>'; }
    $('b-sum').innerHTML = '<b>Step 1 · scores.</b> No injury: <b>0</b> (the base outcome). Injury: ' + line('injury') + '. Fatal: ' + line('fatal') + '.';
    var o = txt(200, 30, 'Step 2 · weight = e^score', { w: 700 }) + txt(610, 30, 'Step 3 · probability = weight ÷ total', { w: 700 });
    o += bars(names.map(function (n, i) { return [n, r.w[i], cols[i], r.w[i].toFixed(2)]; }), 40, 320, 240, 165, Math.max(3, Math.max.apply(null, r.w))) + bars(names.map(function (n, i) { return [n, r.p[i], cols[i], pct(r.p[i])]; }), 450, 320, 240, 165, 1) + txt(410, 150, '→', { size: 30, c: css('--muted') });
    $('b-svg').innerHTML = o;
    var a = probs({ belt: 1, speed: x.speed, night: x.night }), b = probs({ belt: 0, speed: x.speed, night: x.night });
    $('b-read').innerHTML = 'Total weight ' + r.t.toFixed(2) + '. This crash: no injury <b>' + pct(r.p[0]) + '</b>, injury <b>' + pct(r.p[1]) + '</b>, fatal <b>' + pct(r.p[2]) + '</b>.<br>Seat-belt comparison for this same crash: the chance of a fatal outcome is <b>' + pct(a.p[2]) + '</b> without a belt and <b>' + pct(b.p[2]) + '</b> with one, a difference of ' + ((a.p[2] - b.p[2]) * 100).toFixed(1) + ' percentage points. That difference changes when you tick the other boxes; the coefficient (+1.6) does not.';
  }
  ['b-belt', 'b-speed', 'b-night'].forEach(function (id) { $(id).onchange = build; });

  /* maximum likelihood with one number */
  var L = function (v) { return 1 / (1 + Math.exp(-v)); }, LLf = function (b) { var p = L(b); return 7 * Math.log(p) + 3 * Math.log(1 - p); }, BEST = Math.log(7 / 3);
  function ml() {
    var b = +$('l-b').value, p = L(b), ll = LLf(b), X = function (v) { return 330 + (v + 2) / 5 * 430; }, Y = function (v) { return 40 + (-6 - v) / 12 * 200; }, o = '', k, d = '';
    $('l-bv').textContent = f2(b, 2);
    o += txt(30, 34, '10 crashes without a seat belt', { a: 'start', w: 700 });
    for (k = 0; k < 10; k++) { var inj = k < 7, x = 50 + (k % 5) * 50, y = 80 + Math.floor(k / 5) * 60; o += '<circle cx="' + x + '" cy="' + y + '" r="19" fill="' + css(inj ? '--amber-fill' : '--accent') + '"/>' + txt(x, y + 5, pct(inj ? p : 1 - p).replace('.0', ''), { size: 11, w: 700, c: inj ? css('--fg') : css('--accent-fg') }); }
    o += txt(30, 190, 'amber = injured (7), teal = not injured (3)', { a: 'start', size: 13, c: css('--muted') }) + txt(30, 210, 'number in each circle: the chance the model', { a: 'start', size: 13, c: css('--muted') }) + txt(30, 228, 'gave to what actually happened', { a: 'start', size: 13, c: css('--muted') });
    for (var v = -2; v <= 3.001; v += 0.05) d += (d ? ' L' : 'M') + X(v).toFixed(1) + ',' + Y(Math.max(-18, LLf(v))).toFixed(1);
    for (k = -6; k >= -18; k -= 4) o += '<line x1="330" x2="760" y1="' + Y(k) + '" y2="' + Y(k) + '" stroke="' + css('--line') + '"/>' + txt(322, Y(k) + 5, String(k).replace('-', '−'), { a: 'end', size: 13, c: css('--muted') });
    for (k = -2; k <= 3; k++) o += txt(X(k), 262, String(k).replace('-', '−'), { size: 13, c: css('--muted') });
    o += '<path d="' + d + '" fill="none" stroke="' + css('--accent') + '" stroke-width="3"/><line x1="' + X(BEST) + '" x2="' + X(BEST) + '" y1="40" y2="240" stroke="' + css('--amber') + '" stroke-dasharray="6 5"/>' + txt(X(BEST) + 6, 236, 'best: 0.85', { a: 'start', size: 13, c: css('--amber'), w: 700 });
    o += '<circle cx="' + X(b) + '" cy="' + Y(Math.max(-18, ll)) + '" r="8" fill="' + css('--fg') + '"/>' + txt(545, 284, 'the score β we are trying', { size: 13, c: css('--muted') }) + txt(545, 30, 'log-likelihood (higher is better)', { size: 13, c: css('--muted') });
    $('l-svg').innerHTML = o;
    $('l-read').innerHTML = 'With β = <b>' + f2(b, 2) + '</b> the model says an unbelted crash ends in injury with probability <b>' + p.toFixed(3) + '</b>. Log-likelihood = 7 × ln(' + p.toFixed(3) + ') + 3 × ln(' + (1 - p).toFixed(3) + ') = <b>' + f2(ll, 3) + '</b>. ' + (Math.abs(b - BEST) < 0.03 ? 'This is the peak. No other value of β makes the observed data more probable, so 0.85 is the maximum likelihood estimate.' : 'The peak of the curve is at β = 0.85, where the probability equals the observed share, 7 out of 10.');
  }
  $('l-b').oninput = ml;
  $('l-go').onclick = function () { var from = +$('l-b').value, t0 = null; if (REDUCED) { $('l-b').value = BEST; ml(); return; } requestAnimationFrame(function f(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / 900), e = k * k * (3 - 2 * k); $('l-b').value = from + (BEST - from) * e; ml(); if (k < 1) requestAnimationFrame(f); }); };

  function all() { build(); ml(); }
  all(); initSteps(); onTheme(all);
})();
