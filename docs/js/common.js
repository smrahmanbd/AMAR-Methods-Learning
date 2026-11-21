/* Small helpers shared by the pages. */
var $ = function (id) { return document.getElementById(id); };
var css = function (v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); };
var f2 = function (v, d) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d === undefined ? 2 : d); };
function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); }
function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
function randn() { var u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function invNorm(p) {   // inverse of the standard normal distribution (Acklam's approximation)
  var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239],
      b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572],
      c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783],
      d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416], q, r;
  if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - 0.02425) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  q = p - 0.5; r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
function halton(i, base) { var f = 1, r = 0; while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); } return r; }
function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 15) + '" font-family="Inter,sans-serif" font-weight="' + (o.w || 500) + '" text-anchor="' + (o.a || 'middle') + '" fill="' + (o.c || css('--fg')) + '">' + s + '</text>'; }
var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Step-by-step worked solution: <div class="steps" data-steps='["..",".."]'> */
function initSteps() {
  [].forEach.call(document.querySelectorAll('.steps[data-steps]'), function (box) {
    var steps = JSON.parse(box.getAttribute('data-steps')), shown = 0;
    var ol = document.createElement('ol'), row = document.createElement('div'); row.className = 'btns';
    var next = document.createElement('button'); next.className = 'go'; var all = document.createElement('button'); all.className = 'go ghost'; all.textContent = 'Show all';
    function draw() { ol.innerHTML = steps.slice(0, shown).map(function (s) { return '<li>' + s + '</li>'; }).join(''); next.textContent = shown === 0 ? 'Show the first step' : shown < steps.length ? 'Show the next step' : 'Start again'; all.hidden = shown >= steps.length; }
    next.onclick = function () { shown = shown < steps.length ? shown + 1 : 0; draw(); };
    all.onclick = function () { shown = steps.length; draw(); };
    row.appendChild(next); row.appendChild(all); box.appendChild(ol); box.appendChild(row); draw();
  });
}
function onTheme(fn) { if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', fn); new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); }
