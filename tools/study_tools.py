"""HTML for the six 'full study' tools. Shared by the website page and the Methods Lab artifact (ids match docs/js/study.js)."""
def rng(id, label, lo, hi, step, val, vid): return f'<label>{label} <b id="{vid}"></b><input type="range" id="{id}" min="{lo}" max="{hi}" step="{step}" value="{val}"></label>'
SELECT = 'style="font:inherit;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--fg)"'
NUM = 'type="number" min="0" step="1" style="font:inherit;padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--fg);width:92px"'
TOOLS = {
 "sel": '''<div class="btns" style="display:flex;gap:10px;flex-wrap:wrap"><button class="go" id="sl-go">Remove the weakest variable</button><button class="go ghost" id="sl-reset">Start again</button></div>
<svg class="chart" id="sl-svg" viewBox="0 0 820 295" role="img" aria-label="t-values of the variables in the model against the 1.645 threshold"></svg>
<p class="read" id="sl-read" aria-live="polite"></p>''',
 "rp": f'''<div class="ctl">{rng("rp-m", "Mean effect β", -2, 2, 0.05, -0.8, "rp-mv")}{rng("rp-s", "Spread σ", 0, 2, 0.05, 0.7, "rp-sv")}{rng("rp-t", "Θ: shift in the mean when Z = 1", -1.5, 1.5, 0.05, 0.6, "rp-tv")}{rng("rp-w", "ω: change in the spread when W = 1", -1, 1, 0.05, 0.5, "rp-wv")}</div>
<svg class="chart" id="rp-svg" viewBox="0 0 820 290" role="img" aria-label="Two bell curves of a random parameter: ordinary crashes and crashes where the mean and spread are shifted"></svg>
<p class="read" id="rp-read" aria-live="polite"></p>''',
 "ame": f'''<div class="ctl"><label>Switch this indicator on and off<select id="am-q" {SELECT}><option value="roll">Rollover</option><option value="fast">140 km/h speed limit</option><option value="adv">Adverse weather</option></select></label><label>Watch the probability of<select id="am-o" {SELECT}><option value="fatal">Fatal</option><option value="injury">Injury</option><option value="pdo">Property damage only</option></select></label></div>
<svg class="chart" id="am-svg" viewBox="0 0 820 330" role="img" aria-label="Change in probability for each of six crashes and their average"></svg>
<p class="read" id="am-read" aria-live="polite"></p>''',
 "lr": f'''<div class="seg" id="lr-mode" role="group" aria-label="Which test"><button data-m="transfer" aria-pressed="true">Transferability</button><button data-m="merge" aria-pressed="false">Merge two classes</button><button data-m="pc" aria-pressed="false">Constrained vs unconstrained</button><button data-m="rand" aria-pressed="false">Random vs fixed</button></div>
<div class="ctl" id="lr-in"></div>
<div class="ctl"><label>Confidence level<select id="lr-c" {SELECT}><option value="0.90">90%</option><option value="0.95" selected>95%</option><option value="0.99">99%</option></select></label></div>
<svg class="chart" id="lr-svg" viewBox="0 0 820 270" role="img" aria-label="Chi-square distribution with the critical value and the test statistic"></svg>
<p class="read" id="lr-read" aria-live="polite"></p>''',
 "cnt": f'''<div class="ctl">{rng("ct-c", "Road classes", 2, 4, 1, 3, "ct-cv")}{rng("ct-y", "Years", 2, 5, 1, 3, "ct-yv")}</div>
<svg class="chart" id="ct-svg" viewBox="0 0 820 150" role="img" aria-label="One square per likelihood ratio test, coloured by kind"></svg>
<p class="read" id="ct-read" aria-live="polite"></p>''',
 "chi": f'''<div class="scroll" style="overflow-x:auto"><table style="border-collapse:separate;border-spacing:8px 6px"><tr><th></th><th style="font-weight:600;text-align:left">Property damage only</th><th style="font-weight:600;text-align:left">Injury</th><th style="font-weight:600;text-align:left">Fatal</th></tr>
<tr><td style="font-weight:600">Expressway</td><td><input id="ch-00" value="400" {NUM} aria-label="Expressway, property damage only"></td><td><input id="ch-01" value="150" {NUM} aria-label="Expressway, injury"></td><td><input id="ch-02" value="50" {NUM} aria-label="Expressway, fatal"></td></tr>
<tr><td style="font-weight:600">Other roads</td><td><input id="ch-10" value="300" {NUM} aria-label="Other roads, property damage only"></td><td><input id="ch-11" value="200" {NUM} aria-label="Other roads, injury"></td><td><input id="ch-12" value="100" {NUM} aria-label="Other roads, fatal"></td></tr></table></div>
<svg class="chart" id="ch-svg" viewBox="0 0 820 270" role="img" aria-label="Chi-square distribution with 2 degrees of freedom and the test statistic"></svg>
<p class="read" id="ch-read" aria-live="polite"></p>''',
 "odds": f'''<div class="ctl">{rng("od-p", "Starting probability", 1, 99, 1, 20, "od-pv")}{rng("od-a", "Add a coefficient to the score", -3, 3, 0.1, 1.6, "od-av")}</div>
<svg class="chart" id="od-svg" viewBox="0 0 820 285" role="img" aria-label="S-shaped curve linking the score to the probability"></svg>
<p class="read" id="od-read" aria-live="polite"></p>''',
 "lrc": f'''<div class="ctl">{rng("lc-a", "Injured among 100 crashes with a seat belt", 1, 99, 1, 30, "lc-av")}{rng("lc-b", "Injured among 100 crashes without", 1, 99, 1, 45, "lc-bv")}<label>Confidence level<select id="lc-c" {SELECT}><option value="0.9">90%</option><option value="0.95" selected>95%</option><option value="0.99">99%</option></select></label></div>
<svg class="chart" id="lc-svg" viewBox="0 0 820 240" role="img" aria-label="Injury shares in two groups and the chi-square distribution with the test statistic"></svg>
<p class="read" id="lc-read" aria-live="polite"></p>''',
 "fit": '''<div class="seg" id="ft-data" role="group" aria-label="Data set"><button data-d="clear" aria-pressed="true">Clear difference (30% and 45%)</button><button data-d="small" aria-pressed="false">Small difference (36% and 40%)</button></div>
<div class="btns" style="display:flex;gap:10px;flex-wrap:wrap"><button class="go" id="ft-next">Next step</button></div>
<svg class="chart" id="ft-svg" viewBox="0 0 820 295" role="img" aria-label="Two bars fitted by one shared line and by two separate lines, with the log-likelihood of each model"></svg>
<p class="read" id="ft-read" aria-live="polite"></p>''',
 "locks": '''<div class="seg" id="lk-ex" role="group" aria-label="Example"><button data-e="zero" aria-pressed="true">A variable has no effect</button><button data-e="random" aria-pressed="false">Fixed, not random</button><button data-e="merge" aria-pressed="false">Two groups share a model</button><button data-e="years" aria-pressed="false">Same effect every year</button><button data-e="transfer" aria-pressed="false">Borrowed from another model</button></div>
<div class="btns" style="display:flex;gap:10px;flex-wrap:wrap"><button class="go" id="lk-go">Play the locks again</button></div>
<svg class="chart" id="lk-svg" viewBox="0 0 820 285" role="img" aria-label="Parameter slots of the unrestricted model, and the same slots with some locked in the restricted model"></svg>
<p class="read" id="lk-read" aria-live="polite"></p>''',
 "sim": f'''<div class="ctl">{rng("sm-s", "Your statistic", 0, 12, 0.01, 4.82, "sm-sv")}</div>
<div class="btns" style="display:flex;gap:10px;flex-wrap:wrap"><button class="go" id="sm-go">Run 500 imaginary studies</button><button class="go ghost" id="sm-reset">Start again</button></div>
<svg class="chart" id="sm-svg" viewBox="0 0 820 305" role="img" aria-label="Histogram of likelihood ratio statistics from simulated studies in which the restriction is true"></svg>
<p class="read" id="sm-read" aria-live="polite"></p>''',
 "dfr": f'''<div class="ctl">{rng("df-k", "Degrees of freedom (number of locks)", 1, 30, 1, 1, "df-kv")}</div>
<svg class="chart" id="df-svg" viewBox="0 0 820 250" role="img" aria-label="Chi-square distribution and its critical values for the chosen degrees of freedom"></svg>
<p class="read" id="df-read" aria-live="polite"></p>''',
}
