"""Builds docs/index.html, learn.html, practice.html, memory.html from shared pieces."""
import json, html
from pathlib import Path
D = Path(__file__).parent.parent / "docs"
FONT = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap">'
NAV = [("index.html", "Home"), ("learn.html", "Learn"), ("basics.html", "Basics"), ("models.html", "Models"), ("study.html", "Case study"), ("research.html", "Research"), ("practice.html", "Practice"), ("memory.html", "Remember"), ("viewer.html?doc=materials/AMAR_Methods_Study_Guide.pdf&mode=guide", "Study guide")]
GUIDE = NAV[8][0]

def page(fn, title, body, scripts=""):
    nav = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == fn else ""}>{t}</a>' for h, t in NAV)
    import re
    body = re.sub(r'(<svg class="chart".*?</svg>)', r'<div class="scroll">\1</div>', body, flags=re.S)
    (D / fn).write_text(f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="Beginner-friendly animations, interactive worked solutions, a study guide and memory techniques for the methods used in accident research.">
{FONT}
<link rel="stylesheet" href="css/site.css">
</head>
<body>
<header class="band"><div class="in"><a class="brand" href="index.html"><i></i>AMAR Methods Learning</a><nav aria-label="Pages">{nav}</nav></div></header>
{body}
<footer class="site"><p>All data in the tools are simulated for teaching. This site is an independent learning aid and is not affiliated with the journal or its publisher. Sources are listed on the <a href="index.html#sources">home page</a>.</p></footer>
<script src="js/common.js"></script>
{scripts}
</body>
</html>
''')

def steps(items): return f"<div class=\"steps\" data-steps='{html.escape(json.dumps(items), quote=True)}'><b>Worked example, one step at a time</b></div>"
def hook(stop, name, scene): return f'<div class="hook"><b>Remember it · stop {stop}, {name}.</b> {scene}</div>'

# ---------------------------------------------------------------- the seven ideas
IDEAS = [
 dict(id="heterogeneity", n=1, name="Unobserved heterogeneity", short="One variable, many effects",
      one="The same variable can affect different people and places differently, for reasons the data do not record.",
      stop="the costume shop", scene="Every customer who walks through the same door comes out in a different costume. One door (one variable), many outcomes (many effects). The shopkeeper sorts the costumes onto a bell-shaped rail: the mixing distribution."),
 dict(id="simulation", n=2, name="Simulated maximum likelihood", short="Averaging over draws",
      one="When a formula has no exact answer, draw many possible values, compute the result for each and average.",
      stop="the dart casino", scene="A gambler throws darts at a wall of numbers and shouts the running average after each throw. Next to him a robot named Halton places its darts in a neat, even pattern and gets the right average with far fewer darts."),
 dict(id="endogeneity", n=3, name="Endogeneity", short="When the “cause” responds to risk",
      one="A variable is endogenous when something unseen drives both it and the outcome, so a plain comparison is misleading.",
      stop="the icy bridge", scene="Warning signs sprout from the bridge like mushrooms, but only where the invisible ice troll sleeps underneath. A tourist counts the wrecks next to the signs and blames the signs. Nobody sees the troll."),
 dict(id="space", n=4, name="Spatial and temporal correlation", short="Neighbours are not independent",
      one="Sites that are close together, and the same site in consecutive years, share influences the data do not record.",
      stop="gossip street", scene="A street of 100 houses where every neighbour repeats what the house next door said. You knock on 100 doors and hear only 18 different opinions."),
 dict(id="instability", n=5, name="Temporal instability", short="Effects drift over time",
      one="The effect of a variable can change from one period to the next, so a model built on old years may not describe today.",
      stop="the melting clock tower", scene="The clock’s numbers slide down the tower wall year by year. At its foot a judge holds two calendars, one in each hand, weighs them and announces: “These are not the same year.”"),
 dict(id="causality", n=6, name="Prediction versus causality", short="Forecasting is not explaining",
      one="A model can forecast well without telling you what would happen if you changed something.",
      stop="the fortune teller and the mechanic", scene="In a snowstorm, a fortune teller correctly predicts many crashes tonight. The mechanic beside her opens a bonnet to find out why. Only daredevils are on the road; the careful drivers stayed home."),
 dict(id="conflicts", n=7, name="Crash–conflict relationship", short="From near misses to crashes",
      one="Near misses are far more common than crashes; with the right statistics they can be used to estimate crash risk.",
      stop="the near-miss arcade", scene="An arcade machine counts every near miss with a loud ping. Behind it lies a dragon whose tail gets thinner and thinner. Stretch the tail all the way to the wall marked zero, and its tip is the crash."),
]
I = {d["id"]: d for d in IDEAS}

# ---------------------------------------------------------------- learn.html
def concept(d, explain, tool, worked, extra=""):
    return f'''<section class="concept" id="{d["id"]}">
<p class="eyebrow">Idea {d["n"]} of 7</p><h2>{d["name"]}</h2>
{explain}
<h3>Try it</h3>
{tool}
<h3>Solve one by hand</h3>
{worked}
{extra}
{hook(d["n"], d["stop"], d["scene"])}
</section>'''

def rng(id, label, lo, hi, step, val, vid): return f'<label>{label} <b id="{vid}"></b><input type="range" id="{id}" min="{lo}" max="{hi}" step="{step}" value="{val}"></label>'

LEARN = f'''<main class="wrap">
<div><p class="eyebrow">Learn</p><h1>Seven ideas, each with a tool you can move</h1></div>
<p class="lede">Read the short explanation, move the controls, then reveal a hand calculation one step at a time. Each idea ends with a picture to remember it by.</p>
<nav class="jump" aria-label="Ideas">{"".join(f'<a href="#{d["id"]}">{d["n"]} · {d["short"]}</a>' for d in IDEAS)}</nav>

{concept(I["heterogeneity"], """<p>Suppose a model says that wearing a seat belt lowers injury severity by a certain amount. A standard model gives <b>one</b> number for everybody. In reality the benefit depends on things the crash report never records: how the person was sitting, their bone strength, the exact angle of impact. This unrecorded variation is called unobserved heterogeneity.</p>
<p>A <b>random-parameters</b> model lets the effect differ from person to person. The analyst chooses a shape for how the effects are spread out. That shape is called the <b>mixing distribution</b>. The model then estimates its centre and its spread.</p>""",
f"""<div class="ctl"><label>Mixing distribution<select id="h-dist"><option value="normal">Normal (bell shape)</option><option value="lognormal">Lognormal (one sign only)</option><option value="triangular">Triangular</option><option value="uniform">Uniform (flat)</option></select></label>
{rng("h-c", "Centre of the effect", -2, 2, 0.05, -0.5, "h-cv")}{rng("h-s", "Spread across people", 0, 2, 0.05, 0.8, "h-sv")}</div>
<div class="btns"><button class="go" id="h-go">Sample 300 new people</button></div>
<svg class="chart" id="h-svg" viewBox="0 0 820 300" role="img" aria-label="Histogram of the effect across 300 simulated people"></svg>
<p class="read" id="h-read" aria-live="polite"></p>""",
steps(["A model estimates that the effect of a variable is normally distributed with mean −0.5 and standard deviation 0.8.",
       "Question: for what share of people is the effect positive (the variable raises risk)?",
       "Standardise zero: z = (0 − (−0.5)) ÷ 0.8 = 0.625.",
       "The share of a normal distribution below z = 0.625 is 0.734.",
       "Share above zero = 1 − 0.734 = 0.266. So for about <b>27%</b> of people the variable raises risk, although the average effect is negative.",
       "Check it in the tool: Normal, centre −0.50, spread 0.80. The amber share should be near 27%."]),
"""<p class="note">Other ways to capture heterogeneity include letting the mean or the variance of the random parameter depend on other variables, and latent-class models, which sort observations into a few hidden groups. Mannering, Shankar and Bhat (2016) review them and note that no single approach is clearly best.</p>""")}

{concept(I["simulation"], """<p>A random-parameters model has a problem: to compute a probability it must average over <b>every possible value</b> of the effect. That average is an integral with no exact formula.</p>
<p>The solution is simulation. Draw a value of the effect, compute the probability for that value, repeat many times, and take the average. The more draws, the closer the average gets to the true answer. Estimating a model this way is called <b>simulated maximum likelihood</b>.</p>
<p><b>Halton draws</b> are a trick to need fewer draws. Random draws clump by chance. Halton draws follow a fixed pattern that covers the range evenly, so the average settles sooner.</p>""",
"""<div class="seg" id="s-mode" role="group" aria-label="Type of draw"><button data-m="random" aria-pressed="true">Random draws</button><button data-m="halton" aria-pressed="false">Halton draws</button></div>
<div class="btns"><button class="go" id="s-1">Add 1 draw</button><button class="go" id="s-10">Add 10</button><button class="go" id="s-play">Play</button><button class="go ghost" id="s-reset">Start again</button></div>
<svg class="chart" id="s-svg" viewBox="0 0 820 300" role="img" aria-label="Running average of simulated probabilities approaching the exact answer"></svg>
<p class="read" id="s-read" aria-live="polite"></p>
<p class="note">Here the effect is normal with mean 0.5 and standard deviation 1, and the probability is the logistic function of the effect. The teal line is the running average; the dashed amber line is the exact answer.</p>""",
steps(["A crash is severe with probability P = 1 ÷ (1 + e<sup>−β</sup>), and β varies across people. We draw four values of β: −0.2, 0.3, 0.6 and 1.1.",
       "β = −0.2 gives P = 1 ÷ (1 + e<sup>0.2</sup>) = 0.450.",
       "β = 0.3 gives P = 0.574.",
       "β = 0.6 gives P = 0.646.",
       "β = 1.1 gives P = 0.750.",
       "Average: (0.450 + 0.574 + 0.646 + 0.750) ÷ 4 = <b>0.605</b>. That is the simulated probability with four draws. Real studies use hundreds or thousands of draws per observation."]))}

{concept(I["endogeneity"], """<p>Road agencies put ice-warning signs where ice crashes have happened. Now compare segments with signs to segments without. The signed segments have <b>more</b> crashes. Do signs cause crashes?</p>
<p>No. The ice causes both the sign and the crashes. The sign is <b>endogenous</b>: it is a response to the very risk we are trying to measure. Mannering and Bhat (2014) use this example. The same trap appears with personal choices. If safer drivers are the ones who buy cars with side airbags, the airbag looks better than it is.</p>
<p>Cures include instrumental variables, control functions and joint models of the choice and the outcome. All of them try to separate the part of the variable that is a response to risk from the part that is not.</p>""",
"""<div class="seg" id="e-mode" role="group" aria-label="How signs are placed"><button data-m="risk" aria-pressed="true">Signs go where ice is worst</button><button data-m="random" aria-pressed="false">Signs placed at random</button></div>
<div class="btns"><button class="go" id="e-run">New road network</button><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="e-ice"> Show the hidden ice</label></div>
<svg class="chart" id="e-svg" viewBox="0 0 780 305" role="img" aria-label="Grid of road segments with warning signs and a bar chart of average crashes with and without signs"></svg>
<p class="read" id="e-read" aria-live="polite"></p>""",
steps(["100 icy segments would have 10 crashes each without a sign. 300 ordinary segments have 4 crashes each. A sign truly cuts crashes by 20%.",
       "The agency puts signs on all 100 icy segments. Each now has 10 × 0.8 = 8 crashes.",
       "The naive comparison: signed segments average 8, unsigned segments average 4.",
       "8 ÷ 4 = 2. Signs appear to <b>double</b> crashes (+100%).",
       "The truth is −20%. The entire difference comes from the ice, which the analyst never saw.",
       "Now place signs at random in the tool. The two groups become alike in iciness and the comparison returns to about −20%."]))}

{concept(I["space"], """<p>Two neighbouring road segments share weather, drainage, driver population and enforcement. If the model does not include these, what it fails to explain on one segment will look like what it fails to explain next door. The same happens over time: this year’s unexplained crashes at a site resemble last year’s.</p>
<p>A model that treats every observation as independent then believes it has more information than it does. Its estimates look more certain than they are, and they can also be biased. Spatial and temporal models add an explicit link between neighbours and between years.</p>""",
f"""<div class="ctl">{rng("p-r", "Strength of the shared influence", 0, 0.95, 0.05, 0.6, "p-rv")}</div>
<div class="btns"><button class="go" id="p-new">New map</button></div>
<svg class="chart" id="p-svg" viewBox="0 0 800 304" role="img" aria-label="Map of 96 road segments coloured by unexplained crashes"></svg>
<p class="read" id="p-read" aria-live="polite"></p>""",
steps(["You have 100 observations: 10 segments on each of 10 corridors. Segments on the same corridor have a correlation of 0.5.",
       "A rule of thumb for clustered data, the design effect, is 1 + (m − 1) × ρ, where m is the cluster size and ρ the correlation.",
       "Design effect = 1 + (10 − 1) × 0.5 = 5.5.",
       "Effective number of independent observations = 100 ÷ 5.5 ≈ <b>18</b>.",
       "So the 100 observations carry about as much information as 18 independent ones. A model that ignores this reports standard errors that are far too small."]),
"""<p class="note">The design effect is a simple teaching approximation. Research models describe the correlation directly, for example with spatially correlated error terms.</p>""")}

{concept(I["instability"], """<p>Cars get safer, phones enter the cabin, a recession changes who drives, a pandemic empties the roads. The way a variable affects crashes can shift with each of these. Mannering (2018) calls this <b>temporal instability</b>, and a large body of work has since found that parameters estimated in one period often differ in the next.</p>
<p>The standard check: estimate one model on all years together, then a separate model for each period. If the separate models fit much better, the effects are not stable. A <b>likelihood ratio test</b> says how much better counts as “much”.</p>""",
f"""<div class="ctl">{rng("t-d", "Drift per year", -0.15, 0.15, 0.01, -0.08, "t-dv")}{rng("t-n", "Year-to-year noise", 0, 0.3, 0.01, 0.06, "t-nv")}</div>
<div class="btns"><button class="go" id="t-play">Play the ten years</button></div>
<svg class="chart" id="t-svg" viewBox="0 0 820 300" role="img" aria-label="Estimated effect of one variable in each of ten years, with the pooled estimate"></svg>
<p class="read" id="t-read" aria-live="polite"></p>""",
steps(["A model with 12 parameters is estimated three times. All years together: log-likelihood −1,250. Years 2019–2021 only: −600. Years 2022–2024 only: −620.",
       "Add the two separate log-likelihoods: −600 + (−620) = −1,220.",
       "Test statistic = −2 × [pooled − separate] = −2 × [−1,250 − (−1,220)] = −2 × (−30) = 60.",
       "Degrees of freedom: the two separate models have 24 parameters, the pooled model 12. Difference = 12.",
       "The 5% critical value of chi-square with 12 degrees of freedom is 21.03.",
       "60 is far above 21.03. <b>Reject stability</b>: the two periods need different parameters, and a single pooled model would mislead."]))}

{concept(I["causality"], """<p>Two different questions hide in most safety studies. <b>Prediction:</b> how many crashes will this site have next year? <b>Causality:</b> if I change this one thing, how will crashes change? A model can be excellent at the first and wrong about the second.</p>
<p>Mannering, Bhat, Shankar and Abdel-Aty (2020) give an example of why. In bad weather, cautious drivers stay home. The drivers observed in snow are a self-selected, riskier group. The data then mix the effect of snow with the effect of who is driving.</p>
<p>Data-driven methods such as machine learning tend to predict well but say little about cause. Statistical models built to handle heterogeneity and endogeneity predict less sharply but support causal statements. The choice depends on the question.</p>""",
f"""<div class="ctl">{rng("pc-h", "Cautious drivers who stay home when it snows", 0, 100, 5, 80, "pc-hv")}</div>
<svg class="chart" id="pc-svg" viewBox="0 0 780 305" role="img" aria-label="Drivers on the road on a snow day and crash rates on clear and snow days"></svg>
<p class="read" id="pc-read" aria-live="polite"></p>
<p class="note">Each dot stands for 10 drivers. Cautious drivers crash on 0.5% of clear days and 1% of snow days. Risk-takers crash on 2% and 4%. Snow doubles the risk for both.</p>""",
steps(["500 cautious drivers: crash risk 0.5% on a clear day, 1% in snow. 500 risk-takers: 2% clear, 4% snow. For every driver, snow doubles the risk.",
       "Clear day, everyone drives: 500 × 0.5% + 500 × 2% = 2.5 + 10 = 12.5 crashes among 1,000 drivers. Rate = 1.25%.",
       "Snow day: 80% of cautious drivers stay home, so 100 cautious and 500 risk-takers are on the road.",
       "Crashes in snow: 100 × 1% + 500 × 4% = 1 + 20 = 21 among 600 drivers. Rate = 3.5%.",
       "The data say 3.5% ÷ 1.25% = <b>2.8 times</b>. The causal effect of snow is <b>2 times</b>.",
       "For forecasting tomorrow’s snow-day crashes, 3.5% is the right number. For judging what snow does to a driver, or what a snow-related countermeasure could achieve, it is the wrong one."]))}

{concept(I["conflicts"], """<p>Crashes are rare. Waiting years to count them is slow, and each one is a tragedy. <b>Traffic conflicts</b>, or near misses, happen far more often and can be measured from video or vehicle sensors within days.</p>
<p>The most used measures are <b>time-to-collision</b> (how many seconds until two road users would collide if neither changed course) and post-encroachment time (Arun, Haque, Sayed and Mannering, 2021). The smaller the number, the closer the call. A crash is the extreme case: time-to-collision of zero.</p>
<p><b>Extreme value theory</b> is the statistics of rare extremes. It fits a curve to the most severe near misses and extends that curve to zero, giving an estimate of crash probability from near misses alone (Ali, Haque and Mannering, 2023).</p>""",
f"""<div class="ctl">{rng("c-u", "Conflict threshold", 0.8, 2.5, 0.1, 1.5, "c-uv")}{rng("c-n", "Interactions observed", 1000, 20000, 1000, 5000, "c-nv")}</div>
<div class="btns"><button class="go" id="c-play">Play one interaction</button></div>
<svg class="chart" id="c-svg" viewBox="0 0 820 350" role="img" aria-label="Two cars closing in, and a histogram of time-to-collision with a fitted tail extended to zero"></svg>
<p class="read" id="c-read" aria-live="polite"></p>""",
steps(["A camera records 5,000 interactions. In 200 of them the time-to-collision drops below a threshold of 1.5 seconds. These are the conflicts.",
       "Share of interactions that are conflicts: 200 ÷ 5,000 = 0.04.",
       "Among the conflicts, the average distance below the threshold is 0.25 s. A simple tail model says the chance of going at least x below the threshold is e<sup>−x ÷ 0.25</sup>.",
       "A crash means going the full 1.5 s below the threshold: e<sup>−1.5 ÷ 0.25</sup> = e<sup>−6</sup> = 0.00248.",
       "Crash probability per interaction = 0.04 × 0.00248 = 0.0000992.",
       "That is about <b>1 crash per 10,100 interactions</b>, estimated without observing a single crash."]),
"""<p class="note">The tool and the example use the simplest possible tail, an exponential curve above a threshold. Research uses the generalised Pareto and generalised extreme value distributions, which have an extra shape parameter.</p>""")}

<section class="concept"><h2>All seven at once</h2><p>Real crash data rarely have just one of these issues. A single data set can hide varying effects, self-selected drivers, related neighbours and drifting parameters together, and much current research is about handling several in one model.</p>
<div class="btns"><a class="btn" href="practice.html">Practise with new numbers</a><a class="btn ghost" href="memory.html">Walk the memory route</a><a class="btn ghost" href="{GUIDE}">Read the study guide</a></div></section>
</main>'''
page("learn.html", "Learn the seven ideas · AMAR Methods Learning", LEARN, '<script src="js/learn.js"></script>')

# ---------------------------------------------------------------- models.html
MODELS = [
 dict(id="binary", name="Binary logit", q="Two outcomes: injured or not", floor="Ground floor · the two-way door", scene="The hotel entrance is a revolving door with only two exits, IN and OUT. A doorman reads your score and leans on the door: the higher the score, the harder he pushes you towards IN, but he can never push with 100% certainty."),
 dict(id="mnl", name="Multinomial logit", q="Three or more outcomes with no natural order needed", floor="Floor 1 · the balloon buffet", scene="Every dish on the buffet has a balloon tied to it. The tastier the dish (the higher its score), the bigger its balloon. Your chance of picking a dish is its balloon’s share of all the air in the room."),
 dict(id="nested", name="Nested logit", q="Some outcomes are more alike than others", floor="Floor 2 · the twin rooms", scene="Twins share one room and one key. When one twin checks out, the other twin inherits nearly all of the luggage. The guest in the single room across the corridor gets almost nothing."),
 dict(id="ordered", name="Ordered logit and probit", q="Outcomes have a natural order", floor="Floor 3 · the thermometer staircase", scene="A giant thermometer runs up the stairwell with two gates across it. One blob of mercury rises with the score. Below the first gate: no injury. Between the gates: injury. Above the second gate: fatal."),
 dict(id="mixed", name="Mixed (random parameters) logit", q="Effects differ from person to person", floor="Floor 4 · the costume party", scene="The costume shop from the road trip has sent everyone here. Each guest has a different taste, so each has a different chance of dancing. The hotel manager reports only the average of all those chances."),
 dict(id="latent", name="Latent class logit", q="A few hidden groups, each with its own effects", floor="Floor 5 · the masked ball", scene="Two secret clubs are at a masked ball. You cannot tell who belongs to which club. You only know that 60% wear one kind of ring under their glove, and each club dances to its own rules."),
]
def deep(title, body): return f'<details class="deep"><summary>Go deeper: {title}</summary>{body}</details>'
DEEP = {
 "binary": deep("odds and the S-curve", "<p>The <b>odds</b> of an event are p ÷ (1 − p). A probability of 0.69 is odds of 0.69 ÷ 0.31 = 2.2 to 1. The binary logit says that the logarithm of the odds equals the score, which is where the name comes from: “logit” is short for “log-odds unit”.</p><p>Each extra point of score multiplies the odds by e ≈ 2.718. The same change in score moves the probability a lot near 50% and very little near 0% or 100%, which is why the curve is S-shaped.</p>"),
 "mnl": '<div class="btns"><a class="btn" href="mnl.html">The multinomial logit from zero: an eight-step walk-through</a></div><p class="note">The walk-through covers how scores are built from a crash, the base outcome, odds ratios, marginal effects, maximum likelihood and goodness of fit.</p>',
 "nested": deep("the formula in two stages", "<p>The nested logit works in two stages. <b>Inside the nest</b>, the outcomes compete like a small multinomial logit, but with their scores divided by the nest setting, which sharpens the competition between them. <b>Between nests</b>, the whole nest competes with the other outcomes using one combined number, called the <i>inclusive value</i> or <i>logsum</i>:</p><p style='font-family:var(--display);font-weight:600'>nest weight = (sum of e<sup>score ÷ setting</sup> over the outcomes in the nest)<sup>setting</sup></p><p>With two equal scores of 0 and a setting of 0.5 this is (1 + 1)<sup>0.5</sup> = 1.414, as in the worked example. The setting is estimated from the data. An estimate near 1 says the nest was not needed; an estimate outside the range 0 to 1 is a sign that the nesting structure is wrong.</p>"),
 "ordered": deep("thresholds, and when the ordered model is too strict", "<p>The thresholds are not chosen by the analyst. They are estimated together with the coefficients. With three levels there are two thresholds; software fixes one number (the first threshold or the constant) so that the rest can be pinned down.</p><p>Every variable has <b>one</b> coefficient, which shifts the whole curve. That is the “parallel” assumption: a variable cannot make the middle level more likely and both ends less likely. Extensions relax this. The <i>generalised ordered</i> model lets the thresholds themselves depend on variables, and <i>random-parameters ordered</i> models add the heterogeneity of idea 1.</p><p>The probit version replaces the logistic curve with a normal curve. In the example, no injury would be Φ(0 − 0.5) = 0.309 instead of 0.378.</p>"),
 "mixed": deep("how one coefficient becomes a distribution", "<p>In a multinomial logit the “no seat belt” coefficient for fatal might be +1.6 for everyone. In a mixed logit it is written as</p><p style='font-family:var(--display);font-weight:600'>coefficient for person i = mean + spread × (a random draw for person i)</p><p>With mean 1.6 and spread 1.0, a person whose draw is −2 has a coefficient of −0.4 and a person whose draw is +1 has 2.6. The model estimates the mean and the spread. If the spread is not statistically different from zero, the coefficient is kept fixed.</p><p><b>Heterogeneity in means</b> lets the mean depend on something observed: mean = 1.6 + 0.5 × (occupant older than 65). <b>Heterogeneity in variances</b> does the same for the spread. Both help explain <i>why</i> effects differ, not only that they do.</p><p>The probability for a crash is the multinomial-logit probability averaged over the draws, computed by simulation with, typically, several hundred to a thousand or more Halton draws.</p>"),
 "latent": deep("who is in which class?", "<p>Class membership is itself a small multinomial logit. Each class has a score, possibly depending on crash characteristics, and the shares are e<sup>score</sup> ÷ total, exactly as on floor 1.</p><p>After estimation, each crash gets a probability of belonging to each class. Using the example (class A: 60%, severe 0.10; class B: 40%, severe 0.40), a crash that <i>was</i> severe belongs to class B with probability 0.16 ÷ 0.22 = 0.73.</p><p>The number of classes is chosen by fitting models with two, three, four classes and comparing them with information criteria such as BIC, which reward fit and penalise extra parameters.</p>"),
}

def mconcept(d, k, explain, tool, worked, extra=""):
    return f'''<section class="concept" id="{d["id"]}">
<p class="eyebrow">Model {k} of 6 · {d["q"]}</p><h2>{d["name"]}</h2>
{explain}
{"<h3>Try it</h3>" + tool if tool else ""}
<h3>Solve one by hand</h3>
{worked}
{extra}
{DEEP.get(d["id"], "")}
<div class="hook"><b>Remember it · {d["floor"]}.</b> {d["scene"]}</div>
</section>'''
M = {d["id"]: d for d in MODELS}
MODELS_HTML = f'''<main class="wrap">
<div><p class="eyebrow">Models</p><h1>The logit family, one floor at a time</h1></div>
<p class="lede">The seven ideas say what can go wrong. These are the models researchers use in response. Each one is a small change to the one before, so learn them in order.</p>
<section class="concept"><h2>First: what is being modelled?</h2>
<p>Crash studies ask two kinds of question, and each has its own family of models.</p>
<div class="grid">
<div class="card"><span class="num">How many?</span><h3>Crash frequency</h3><p>The number of crashes on a road segment in a year: 0, 1, 2, 3 … These are counts, modelled with the <b>Poisson</b> model or, when counts vary more than Poisson allows, the <b>negative binomial</b> model.</p></div>
<div class="card"><span class="num">How bad?</span><h3>Injury severity</h3><p>The outcome of one crash: no injury, injury or fatal. These are categories, modelled with the <b>logit family</b> on this page.</p></div>
</div>
<p>Every model below starts the same way. It gives each possible outcome a <b>score</b>: a weighted sum of what is known about the crash, such as speed limit, seat-belt use and lighting. The models differ in how they turn scores into probabilities.</p>
<nav class="jump" aria-label="Models"><a href="#counts">Count models</a>{"".join(f'<a href="#{d["id"]}">{d["name"]}</a>' for d in MODELS)}<a href="#choose">Which model when?</a><a href="mnl.html">Multinomial logit from zero</a></nav></section>

<section class="concept" id="counts"><p class="eyebrow">Before the hotel · how many crashes?</p><h2>Count models: Poisson and negative binomial</h2>
<p>When the question is “how many crashes will this segment have in a year?”, the outcome is a count: 0, 1, 2, 3 … The <b>Poisson</b> model is the starting point. It needs one number per segment, the expected count, which is linked to road features (traffic volume, curves, lighting) through e<sup>score</sup>, so that it can never be negative.</p>
<p>Poisson has a built-in assumption: the variance equals the mean. Real crash counts are more spread out, with many segments at zero and a few with very many. This is called <b>overdispersion</b>, and it is unobserved heterogeneity (idea 1) showing up in counts. The <b>negative binomial</b> model adds one parameter, α, for the extra spread.</p>
<h3>Try it</h3>
<div class="ctl">{rng("k-m", "Expected crashes per year (mean)", 0.5, 6, 0.1, 2, "k-mv")}{rng("k-a", "Extra spread α (0 = Poisson)", 0, 2, 0.1, 1, "k-av")}</div>
<svg class="chart" id="k-svg" viewBox="0 0 820 295" role="img" aria-label="Probability of each crash count under Poisson and negative binomial models"></svg>
<p class="read" id="k-read" aria-live="polite"></p>
<h3>Solve one by hand</h3>
{steps(["A segment is expected to have 2 crashes a year. Poisson probability of exactly k crashes: e<sup>−2</sup> × 2<sup>k</sup> ÷ k!", "Zero crashes: e<sup>−2</sup> = <b>0.135</b>.", "One crash: 0.135 × 2 ÷ 1 = <b>0.271</b>. Two crashes: 0.135 × 4 ÷ 2 = <b>0.271</b>.", "Poisson variance = mean = 2.", "Negative binomial with α = 1: variance = 2 + 1 × 2² = <b>6</b>, three times the Poisson value.", "Its chance of zero crashes is (1 ÷ (1 + α × mean))<sup>1 ÷ α</sup> = 1 ÷ 3 = <b>0.333</b>, against 0.135 for Poisson."])}
{deep("zeros, and random parameters for counts", "<p>If a data set has even more zeros than the negative binomial expects, <b>zero-inflated</b> models add a separate yes/no part for “is this a segment where crashes essentially never get recorded?”. They are used with care, because a road with traffic is never truly risk-free.</p><p>Counts can have random parameters too. A <b>random-parameters negative binomial</b> lets the effect of, say, lane width differ from segment to segment, estimated by simulation exactly as in idea 2.</p>")}
</section>

{mconcept(M["binary"], 1, """<p>The simplest case has two outcomes, such as injured or not injured. The model computes one score and passes it through an S-shaped curve, the <b>logistic function</b>, which turns any number into a probability between 0 and 1.</p>
<p style="font-family:var(--display);font-weight:600">probability = 1 ÷ (1 + e<sup>−score</sup>)</p>
<p>A score of 0 gives 50%. Large positive scores approach 100%, large negative scores approach 0%.</p>""", "",
steps(["A crash has a score of 0.8 for “injured”.", "e<sup>−0.8</sup> = 0.449.", "Probability = 1 ÷ (1 + 0.449) = <b>0.690</b>.", "So this crash has a 69% chance of an injury and a 31% chance of none.", "Check the pattern: a score of 0 gives 1 ÷ (1 + 1) = 0.5."]))}

{mconcept(M["mnl"], 2, """<p>With three or more outcomes, each outcome gets its own score. The <b>multinomial logit</b> turns the scores into probabilities in two steps. First, each score becomes a positive weight, e<sup>score</sup>. Second, each weight is divided by the total of all weights.</p>
<p>The binary logit is the same thing with two outcomes. The multinomial logit is the workhorse of severity analysis and the starting point for everything else on this page.</p>""",
f"""<div class="ctl">{rng("m-1", "Score: no injury", -3, 3, 0.1, 0, "m-1v")}{rng("m-2", "Score: injury", -3, 3, 0.1, -0.5, "m-2v")}{rng("m-3", "Score: fatal", -3, 3, 0.1, -2, "m-3v")}</div>
<svg class="chart" id="m-svg" viewBox="0 0 820 270" role="img" aria-label="Weights and probabilities of three outcomes"></svg>
<p class="read" id="m-read" aria-live="polite"></p>""",
steps(["Scores: no injury 0, injury −0.5, fatal −2.", "Weights: e<sup>0</sup> = 1.000, e<sup>−0.5</sup> = 0.607, e<sup>−2</sup> = 0.135.", "Total weight = 1.000 + 0.607 + 0.135 = 1.742.", "No injury: 1.000 ÷ 1.742 = <b>0.574</b>.", "Injury: 0.607 ÷ 1.742 = <b>0.348</b>.", "Fatal: 0.135 ÷ 1.742 = <b>0.078</b>. The three add to 1."]),
"""<p class="note"><b>Its weak spot.</b> The ratio of any two probabilities depends only on those two scores. If one outcome becomes less likely, its lost share is spread over all the others in proportion. This property is called the independence of irrelevant alternatives. It is wrong when some outcomes are close cousins, which is the reason for the next model.</p>""")}

{mconcept(M["nested"], 3, """<p>“Minor injury” and “severe injury” have something in common that “no injury” lacks: in both, the crash forces reached the occupant. Unrecorded factors that push a crash towards one injury level also push it towards the other.</p>
<p>The <b>nested logit</b> puts such related outcomes in a group, called a nest. One extra number, between 0 and 1, says how alike the nested outcomes are: 1 means not alike at all (the model becomes the plain multinomial logit), and values near 0 mean nearly interchangeable.</p>""",
f"""<div class="ctl">{rng("n-v", "Score of severe injury (lower it)", -3, 0, 0.1, -1.5, "n-vv")}{rng("n-l", "Nest setting (1 = plain multinomial logit)", 0.1, 1, 0.05, 0.4, "n-lv")}</div>
<svg class="chart" id="n-svg" viewBox="0 0 820 305" role="img" aria-label="Probabilities before and after lowering the score of severe injury"></svg>
<p class="read" id="n-read" aria-live="polite"></p>""",
steps(["Three outcomes with equal scores of 0. A plain multinomial logit gives each one 1 ÷ 3 = 0.333.", "Now nest minor and severe injury with a nest setting of 0.5.", "The nest’s combined weight is (1 + 1)<sup>0.5</sup> = 2<sup>0.5</sup> = 1.414. No injury keeps a weight of 1.", "Probability of the injury nest = 1.414 ÷ (1 + 1.414) = 0.586.", "Inside the nest the two outcomes have equal scores, so each gets half: 0.586 ÷ 2 = <b>0.293</b>.", "No injury = 1 − 0.586 = <b>0.414</b>. Two similar outcomes count for less than two fully separate ones."]))}

{mconcept(M["ordered"], 4, """<p>No injury, injury and fatal have a natural order. The <b>ordered logit</b> (and its close relative the ordered probit) uses that order. It computes a single score for the crash, a hidden “severity tendency”, and cuts the scale with thresholds. Where the tendency falls decides the level.</p>
<p>It needs fewer parameters than the multinomial logit, because there is one score, not one per outcome. The price is a restriction: a variable that raises the score must make the highest level more likely and the lowest level less likely. Some real effects do not behave that way. An airbag can reduce fatalities and also increase minor injuries.</p>""",
f"""<div class="ctl">{rng("o-x", "Score of the crash", -3, 5, 0.1, 0.5, "o-xv")}</div>
<svg class="chart" id="o-svg" viewBox="0 0 820 295" role="img" aria-label="A bell-shaped curve cut by two thresholds into three severity levels"></svg>
<p class="read" id="o-read" aria-live="polite"></p>""",
steps(["Thresholds are 0 and 2. The crash’s score is 0.5. Write F(z) = 1 ÷ (1 + e<sup>−z</sup>).", "No injury = F(0 − 0.5) = F(−0.5) = <b>0.378</b>.", "Up to and including injury = F(2 − 0.5) = F(1.5) = 0.818.", "Injury = 0.818 − 0.378 = <b>0.440</b>.", "Fatal = 1 − 0.818 = <b>0.182</b>.", "Check: 0.378 + 0.440 + 0.182 = 1."]),
"""<p class="note">The ordered probit is the same idea with a normal curve in place of the logistic curve. Results are usually very similar.</p>""")}

{mconcept(M["mixed"], 5, f"""<p>All models so far give every person the same effects. The <b>mixed logit</b>, also called the random parameters logit, removes that assumption. It is the multinomial logit with <a href="learn.html#heterogeneity">idea 1</a> built in: each person has their own effect, drawn from a mixing distribution.</p>
<p>The probability it reports is the average of the logit probability over all those personal effects. That average has no exact formula, so it is computed by simulation, which is <a href="learn.html#simulation">idea 2</a>.</p>
<p>Two extensions are common in recent papers. <b>Heterogeneity in means and variances</b> lets the centre and the spread of a random effect depend on other variables, for example a larger seat-belt benefit for younger occupants. <b>Correlated random parameters</b> let two random effects move together.</p>""",
f"""<div class="ctl">{rng("x-m", "Mean effect", -2, 2, 0.1, 0.5, "x-mv")}{rng("x-s", "Spread across people", 0, 3, 0.1, 1.5, "x-sv")}</div>
<svg class="chart" id="x-svg" viewBox="0 0 820 295" role="img" aria-label="Distribution of individual probabilities with the mixed logit average and the fixed-parameter value"></svg>
<p class="read" id="x-read" aria-live="polite"></p>""",
steps(["Imagine just two kinds of people, equally common. For one kind the score is −1; for the other it is 2. The mean score is 0.5.", "Probability for the first kind: 1 ÷ (1 + e<sup>1</sup>) = 0.269.", "Probability for the second kind: 1 ÷ (1 + e<sup>−2</sup>) = 0.881.", "Mixed logit: average the probabilities. (0.269 + 0.881) ÷ 2 = <b>0.575</b>.", "A fixed-parameter logit uses the mean score: 1 ÷ (1 + e<sup>−0.5</sup>) = <b>0.622</b>.", "The two differ because averaging scores first and averaging probabilities are not the same thing."]))}

{mconcept(M["latent"], 6, """<p>The mixed logit lets effects vary smoothly. The <b>latent class logit</b> takes a different view: crashes belong to a small number of hidden groups, and each group has its own multinomial logit. “Latent” means hidden. Nobody labels the groups; the model infers them.</p>
<p>The model estimates the share of each class and the effects within each class. It does not need the analyst to choose a mixing distribution, which is its main appeal. Its limit is that everyone inside a class is treated as identical. Some papers combine the two and allow random parameters inside each class.</p>""",
f"""<div class="ctl">{rng("l-s", "Share of crashes in class A", 0, 100, 5, 60, "l-sv")}{rng("l-a", "Severe-outcome probability, class A", 0, 100, 5, 10, "l-av")}{rng("l-b", "Severe-outcome probability, class B", 0, 100, 5, 40, "l-bv")}</div>
<svg class="chart" id="l-svg" viewBox="0 0 820 225" role="img" aria-label="One hundred crashes in two hidden classes and the probability of a severe outcome in each"></svg>
<p class="read" id="l-read" aria-live="polite"></p>""",
steps(["Class A holds 60% of crashes; its probability of a severe outcome is 0.10.", "Class B holds 40% of crashes; its probability is 0.40.", "Contribution of class A: 0.60 × 0.10 = 0.06.", "Contribution of class B: 0.40 × 0.40 = 0.16.", "Overall probability = 0.06 + 0.16 = <b>0.22</b>.", "A single-class model would have to describe everyone with one set of effects and would fit neither group well."]))}

<section class="concept" id="choose"><h2>Which model when?</h2>
<div style="overflow-x:auto"><table style="border-collapse:collapse;min-width:640px;width:100%"><thead><tr>{"".join(f'<th style="text-align:left;padding:8px 12px 8px 0;font-family:var(--display)">{h}</th>' for h in ["Model", "Use it when", "Watch out for"])}</tr></thead><tbody>
{"".join(f'<tr>{"".join(f"<td style=\'padding:8px 12px 8px 0;border-top:1px solid var(--line);vertical-align:top\'>{c}</td>" for c in row)}</tr>' for row in [
 ("<b>Poisson, negative binomial</b>", "The outcome is a count of crashes", "Poisson assumes mean = variance; crash counts usually vary more"),
 ("<b>Binary logit</b>", "Two outcomes", "Nothing beyond the issues below"),
 ("<b>Multinomial logit</b>", "Three or more outcomes; a flexible first model", "Treats all outcomes as equally unrelated"),
 ("<b>Nested logit</b>", "Some outcomes share unrecorded causes", "You must decide the nests"),
 ("<b>Ordered logit or probit</b>", "Outcomes are ordered and you want few parameters", "One score moves all levels the same way"),
 ("<b>Mixed logit</b>", "Effects differ across people (idea 1)", "Needs simulation and a choice of mixing distribution"),
 ("<b>Latent class logit</b>", "You suspect a few distinct hidden groups", "Everyone inside a class is identical; the number of classes is a choice")])}
</tbody></table></div>
<p class="note">Mannering and Bhat (2014) and Mannering, Shankar and Bhat (2016) review these models and their many variants. The second paper notes that no one approach to heterogeneity is clearly superior.</p>
<div class="btns"><a class="btn" href="practice.html#models">Practise the models</a><a class="btn ghost" href="memory.html#hotel">Walk the Logit Hotel</a></div></section>
</main>'''
page("models.html", "The logit family · AMAR Methods Learning", MODELS_HTML, '<script src="js/models.js"></script>')

# ---------------------------------------------------------------- mnl.html
def sec(n, title, body): return f'<section class="concept" id="s{n}"><p class="eyebrow">Step {n} of 8</p><h2>{title}</h2>{body}</section>'
MNL_HTML = f'''<main class="wrap">
<div><p class="eyebrow">Models · in depth</p><h1>The multinomial logit from zero</h1></div>
<p class="lede">This page assumes nothing. It follows one crash through the model, from what the police report says to three probabilities, and then explains where the model’s numbers come from and how to read them.</p>
<nav class="jump" aria-label="Steps">{"".join(f'<a href="#s{i + 1}">{i + 1} · {t}</a>' for i, t in enumerate(["The question", "Scores", "Weights and shares", "The base outcome", "Reading the numbers", "Where the numbers come from", "How good is the fit?", "The weak spot"]))}<a href="#words">Words you will meet</a></nav>

{sec(1, "What question does it answer?", """<p>A crash has happened. It ended in one of several ways: <b>no injury</b>, <b>injury</b> or <b>fatal</b>. We know a few facts about it, such as whether the driver wore a seat belt. The multinomial logit answers one question:</p>
<p style="font-family:var(--display);font-weight:600;font-size:18px">Given what we know about this crash, how likely was each outcome?</p>
<p>“Multinomial” means “more than two named outcomes”. “Logit” is the name of the formula it uses. The model does not say what <i>will</i> happen. It gives a probability for each outcome, and the probabilities add up to 100%.</p>""")}

{sec(2, "Give every outcome a score", """<p>The model keeps a small table of numbers called <b>coefficients</b>. Each outcome has its own row. To score a crash, start with the outcome’s <b>constant</b> and add the coefficient of every fact that is true for this crash. Papers call the score the <i>utility</i> or the <i>severity function</i>.</p>
<div class="scroll"><table class="t"><tr><th>Outcome</th><th>Constant</th><th>No seat belt</th><th>High speed limit</th><th>Night</th></tr>
<tr><td><b>No injury</b> (base)</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td><b>Injury</b></td><td>−0.6</td><td>+0.9</td><td>+0.5</td><td>+0.3</td></tr>
<tr><td><b>Fatal</b></td><td>−2.5</td><td>+1.6</td><td>+1.1</td><td>+0.6</td></tr></table></div>
<p class="note">These coefficients are invented for teaching. In a real study they are estimated from thousands of crash records (step 6).</p>
<h3>Try it: describe a crash</h3>
<div class="btns"><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="b-belt" checked> No seat belt</label><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="b-speed" checked> High speed limit</label><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="b-night"> Night</label></div>
<p class="read" id="b-sum" aria-live="polite"></p>
<svg class="chart" id="b-svg" viewBox="0 0 820 270" role="img" aria-label="Weights and probabilities of the three outcomes for the crash described"></svg>
<p class="read" id="b-read" aria-live="polite"></p>""")}

{sec(3, "Turn scores into weights, then into shares", """<p>Scores can be negative, and probabilities cannot. So the model first turns each score into a positive <b>weight</b> with the exponential function, e<sup>score</sup> (e ≈ 2.718). A score of 0 gives a weight of 1. Each extra point of score multiplies the weight by 2.718.</p>
<p>Then each outcome’s probability is simply its share of the total weight. That is the whole model:</p>
<p style="font-family:var(--display);font-weight:600">probability of an outcome = e<sup>its score</sup> ÷ (sum of e<sup>score</sup> over all outcomes)</p>"""
+ steps(["The crash: no seat belt, high speed limit, daytime.", "Injury score = −0.6 + 0.9 + 0.5 = <b>0.8</b>. Fatal score = −2.5 + 1.6 + 1.1 = <b>0.2</b>. No injury score = 0.", "Weights: e<sup>0</sup> = 1.000, e<sup>0.8</sup> = 2.226, e<sup>0.2</sup> = 1.221.", "Total weight = 1.000 + 2.226 + 1.221 = 4.447.", "No injury: 1.000 ÷ 4.447 = <b>0.225</b>.", "Injury: 2.226 ÷ 4.447 = <b>0.500</b>.", "Fatal: 1.221 ÷ 4.447 = <b>0.275</b>. Check: 0.225 + 0.500 + 0.275 = 1."]))}

{sec(4, "Why one outcome has a score of zero", """<p>Add 5 to every score and nothing changes: every weight is multiplied by the same amount, so the shares stay the same. Only <b>differences</b> between scores matter.</p>
<p>That means the model has one score too many. The fix is to pick one outcome, call it the <b>base outcome</b>, and set its score to 0. Every coefficient is then read <i>relative to the base</i>. In the table above the base is “no injury”, so +1.6 means “not wearing a seat belt pushes a crash towards fatal, compared with no injury”.</p>
<p class="note">Choosing a different base changes the numbers in the table but not a single probability.</p>""")}

{sec(5, "How to read the numbers in a paper", """<p><b>1. The sign.</b> A positive coefficient pushes crashes towards that outcome, relative to the base. A negative one pulls them away.</p>
<p><b>2. The odds ratio.</b> “Odds” here means the probability of an outcome divided by the probability of the base outcome. The exponential of a coefficient tells you by how much the odds are multiplied. For fatal, e<sup>1.6</sup> ≈ 4.95: without a seat belt, the odds of a fatal outcome against no injury are about five times higher.</p>
<p><b>3. The change in probability.</b> This is what most people want, and papers report it as a <b>marginal effect</b>. It is the difference in probability with and without the fact, holding everything else the same. Unlike the coefficient, it depends on the rest of the crash.</p>"""
+ steps(["Same crash as before (high speed limit, daytime), now compare without and with a seat belt.", "Without a belt we found: fatal = 0.275.", "With a belt the “no seat belt” coefficients drop out. Injury score = −0.6 + 0.5 = −0.1. Fatal score = −2.5 + 1.1 = −1.4.", "Weights: 1.000, e<sup>−0.1</sup> = 0.905, e<sup>−1.4</sup> = 0.247. Total = 2.151.", "With a belt: no injury 0.465, injury 0.421, fatal <b>0.115</b>.", "Change in the probability of a fatal outcome: 0.275 − 0.115 = <b>0.160</b>, or 16 percentage points.", "Odds check: fatal ÷ no injury is 1.221 without a belt and 0.247 with one. 1.221 ÷ 0.247 = 4.95 = e<sup>1.6</sup>."]))}

{sec(6, "Where do the coefficients come from?", f"""<p>Nobody chooses the coefficients. The computer finds them from data by <b>maximum likelihood</b>: it tries values, and for each try it asks, “if these values were true, how probable is the data we actually observed?” It keeps the values that make the observed data most probable.</p>
<p>Probabilities of thousands of crashes multiplied together give a tiny number, so the computer works with its logarithm, the <b>log-likelihood</b>. It is always negative, and closer to zero is better.</p>
<p>Here is the smallest possible example: one number to find. Ten crashes without a seat belt; seven ended in injury.</p>
<div class="ctl">{rng("l-b", "Try a value of β", -2, 3, 0.05, 0, "l-bv")}</div>
<div class="btns"><button class="go" id="l-go">Let the computer find the best value</button></div>
<svg class="chart" id="l-svg" viewBox="0 0 820 295" role="img" aria-label="Ten crashes and the log-likelihood curve as the coefficient changes"></svg>
<p class="read" id="l-read" aria-live="polite"></p>"""
+ steps(["The model: probability of injury p = 1 ÷ (1 + e<sup>−β</sup>). Data: 7 injured, 3 not.", "Try β = 0: p = 0.5. Log-likelihood = 7 × ln(0.5) + 3 × ln(0.5) = 10 × (−0.693) = <b>−6.931</b>.", "Try β = 1: p = 0.731. Log-likelihood = 7 × ln(0.731) + 3 × ln(0.269) = −2.193 − 3.939 = <b>−6.133</b>. Better.", "The best possible p is the observed share, 7 ÷ 10 = 0.7. That needs β = ln(0.7 ÷ 0.3) = <b>0.847</b>.", "At β = 0.847: 7 × ln(0.7) + 3 × ln(0.3) = −2.497 − 3.612 = <b>−6.109</b>, the highest value on the curve.", "A real model does the same thing with many coefficients at once, climbing the same kind of hill in many dimensions."]))}

{sec(7, "How good is the fit?", """<p>Compare the log-likelihood of your model with that of a model that knows nothing. A common summary is McFadden’s pseudo R-squared:</p>
<p style="font-family:var(--display);font-weight:600">ρ² = 1 − (log-likelihood of the model) ÷ (log-likelihood of the know-nothing model)</p>
<p>It runs from 0 (no better than knowing nothing) towards 1. It is not the share of variance explained, and values that would look low for an ordinary regression are normal here.</p>"""
+ steps(["From step 6: know-nothing model (β = 0) has log-likelihood −6.931. Best model: −6.109.", "ρ² = 1 − (−6.109 ÷ −6.931) = 1 − 0.881 = <b>0.119</b>.", "To compare two models where one adds extra coefficients, use the likelihood ratio test: −2 × (LL of the smaller model − LL of the larger model), compared with a chi-square value. It is the same test used for temporal instability on the Learn page."]))}

{sec(8, "The weak spot", """<p>The model treats outcomes as unrelated. Its formula implies that the <b>ratio</b> of any two probabilities depends only on those two scores. This is called the <b>independence of irrelevant alternatives</b>.</p>
<p>Take the crash from step 3: no injury 0.225, injury 0.500, fatal 0.275. Suppose a new vehicle design made a fatal outcome impossible. The model keeps the ratio of the other two fixed, so the 0.275 is shared out in proportion:</p>"""
+ steps(["Remaining weight: 1.000 (no injury) + 2.226 (injury) = 3.226.", "No injury: 1.000 ÷ 3.226 = <b>0.310</b>. Injury: 2.226 ÷ 3.226 = <b>0.690</b>.", "So about 31% of the crashes that would have been fatal are predicted to become “no injury”.", "That is hard to believe. A crash violent enough to kill is far more likely to end in a serious injury than in none.", "The nested logit fixes this by grouping the injury outcomes. The mixed logit fixes it by letting effects vary across people."])
+ """<div class="btns"><a class="btn" href="models.html#nested">Continue to the nested logit</a><a class="btn ghost" href="practice.html#models">Practise</a></div>""")}

<section class="concept" id="words"><h2>Words you will meet in papers</h2>
<div class="scroll"><table class="t"><tr><th>Word</th><th>Plain meaning</th></tr>
{"".join(f"<tr><td><b>{a}</b></td><td>{b}</td></tr>" for a, b in [("Alternative, outcome", "One of the possible results: no injury, injury, fatal."), ("Utility, severity function", "The score of an outcome for one crash."), ("Coefficient, parameter (β)", "A number in the table: how much one fact adds to a score."), ("Constant", "The score an outcome gets before any fact is added."), ("Base outcome", "The outcome whose score is fixed at 0; everything is read relative to it."), ("Likelihood", "How probable the observed data are, given the coefficients."), ("Log-likelihood", "The logarithm of the likelihood. Negative; closer to zero is better."), ("Odds ratio", "e to the power of a coefficient: how much a fact multiplies the odds against the base."), ("Marginal effect", "The change in an outcome’s probability when a fact changes."), ("Independence of irrelevant alternatives", "The weak spot: lost probability is shared out in proportion among all other outcomes.")])}
</table></div>
<div class="hook"><b>Remember it · Floor 1 of the Logit Hotel, the balloon buffet.</b> A chef reads the recipe card for each dish and adds up the ingredients that are in the kitchen today (the score). A pump inflates each dish’s balloon to e to the power of its score (the weight). Your chance of choosing a dish is its balloon’s share of all the air. One dish, plain bread, always has a balloon of size 1 (the base outcome).</div></section>
</main>'''
page("mnl.html", "Multinomial logit from zero · AMAR Methods Learning", MNL_HTML, '<script src="js/mnl.js"></script>')

# ---------------------------------------------------------------- study.html
import sys; sys.path.insert(0, str(Path(__file__).parent))
from study_tools import TOOLS
STEPS10 = ["Code the data", "Split into subsets", "Multinomial logit", "Choose the variables", "Random parameters", "Estimate by simulation", "Marginal effects", "Transfer between road classes", "Stability over time", "Predict"]
def st(n, title, body): return f'<section class="concept" id="step{n}"><p class="eyebrow">Step {n} of 10</p><h2>{title}</h2>{body}</section>'
STUDY_HTML = f'''<main class="wrap">
<div><p class="eyebrow">Case study</p><h1>A full severity study, step by step</h1></div>
<p class="lede">Many recent papers follow the same recipe: split crashes by place and by year, fit a random-parameters logit to each part, then test whether the parts can share a model. This page walks through that recipe with a study of truck crashes on three classes of road over three years. Every number is invented for teaching.</p>
<nav class="jump" aria-label="Steps">{"".join(f'<a href="#step{i + 1}">{i + 1} · {t}</a>' for i, t in enumerate(STEPS10))}<a href="#named">Models named in the literature</a></nav>
<section class="concept"><h2>The study in one picture</h2>
<p><b>The question:</b> do the factors linked to crash severity differ between expressways, dual carriageways and single carriageways, and do they stay the same from year to year?</p>
<p><b>The outcome</b> has three levels: property damage only, injury, fatal. <b>The design</b> is 3 road classes × 3 years = 9 separate models, compared with each other by likelihood ratio tests.</p>
<div class="grid">{"".join(f'<a class="card" href="#step{i + 1}" style="text-decoration:none;color:inherit"><span class="num">Step {i + 1}</span><h3>{t}</h3></a>' for i, t in enumerate(STEPS10))}</div></section>

{st(1, "Turn the crash records into 0/1 indicators", """<p>A model needs numbers. Each category in the records becomes an <b>indicator</b>: 1 if true for this crash, 0 if not. One category of each variable gets no indicator. It is the <b>base category</b>, and every coefficient is read as “compared with the base”.</p>"""
+ steps(["Season has four categories: winter, spring, summer, autumn.", "Choose summer as the base. Create three indicators: Winter, Spring, Autumn.", "A crash in spring is coded Winter = 0, Spring = 1, Autumn = 0.", "A crash in summer is coded 0, 0, 0. Summer needs no indicator of its own.", "Why not four indicators? The fourth adds no information (if the other three are 0, it must be summer), and the model could not tell its effect apart from the constant.", "An indicator that is the same for every crash in a subset (for example a speed limit that never occurs on single carriageways) is dropped from that subset’s model: it is constant, so nothing can be learned about it."]))}

{st(2, "Split the data into subsets", """<p>To ask whether effects differ by place and year, the data are split first. Three road classes and three years give nine subsets, each with its own model. This is called <b>segmentation</b>.</p>
<p>Before modelling, a quick <b>chi-square test</b> checks whether the mix of severities differs between groups at all. It compares the counts you observed with the counts you would expect if road class made no difference.</p>
<h3>Try it</h3>""" + TOOLS["chi"] + """<h3>Solve one by hand</h3>"""
+ steps(["Expressway: 400 property damage only, 150 injury, 50 fatal (600 crashes). Other roads: 300, 200, 100 (600 crashes).", "Column totals: 700, 350, 150. Both rows have half of all crashes, so the expected counts in each row are half the column totals: 350, 175, 75.", "For each cell compute (observed − expected)² ÷ expected. Expressway: 50² ÷ 350 = 7.14; 25² ÷ 175 = 3.57; 25² ÷ 75 = 8.33.", "The second row gives the same three numbers. Sum of all six: χ² = <b>38.10</b>.", "Degrees of freedom = (rows − 1) × (columns − 1) = 1 × 2 = 2. The 5% critical value is 5.99.", "38.10 is far above 5.99: the severity mix differs between the two groups."])
+ """<p class="note">The trade-off in splitting: more subsets answer finer questions, but each has fewer crashes. A subset with very few fatal crashes gives shaky estimates, which is one reason to test whether two road classes can be merged (step 8).</p>""")}

{st(3, "Start with the multinomial logit", """<p>Each subset first gets a plain multinomial logit. Property damage only is the base outcome with a score of 0. Injury and fatal each get a constant and their own coefficients.</p>
<p style="font-family:var(--display);font-weight:600">score of outcome i for crash n = constant + (coefficients × indicators) + a random disturbance</p>
<p>The disturbance stands for everything not in the data. Assuming it follows an extreme value distribution is what produces the simple “weight ÷ total of weights” formula. Because the outcomes are treated as unordered, a variable can raise the fatal share and lower the injury share at once, which an ordered model cannot do.</p>
<p class="note">A variable can enter at most two of the three score functions. Entering all three would be like adding the same number to every score: nothing would change.</p>
<div class="btns"><a class="btn" href="mnl.html">The multinomial logit from zero</a></div>""")}

{st(4, "Choose which variables stay", """<p>With thirty or so candidate indicators, not all will matter. The usual tool is the <b>t-statistic</b>: the estimate divided by its standard error. It says how many standard errors the estimate is away from zero. A common rule keeps a variable when |t| ≥ 1.645, which corresponds to 90% confidence.</p>
<p><b>Backward selection</b> starts with everything in, removes the weakest variable, estimates again, and repeats until every remaining variable passes.</p>
<h3>Try it</h3>""" + TOOLS["sel"] + """<h3>Solve one by hand</h3>"""
+ steps(["A coefficient is estimated as 0.84 with a standard error of 0.35.", "t = 0.84 ÷ 0.35 = <b>2.40</b>.", "2.40 ≥ 1.645, so the variable stays.", "Another coefficient: −0.21 with a standard error of 0.18. t = −0.21 ÷ 0.18 = −1.17, so |t| = <b>1.17</b>.", "1.17 is below 1.645: this variable is a candidate for removal.", "Remove one variable at a time, because the remaining t-values change after each removal."]))}

{st(5, "Let effects vary: random parameters with heterogeneity in means and variances", """<p>Now each coefficient is tested as a <b>random parameter</b>: one that differs from crash to crash (idea 1). This model is often written RPLHMV: random parameters logit with heterogeneity in means and variances. The coefficient for crash n is</p>
<p style="font-family:var(--display);font-weight:600">β<sub>n</sub> = β + Θ × Z<sub>n</sub> + σ × e<sup>ω × W<sub>n</sub></sup> × (a standard normal draw)</p>
<ul><li><b>β</b> is the mean effect and <b>σ</b> its spread. With only these two, it is an ordinary random parameter.</li><li><b>Θ × Z</b> is heterogeneity in the <b>mean</b>: for crashes where indicator Z is 1, the whole curve slides by Θ.</li><li><b>e<sup>ω × W</sup></b> is heterogeneity in the <b>variance</b>: for crashes where indicator W is 1, the spread is multiplied by e<sup>ω</sup>.</li></ul>
<p>Z and W are other variables in the data. They help explain <i>why</i> the effect differs, not just that it does.</p>
<h3>Try it</h3>""" + TOOLS["rp"] + """<h3>Solve one by hand</h3>"""
+ steps(["The rollover coefficient in the fatal function is random: β = −0.8, σ = 0.7. Bad weather shifts its mean (Θ = 0.6) and its spread (ω = 0.5).", "Clear weather (Z = 0, W = 0): mean −0.8, spread 0.7. Share of crashes with a positive effect: z = 0.8 ÷ 0.7 = 1.14, so 1 − 0.873 = <b>12.7%</b>.", "Bad weather (Z = 1, W = 1): mean = −0.8 + 0.6 = <b>−0.2</b>.", "Spread = 0.7 × e<sup>0.5</sup> = 0.7 × 1.649 = <b>1.15</b>.", "Share with a positive effect: z = 0.2 ÷ 1.15 = 0.17, so 1 − 0.569 = <b>43.1%</b>.", "One variable, two very different pictures, depending on the weather."])
+ """<p class="note"><b>When is a parameter kept as random?</b> Two checks: its spread σ must be statistically significant, and a likelihood ratio test must favour the random-parameter model over the fixed one (step 8’s calculator has a “Random vs fixed” mode). The random draws are usually assumed normal.</p>""")}

{st(6, "Estimate by simulation", """<p>The probability of an outcome is now the multinomial-logit probability <b>averaged over all possible draws</b> of the random parameters. That average is an integral with no exact solution, so it is simulated (idea 2).</p>
<p>A practical routine: use a modest number of Halton draws, for example 200, while searching for the best specification, because hundreds of trial models must be estimated. Then re-estimate the final models with many more, for example 1,000, so that the reported numbers do not depend on the draws.</p>
<div class="btns"><a class="btn ghost" href="learn.html#simulation">Open the simulation tool</a></div>""")}

{st(7, "Report average marginal effects", """<p>Coefficients of a logit model are hard to interpret directly. The <b>marginal effect</b> answers a plainer question: by how many percentage points does the probability of an outcome change when an indicator goes from 0 to 1?</p>
<p>The answer differs from crash to crash. So it is computed for every crash and averaged:</p>
<p style="font-family:var(--display);font-weight:600">average marginal effect = average over all crashes of [ P(outcome | indicator = 1) − P(outcome | indicator = 0) ]</p>
<h3>Try it</h3>""" + TOOLS["ame"] + """<p class="note">Coefficients behind this tool (invented). Injury: constant −0.7, rollover +0.8, 140 km/h +0.3, adverse weather +0.4. Fatal: constant −2.6, rollover +1.4, 140 km/h +0.9, adverse weather +0.5.</p><h3>Solve one by hand</h3>"""
+ steps(["Effect of rollover on a fatal outcome, for three crashes.", "Crash A (120 km/h limit, clear). With rollover: weights 1, 1.105, 0.301; fatal = 0.301 ÷ 2.406 = 0.125. Without: weights 1, 0.497, 0.074; fatal = 0.047. Change = <b>+0.078</b>.", "Crash B (140 km/h limit, clear). With: 0.229. Without: 0.099. Change = <b>+0.131</b>.", "Crash C (140 km/h limit, adverse weather). With: 0.275. Without: 0.131. Change = <b>+0.144</b>.", "Average marginal effect = (0.078 + 0.131 + 0.144) ÷ 3 = <b>0.118</b>.", "Reading: across these crashes, a rollover raises the probability of a fatal outcome by about 11.8 percentage points."]))}

{st(8, "Test whether models transfer between road classes", """<p>Do expressways and dual carriageways need different models? The <b>likelihood ratio test</b> answers with one comparison. Take the estimated parameters of road class A, apply them unchanged to the crashes of road class B, and see how much worse they fit than B’s own model:</p>
<p style="font-family:var(--display);font-weight:600">χ² = −2 × [ LL(A’s parameters on B’s data) − LL(B’s own model) ]</p>
<p>A large value means A’s parameters do not describe B. The test is run in both directions (A on B, and B on A) for every pair of road classes in every year.</p>
<p>A second version asks whether two classes can be <b>merged</b>: fit one pooled model and compare it with the two separate ones.</p>
<p style="font-family:var(--display);font-weight:600">χ² = −2 × [ LL(pooled) − LL(class 1) − LL(class 2) ]</p>
<h3>Try it: one calculator, four tests</h3>""" + TOOLS["lr"] + """<h3>Solve one by hand</h3>"""
+ steps(["Transferability. The expressway model has 14 parameters. Applied to the dual-carriageway crashes it gives a log-likelihood of −612.4. The dual carriageway’s own model gives −588.1.", "χ² = −2 × [−612.4 − (−588.1)] = −2 × (−24.3) = <b>48.6</b>.", "Degrees of freedom = 14. The 5% critical value is 23.68. 48.6 &gt; 23.68: <b>not transferable</b>.", "Merge test. Pooled model: −1,105.0 with 15 parameters. Dual alone: −640.2 with 13. Single alone: −447.5 with 12.", "χ² = −2 × [−1,105.0 − (−640.2) − (−447.5)] = −2 × (−17.3) = <b>34.6</b>.", "Degrees of freedom = 13 + 12 − 15 = 10. Critical value 18.31. 34.6 &gt; 18.31: the two classes <b>must be modelled separately</b>."]))}

{st(9, "Test stability over time, then find what is stable", """<p>The same test is used across years (idea 5): apply the 2021 parameters to the 2020 crashes and compare with the 2020 model, in both directions, for every pair of years and every road class.</p>
<p>If the years differ, a natural next question is: <b>which effects changed and which stayed the same?</b> A <b>partially temporally constrained</b> model pools the years of one road class and forces a parameter to be equal across years whenever a test does not reject equality. The others stay free. The constrained model is then compared with the fully separate yearly models:</p>
<p style="font-family:var(--display);font-weight:600">χ² = −2 × [ LL(constrained) − sum of LL(each year) ],  degrees of freedom = parameters saved</p>
<p>If this test is <i>not</i> rejected, the constraints are acceptable, and the constrained parameters are the temporally stable effects: the ones most useful for policy.</p>"""
+ steps(["One road class, three yearly models with 14, 13 and 13 parameters: 40 in total. Their log-likelihoods add to −1,631.5.", "The partially constrained model holds 6 effects equal across the three years. Each saves 2 parameters, so it has 40 − 12 = 28 parameters. Its log-likelihood is −1,640.0.", "χ² = −2 × [−1,640.0 − (−1,631.5)] = −2 × (−8.5) = <b>17.0</b>.", "Degrees of freedom = 40 − 28 = 12. The 5% critical value is 21.03.", "17.0 &lt; 21.03: <b>not rejected</b>. The simpler model is acceptable.", "Those 6 effects can be reported as stable over the three years; the remaining ones are year-specific."])
+ """<h3>How many tests is that?</h3>""" + TOOLS["cnt"])}

{st(10, "Check the model by predicting", """<p>The last check uses the model to predict. For <b>out-of-sample</b> prediction, the model estimated on one set of crashes (for example one year) is used to compute outcome probabilities for another set, and the predicted shares are compared with what actually happened. With random parameters the probabilities are again simulated by drawing the parameters many times.</p>"""
+ steps(["A model estimated on 2020 crashes is applied to 500 crashes from 2021.", "Adding up the predicted probabilities gives: 320 property damage only, 150 injury, 30 fatal.", "What happened in 2021: 300, 155, 45.", "Differences: +20, −5, −15. The model predicts 30 fatal crashes where 45 occurred: it under-predicts fatal crashes by a third.", "This agrees with what a rejected temporal stability test says: the 2020 relationships do not carry over to 2021.", "A stable model would give predicted shares close to the observed ones."]))}

<section class="concept" id="named"><h2>Models named in this literature</h2>
<p>Review tables in severity papers use a small vocabulary. Here is what each label means and where this site explains it.</p>
<div class="scroll"><table class="t"><tr><th>Label</th><th>What it is</th><th>Where</th></tr>
{"".join(f"<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>" for a, b, c in [
 ("Multinomial logit (MNL)", "Scores, weights, shares; unordered outcomes.", '<a href="mnl.html">From zero</a>'),
 ("Mixed logit / random parameters logit (RPL)", "MNL in which coefficients vary across crashes.", '<a href="models.html#mixed">Models</a>'),
 ("RPL with heterogeneity in means (RPLHM)", "The mean of a random coefficient depends on other variables (Θ).", '<a href="#step5">Step 5</a>'),
 ("RPL with heterogeneity in means and variances (RPLHMV)", "The mean and the spread both depend on other variables (Θ and ω).", '<a href="#step5">Step 5</a>'),
 ("Correlated random parameters", "Two random coefficients are allowed to move together: crashes with a high value of one tend to have a high (or low) value of the other.", '<a href="models.html#mixed">Models</a>'),
 ("Random parameters binary logit", "The same idea with only two outcomes, for example severe against not severe.", '<a href="models.html#binary">Models</a>'),
 ("Random parameters ordered probit", "One score and thresholds, with coefficients that vary across crashes.", '<a href="models.html#ordered">Models</a>'),
 ("Partially temporally constrained model", "Years pooled; stable parameters held equal, the rest free.", '<a href="#step9">Step 9</a>'),
 ("Machine learning (for example support vector machines)", "Data-driven classifiers. Usually strong at prediction; they do not give coefficients with a causal reading.", '<a href="learn.html#causality">Idea 6</a>')])}
</table></div>
<div class="hook"><b>Remember it · the detective’s ten-room office.</b> (1) A filing clerk stamps every record 0 or 1. (2) A butcher cuts the files into nine piles. (3) The balloon buffet is served. (4) A bouncer with “1.645” on his shirt throws out the weakest guest, one at a time. (5) Two bells, one teal, one amber, slide and stretch when the weather changes. (6) The robot Halton throws 200 darts, then 1,000. (7) A light switch is flipped on and off for every guest and the average flicker is written down. (8) A tailor tries one road’s suit on another road. (9) A judge chains together the calendar pages that match. (10) A fortune teller is tested on next year’s newspaper.</div></section>
</main>'''
page("study.html", "A full severity study · AMAR Methods Learning", STUDY_HTML, '<script src="js/study.js"></script>')

# ---------------------------------------------------------------- basics.html
def bs(n, title, body): return f'<section class="concept" id="b{n}"><p class="eyebrow">Building block {n} of 8</p><h2>{title}</h2>{body}</section>'
def cite(r): return f'{r["authors"]} ({r["year"]}). {r["title"]}. <i>{r["journal"]}</i>{" " + r["volume"] + "," if r["volume"] else ","} {r["pages"]}.'
BASICS_HTML = f'''<main class="wrap">
<div><p class="eyebrow">Basics</p><h1>Logit and likelihood from zero</h1></div>
<p class="lede">Two ideas carry almost every paper in this field: the <b>logit</b>, which turns a score into a probability, and the <b>likelihood ratio test</b>, which decides whether a more complicated model is worth it. This page builds both from school mathematics.</p>
<nav class="jump" aria-label="Building blocks">{"".join(f'<a href="#b{i + 1}">{i + 1} · {t}</a>' for i, t in enumerate(["Probability and odds", "e and ln", "The logit", "Likelihood", "Log-likelihood", "The likelihood ratio test", "Reading the verdict", "Other yardsticks"]))}<a href="#uses">Six uses in papers</a></nav>

{bs(1, "Probability, odds and log-odds", """<p>The same chance can be written three ways.</p>
<ul><li><b>Probability:</b> 20 injuries in 100 crashes is a probability of 0.20. It lives between 0 and 1.</li><li><b>Odds:</b> injuries against non-injuries, 20 to 80, or 0.20 ÷ 0.80 = 0.25. Odds live between 0 and infinity.</li><li><b>Log-odds:</b> the natural logarithm of the odds, ln(0.25) = −1.39. Log-odds can be any number, negative or positive.</li></ul>
<p>A model adds things up, and a sum can be any number. Only the log-odds scale can hold any number, so that is the scale the model works on. The log-odds <i>is</i> the score.</p>
<h3>Try it</h3>""" + TOOLS["odds"] + """<h3>Solve one by hand</h3>"""
+ steps(["Start with a probability of 0.20.", "Odds = 0.20 ÷ (1 − 0.20) = 0.20 ÷ 0.80 = <b>0.25</b>.", "Log-odds = ln(0.25) = <b>−1.386</b>.", "A variable with coefficient +1.6 applies. New log-odds = −1.386 + 1.6 = <b>0.214</b>.", "New odds = e<sup>0.214</sup> = <b>1.238</b>. Check: 0.25 × e<sup>1.6</sup> = 0.25 × 4.953 = 1.238.", "New probability = 1.238 ÷ (1 + 1.238) = <b>0.553</b>. The coefficient moved the probability from 20% to 55%."]))}

{bs(2, "Two buttons on the calculator: e and ln", """<p><b>e<sup>x</sup></b> (the exponential) turns any number into a positive one. <b>ln</b> (the natural logarithm) undoes it. They are opposites, like squaring and taking a square root.</p>
<div class="scroll"><table class="t"><tr><th>x</th><th>−2</th><th>−1</th><th>0</th><th>1</th><th>2</th></tr><tr><td><b>e<sup>x</sup></b></td><td>0.135</td><td>0.368</td><td>1</td><td>2.718</td><td>7.389</td></tr></table></div>
<p>Three facts are enough for this whole site. e<sup>0</sup> = 1. Adding in the exponent means multiplying outside: e<sup>a + b</sup> = e<sup>a</sup> × e<sup>b</sup>. And the logarithm of a product is a sum: ln(a × b) = ln(a) + ln(b).</p>""")}

{bs(3, "The logit in one line", """<p>Put blocks 1 and 2 together. The model says the log-odds of an outcome equals a score:</p>
<p style="font-family:var(--display);font-weight:600">ln( p ÷ (1 − p) ) = score = constant + coefficient × indicator + …</p>
<p>Solve for p and you get the S-shaped logistic formula, p = 1 ÷ (1 + e<sup>−score</sup>). “Logit” simply means log-odds.</p>
<p>What a coefficient means follows directly: <b>one unit of a variable adds the coefficient to the log-odds, which multiplies the odds by e<sup>coefficient</sup></b>. That multiplier is the odds ratio. With more than two outcomes, each outcome has its own score and the odds are taken against the base outcome.</p>
<div class="btns"><a class="btn ghost" href="mnl.html">The multinomial logit from zero</a></div>""")}

{bs(4, "Likelihood: how probable is what we saw?", """<p>A model with given coefficients assigns a probability to every possible outcome. The <b>likelihood</b> is the probability it assigned to the outcomes that actually happened, all multiplied together.</p>"""
+ steps(["Three crashes. The model says the probabilities of injury are 0.8, 0.6 and 0.3.", "What happened: injury, injury, no injury.", "The model gave these outcomes probabilities of 0.8, 0.6 and 1 − 0.3 = 0.7.", "Likelihood = 0.8 × 0.6 × 0.7 = <b>0.336</b>.", "A second model gives 0.5, 0.5, 0.5. Its likelihood = 0.5 × 0.5 × 0.5 = <b>0.125</b>.", "The first model makes the observed data more probable, so it fits better. Estimation searches for the coefficients with the highest likelihood."]))}

{bs(5, "Log-likelihood: the same thing on a friendlier scale", """<p>Multiply thousands of probabilities and the result is too small for a computer to hold. Taking the logarithm turns the product into a sum.</p>
<ul><li>It is the <b>sum of ln(probability of what happened)</b> over all crashes.</li><li>Every probability is below 1, so every logarithm is negative. A log-likelihood is <b>always negative</b>.</li><li><b>Closer to zero is better.</b> A value of −588 beats −612.</li><li>It grows with the sample, so a log-likelihood means nothing alone. Only compare models fitted to the <b>same data</b>.</li></ul>"""
+ steps(["From block 4: probabilities of what happened are 0.8, 0.6 and 0.7.", "ln(0.8) = −0.223, ln(0.6) = −0.511, ln(0.7) = −0.357.", "Log-likelihood = −0.223 − 0.511 − 0.357 = <b>−1.091</b>.", "Second model: 3 × ln(0.5) = 3 × (−0.693) = <b>−2.079</b>.", "−1.091 is closer to zero than −2.079: the first model fits better, the same answer as before.", "Check: e<sup>−1.091</sup> = 0.336, the likelihood from block 4."]))}

{bs(6, "The likelihood ratio test", """<p>Adding parameters can never make the fit worse. So the question is never “does the bigger model fit better?” (it always does) but “does it fit better <b>by more than chance alone would give</b>?”</p>
<p>The test compares two models fitted to the same data:</p>
<ul><li>the <b>restricted</b> model, which is simpler: some parameters are forced to be zero or equal;</li><li>the <b>unrestricted</b> model, which is free.</li></ul>
<div class="btns"><a class="btn" href="restricted.html">Restricted and unrestricted models, animated</a></div>
<p style="font-family:var(--display);font-weight:600">statistic = −2 × [ LL(restricted) − LL(unrestricted) ]</p>
<p>The statistic is zero if the two fit equally well and grows as the restricted model falls behind. If the restriction is really true, the statistic follows a known pattern, the <b>chi-square distribution</b>. Its shape depends on the <b>degrees of freedom</b>: the number of parameters the restriction removed. The <b>critical value</b> is the point that chance alone would exceed only 5% of the time.</p>
<h3>Try it: does a seat belt matter?</h3>""" + TOOLS["lrc"] + """<h3>Solve one by hand</h3>"""
+ steps(["100 belted crashes with 30 injuries; 100 unbelted crashes with 45 injuries.", "Restricted model: one injury share for all, 75 ÷ 200 = 0.375. LL = 75 × ln(0.375) + 125 × ln(0.625) = −73.56 − 58.75 = <b>−132.31</b>.", "Unrestricted model: 0.30 for belted, 0.45 for unbelted. LL = 30 × ln(0.30) + 70 × ln(0.70) + 45 × ln(0.45) + 55 × ln(0.55) = <b>−129.90</b>.", "Statistic = −2 × [−132.31 − (−129.90)] = −2 × (−2.41) = <b>4.82</b>.", "The unrestricted model has one more parameter, so 1 degree of freedom. The 5% critical value is 3.84.", "4.82 &gt; 3.84: reject the restricted model. The difference between the groups is more than chance would explain."])
+ """<p class="note">Why the −2? It is the scaling that makes the statistic follow the chi-square distribution. Why “ratio”? A difference of logarithms is the logarithm of a ratio: the test compares the two likelihoods by dividing one by the other.</p>""")}

{bs(7, "Reading the verdict carefully", """<div class="grid">
<div class="card"><h3>“Rejected”</h3><p>The simpler model fits significantly worse. Keep the larger model: the extra parameters, the separate road classes or the separate years are needed.</p></div>
<div class="card"><h3>“Not rejected”</h3><p>The simpler model is good enough for these data. It does not prove the restriction is true, only that the data cannot tell the two apart.</p></div>
<div class="card"><h3>Confidence level</h3><p>At 95%, a true restriction is wrongly rejected 5 times in 100. Papers often report 90%, 95% and 99%. Run forty tests and a couple of false alarms are expected.</p></div>
<div class="card"><h3>Size is not importance</h3><p>With tens of thousands of crashes, tiny differences become “significant”. Always look at the marginal effects to see whether a difference matters in practice.</p></div></div>
<p><b>The p-value</b> is the chance of a statistic at least this large if the restriction were true. A p-value of 0.03 passes at 95% and fails at 99%.</p>
<p><b>Two rules the test needs.</b> The models must be fitted to the same crashes, and one must be a restricted version of the other (they must be <i>nested</i>). For models that are not nested, use the yardsticks below.</p>""")}

{bs(8, "Other yardsticks you will meet", """<div class="scroll"><table class="t"><tr><th>Yardstick</th><th>Formula</th><th>How to read it</th></tr>
<tr><td><b>t-statistic</b></td><td>estimate ÷ standard error</td><td>Tests one parameter. |t| ≥ 1.645 passes at 90%, ≥ 1.96 at 95%.</td></tr>
<tr><td><b>Likelihood ratio test</b></td><td>−2 × [LL(restricted) − LL(unrestricted)]</td><td>Tests several parameters, or whole models, at once.</td></tr>
<tr><td><b>AIC</b></td><td>2 × K − 2 × LL</td><td>Lower is better. Rewards fit, charges 2 per parameter. Works for non-nested models.</td></tr>
<tr><td><b>BIC</b></td><td>K × ln(N) − 2 × LL</td><td>Lower is better. Charges ln(N) per parameter, so it favours simpler models in large samples.</td></tr>
<tr><td><b>McFadden’s ρ²</b></td><td>1 − LL(model) ÷ LL(no variables)</td><td>0 to 1; higher is better. Not a share of variance explained.</td></tr></table></div>
<p class="note">K is the number of parameters, N the number of observations, LL the log-likelihood.</p>"""
+ steps(["Seat-belt example. Model A (two shares): LL = −129.90, K = 2. Model B (one share): LL = −132.31, K = 1. N = 200.", "AIC of A = 2 × 2 − 2 × (−129.90) = 4 + 259.80 = <b>263.80</b>.", "AIC of B = 2 × 1 − 2 × (−132.31) = 2 + 264.63 = <b>266.63</b>. AIC prefers A.", "BIC of A = 2 × ln(200) + 259.80 = 10.60 + 259.80 = <b>270.40</b>.", "BIC of B = 1 × ln(200) + 264.63 = 5.30 + 264.63 = <b>269.92</b>. BIC prefers B, narrowly.", "The yardsticks can disagree when the evidence is borderline. BIC asks for stronger evidence before accepting an extra parameter."]))}

<section class="concept" id="uses"><h2>Six uses of the likelihood ratio test in severity papers</h2>
<div class="scroll"><table class="t"><tr><th>Question</th><th>Restricted model</th><th>Unrestricted model</th><th>“Rejected” means</th></tr>
<tr><td>Do random parameters help?</td><td>Fixed parameters</td><td>Random parameters</td><td>Keep the random parameters</td></tr>
<tr><td>Does model A fit data B? (transferability)</td><td>A’s parameters applied to B</td><td>B’s own model</td><td>Not transferable</td></tr>
<tr><td>Can two groups be merged?</td><td>One pooled model</td><td>Two separate models</td><td>Model them separately</td></tr>
<tr><td>Are all years alike? (global test)</td><td>All years pooled</td><td>One model per year</td><td>Effects are not stable over time</td></tr>
<tr><td>Are two years alike? (pairwise test)</td><td>One year’s parameters on another year</td><td>That year’s own model</td><td>These two years differ</td></tr>
<tr><td>Can some effects be held equal across years?</td><td>Partially constrained model</td><td>Separate yearly models</td><td>Too many constraints; free some</td></tr></table></div>
<p class="note">Hou, Huo, Leng and Mannering (2022) compare the global and the pairwise temporal tests and find that pairwise comparisons reveal more detail.</p>
<div class="btns"><a class="btn" href="study.html#step8">Open the four-test calculator</a><a class="btn ghost" href="research.html">What current research is doing</a></div>
<div class="hook"><b>Remember it · the courtroom of Judge Chi.</b> Two tailors bring suits for the same customer. One suit is plain (the restricted model); the other has extra pockets (the unrestricted model). Judge Chi measures how much better the fancy suit fits, doubles it, and holds it against a ruler. The ruler has one notch for every extra pocket (degrees of freedom). Past the red notch, the pockets are worth it. Short of it, the plain suit wins.</div></section>
</main>'''
page("basics.html", "Logit and likelihood from zero · AMAR Methods Learning", BASICS_HTML, '<script src="js/foundations.js"></script>')

# ---------------------------------------------------------------- research.html
THEMES = [
 ("time", "Time: beyond one model per year", "Papers used to stop at “the years differ”. Newer work asks <b>which</b> effects change, <b>for whom</b>, and how to model change without cutting the data into ever smaller pieces.",
  "Whether effects that look stable over three years stay stable when a fourth year is added; how to forecast when parameters keep drifting."),
 ("groups", "Groups: let the data suggest the split", "Splitting by road class or year is the analyst’s choice. Newer papers let a clustering step or hidden segments propose the groups, then test them with likelihood ratio tests.",
  "Whether data-driven groups beat the obvious administrative ones (road class, region), and whether they are stable from year to year."),
 ("learning", "Learning machines against statistical models", "Deep learning predicts well. The open question is whether the variable effects it implies can be trusted for deciding countermeasures.",
  "How to get trustworthy variable effects out of a prediction machine, and how to handle shifting effects over time inside one."),
 ("conflicts", "Conflicts: how much data, which threshold, which measure", "Extreme value theory is now a standard way to turn near misses into crash estimates. Current work is about making it dependable.",
  "How much video is enough, how to set the threshold without guesswork, and how to combine several conflict measures."),
 ("practice", "Good practice: predicting and reporting effects", "With random parameters, even computing a prediction or a marginal effect involves choices. Papers that compare those choices give later studies a firmer footing.",
  "A shared standard for reporting marginal effects and out-of-sample checks, so that studies can be compared."),
]
REFS_ALL = json.load(open(Path(__file__).parent.parent / "research" / "references.json"))
RECENT = [r for r in REFS_ALL if r.get("kind") == "recent"]
IDEAS_Q = [
 ("Add a year", "Take a published study design, add the newest year of data, and test whether the effects reported as stable are still stable.", "time", "Pairwise and global likelihood ratio tests"),
 ("Cluster first", "Compare three ways of splitting the same crashes: by road class, by a clustering step, and by hidden classes. Which gives the best fit and the clearest story?", "groups", "Likelihood ratio tests, AIC and BIC"),
 ("Machine against model", "Fit a random parameters logit and a machine-learning classifier to the same crashes. Compare out-of-sample prediction and, more importantly, whether the two agree on the direction of each variable’s effect.", "learning", "Out-of-sample prediction, marginal effects"),
 ("Transfer across regions", "Estimate a model in one region and test whether it transfers to another. The transferability test is the same one used between road classes.", "groups", "Transferability test"),
 ("How fragile is the threshold?", "With conflict data from one site, estimate crash risk for a range of thresholds and sample sizes and report how much the answer moves.", "conflicts", "Peak-over-threshold model"),
 ("Report it twice", "Compute marginal effects by two methods for the same model and show where they differ.", "practice", "Average marginal effects"),
]
RESEARCH_HTML = f'''<main class="wrap">
<div><p class="eyebrow">Research</p><h1>What current research is doing</h1></div>
<p class="lede">Eight recent papers from <i>Analytic Methods in Accident Research</i>, sorted into five themes and explained without jargon. Each theme ends with what is still open, and the page closes with six starter questions for a first research project.</p>
<p class="note">Checked in November 2026 against publisher pages and university repositories. Summaries are based on the published abstracts, not on a full reading; treat them as a map and read the papers before citing them. The Editor-in-Chief’s note (volume 47, 100389) could not be opened, so nothing here is drawn from it.</p>
<div class="seg" id="th" role="group" aria-label="Filter by theme"><button data-t="all" aria-pressed="true">All themes</button>{"".join(f'<button data-t="{k}" aria-pressed="false">{t.split(":")[0]}</button>' for k, t, _, _ in THEMES)}</div>
{"".join(f'''<section class="concept theme" data-t="{k}"><h2>{t}</h2><p>{intro}</p>
<div class="grid">{"".join(f'<div class="card"><span class="num">{r["year"]} · {("volume " + r["volume"] + ", ") if r["volume"] else "article "}{r["pages"]}</span><h3 style="font-size:16px">{r["title"]}</h3><p class="note">{r["authors"]}</p><p>{r["plain"]}</p>' + (f'<p><a href="https://doi.org/{r["doi"]}">Open the paper</a></p>' if r["doi"] else "") + "</div>" for r in RECENT if r["theme"] == k)}</div>
<p><b>Still open:</b> {openq}</p></section>''' for k, t, intro, openq in THEMES)}
<section class="concept" id="ideas"><h2>Six starter questions for a first project</h2>
<p>These are suggestions for learning the methods on real data. They are not findings, and a literature search should come before any of them.</p>
<div class="grid">{"".join(f'<div class="card"><span class="num">Idea {i + 1}</span><h3>{t}</h3><p>{b}</p><p class="note">Main tool: {tool}</p></div>' for i, (t, b, th, tool) in enumerate(IDEAS_Q))}</div></section>
<section class="concept" id="read"><h2>How to read a methods paper in fifteen minutes</h2>
<ol style="margin:0;padding-left:22px;display:flex;flex-direction:column;gap:8px;max-width:70ch">
<li><b>Abstract and last paragraph of the introduction (2 min).</b> What is the one methodological claim?</li>
<li><b>Data section (2 min).</b> What is one observation: a crash, a person, a road segment, a conflict? How many, and over which years?</li>
<li><b>Method section (4 min).</b> Find the score function. Which of the seven ideas does the model address? Which does it ignore?</li>
<li><b>Tables (4 min).</b> Find the log-likelihood and the number of parameters. Which parameters are random? Read the marginal effects, not the coefficients.</li>
<li><b>Tests (2 min).</b> Which likelihood ratio tests were run, and which were rejected?</li>
<li><b>Conclusions (1 min).</b> Does the paper claim prediction or cause, and did its method earn that claim?</li></ol>
<div class="btns"><a class="btn" href="basics.html">Refresh the basics</a><a class="btn ghost" href="study.html">See a full study step by step</a></div></section>
</main>'''
RJS = '''<script>(function(){ var seg=document.getElementById('th'); seg.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; [].forEach.call(seg.children,function(c){ c.setAttribute('aria-pressed', c===b); }); [].forEach.call(document.querySelectorAll('.theme'),function(s){ s.hidden = b.dataset.t!=='all' && s.dataset.t!==b.dataset.t; }); }); })();</script>'''
page("research.html", "Current research · AMAR Methods Learning", RESEARCH_HTML, RJS)


# ---------------------------------------------------------------- restricted.html
def rs(n, title, body): return f'<section class="concept" id="r{n}"><p class="eyebrow">Part {n} of 7</p><h2>{title}</h2>{body}</section>'
RESTR_HTML = f"""<main class="wrap">
<div><p class="eyebrow">Basics · in depth</p><h1>Restricted and unrestricted models, animated</h1></div>
<p class="lede">Almost every test in this field compares two versions of the same model: one that is free, and one with some of its numbers locked. This page shows what that means with four animations and five examples.</p>
<nav class="jump" aria-label="Parts">{"".join(f'<a href="#r{i + 1}">{i + 1} · {t}</a>' for i, t in enumerate(["The idea", "One line or two?", "Restrictions are locks", "What chance looks like", "Degrees of freedom", "Three full examples", "Common mistakes"]))}</nav>

{rs(1, "The idea in plain words", """<p>A model is a set of numbers (parameters) that the computer is free to choose so that the model fits the data as well as possible.</p>
<div class="grid">
<div class="card"><span class="num">Free</span><h3>Unrestricted model</h3><p>Every parameter can take whatever value fits best. Think of a made-to-measure suit.</p></div>
<div class="card"><span class="num">Locked</span><h3>Restricted model</h3><p>The same model, but some parameters are <b>locked</b>: forced to be zero, forced to equal each other, or fixed at values borrowed from elsewhere. Think of a suit in one standard size.</p></div>
<div class="card"><span class="num">The question</span><h3>The test</h3><p>Does locking those parameters make the fit <b>much</b> worse, or only a little? Much worse: the locks are wrong. Only a little: the simpler model will do.</p></div></div>
<p>Three facts follow, and they are worth memorising.</p>
<ul><li>The restricted model is a <b>special case</b> of the unrestricted one. (The two are called <i>nested</i>.)</li><li>The unrestricted model <b>always fits at least as well</b>, because it could choose the locked values if they were best.</li><li>So the test never asks “which fits better?” It asks “is the improvement larger than chance alone would produce?”</li></ul>""")}

{rs(2, "Animation 1 · One line or two?", """<p>The smallest possible example. Two groups of crashes, and one question: is the injury share the same in both? Press <b>Next step</b> and watch the two models try to fit the same two bars.</p>""" + TOOLS["fit"] + """<p class="note">Try the second data set. With 36% and 40%, two shares still fit better than one, as they always must, but only by a hair. The statistic stays far below 3.84.</p>""")}

{rs(3, "Animation 2 · Restrictions are locks", """<p>Every restricted model in a paper is the unrestricted model with locks on some parameters. The <b>degrees of freedom</b> of the test are simply the number of locks. Choose an example and watch the locks drop.</p>""" + TOOLS["locks"] + """<div class="scroll"><table class="t"><tr><th>Kind of lock</th><th>What is forced</th><th>Typical question</th></tr>
<tr><td><b>= 0</b></td><td>A coefficient, or the spread of a random parameter, is set to zero</td><td>Does this variable matter? Is this parameter random?</td></tr>
<tr><td><b>= each other</b></td><td>Two groups or years must share the same coefficient</td><td>Can road classes be merged? Is the effect stable over time?</td></tr>
<tr><td><b>= borrowed values</b></td><td>All coefficients are fixed at another model’s estimates</td><td>Does model A transfer to data B?</td></tr></table></div>""")}

{rs(4, "Animation 3 · What does chance alone look like?", """<p>Even when a restriction is exactly true, the unrestricted model fits a little better, because it bends towards the random quirks of the sample. So the statistic is never exactly zero. How big does it get by luck?</p>
<p>The tool below invents studies in which the seat belt truly makes no difference, and computes the statistic for each one. The pile that builds up is the <b>chi-square distribution</b>. The <b>critical value</b> is the point that only 5% of the pile lies beyond. The <b>p-value</b> is the share of the pile beyond <i>your</i> statistic.</p>""" + TOOLS["sim"])}

{rs(5, "Animation 4 · Degrees of freedom move the ruler", """<p>Each lock gives chance one more way to open a gap between the two models. So with more locks, larger statistics are normal, and the critical value moves to the right. Move the slider.</p>""" + TOOLS["dfr"] + """<div class="scroll"><table class="t"><tr><th>Degrees of freedom</th><th>1</th><th>2</th><th>3</th><th>4</th><th>10</th><th>12</th><th>14</th></tr><tr><td><b>Critical value at 95%</b></td><td>3.84</td><td>5.99</td><td>7.81</td><td>9.49</td><td>18.31</td><td>21.03</td><td>23.68</td></tr></table></div>""")}

{rs(6, "Three full examples", """<h3>Example 1 · Does a seat belt matter? (one lock)</h3>"""
+ steps(["Unrestricted model: a separate injury share for each group. Restricted model: one share for both (the two shares are locked equal).", "Data: 30 of 100 belted and 45 of 100 unbelted crashes ended in injury.", "Restricted: share 0.375; log-likelihood = 75 × ln(0.375) + 125 × ln(0.625) = <b>−132.31</b>.", "Unrestricted: shares 0.30 and 0.45; log-likelihood = <b>−129.90</b>.", "Statistic = −2 × [−132.31 − (−129.90)] = <b>4.82</b>. One lock, so 1 degree of freedom; critical value 3.84.", "4.82 &gt; 3.84: the lock is rejected. The seat belt matters."])
+ """<h3>Example 2 · Should rollover be a random parameter? (two locks)</h3>"""
+ steps(["Unrestricted model: rollover has a mean β, a spread σ, and its mean shifts with weather by Θ. Restricted model: σ = 0 and Θ = 0, an ordinary fixed parameter.", "Log-likelihood of the fixed model: −598.3. Of the random model: −591.0.", "Statistic = −2 × [−598.3 − (−591.0)] = −2 × (−7.3) = <b>14.6</b>.", "Two locks (σ and Θ), so 2 degrees of freedom; critical value 5.99.", "14.6 &gt; 5.99: the locks are rejected.", "Keep rollover as a random parameter with heterogeneity in its mean."])
+ """<h3>Example 3 · Can two road classes share one model? (ten locks)</h3>"""
+ steps(["Unrestricted: a separate model for dual carriageways (13 parameters) and for single carriageways (12 parameters): 25 free parameters.", "Restricted: one pooled model with 15 parameters. Pooling locks 25 − 15 = 10 parameters.", "Log-likelihoods: pooled −1,105.0; dual −640.2; single −447.5. The separate models together: −1,087.7.", "Statistic = −2 × [−1,105.0 − (−1,087.7)] = −2 × (−17.3) = <b>34.6</b>.", "10 degrees of freedom; critical value 18.31.", "34.6 &gt; 18.31: the locks are rejected. Model the two road classes separately."]))}

{rs(7, "Common mistakes", """<div class="grid">
<div class="card"><h3>Subtracting the wrong way</h3><p>The restricted log-likelihood goes first. If your statistic is negative, the two are swapped.</p></div>
<div class="card"><h3>Different data</h3><p>Both models must be fitted to exactly the same crashes. Dropping a few records for one model breaks the test.</p></div>
<div class="card"><h3>Not nested</h3><p>A multinomial logit and an ordered probit are not special cases of each other. Use AIC or BIC for those.</p></div>
<div class="card"><h3>Miscounting the locks</h3><p>Degrees of freedom are the number of parameters locked, not the number of parameters in either model.</p></div>
<div class="card"><h3>“Not rejected” read as “proved”</h3><p>It only means these data cannot tell the two models apart.</p></div>
<div class="card"><h3>Forgetting which result is the good news</h3><p>For transferability, <i>rejected</i> is the interesting finding. For a partially constrained model, <i>not rejected</i> is.</p></div></div>
<div class="btns"><a class="btn" href="study.html#step8">Try the four-test calculator</a><a class="btn ghost" href="basics.html">Back to the basics</a></div>
<div class="hook"><b>Remember it · the locksmith and Judge Chi.</b> A locksmith walks along a row of dials (the parameters) and snaps padlocks onto some of them. Judge Chi watches the needle of a fit-meter drop, doubles the drop, and counts the padlocks to choose his ruler. Few padlocks and a big drop: “Take them off!” Many padlocks and a small drop: “Leave them on. The simple model stands.”</div>""")}
</main>"""
page("restricted.html", "Restricted and unrestricted models · AMAR Methods Learning", RESTR_HTML, '<script src="js/restricted.js"></script>')

MPROBS = [
 ("Binary logit", "A crash has a score of −0.4 for “injured”. What is the probability of injury (three decimals)?", 0.401, 0.003, "",
  ["e<sup>0.4</sup> = 1.492.", "Probability = 1 ÷ (1 + 1.492) = <b>0.401</b>."]),
 ("Multinomial logit", "Scores are 0 (no injury), 1 (injury) and −1 (fatal). What is the probability of injury (three decimals)?", 0.665, 0.003, "",
  ["Weights: e<sup>0</sup> = 1, e<sup>1</sup> = 2.718, e<sup>−1</sup> = 0.368.", "Total = 4.086.", "Injury: 2.718 ÷ 4.086 = <b>0.665</b>."]),
 ("Nested logit", "Three outcomes have equal scores of 0. Minor and severe injury are nested with a nest setting of 0.2. What is the probability of no injury (three decimals)?", 0.465, 0.003, "",
  ["Nest weight = 2<sup>0.2</sup> = 1.149.", "No injury = 1 ÷ (1 + 1.149) = <b>0.465</b>.", "The closer the nest setting is to 0, the closer this gets to 0.5: the two injury levels behave almost like one outcome."]),
 ("Ordered logit", "Thresholds are 0 and 2 and the crash’s score is 1. What is the probability of the highest level (three decimals)?", 0.269, 0.003, "",
  ["Up to the second threshold: F(2 − 1) = F(1) = 0.731.", "Highest level = 1 − 0.731 = <b>0.269</b>."]),
 ("Latent class logit", "70% of crashes are in a class with a severe-outcome probability of 0.05; 30% are in a class with 0.50. What is the overall probability (three decimals)?", 0.185, 0.002, "",
  ["0.70 × 0.05 = 0.035.", "0.30 × 0.50 = 0.150.", "Total = <b>0.185</b>."]),
]

# ---------------------------------------------------------------- practice.html
QUIZ = [
 ("A model finds that roads with more police patrols have more crashes. Patrols are assigned to high-crash roads.", "endogeneity", "Patrols are a response to crash risk, so risk drives both the patrols and the crashes."),
 ("The same model, estimated on 2015–2018 data and again on 2021–2024 data, gives a different sign for “night-time”.", "instability", "The effect of the variable changed between periods."),
 ("Motorcycle helmets reduce injury severity on average, yet the benefit seems to differ widely between riders in ways the crash report cannot explain.", "heterogeneity", "The effect varies across people for unrecorded reasons."),
 ("A deep-learning model forecasts next month’s crash counts very accurately, but cannot say what a lower speed limit would do.", "causality", "Good prediction does not give the effect of an intervention."),
 ("A study has no crashes at a new junction design, so it measures time-to-collision from video for two weeks.", "conflicts", "Near misses stand in for crashes; a method is needed to link the two."),
 ("Ten consecutive segments of one motorway all have more crashes than the model expects.", "space", "Neighbouring segments share unrecorded influences."),
 ("A random-parameters model cannot be solved exactly, so the software uses 1,000 Halton draws per observation.", "simulation", "The integral is replaced by an average over draws."),
 ("Drivers who choose cars with advanced safety systems may already be more careful than average.", "endogeneity", "Self-selection: an unseen trait drives both the choice and the outcome."),
]
PROBS = [
 ("heterogeneity", "The effect of a variable is normally distributed with mean 0.3 and standard deviation 0.6. For what percentage of people is the effect negative?", 31, 1.5, "%",
  ["Standardise zero: z = (0 − 0.3) ÷ 0.6 = −0.5.", "The share of a normal distribution below z = −0.5 is 0.309.", "About <b>31%</b> of people have a negative effect."]),
 ("simulation", "Four draws of β are −1.0, 0, 0.5 and 1.5, and P = 1 ÷ (1 + e<sup>−β</sup>). What is the simulated probability (to three decimals)?", 0.552, 0.004, "",
  ["P(−1.0) = 0.269, P(0) = 0.500, P(0.5) = 0.622, P(1.5) = 0.818.", "Sum = 2.209.", "Average = 2.209 ÷ 4 = <b>0.552</b>."]),
 ("endogeneity", "50 high-risk sites would have 12 crashes each without a speed camera; a camera truly cuts crashes by 25%. All 50 get cameras. 200 other sites have 5 crashes each and no camera. By what percentage do camera sites appear to have MORE crashes?", 80, 1, "%",
  ["Camera sites: 12 × 0.75 = 9 crashes each.", "Naive ratio: 9 ÷ 5 = 1.8.", "Cameras appear to raise crashes by <b>80%</b>, although the true effect is −25%."]),
 ("space", "200 observations come in clusters of 5 with a within-cluster correlation of 0.25. How many independent observations are they worth?", 100, 1, "",
  ["Design effect = 1 + (5 − 1) × 0.25 = 2.", "Effective sample = 200 ÷ 2 = <b>100</b>."]),
 ("instability", "Pooled log-likelihood −980; period 1 alone −470; period 2 alone −495. What is the likelihood ratio test statistic?", 30, 0.5, "",
  ["Separate models together: −470 + (−495) = −965.", "Statistic = −2 × [−980 − (−965)] = −2 × (−15) = <b>30</b>.", "With 10 parameters per model the 5% critical value is 18.31, so stability is rejected."]),
 ("causality", "600 experienced drivers crash on 0.2% of daytime trips and 0.4% of night trips. 400 novices crash on 0.6% (day) and 1.2% (night). Night truly doubles everyone’s risk. 75% of novices avoid driving at night. What night-to-day ratio do the data show (two decimals)?", 1.43, 0.02, "",
  ["Day: 600 × 0.2% + 400 × 0.6% = 1.2 + 2.4 = 3.6 crashes per 1,000 drivers = 0.36%.", "Night: 600 experienced and 100 novices drive. 600 × 0.4% + 100 × 1.2% = 2.4 + 1.2 = 3.6 crashes per 700 drivers = 0.514%.", "Ratio = 0.514 ÷ 0.36 = <b>1.43</b>. Here self-selection hides part of the true effect of 2."]),
 ("conflicts", "150 of 10,000 interactions fall below a 2.0 s threshold. The mean distance below the threshold is 0.4 s. With an exponential tail, about one crash per how many interactions?", 9900, 250, "",
  ["Share of conflicts = 150 ÷ 10,000 = 0.015.", "Chance of reaching zero = e<sup>−2.0 ÷ 0.4</sup> = e<sup>−5</sup> = 0.00674.", "Crash probability = 0.015 × 0.00674 = 0.000101, about <b>1 per 9,900</b>."]),
]
opts = "".join(f'<button data-v="{d["id"]}">{d["name"]}</button>' for d in IDEAS)
PRACTICE = f'''<main class="wrap">
<div><p class="eyebrow">Practice</p><h1>Check that it stuck</h1></div>
<p class="lede">First name the issue in eight short scenarios. Then solve seven small problems on the ideas and five on the models; each has a solution you can reveal one step at a time.</p>
<section class="concept"><h2>Part 1 · Which issue is it?</h2><p class="read" id="score" aria-live="polite">0 of {len(QUIZ)} answered.</p>
{"".join(f'<div class="q" data-a="{a}" data-why="{html.escape(w)}"><p><b>{i + 1}.</b> {s}</p><div class="opts">{opts}</div><p class="fb" aria-live="polite"></p></div>' for i, (s, a, w) in enumerate(QUIZ))}
</section>
<section class="concept"><h2>Part 2 · Solve it</h2><p>Type your answer and press Check. Use a calculator. Small rounding differences are accepted.</p>
{"".join(f'<div class="q" data-ans="{ans}" data-tol="{tol}"><p><b>{i + 1}. {I[k]["name"]}.</b> {q}</p><div class="btns"><input type="number" step="any" aria-label="Your answer to problem {i + 1}"> <span>{unit}</span><button class="go">Check</button></div><p class="fb" aria-live="polite"></p>{steps(st).replace("Worked example, one step at a time", "Solution, one step at a time")}</div>' for i, (k, q, ans, tol, unit, st) in enumerate(PROBS))}
</section>
<section class="concept" id="models"><h2>Part 3 · The model family</h2><p>One problem per model. The <a href="models.html">Models page</a> has a worked example of each.</p>
{"".join(f'<div class="q" data-ans="{ans}" data-tol="{tol}"><p><b>{i + 1}. {k}.</b> {q}</p><div class="btns"><input type="number" step="any" aria-label="Your answer to model problem {i + 1}"> <span>{unit}</span><button class="go">Check</button></div><p class="fb" aria-live="polite"></p>{steps(st).replace("Worked example, one step at a time", "Solution, one step at a time")}</div>' for i, (k, q, ans, tol, unit, st) in enumerate(MPROBS))}
</section>
</main>'''
PJS = '''<script>
(function(){ var done=0, right=0, qs=document.querySelectorAll('.q[data-a]');
[].forEach.call(qs,function(q){ q.querySelector('.opts').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b||q.dataset.done) return; q.dataset.done=1; done++; var ok=b.dataset.v===q.dataset.a; if(ok) right++;
  [].forEach.call(q.querySelectorAll('.opts button'),function(c){ if(c.dataset.v===q.dataset.a) c.className='ok'; else if(c===b) c.className='no'; c.disabled=true; });
  q.querySelector('.fb').textContent=(ok?'Correct. ':'Not quite. ')+q.dataset.why;
  $('score').textContent=done+' of '+qs.length+' answered, '+right+' correct.'+(done===qs.length?(right>=7?' Ready for Part 2.':' Revisit the ideas you missed on the Learn page.'):''); }); });
[].forEach.call(document.querySelectorAll('.q[data-ans]'),function(q){ var inp=q.querySelector('input'), fb=q.querySelector('.fb'); function chk(){ var v=parseFloat(inp.value); if(isNaN(v)){ fb.textContent='Type a number first.'; return; } var ok=Math.abs(v-(+q.dataset.ans))<=+q.dataset.tol; fb.textContent=ok?'Correct.':'Not yet. Try again, or reveal the solution below.'; }
  q.querySelector('button.go').onclick=chk; inp.addEventListener('keydown',function(e){ if(e.key==='Enter') chk(); }); });
initSteps(); })();
</script>'''
page("practice.html", "Practice · AMAR Methods Learning", PRACTICE, PJS)

# ---------------------------------------------------------------- memory.html
KEYS = ["27% opposite sign when the effect is N(−0.5, 0.8)", "four draws average to 0.605; Halton needs fewer", "signs look like +100% when the truth is −20%", "100 observations worth 18", "test statistic 60 against 21.03", "data say 2.8 times, truth is 2 times", "0.04 × e⁻⁶ ≈ 1 crash per 10,100"]
def route_svg():
    pts = [(70, 110), (190, 215), (310, 105), (430, 220), (550, 110), (670, 215), (790, 115)]
    d = "M" + " L".join(f"{x},{y}" for x, y in pts)
    o = f'<svg class="chart" id="route" viewBox="0 0 860 320" role="img" aria-label="A road with seven numbered stops">'
    o += f'<path d="{d}" fill="none" stroke="var(--muted)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/><path d="{d}" fill="none" stroke="var(--amber-fill)" stroke-width="2.5" stroke-dasharray="10 9"/>'
    o += f'<g id="car"><rect x="-17" y="-11" width="34" height="22" rx="7" fill="var(--fg)"/><rect x="-7" y="-7" width="14" height="14" rx="3" fill="var(--amber-fill)"/></g>'
    for i, ((x, y), dd) in enumerate(zip(pts, IDEAS)):
        up = i % 2 == 0; ly = y - 46 if up else y + 54
        words = dd["stop"].replace("the ", "", 1).split(" "); mid = (len(words) + 1) // 2
        l1, l2 = " ".join(words[:mid]), " ".join(words[mid:])
        o += f'<g class="stop" data-i="{i}" tabindex="0" role="button" aria-label="Stop {i + 1}: {dd["stop"]}" style="cursor:pointer"><circle cx="{x}" cy="{y}" r="22" fill="var(--accent)" stroke="var(--surface)" stroke-width="3"/><text x="{x}" y="{y + 6}" text-anchor="middle" font-size="18" font-weight="700" font-family="Space Grotesk,sans-serif" fill="var(--accent-fg)">{i + 1}</text>'
        o += f'<text x="{x}" y="{ly - (18 if (l2 and up) else 0)}" text-anchor="middle" font-size="14" font-weight="600" font-family="Inter,sans-serif" fill="var(--fg)">{l1}</text>' + (f'<text x="{x}" y="{ly + (0 if up else 18)}" text-anchor="middle" font-size="14" font-weight="600" font-family="Inter,sans-serif" fill="var(--fg)">{l2}</text>' if l2 else "") + "</g>"
    return o + "</svg>", pts
RSVG, PTS = route_svg()
MEMORY = f'''<main class="wrap">
<div><p class="eyebrow">Remember</p><h1>The crash investigator’s road trip</h1></div>
<p class="lede">Memory champions remember lists by placing strange pictures along a route they know. Here is a route with seven stops, one per idea. The stranger the picture, the better it sticks.</p>
<section class="concept"><h2>Drive the route</h2>
<p>Press Next stop, or click any stop. Read the scene, close your eyes for five seconds and picture it. Add sound and movement.</p>
{RSVG}
<div class="read" id="scene" aria-live="polite"></div>
<div class="btns"><button class="go ghost" id="prev">Previous stop</button><button class="go" id="next">Next stop</button></div>
<p class="note">Why it works: the route gives the order, the picture gives the meaning, and the number hidden in each scene (100 houses, 18 opinions) gives you a worked example to rebuild the idea from.</p></section>
<section class="concept"><h2>Flip cards</h2><p>Say the answer aloud before you turn the card. Saying it is what builds the memory; reading the back does not.</p>
<div class="grid">{"".join(f'<button class="flash" aria-pressed="false"><span class="in"><span class="f"><span class="eyebrow">Stop {d["n"]}</span><b>{d["stop"][0].upper() + d["stop"][1:]}</b><span class="note">Which idea? What does it mean? Tap to check.</span></span><span class="b"><b>{d["name"]}</b><span>{d["one"]}</span><span class="note">Number to rebuild it: {KEYS[i]}.</span></span></span></button>' for i, d in enumerate(IDEAS))}</div></section>
<section class="concept"><h2>Self-test: put the route in order</h2><p>Click the stops in the order you meet them on the trip.</p>
<div class="q"><div class="opts" id="order"></div><p class="fb" id="ofb" aria-live="polite"></p><div class="btns"><button class="go ghost" id="oreset">Shuffle and try again</button></div></div></section>
<section class="concept" id="hotel"><h2>A second place: the Logit Hotel</h2><p>The road trip holds the seven ideas. The models live in a hotel with six floors. Each floor adds one thing to the floor below, just as each model adds one thing to the model before.</p>
<div class="grid">{"".join(f'<button class="flash" aria-pressed="false"><span class="in"><span class="f"><span class="eyebrow">{d["floor"].split(" · ")[0]}</span><b>{d["floor"].split(" · ")[1][0].upper() + d["floor"].split(" · ")[1][1:]}</b><span class="note">Which model lives here? Tap to check.</span></span><span class="b"><b>{d["name"]}</b><span>{d["q"]}.</span></span></span></button>' for d in MODELS)}</div>
<ol style="margin:0;padding-left:22px;display:flex;flex-direction:column;gap:8px">{"".join(f'<li><b>{d["floor"]} ({d["name"].lower()}).</b> {d["scene"]}</li>' for d in MODELS)}</ol>
<div class="btns"><a class="btn ghost" href="models.html">Open the Models page</a></div></section>
<section class="concept"><h2>A review plan that takes ten minutes in total</h2>
<div style="overflow-x:auto"><table style="border-collapse:collapse;min-width:480px;width:100%"><tbody>
{"".join(f'<tr><td style="padding:8px 12px 8px 0;border-top:1px solid var(--line);font-weight:600;white-space:nowrap">{a}</td><td style="padding:8px 0;border-top:1px solid var(--line)">{b}</td></tr>' for a, b in [("Today", "Drive the route twice forwards, once backwards."), ("Tomorrow", "Without looking, name the seven stops and one number at each. Then check."), ("In 3 days", "Do Part 1 of the practice page."), ("In 1 week", "Do Part 2 of the practice page without revealing solutions."), ("In 2 weeks", "Explain each idea aloud to someone in one sentence.")])}
</tbody></table></div>
<div class="btns"><a class="btn" href="practice.html">Go to practice</a><a class="btn ghost" href="{GUIDE}">Open the study guide</a></div></section>
</main>'''
MJS = f'''<script>
(function(){{ var S={json.dumps([dict(stop=d["stop"], name=d["name"], scene=d["scene"], one=d["one"], key=k) for d, k in zip(IDEAS, KEYS)])}, P={json.dumps(PTS)}, cur=0, car=$('car'), pos=P[0].slice();
function show(){{ var s=S[cur]; $('scene').innerHTML='<b>Stop '+(cur+1)+' · '+s.stop+'.</b> '+s.scene+'<br><span class="note">This is <b>'+s.name+'</b>: '+s.one+' Number to keep: '+s.key+'.</span>'; }}
function go(i){{ i=(i+7)%7; var from=pos.slice(), to=P[i], t0=null; cur=i; show(); if(REDUCED){{ pos=to.slice(); car.setAttribute('transform','translate('+to[0]+','+(to[1]-38)+')'); return; }}
  requestAnimationFrame(function f(t){{ if(t0===null) t0=t; var k=Math.min(1,(t-t0)/600), e=k*k*(3-2*k); pos=[from[0]+(to[0]-from[0])*e, from[1]+(to[1]-from[1])*e]; car.setAttribute('transform','translate('+pos[0]+','+(pos[1]-38)+')'); if(k<1&&cur===i) requestAnimationFrame(f); }}); }}
$('next').onclick=function(){{ go(cur+1); }}; $('prev').onclick=function(){{ go(cur-1); }};
[].forEach.call(document.querySelectorAll('#route .stop'),function(g){{ g.onclick=function(){{ go(+g.dataset.i); }}; g.onkeydown=function(e){{ if(e.key==='Enter'||e.key===' '){{ e.preventDefault(); go(+g.dataset.i); }} }}; }});
car.setAttribute('transform','translate('+P[0][0]+','+(P[0][1]-38)+')'); show();
[].forEach.call(document.querySelectorAll('.flash'),function(b){{ b.onclick=function(){{ b.setAttribute('aria-pressed', b.getAttribute('aria-pressed')!=='true'); }}; }});
var want=0;
function deal(){{ want=0; var idx=[0,1,2,3,4,5,6].sort(function(){{ return Math.random()-.5; }}); $('order').innerHTML=idx.map(function(i){{ return '<button data-i="'+i+'">'+S[i].stop.replace(/^the /,'')+'</button>'; }}).join(''); $('ofb').textContent='Which stop comes first?'; }}
$('order').addEventListener('click',function(e){{ var b=e.target.closest('button'); if(!b||b.disabled) return; if(+b.dataset.i===want){{ b.className='ok'; b.disabled=true; b.textContent=(want+1)+'. '+b.textContent+' → '+S[want].name; want++; $('ofb').textContent=want===7?'All seven in order. Now try it with your eyes closed.':'Correct. Next?'; }} else {{ b.className='no'; setTimeout(function(){{ b.className=''; }},500); $('ofb').textContent='Not that one yet. Picture the road again.'; }} }});
$('oreset').onclick=deal; deal(); }})();
</script>'''
page("memory.html", "Memory route · AMAR Methods Learning", MEMORY, MJS)

# ---------------------------------------------------------------- index.html
REFS = json.load(open(Path(__file__).parent.parent / "research" / "references.json"))
INDEX = f'''<main class="wrap">
<div><p class="eyebrow">Methods in accident research, for beginners</p><h1>Seven ideas behind modern crash-data analysis</h1></div>
<p class="lede">Papers in the journal <i>Analytic Methods in Accident Research</i> keep returning to the same few statistical ideas. This site explains each one with an animation you can control, a calculation you can follow by hand and a picture to remember it by.</p>
<div class="btns"><a class="btn" href="learn.html">Start learning</a><a class="btn ghost" href="study.html">Case study</a><a class="btn ghost" href="practice.html">Practice</a><a class="btn ghost" href="memory.html">Memory route</a><a class="btn ghost" href="{GUIDE}">Study guide (PDF)</a><a class="btn ghost" href="viewer.html?doc=materials/AMAR_Methods_Presentation.pdf&mode=slides&dl=materials/AMAR_Methods_Presentation.pptx">Presentation</a></div>
<h2>The seven ideas</h2>
<div class="grid">{"".join(f'<a class="card" href="learn.html#{d["id"]}" style="text-decoration:none;color:inherit"><span class="num">Idea {d["n"]}</span><h3>{d["name"]}</h3><p>{d["one"]}</p><p class="note">Memory stop: {d["stop"]}</p></a>' for d in IDEAS)}</div>
<h2>The models</h2>
<p>The ideas say what can go wrong; the models are the response. The <a href="models.html">Models page</a> builds the logit family one step at a time. New to all of this? Start with <a href="mnl.html">the multinomial logit from zero</a>, an eight-step walk-through of one crash.</p>
<div class="grid">{"".join(f'<a class="card" href="models.html#{d["id"]}" style="text-decoration:none;color:inherit"><h3>{d["name"]}</h3><p>{d["q"]}.</p><p class="note">{d["floor"]}</p></a>' for d in MODELS)}</div>
<h2>Start here if the mathematics is new</h2>
<p><a href="basics.html">Logit and likelihood from zero</a> builds the two workhorses of the field from school mathematics: probability, odds and log-odds; likelihood and log-likelihood; and the likelihood ratio test with its chi-square ruler, degrees of freedom and p-value.</p>
<p>Then watch <a href="restricted.html">restricted and unrestricted models, animated</a>: four animations and five examples of what it means to lock a model’s parameters and test the locks.</p>
<h2>What current research is doing</h2>
<p>The <a href="research.html">Research page</a> explains eight recent papers from the journal in plain words, sorted into five themes, with open questions and six starter ideas for a first project.</p>
<h2>A full study, step by step</h2>
<p>The <a href="study.html">Case study page</a> follows a complete severity study in ten steps: coding the data, splitting it by road class and year, the random-parameters logit with heterogeneity in means and variances, marginal effects, and the likelihood ratio tests for transferability and temporal stability. Six tools, including a likelihood ratio test calculator.</p>
<h2>How to use this site</h2>
<div class="grid">
<div class="card"><span class="num">Step 1 · 40 minutes</span><h3>Learn</h3><p>Go through the seven ideas in order, then the six models. Move every slider before you read the worked example.</p></div>
<div class="card"><span class="num">Step 2 · 20 minutes</span><h3>Practice</h3><p>Name the issue in eight scenarios, then solve twelve problems with new numbers.</p></div>
<div class="card"><span class="num">Step 3 · 10 minutes, spread over two weeks</span><h3>Remember</h3><p>Drive the seven-stop memory route, climb the six floors of the Logit Hotel and follow the short review plan.</p></div>
<div class="card"><span class="num">Offline</span><h3>Study guide</h3><p>The same material as a printable guide with mind maps, hand calculations, a quiz and a one-page cheat sheet.</p><p><a href="{GUIDE}">Read online</a> · <a href="materials/AMAR_Methods_Study_Guide.pdf">Download PDF</a></p></div>
<div class="card"><span class="num">For teaching</span><h3>Presentation</h3><p>A 52-slide lecture on the seven ideas, the basics of logit and likelihood, the logit family, a full study in ten steps and current research, with click-by-click hand calculations and speaker notes.</p><p><a href="viewer.html?doc=materials/AMAR_Methods_Presentation.pdf&mode=slides&dl=materials/AMAR_Methods_Presentation.pptx">View slides</a> · <a href="materials/AMAR_Methods_Presentation.pptx">Download PowerPoint</a></p></div>
</div>
<section class="concept" id="sources"><h2>Sources</h2>
<p>The explanations follow these papers. Examples such as the ice-warning signs and the drivers who avoid snow come from them; all numbers in the tools and calculations are invented for teaching.</p>
<ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px">{"".join(f'<li>{r["authors"]} ({r["year"]}). {r["title"]}. <i>{r["journal"]}</i>{" " + r["volume"] + "," if r["volume"] else ","} {r["pages"]}.' + (f' <a href="https://doi.org/{r["doi"]}">doi:{r["doi"]}</a>' if r["doi"] else "") + (" — " + r["note"] if r.get("note") else "") + "</li>" for r in REFS)}</ul>
</section>
</main>'''
page("index.html", "AMAR Methods Learning", INDEX)
print("built")
