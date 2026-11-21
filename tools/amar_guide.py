import json, math, random
from scipy.stats import norm, chi2
from guide_lib import *

OUT = "../docs/materials/AMAR_Methods_Study_Guide.pdf"
REFS = json.load(open("../research/references.json"))
N = 7
C = ["navy", "teal", "rust", "green", "amber", "plum", "violet"]
NAMES = ["Unobserved heterogeneity", "Simulated maximum likelihood", "Endogeneity", "Spatial and temporal correlation", "Temporal instability", "Prediction versus causality", "Crash–conflict relationship"]
STOPS = ["Costume shop", "Dart casino", "Icy bridge", "Gossip street", "Melting clock tower", "Fortune teller and mechanic", "Near-miss arcade"]
BR = dict(navy="#4f8fc0", teal="#3aa3b0", rust="#d98a70", green="#86b860", amber="#e9a63a", plum="#b9808e", violet="#9a8bd0")

# ---- every number used in the text is computed here
logit = lambda b: 1 / (1 + math.exp(-b))
n1 = 1 - norm.cdf(0.625); assert round(n1, 3) == 0.266
t1 = norm.cdf(-0.5 / 1.0)                                   # try-it 1: N(0.5, 1.0) share negative
draws = [logit(b) for b in (-0.2, 0.3, 0.6, 1.1)]; sim = sum(draws) / 4; assert round(sim, 3) == 0.605
t2 = (logit(0) + logit(1)) / 2
de = 1 + 9 * 0.5; eff = 100 / de; assert round(eff) == 18
t4 = 60 / (1 + 3 * 0.5)
crit12 = chi2.ppf(0.95, 12); assert round(crit12, 2) == 21.03
crit8 = chi2.ppf(0.95, 8)
snow = (100 * 0.01 + 500 * 0.04) / 600; clear = (500 * 0.005 + 500 * 0.02) / 1000; assert round(snow / clear, 1) == 2.8
pc = 0.04 * math.exp(-6); assert round(1 / pc, -2) == 10100
t7 = 0.02 * math.exp(-4)
print(dict(n1=n1, t1=t1, t2=t2, t4=t4, crit8=crit8, per=1 / pc, t7=1 / t7))

def recap(k):
    lines = [
        "<b>Unobserved heterogeneity:</b> one variable can have different effects on different people. A random parameter gives the effect a distribution (the mixing distribution).",
        "<b>Simulated maximum likelihood:</b> average the probability over many draws of the random parameter. Halton draws cover the range evenly and need fewer draws.",
        "<b>Endogeneity:</b> a variable that responds to risk (a warning sign) or is chosen by people (an airbag) is tangled with what you cannot see. A plain comparison is biased.",
        "<b>Spatial and temporal correlation:</b> neighbours and consecutive years share unrecorded influences, so 100 observations can be worth 18.",
        "<b>Temporal instability:</b> effects change between periods. Test with −2 × [pooled − sum of separate log-likelihoods].",
        "<b>Prediction versus causality:</b> a good forecast is not the effect of a change. Self-selection (who drives in snow) separates the two.",
        "<b>Crash–conflict:</b> fit the tail of near misses and extend it to zero time-to-collision to estimate crash risk.",
    ]
    return box("RECAP SO FAR", "<ol>" + "".join(f"<li>{l}</li>" for l in lines[:k]) + "</ol>", C[k - 1])

# ---------------------------------------------------------------- figures
def f_het():
    c = Chart(xr=(-3.5, 2.5), yr=(0, 0.56), xlabel="effect of the variable on one person", ylabel="how common")
    c.axes([-3, -2, -1, 0, 1, 2], [])
    pdf = lambda x: norm.pdf(x, -0.5, 0.8)
    xs = [i / 50 for i in range(0, 126)]
    c.raw('<path d="M' + " L".join(f"{c.X(x):.1f},{c.Y(pdf(x)):.1f}" for x in xs) + f' L{c.X(2.5):.1f},{c.Y(0):.1f} L{c.X(0):.1f},{c.Y(0):.1f} Z" fill="{BR["amber"]}"/>')
    c.line([(x / 50, pdf(x / 50)) for x in range(-175, 126)], COL["navy"])
    c.raw(f'<line x1="{c.X(0)}" x2="{c.X(0)}" y1="{c.Y(0)}" y2="{c.Y(0.5)}" stroke="#1c2430" stroke-dasharray="5 4"/><line x1="{c.X(-0.5)}" x2="{c.X(-0.5)}" y1="{c.Y(0)}" y2="{c.Y(pdf(-0.5))}" stroke="{COL["navy"]}"/>')
    c.label(-0.5, 0.53, "mean −0.5", COL["navy"], "middle", bold=True).label(0.75, 0.2, "27% above zero", COL["amber"], bold=True).label(-3.3, 0.3, "73% below zero", COL["navy"])
    return c.svg()

def f_sml():
    rnd = random.Random(7); exact = sum(norm.pdf(z / 100) * logit(0.5 + z / 100) for z in range(-600, 601)) / sum(norm.pdf(z / 100) for z in range(-600, 601))
    def halton(i, b=2):
        f, r = 1, 0
        while i > 0: f /= b; r += f * (i % b); i //= b
        return r
    def run(gen):
        s, out = 0, []
        for k in range(1, 201): s += logit(0.5 + gen(k)); out.append((k, s / k))
        return out
    c = Chart(xr=(0, 200), yr=(0.5, 0.72), xlabel="number of draws", ylabel="simulated probability")
    c.axes([0, 50, 100, 150, 200], [0.5, 0.55, 0.6, 0.65, 0.7], yf=lambda v: f"{v:.2f}")
    c.line([(0, exact), (200, exact)], COL["amber"], "7 5", 2)
    c.line([(k, min(.72, max(.5, v))) for k, v in run(lambda k: rnd.gauss(0, 1))], COL["grey"], "2 3", 2)
    c.line([(k, min(.72, max(.5, v))) for k, v in run(lambda k: norm.ppf(halton(k)))], COL["teal"])
    c.label(196, exact, f"exact {exact:.3f}", COL["amber"], "end", dy=-8, bold=True).label(60, 0.69, "random draws (dotted)", COL["grey"]).label(60, 0.525, "Halton draws (solid)", COL["teal"], bold=True)
    return c.svg()

def f_endo():
    W, H = 600, 250; s = f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="Carlito, sans-serif" font-size="14">'
    def nd(x, y, w, t1, t2, col, dash=""):
        return f'<rect x="{x}" y="{y}" width="{w}" height="50" rx="8" fill="{SOFT[col]}" stroke="{COL[col]}" stroke-width="1.6" {dash}/><text x="{x + w / 2}" y="{y + 22}" text-anchor="middle" font-weight="700" fill="{COL[col]}">{t1}</text><text x="{x + w / 2}" y="{y + 40}" text-anchor="middle" font-size="12.5" fill="#1c2430">{t2}</text>'
    s += '<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#1c2430"/></marker></defs>'
    s += nd(105, 14, 150, "Ice risk", "not in the data", "rust", 'stroke-dasharray="5 4"') + nd(10, 170, 150, "Warning sign", "in the data", "amber") + nd(200, 170, 150, "Crashes", "in the data", "navy")
    s += '<line x1="150" y1="66" x2="92" y2="166" stroke="#1c2430" stroke-width="2" marker-end="url(#ah)"/><line x1="210" y1="66" x2="268" y2="166" stroke="#1c2430" stroke-width="2" marker-end="url(#ah)"/><line x1="162" y1="195" x2="197" y2="195" stroke="#1c2430" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#ah)"/>'
    s += '<text x="180" y="240" text-anchor="middle" font-size="12.5" fill="#1c2430">dashed arrow = the effect we want (−20%)</text>'
    base = 200
    for x, v, lab, col in [(430, 4, "no sign", "navy"), (510, 8, "sign", "amber")]:
        s += f'<rect x="{x}" y="{base - v * 19}" width="56" height="{v * 19}" fill="{BR[col]}"/><text x="{x + 28}" y="{base - v * 19 - 6}" text-anchor="middle" font-weight="700" fill="#1c2430">{v}</text><text x="{x + 28}" y="{base + 17}" text-anchor="middle" fill="#1c2430">{lab}</text>'
    s += f'<line x1="410" x2="590" y1="{base}" y2="{base}" stroke="#1c2430"/><text x="500" y="240" text-anchor="middle" font-size="12.5" fill="#1c2430">average crashes per segment</text>'
    return s + "</svg>"

def f_space():
    c = Chart(xr=(0, 1), yr=(0, 105), xlabel="correlation within a cluster of 10", ylabel="worth this many independent obs.")
    c.axes([0, 0.25, 0.5, 0.75, 1], [0, 25, 50, 75, 100])
    c.line([(r / 100, 100 / (1 + 9 * r / 100)) for r in range(0, 101)], COL["green"]).dot(0.5, eff, COL["green"], 6).dot(0, 100, COL["green"], 6)
    c.label(0.5, eff, "ρ = 0.5 → about 18", COL["green"], dx=10, dy=-8, bold=True).label(0, 100, "ρ = 0 → all 100 count", COL["green"], dx=10, dy=4)
    return c.svg()

def f_inst():
    b = [0.52, 0.47, 0.40, 0.36, 0.25, 0.20, 0.10, 0.05, -0.04, -0.12]; pooled = sum(b) / 10
    c = Chart(xr=(0.5, 10.5), yr=(-0.3, 0.7), xlabel="year", ylabel="estimated effect")
    c.axes(range(1, 11), [-0.2, 0, 0.2, 0.4, 0.6], yf=lambda v: f"{v:.1f}")
    c.line([(0.5, 0), (10.5, 0)], "#1c2430", "3 4", 1).line([(0.5, pooled), (10.5, pooled)], COL["amber"], "7 5", 2.2).line(list(enumerate(b, 1)), COL["navy"])
    for i, v in enumerate(b, 1): c.dot(i, v, COL["navy"])
    c.label(10.3, pooled, f"pooled model: {pooled:.2f}", COL["amber"], "end", dy=-8, bold=True).label(1.2, 0.62, "year-by-year estimates", COL["navy"], dy=-2)
    return c.svg()

def f_cause():
    c = Chart(xr=(0, 4), yr=(0, 4.2), ylabel="crash rate (%)", mb=58)
    c.axes([], [0, 1, 2, 3, 4])
    for x, v, lab, col in [(0.8, clear * 100, "clear day", "navy"), (2, 2.5, "snow, if everyone drove", "plum"), (3.2, snow * 100, "snow, as observed", "amber")]:
        c.bar(x, v, 74, BR[col]); c.label(x, v, f"{v:.2f}%", "#1c2430", "middle", dy=-6, bold=True)
        c.raw(f'<text x="{c.X(x):.1f}" y="{c.H - c.mb + 18}" text-anchor="middle" fill="#1c2430">{lab}</text>')
    c.raw(f'<text x="{c.X(1.4):.1f}" y="{c.H - 8}" text-anchor="middle" fill="{COL["plum"]}" font-weight="700">× 2 = cause</text><text x="{c.X(2.9):.1f}" y="{c.H - 8}" text-anchor="middle" fill="{COL["amber"]}" font-weight="700">× 2.8 = what the data show</text>')
    return c.svg()

def f_tail():
    c = Chart(H=200, xr=(0, 3.5), yr=(0, 1.05), xlabel="smallest time-to-collision in an interaction (seconds)", ylabel="how common")
    c.axes([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], [])
    from scipy.stats import gamma
    dens = lambda t: gamma.pdf(3.5 - t, 3, scale=0.3); m = max(dens(t / 100) for t in range(0, 351))
    for j in range(14):
        t0 = j * 0.25; h = (gamma.cdf(3.5 - t0, 3, scale=0.3) - gamma.cdf(3.5 - t0 - 0.25, 3, scale=0.3)) / 0.25 / m
        c.raw(f'<rect x="{c.X(t0) + 1:.1f}" y="{c.Y(h):.1f}" width="{c.X(0.25) - c.X(0) - 2:.1f}" height="{c.Y(0) - c.Y(h):.1f}" fill="{BR["amber"] if t0 < 1.5 else BR["violet"]}"/>')
    h15 = dens(1.5) / m
    c.line([(t / 100, max(h15, 0.12) * math.exp(-(1.5 - t / 100) / 0.25)) for t in range(0, 151)], "#1c2430")
    c.raw(f'<line x1="{c.X(1.5)}" x2="{c.X(1.5)}" y1="{c.Y(0)}" y2="{c.Y(1)}" stroke="#1c2430" stroke-dasharray="5 4"/><line x1="{c.X(0)}" x2="{c.X(0)}" y1="{c.Y(0)}" y2="{c.Y(1)}" stroke="{COL["rust"]}" stroke-width="3"/>')
    c.label(1.5, 0.95, "threshold 1.5 s", dx=6).label(0, 0.75, "crash: 0 s", COL["rust"], dx=8, bold=True).label(0.25, 0.3, "fitted tail, extended to zero", "#1c2430", dx=0)
    return c.svg()

def f_rp():
    c = Chart(H=215, xr=(-4, 4), yr=(0, 0.62), xlabel="effect of the variable in each crash")
    c.axes([-4, -2, 0, 2, 4], [])
    s2 = 0.7 * math.exp(0.5)
    def area(mu, sd, col):
        xs = [i / 25 for i in range(-100, 101)]
        return '<path d="M' + " L".join(f"{c.X(x):.1f},{c.Y(norm.pdf(x, mu, sd)):.1f}" for x in xs) + f' L{c.X(4):.1f},{c.Y(0):.1f} L{c.X(-4):.1f},{c.Y(0):.1f} Z" fill="{col}" opacity=".45"/>'
    c.raw(area(-0.8, 0.7, BR["navy"]) + area(-0.2, s2, BR["amber"]))
    c.line([(x / 25, norm.pdf(x / 25, -0.8, 0.7)) for x in range(-100, 101)], COL["navy"]).line([(x / 25, norm.pdf(x / 25, -0.2, s2)) for x in range(-100, 101)], COL["amber"], "6 4")
    c.raw(f'<line x1="{c.X(0)}" x2="{c.X(0)}" y1="{c.Y(0)}" y2="{c.Y(0.6)}" stroke="#1c2430" stroke-dasharray="4 4"/>')
    c.label(-3.9, 0.56, "clear weather: mean −0.8, spread 0.7", COL["navy"], bold=True).label(1.0, 0.3, "bad weather: mean −0.2, spread 1.15", COL["amber"], bold=True)
    return c.svg()
def f_chi(k=14, stat=48.6):
    crit = chi2.ppf(0.95, k); xm = 56
    c = Chart(H=205, xr=(0, xm), yr=(0, chi2.pdf(k - 2, k) * 1.25), xlabel=f"chi-square distribution, {k} degrees of freedom")
    c.axes([0, 10, 20, 30, 40, 50], [])
    xs = [crit + (xm - crit) * i / 60 for i in range(61)]
    c.raw('<path d="M' + f"{c.X(crit):.1f},{c.Y(0):.1f} " + " ".join(f"L{c.X(x):.1f},{c.Y(chi2.pdf(x, k)):.1f}" for x in xs) + f' L{c.X(xm):.1f},{c.Y(0):.1f} Z" fill="{BR["rust"]}"/>')
    c.line([(x / 5, chi2.pdf(x / 5, k)) for x in range(1, xm * 5 + 1)], COL["navy"])
    top = chi2.pdf(k - 2, k)
    c.raw(f'<line x1="{c.X(crit)}" x2="{c.X(crit)}" y1="{c.Y(0)}" y2="{c.Y(top)}" stroke="#1c2430" stroke-dasharray="4 4"/><line x1="{c.X(stat)}" x2="{c.X(stat)}" y1="{c.Y(0)}" y2="{c.Y(top * 0.55)}" stroke="{COL["amber"]}" stroke-width="3"/>')
    c.label(crit, top * 1.08, f"critical value {crit:.2f}", "#1c2430", "middle").label(stat, top * 0.62, f"statistic {stat}", COL["amber"], "middle", bold=True).label(33, top * 0.2, "rejection region", COL["rust"])
    return c.svg()

def f_chi1(stat=4.82):
    crit = chi2.ppf(0.95, 1); xm = 10
    c = Chart(H=200, xr=(0, xm), yr=(0, 1.0), xlabel="chi-square distribution, 1 degree of freedom")
    c.axes([0, 2, 4, 6, 8, 10], [])
    xs = [crit + (xm - crit) * i / 60 for i in range(61)]
    c.raw('<path d="M' + f"{c.X(crit):.1f},{c.Y(0):.1f} " + " ".join(f"L{c.X(x):.1f},{c.Y(chi2.pdf(x, 1)):.1f}" for x in xs) + f' L{c.X(xm):.1f},{c.Y(0):.1f} Z" fill="{BR["rust"]}"/>')
    c.line([(x / 50, min(1.0, chi2.pdf(x / 50, 1))) for x in range(8, xm * 50 + 1)], COL["navy"])
    c.raw(f'<line x1="{c.X(crit)}" x2="{c.X(crit)}" y1="{c.Y(0)}" y2="{c.Y(0.8)}" stroke="#1c2430" stroke-dasharray="4 4"/><line x1="{c.X(stat)}" x2="{c.X(stat)}" y1="{c.Y(0)}" y2="{c.Y(0.5)}" stroke="{COL["amber"]}" stroke-width="3"/>')
    c.label(crit, 0.86, f"critical value {crit:.2f}", "#1c2430", "middle").label(stat, 0.56, f"statistic {stat}", COL["amber"], "start", dx=4, bold=True).label(6.6, 0.16, "rejection region (5% of the area)", COL["rust"])
    return c.svg()

def f_locks():
    W, H = 640, 210; slots = ["constant D", "rollover D", "speed D", "constant S", "rollover S", "speed S"]
    s = f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="Carlito, sans-serif" font-size="13">'
    def row(y, title, locked):
        o = f'<text x="14" y="{y - 8}" font-weight="700" fill="#1c2430">{title}</text>'
        for i, lab in enumerate(slots):
            x = 14 + i * 104; lk = locked and i >= 3
            o += f'<rect x="{x}" y="{y}" width="96" height="58" rx="7" fill="#fff" stroke="{COL["amber"] if lk else COL["teal"]}" stroke-width="2"/><text x="{x + 48}" y="{y + 18}" text-anchor="middle" fill="#1c2430">{lab}</text>'
            if lk: o += f'<path d="M{x + 40} {y + 31} v-4 a8 8 0 0 1 16 0 v4" fill="none" stroke="{COL["amber"]}" stroke-width="3"/><rect x="{x + 20}" y="{y + 30}" width="56" height="21" rx="5" fill="{BR["amber"]}"/><text x="{x + 48}" y="{y + 45}" text-anchor="middle" font-weight="700" fill="#1c2430">= D</text>'
            else: o += f'<text x="{x + 48}" y="{y + 43}" text-anchor="middle" font-weight="700" fill="{COL["teal"]}">free</text>'
        return o
    s += row(24, "Unrestricted: two separate models, 6 free parameters", False) + row(122, "Restricted: one pooled model, 3 parameters locked equal", True)
    s += f'<text x="{W / 2}" y="{H - 6}" text-anchor="middle" font-weight="700" fill="#1c2430">degrees of freedom = number of locks = 3</text>'
    return s + "</svg>"
def f_sim():
    import numpy as np
    rng = np.random.default_rng(11); a = rng.binomial(100, 0.375, 5000); b = rng.binomial(100, 0.375, 5000)
    xl = lambda k, n: np.where((k > 0) & (k < n), k * np.log(np.maximum(k, 1) / n) + (n - k) * np.log(1 - np.minimum(k, n - 1) / n), 0)
    st = np.maximum(0, -2 * (xl(a + b, 200) - xl(a, 100) - xl(b, 100)))
    share = float((st > 3.841).mean())
    c = Chart(H=215, xr=(0, 12), yr=(0, 0.56), xlabel="likelihood ratio statistic in 5,000 imaginary studies where the restriction is true")
    c.axes([0, 2, 4, 6, 8, 10, 12], [])
    for j in range(24):
        h = float(((st >= j * .5) & (st < j * .5 + .5)).mean())
        c.raw(f'<rect x="{c.X(j * .5) + 1:.1f}" y="{c.Y(min(h, .56)):.1f}" width="{c.X(.5) - c.X(0) - 2:.1f}" height="{c.Y(0) - c.Y(min(h, .56)):.1f}" fill="{BR["rust"] if j * .5 >= 3.5 else BR["navy"]}"/>')
    c.line([(x / 10, min(.56, float(chi2.cdf(x / 10 + .25, 1) - chi2.cdf(max(0, x / 10 - .25), 1)))) for x in range(3, 121)], "#1c2430", "5 4", 1.6)
    c.raw(f'<line x1="{c.X(3.84)}" x2="{c.X(3.84)}" y1="{c.Y(0)}" y2="{c.Y(.5)}" stroke="#1c2430" stroke-dasharray="4 4"/><line x1="{c.X(4.82)}" x2="{c.X(4.82)}" y1="{c.Y(0)}" y2="{c.Y(.3)}" stroke="{COL["amber"]}" stroke-width="3"/>')
    c.label(3.84, 0.52, "critical value 3.84", "#1c2430", "start", dx=5).label(4.82, 0.32, "your statistic 4.82", COL["amber"], "start", dx=5, bold=True).label(6.3, 0.12, f"{share * 100:.1f}% of studies beyond 3.84 (theory 5%)", COL["rust"])
    return c.svg()

def cover_svg():
    rnd = random.Random(3)
    s = '<svg viewBox="0 0 560 792" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="560" height="792" fill="#14213D"/>'
    pts = [(60, 700), (150, 610), (250, 665), (340, 560), (430, 610), (500, 500), (470, 400)]
    d = "M" + " L".join(f"{x},{y}" for x, y in pts)
    s += f'<path d="{d}" fill="none" stroke="#3a4a6e" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><path d="{d}" fill="none" stroke="#E9A63A" stroke-width="2.5" stroke-dasharray="11 10"/>'
    for i, (x, y) in enumerate(pts): s += f'<circle cx="{x}" cy="{y}" r="19" fill="#1F6F8B" stroke="#F6F5EF" stroke-width="3"/><text x="{x}" y="{y + 6}" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="700" font-size="17" fill="#fff">{i + 1}</text>'
    for k in range(34):
        x = 40 + k * 14.5; h = 150 * math.exp(-((k - 12) / 7) ** 2) + rnd.random() * 10
        s += f'<rect x="{x:.0f}" y="{370 - h:.0f}" width="11" height="{h:.0f}" fill="{"#E9A63A" if k > 17 else "#1F6F8B"}" opacity=".5"/>'
    return s + "</svg>"

COVER = f'''<div class="cover">{cover_svg()}
<div class="plate" style="top:20mm"><div class="label">Research topics · Methods in accident research</div>
<h1>Why do warning signs seem to cause crashes?</h1>
<div class="sub">Seven statistical ideas behind modern crash-data analysis, built up from hand calculations, with a seven-stop memory route.</div></div>
<div class="plate" style="top:150mm; right:70mm"><b>Inside</b><br>How 100 observations can be worth only 18<br>Why a perfect forecast can give the wrong advice<br>How to count crashes that have not happened yet</div>
<div class="foot">Study guide for beginners · numbers in the examples are invented for teaching · companion site: smrahmanbd.github.io/AMAR-Methods-Learning</div></div>'''

chips = "".join(f'<span style="background:{COL[c]}">{i + 1} · {n}</span>' for i, (c, n) in enumerate(zip(C, NAMES)))
MAP = f'''<h2>The map</h2>
<p>The journal <i>Analytic Methods in Accident Research</i> publishes studies that develop or apply advanced statistical and econometric methods to crash data. Its papers keep returning to a small set of ideas. This guide explains seven of them from the beginning. You need to know what an average and a probability are, and nothing more.</p>
{fig(mindmap("Crash-data methods", [("1 Heterogeneity", ["effects differ across people"]), ("2 Simulation", ["average over draws"]), ("3 Endogeneity", ["cause responds to risk"]), ("4 Space and time", ["neighbours are related"]), ("5 Instability", ["effects drift"]), ("6 Causality", ["forecast is not cause"]), ("7 Conflicts", ["near misses to crashes"])], "navy"), "Figure 1 — the seven ideas of this guide. Ideas 1 and 2 belong together: simulation is how models with heterogeneity are estimated.", True)}
{box("HOW TO USE THIS GUIDE", "<ol><li>Read the seven concepts in order, then Part 2 on the models, Part 3 on a full study and Part 4 on foundations and current research. Each has one hand calculation; do it with a calculator before reading the steps.</li><li>Each concept ends with a scene at one stop of a road trip. Picture it for five seconds. The scenes are how you will recall the list later.</li><li>Do every TRY IT NOW. Answers are at the back.</li><li>The companion website has a tool you can move for each idea.</li></ol>", "navy")}
<h3>What you will be able to do</h3>
<ul><li>Explain each of the seven ideas in one sentence to a non-specialist.</li><li>Compute the share of people with an opposite-sign effect under a random parameter.</li><li>Simulate a probability from a handful of draws.</li><li>Spot an endogenous variable and say which way the bias goes.</li><li>Run a likelihood ratio test for temporal stability.</li><li>Separate a forecast from a causal effect in a self-selection example.</li><li>Turn conflict counts into a crash-risk estimate with a simple tail model.</li></ul>
<div class="chips">{chips}</div>
<p class="small muted">The explanations follow the review papers listed at the end. The article “A note from the new Editor-in-Chief of Analytic Methods in Accident Research” (volume 47, 100389) is the recommended overview; it could not be opened while this guide was written, so nothing here quotes it. All numbers in examples are invented for teaching.</p>'''

S = []
S.append(f'''<div class="section">{band("1 · Unobserved heterogeneity", 1, N, C[0])}
{box("HOOK", "Two people sit in identical cars in identical crashes, both belted. One walks away, one is badly hurt. The crash report has the same entries for both. Whatever made the difference is real, and it is not in the data.", C[0])}
{fig(mindmap("Heterogeneity", [("What", ["effects vary for unrecorded reasons"]), ("Fixed parameter", ["one effect for everyone"]), ("Random parameter", ["effect has a distribution"]), ("Mixing distribution", ["normal, lognormal, triangular, uniform"])], C[0]), "")}
<p>A standard model estimates one number for each variable: “a seat belt lowers injury severity by this much”. That assumes the effect is identical for every person. It is not. Posture, bone strength and the exact angle of impact all matter, and none is recorded. This unrecorded variation is <b>unobserved heterogeneity</b>.</p>
<p>Ignoring it is not harmless. The single number can be biased, and it hides the fact that the variable may help most people and hurt some.</p>
<p><b>Start simple.</b> Imagine only two kinds of people. For half of them the effect is −1.3; for the other half it is +0.3. The average is −0.5. A fixed-parameter model reports −0.5 and never tells you that half the people have a positive effect.</p>
<p><b>Now generalise.</b> Instead of two kinds, let the effect vary smoothly. A <b>random-parameters</b> model writes the effect for person <i>i</i> as</p>
{formula("β<sub>i</sub> = β + σ × (a random draw for person i)", 1)}
<p>The shape of the random draw is the <b>mixing distribution</b>. The normal (bell) shape is most common. The lognormal keeps every effect on one side of zero. Triangular and uniform shapes have hard limits. The model estimates the centre β and the spread σ.</p>
{box("SIMPLE CALCULATION (illustrative numbers)", f"<ol><li>A model estimates a normal random parameter with mean −0.5 and standard deviation 0.8.</li><li>For what share of people is the effect positive? Standardise zero: z = (0 − (−0.5)) ÷ 0.8 = <b>0.625</b>.</li><li>Share of a normal distribution below 0.625: <b>{norm.cdf(0.625):.3f}</b>.</li><li>Share above zero = 1 − {norm.cdf(0.625):.3f} = <b>{n1:.3f}</b>, about 27%.</li><li>Reading: the variable lowers risk for 73% of people and raises it for 27%.</li></ol>", C[0])}
{fig(f_het(), "Figure 2 — what to notice: the mean is negative, yet more than a quarter of the area lies to the right of zero. A fixed-parameter model reports only the vertical line at −0.5.")}
{box("TRAP", "A random parameter with a significant spread does not say <i>why</i> effects differ. It only says that they do. To explain the differences, researchers let the mean or the variance of the parameter depend on other variables, or use latent-class models that sort observations into a few hidden groups. No single approach is clearly best (Mannering, Shankar and Bhat, 2016).", "rust")}
{box("PICTURE THIS — stop 1 of the route: the costume shop", "Your road trip starts at a costume shop. Every customer walks in through the same door and each comes out in a different costume: a pirate, a nun, a giant banana. The shopkeeper hangs the returned costumes on a rail shaped like a bell, crowded in the middle and thin at the ends. One door, many outcomes; the rail is the mixing distribution.", C[0])}
{box("TRY IT NOW (90 seconds)", "A random parameter is normal with mean 0.5 and standard deviation 1.0. For what share of people is the effect negative?", "grey")}
{recap(1)}</div>''')

S.append(f'''<div class="section">{band("2 · Simulated maximum likelihood", 2, N, C[1])}
{box("HOOK", "Some of the most-used models in crash research cannot be written down as a formula a computer can simply evaluate. Every estimate you see from them was produced by a controlled form of guessing, repeated thousands of times.", C[1])}
{fig(mindmap("Simulation", [("Problem", ["an average over all possible effects"]), ("Fix", ["draw, compute, average"]), ("Halton draws", ["evenly spread, fewer needed"]), ("Then", ["maximise the simulated likelihood"])], C[1]), "")}
<p>Concept 1 gave each person their own effect β<sub>i</sub>. We never observe β<sub>i</sub>, so the probability of what we saw must be averaged over every value β<sub>i</sub> could take. That average is an integral, and for these models it has no exact solution.</p>
<p><b>Start simple.</b> If β could take only two values, 0 and 1, equally likely, the probability would be the plain average of two numbers. With a continuous distribution we imitate that: take a sample of values, compute, and average.</p>
{formula("simulated probability = (P at draw 1 + P at draw 2 + … + P at draw R) ÷ R", 2)}
{box("SIMPLE CALCULATION (illustrative numbers)", f"<ol><li>A crash is severe with probability P = 1 ÷ (1 + e<sup>−β</sup>). Four draws of β: −0.2, 0.3, 0.6, 1.1.</li><li>P at each draw: {draws[0]:.3f}, {draws[1]:.3f}, {draws[2]:.3f}, {draws[3]:.3f}.</li><li>Sum = {sum(draws):.3f}. Divide by 4: <b>{sim:.3f}</b>.</li><li>That is the simulated probability with R = 4. Real studies use hundreds or thousands of draws for every observation.</li></ol>", C[1])}
<p><b>Maximum likelihood</b> means choosing the parameter values (here the centre β and spread σ) that make the observed data most probable. <b>Simulated</b> maximum likelihood does the same, with every probability replaced by its simulated average.</p>
<p><b>Halton draws.</b> Random draws clump by chance, so the average wobbles. A Halton sequence is a fixed pattern that fills the range evenly: in base 2 it goes ½, ¼, ¾, ⅛, ⅝, ⅜, ⅞ … Each new point lands in the largest gap left by the earlier ones.</p>
{fig(f_sml(), "Figure 3 — what to notice: both lines head for the exact answer, but the Halton line (solid) settles much sooner. Effect: normal with mean 0.5 and standard deviation 1; one random sequence shown.")}
{box("TRAP", "Too few draws give an answer that looks precise and is not. If results change when the number of draws is doubled, there were not enough.", "rust")}
{box("PICTURE THIS — stop 2: the dart casino", "Next door is a casino where a gambler throws darts at a wall covered in numbers and shouts the running average after every throw. His darts land in clumps and his average lurches about. Beside him a small robot called Halton places darts one by one into the biggest empty gap. After four darts the robot is already shouting the right number.", C[1])}
{box("TRY IT NOW (90 seconds)", "Two draws of β are 0 and 1. With P = 1 ÷ (1 + e<sup>−β</sup>), what is the simulated probability?", "grey")}
{recap(2)}</div>''')

S.append(f'''<div class="section">{band("3 · Endogeneity", 3, N, C[2])}
{box("HOOK", "Road segments with ice-warning signs have more ice crashes than segments without. Hospitals have more deaths than supermarkets. Neither fact means what it first seems to mean.", C[2])}
{fig(mindmap("Endogeneity", [("What", ["variable tangled with unseen causes"]), ("Sources", ["response to risk", "people's own choices"]), ("Result", ["biased, even wrong sign"]), ("Cures", ["instruments, joint models"])], C[2]), "")}
<p>A model assumes its explanatory variables are given from outside. A variable is <b>endogenous</b> when that is false: something we cannot see drives both the variable and the outcome.</p>
<p>Mannering and Bhat (2014) use ice-warning signs as the example. Agencies install signs where ice crashes have been frequent. Ice risk therefore causes the sign <i>and</i> the crashes. A model that ignores this credits the sign with the crashes the ice caused.</p>
{fig(f_endo(), "Figure 4 — what to notice: two solid arrows leave the hidden box. A plain comparison of the two bars mixes them into the dashed arrow.", True)}
{box("SIMPLE CALCULATION (illustrative numbers)", "<ol><li>100 icy segments would have 10 crashes each without a sign. 300 ordinary segments have 4 each. A sign truly cuts crashes by 20%.</li><li>Signs go on all 100 icy segments: 10 × 0.8 = <b>8</b> crashes each.</li><li>Plain comparison: 8 with a sign, 4 without. 8 ÷ 4 = 2, so signs appear to <b>double</b> crashes (+100%).</li><li>Truth: <b>−20%</b>. The gap between +100% and −20% is entirely the ice.</li><li>If signs were placed at random, both groups would have the same mix of icy and ordinary segments and the comparison would return −20%.</li></ol>", C[2])}
<p>The same problem arises from <b>people’s choices</b> (self-selection). If careful drivers are the ones who buy cars with side airbags, airbag cars have fewer severe injuries partly because of who drives them.</p>
<p><b>Cures</b> all try to isolate the part of the variable that is not a response to risk: an instrumental variable (something that moves the variable but has no other path to crashes), control functions, or modelling the choice and the outcome jointly. The paper notes that the familiar two-stage least squares recipe is not appropriate for the nonlinear models used with crash data.</p>
{box("TRAP", "Adding more control variables does not cure endogeneity unless you add the hidden cause itself. If ice risk is not measured, no amount of other variables removes it.", "rust")}
{box("PICTURE THIS — stop 3: the icy bridge", "The road crosses a bridge. Yellow warning signs sprout from the deck like mushrooms, but only above the spots where an invisible ice troll sleeps under the bridge. A tourist with a clipboard counts the wrecked cars next to the signs and writes: signs are dangerous. Nobody looks under the bridge.", C[2])}
{box("TRY IT NOW (2 minutes)", "50 high-risk sites would have 12 crashes each without a speed camera. A camera cuts crashes by 25%, and all 50 get one. 200 other sites have 5 crashes each. What does a plain comparison say about cameras?", "grey")}
{recap(3)}</div>''')

S.append(f'''<div class="section">{band("4 · Spatial and temporal correlation", 4, N, C[3])}
{box("HOOK", "Ask one family of ten what they think of a film and you have ten answers but nowhere near ten independent opinions. Crash data from ten neighbouring road segments behave the same way.", C[3])}
{fig(mindmap("Correlation", [("In space", ["neighbouring sites alike"]), ("In time", ["same site, year after year"]), ("Cause", ["shared unrecorded factors"]), ("Cost", ["false confidence, possible bias"])], C[3]), "")}
<p>Neighbouring segments share weather, drainage, the local driver population and enforcement. The same site in consecutive years shares its geometry and surroundings. When these are not in the model, the part of crashes the model fails to explain is similar for neighbours and for consecutive years. That is <b>spatial</b> and <b>temporal correlation</b>.</p>
<p><b>Start simple.</b> If two observations are perfectly correlated, the second tells you nothing new: you have one observation, counted twice. If they are uncorrelated, you have two. Real data sit in between.</p>
<p>A rule of thumb for clustered data shows the size of the problem. With clusters of size <i>m</i> and correlation ρ inside each cluster:</p>
{formula("design effect = 1 + (m − 1) × ρ   and   effective sample = n ÷ design effect", 3)}
{box("SIMPLE CALCULATION (illustrative numbers)", f"<ol><li>100 observations: 10 segments on each of 10 corridors. Within a corridor, ρ = 0.5.</li><li>Design effect = 1 + (10 − 1) × 0.5 = <b>{de}</b>.</li><li>Effective sample = 100 ÷ {de} = <b>{eff:.1f}</b>, about 18.</li><li>A model that treats the 100 as independent reports standard errors too small by a factor of √{de} ≈ {math.sqrt(de):.2f}.</li></ol>", C[3])}
{fig(f_space(), "Figure 5 — what to notice: the curve falls steeply. Even a modest correlation removes most of the apparent sample size.")}
<p>Mannering and Bhat (2014) warn that ignoring these correlations gives inefficient and possibly inconsistent estimates. Research models describe the links directly, for example with error terms that are correlated between neighbours or over time.</p>
{box("TRAP", "Formula (3) is a teaching approximation for equal clusters. It shows why correlation matters; it is not what research papers estimate.", "rust")}
{box("PICTURE THIS — stop 4: gossip street", "After the bridge you drive down a street of exactly 100 houses. At every door the owner repeats, word for word, what the neighbour just said. You knock on all 100 doors, and when you count the different opinions in your notebook there are only 18.", C[3])}
{box("TRY IT NOW (60 seconds)", "60 observations come in clusters of 4 with ρ = 0.5. How many independent observations are they worth?", "grey")}
{recap(4)}</div>''')

S.append(f'''<div class="section">{band("5 · Temporal instability", 5, N, C[4])}
{box("HOOK", "A model of driver injury estimated before smartphones existed is still a correct description of the past. Whether it describes this year is a question the data can answer, and the answer is often no.", C[4])}
{fig(mindmap("Instability", [("What", ["effects change between periods"]), ("Why", ["vehicles, behaviour, economy"]), ("Test", ["pooled against separate models"]), ("Cost", ["old models mislead forecasts"])], C[4]), "")}
<p>Vehicles get safer, phones enter the cabin, a recession changes who drives, a pandemic empties the roads. Each can change how a variable affects crashes. Mannering (2018) named this <b>temporal instability</b> and argued that it should be tested, not assumed away. Many later studies in the journal report parameters that shift from one period to the next.</p>
<p><b>Start simple.</b> Estimate the effect of “night-time” on severity for each year. If the ten estimates sit on a flat line, one pooled model is fine. If they slope, the pooled value describes none of the years well.</p>
{fig(f_inst(), "Figure 6 — what to notice (stylised): the effect falls every year and changes sign. The pooled value is far from the latest year, which is the one a forecast depends on.")}
<p><b>The test.</b> Log-likelihood (LL) measures how well a model fits; closer to zero is better. Fit one model to all the data, and separate models to each period.</p>
{formula("test statistic = −2 × [ LL(pooled) − ( LL(period 1) + LL(period 2) ) ]", 4)}
<p>Compare it with a chi-square value whose degrees of freedom equal the extra parameters the separate models use.</p>
{box("SIMPLE CALCULATION (illustrative numbers)", f"<ol><li>A model has 12 parameters. LL(pooled) = −1,250. LL(2019–2021) = −600. LL(2022–2024) = −620.</li><li>Separate models together: −600 + (−620) = <b>−1,220</b>.</li><li>Statistic = −2 × [−1,250 − (−1,220)] = −2 × (−30) = <b>60</b>.</li><li>Degrees of freedom = 24 − 12 = 12. The 5% critical value is <b>{crit12:.2f}</b>.</li><li>60 &gt; {crit12:.2f}: reject stability. The two periods need different parameters.</li></ol>", C[4])}
{box("TRAP", "Temporal instability (concept 5) is not temporal correlation (concept 4). Correlation: the unexplained part is similar from year to year. Instability: the <i>effects themselves</i> change.", "rust")}
{box("PICTURE THIS — stop 5: the melting clock tower", "At the end of gossip street stands a clock tower whose numbers are melting and sliding down the wall, a little lower each year. At its foot a judge in a wig holds a calendar in each hand, weighs them like fruit and bangs a gavel: “These are not the same year!” Carved over the door: 60 beats 21.", C[4])}
{box("TRY IT NOW (2 minutes)", f"A model has 8 parameters. LL(pooled) = −500, LL(period 1) = −240, LL(period 2) = −252. The 5% critical value with 8 degrees of freedom is {crit8:.2f}. Is the model stable?", "grey")}
{recap(5)}</div>''')

S.append(f'''<div class="section">{band("6 · Prediction versus causality", 6, N, C[5])}
{box("HOOK", "A model can forecast tomorrow’s crashes almost perfectly and still give exactly the wrong advice about how to prevent them.", C[5])}
{fig(mindmap("Two questions", [("Prediction", ["what will happen?"]), ("Causality", ["what if I change this?"]), ("Gap", ["self-selection, endogeneity"]), ("Choice", ["depends on the question"])], C[5]), "")}
<p><b>Prediction</b> asks: how many crashes will this site have next year? <b>Causality</b> asks: if I change one thing, how will crashes change? The first needs patterns that hold. The second needs the reason the pattern exists.</p>
<p>Mannering, Bhat, Shankar and Abdel-Aty (2020) explain why the two come apart in crash data. Their example: in snow, cautious drivers stay home. The drivers observed on snowy roads are a riskier group than usual. Crash data in snow mix the effect of the snow with the effect of who is driving.</p>
{box("SIMPLE CALCULATION (illustrative numbers)", f"<ol><li>500 cautious drivers: crash risk 0.5% on a clear day, 1% in snow. 500 risk-takers: 2% and 4%. Snow doubles everyone’s risk.</li><li>Clear day: 500 × 0.5% + 500 × 2% = 2.5 + 10 = 12.5 crashes per 1,000 drivers = <b>{clear * 100:.2f}%</b>.</li><li>Snow day: 80% of cautious drivers stay home, leaving 100 cautious and 500 risk-takers.</li><li>100 × 1% + 500 × 4% = 1 + 20 = 21 crashes per 600 drivers = <b>{snow * 100:.1f}%</b>.</li><li>Data: {snow * 100:.1f} ÷ {clear * 100:.2f} = <b>{snow / clear:.1f} times</b>. Cause: <b>2 times</b>.</li></ol>", C[5])}
{fig(f_cause(), "Figure 7 — what to notice: the middle bar is what snow does. The right bar is what the data show. The difference is who stayed home.")}
<p>The paper sorts methods into families. Data-driven methods such as machine learning are usually strongest at prediction and say least about cause. Statistical models that handle heterogeneity and endogeneity (concepts 1 and 3) forecast less sharply but support statements about cause. Neither family is “better”; they answer different questions.</p>
{box("TRAP", "Self-selection can push either way. If the people who stay home are the high-risk ones (novices avoiding night driving), the data <i>understate</i> the true effect.", "rust")}
{box("PICTURE THIS — stop 6: the fortune teller and the mechanic", "Snow starts to fall. By the roadside a fortune teller looks into a crystal ball and announces, correctly, that there will be many crashes tonight. Next to her a mechanic has a bonnet open and is asking why. On the road every driver is a daredevil in a stunt helmet. The careful drivers are at home, waving from their windows.", C[5])}
{box("TRY IT NOW (2 minutes)", "Use the example above but let only 50% of cautious drivers stay home in snow. What ratio do the data show?", "grey")}
{recap(6)}</div>''')

S.append(f'''<div class="section">{band("7 · Crash–conflict relationship", 7, N, C[6])}
{box("HOOK", "To judge a new junction design from crash counts you may have to wait three years and accept that people will be hurt while you wait. A camera can record thousands of near misses in a week.", C[6])}
{fig(mindmap("Conflicts", [("Conflict", ["a near miss you can measure"]), ("Measures", ["time-to-collision", "post-encroachment time"]), ("Link", ["extreme value theory"]), ("Open issues", ["threshold, validation"])], C[6]), "")}
<p>A <b>traffic conflict</b> is an interaction in which road users would have collided if nobody had braked or swerved. Two measures dominate (Arun, Haque, Sayed and Mannering, 2021):</p>
<ul><li><b>Time-to-collision:</b> the seconds left before impact if both keep their current course and speed.</li><li><b>Post-encroachment time:</b> the gap between one road user leaving a spot and the other arriving at it.</li></ul>
<p>Smaller means closer. A crash is the extreme case: zero.</p>
<p><b>Start simple.</b> If 1 near miss in 100 came within 1 second, and 1 in 100 of <i>those</i> came within 0 seconds, the crash rate would be 1 in 10,000. <b>Extreme value theory</b> makes this idea precise. It is the statistics of rare extremes, used for floods and stock crashes. It fits a curve to the most severe conflicts (the tail) and extends the curve to zero (Ali, Haque and Mannering, 2023). The <i>peak-over-threshold</i> version uses every conflict beyond a chosen threshold; the <i>block-maxima</i> version uses the most severe conflict in each time block.</p>
<p>The simplest tail is exponential: among conflicts, the chance of being at least <i>x</i> seconds below the threshold <i>u</i> is e<sup>−x ÷ mean excess</sup>.</p>
{formula("crash probability = (share below threshold) × e<sup>−u ÷ mean excess</sup>", 5)}
{fig(f_tail(), "Figure 8 — what to notice (stylised): the amber bars are the conflicts. The black curve is fitted to them and continued to the red line at zero, where no data exist.")}
{box("SIMPLE CALCULATION (illustrative numbers)", f"<ol><li>5,000 interactions observed. 200 have a time-to-collision below u = 1.5 s. Share = 200 ÷ 5,000 = <b>0.04</b>.</li><li>Those 200 are on average 0.25 s below the threshold (the mean excess).</li><li>Chance of reaching zero: e<sup>−1.5 ÷ 0.25</sup> = e<sup>−6</sup> = <b>{math.exp(-6):.5f}</b>.</li><li>Crash probability = 0.04 × {math.exp(-6):.5f} = <b>{pc:.7f}</b>.</li><li>About <b>1 crash per {round(1 / pc, -2):,.0f} interactions</b>, with no crash observed.</li></ol>", C[6])}
{box("TRAP", "The answer depends on the threshold. Too high and ordinary driving pollutes the tail; too low and too few conflicts remain. Research uses the generalised Pareto and generalised extreme value distributions, which add a shape parameter.", "rust")}
{box("PICTURE THIS — stop 7: the near-miss arcade", "The trip ends at an arcade. One machine goes PING every time two toy cars almost touch, and its counter shows 200. Behind the machine lies a sleeping dragon whose tail gets thinner and thinner. You pull the tail straight until its tip touches a wall painted with a huge red zero. The tip of the tail is the crash.", C[6])}
{box("TRY IT NOW (2 minutes)", "100 of 5,000 interactions fall below a 2.0 s threshold, with a mean excess of 0.5 s. Estimate the crash probability and express it as “1 per …”.", "grey")}
{recap(7)}</div>''')

# ---------------------------------------------------------------- part 2: the model family
L_ = logit
mn = [math.exp(v) for v in (0, -0.5, -2)]; mnp = [v / sum(mn) for v in mn]; assert [round(v, 3) for v in mnp] == [0.574, 0.348, 0.078]
nst = 2 ** 0.5 / (1 + 2 ** 0.5); assert round(nst, 3) == 0.586
o1, o2 = L_(-0.5), L_(1.5); assert round(o1, 3) == 0.378 and round(o2, 3) == 0.818
def _mn(si, sf):
    w = [1, math.exp(si), math.exp(sf)]; return [v / sum(w) for v in w], w, sum(w)
ua, ub = _mn(0.8, 0.2), _mn(-0.1, -1.4); assert round(ua[0][2], 3) == 0.275 and round(ub[0][2], 3) == 0.115
mx = (L_(-1) + L_(2)) / 2; assert round(mx, 3) == 0.575 and round(L_(0.5), 3) == 0.622
def f_ord():
    c = Chart(H=210, xr=(-6, 8), yr=(0, 0.27), xlabel="hidden severity tendency (bump centred on the score, 0.5)")
    c.axes([-4, -2, 0, 2, 4, 6], [])
    d = lambda z: math.exp(-(z - 0.5)) / (1 + math.exp(-(z - 0.5))) ** 2
    def area(a, b, col):
        zs = [a + (b - a) * i / 60 for i in range(61)]
        return f'<path d="M{c.X(a):.1f},{c.Y(0):.1f} ' + " ".join(f"L{c.X(z):.1f},{c.Y(d(z)):.1f}" for z in zs) + f' L{c.X(b):.1f},{c.Y(0):.1f} Z" fill="{col}"/>'
    c.raw(area(-6, 0, BR["navy"]) + area(0, 2, BR["amber"]) + area(2, 8, BR["rust"]))
    for t in (0, 2): c.raw(f'<line x1="{c.X(t)}" x2="{c.X(t)}" y1="{c.Y(0)}" y2="{c.Y(0.26)}" stroke="#1c2430" stroke-dasharray="5 4"/>')
    c.label(-5.6, 0.12, "no injury 0.378", COL["navy"], bold=True).label(1, 0.262, "injury 0.440", COL["amber"], "middle", bold=True).label(3.6, 0.12, "fatal 0.182", COL["rust"], bold=True)
    return c.svg()
HOTEL = [("Ground floor, the two-way door", "binary logit", "A revolving door with two exits, IN and OUT. The doorman pushes harder towards IN the higher your score, but never with certainty."),
 ("Floor 1, the balloon buffet", "multinomial logit", "Each dish has a balloon whose size is e to the power of its score. Your chance of a dish is its balloon’s share of all the air."),
 ("Floor 2, the twin rooms", "nested logit", "Twins share a room. When one twin checks out, the other inherits nearly all the luggage; the guest across the corridor gets almost none."),
 ("Floor 3, the thermometer staircase", "ordered logit", "One blob of mercury rises with the score past two gates: below the first, no injury; between them, injury; above the second, fatal."),
 ("Floor 4, the costume party", "mixed logit", "Everyone from the costume shop is here, each with their own chance of dancing. The manager reports the average chance."),
 ("Floor 5, the masked ball", "latent class logit", "Two secret clubs in masks. You know only that 60% belong to one, and each club dances to its own rules.")]
PART2 = f"""<div class="section"><div class="band" style="background:{COL["grey"]}"><h2>Part 2 · The model family</h2><span class="prog">Six models</span></div>
{box("HOOK", "Every model on this page is one sentence away from the one before it. If you can turn three scores into three probabilities with a calculator, you already know the core of the most-used model in injury-severity research.", "grey")}
<p>The seven concepts say what can go wrong. The models are the response. Crash studies ask two questions. <b>How many</b> crashes (a count: Poisson, or negative binomial when counts vary more than Poisson allows)? And <b>how bad</b> is a crash (a category: the logit family)? This part covers the logit family.</p>
<p>Each model gives every outcome a <b>score</b>, a weighted sum of what is known about the crash. They differ in how scores become probabilities.</p>
<table><tr><th>Model</th><th>One-sentence idea</th><th>Watch out for</th></tr>
<tr><td><b>Binary logit</b></td><td>Two outcomes: P = 1 ÷ (1 + e<sup>−score</sup>)</td><td>—</td></tr>
<tr><td><b>Multinomial logit</b></td><td>Each outcome’s weight is e<sup>score</sup>; probability = weight ÷ total</td><td>Treats all outcomes as equally unrelated</td></tr>
<tr><td><b>Nested logit</b></td><td>Groups similar outcomes in a nest so they share lost or gained probability</td><td>You must choose the nests</td></tr>
<tr><td><b>Ordered logit / probit</b></td><td>One score on a hidden scale, cut by thresholds</td><td>One score moves all levels the same way</td></tr>
<tr><td><b>Mixed (random parameters) logit</b></td><td>Multinomial logit with concept 1: personal effects, averaged by simulation (concept 2)</td><td>Needs a mixing distribution</td></tr>
<tr><td><b>Latent class logit</b></td><td>A few hidden groups, one multinomial logit each</td><td>Everyone in a class is identical</td></tr></table>
{formula("multinomial logit:   P(outcome k) = e<sup>score k</sup> ÷ (e<sup>score 1</sup> + e<sup>score 2</sup> + … )", 6)}
{box("SIMPLE CALCULATION 1 — multinomial logit", f"<ol><li>Scores: no injury 0, injury −0.5, fatal −2.</li><li>Weights: e<sup>0</sup> = 1.000, e<sup>−0.5</sup> = {mn[1]:.3f}, e<sup>−2</sup> = {mn[2]:.3f}. Total = {sum(mn):.3f}.</li><li>Probabilities: <b>{mnp[0]:.3f}</b>, <b>{mnp[1]:.3f}</b>, <b>{mnp[2]:.3f}</b>. They add to 1.</li></ol>", "navy")}

<h3>The multinomial logit, slowly</h3>
<p>Follow one crash through the model. The model keeps a table of <b>coefficients</b>, one row per outcome (invented here for teaching). One outcome, the <b>base</b>, has a score of 0, because only differences between scores matter.</p>
<table><tr><th>Outcome</th><th>Constant</th><th>No seat belt</th><th>High speed limit</th><th>Night</th></tr><tr><td>No injury (base)</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>Injury</td><td>−0.6</td><td>+0.9</td><td>+0.5</td><td>+0.3</td></tr><tr><td>Fatal</td><td>−2.5</td><td>+1.6</td><td>+1.1</td><td>+0.6</td></tr></table>
{box("SIMPLE CALCULATION 1b — from a crash to three probabilities", f"<ol><li>The crash: no seat belt, high speed limit, daytime. Add the coefficients of the facts that are true.</li><li>Injury score = −0.6 + 0.9 + 0.5 = <b>0.8</b>. Fatal score = −2.5 + 1.6 + 1.1 = <b>0.2</b>.</li><li>Weights: 1.000, e<sup>0.8</sup> = {math.exp(.8):.3f}, e<sup>0.2</sup> = {math.exp(.2):.3f}. Total = {ua[2]:.3f}.</li><li>No injury <b>{ua[0][0]:.3f}</b>, injury <b>{ua[0][1]:.3f}</b>, fatal <b>{ua[0][2]:.3f}</b>.</li><li><b>With a seat belt:</b> scores −0.1 and −1.4; weights 1.000, {math.exp(-.1):.3f}, {math.exp(-1.4):.3f}; fatal = <b>{ub[0][2]:.3f}</b>.</li><li><b>Marginal effect</b> of the belt on a fatal outcome: {ua[0][2]:.3f} − {ub[0][2]:.3f} = <b>{ua[0][2] - ub[0][2]:.3f}</b> (16 percentage points). It depends on the rest of the crash.</li><li><b>Odds ratio:</b> e<sup>1.6</sup> = <b>{math.exp(1.6):.2f}</b>. Without a belt, the odds of fatal against no injury are about five times higher, whatever the rest of the crash.</li></ol>", "navy")}
{box("SIMPLE CALCULATION 1c — where coefficients come from (maximum likelihood)", f"<ol><li>The computer tries values and keeps those that make the observed data most probable. It works with the logarithm of that probability, the <b>log-likelihood</b> (negative; closer to zero is better).</li><li>Smallest example: 10 unbelted crashes, 7 with injury. Model: p = 1 ÷ (1 + e<sup>−β</sup>).</li><li>β = 0: p = 0.5; log-likelihood = 10 × ln(0.5) = <b>{10 * math.log(.5):.3f}</b>.</li><li>β = 0.847: p = 0.7; log-likelihood = 7 × ln(0.7) + 3 × ln(0.3) = <b>{7 * math.log(.7) + 3 * math.log(.3):.3f}</b>. No other β does better.</li><li>Fit: ρ² = 1 − (−6.109 ÷ −6.931) = <b>{1 - (7 * math.log(.7) + 3 * math.log(.3)) / (10 * math.log(.5)):.3f}</b> (McFadden’s pseudo R-squared).</li></ol>", "navy")}
<p><b>Count models in one paragraph.</b> For “how many crashes?”, the Poisson model gives each segment an expected count. With a mean of 2, the chance of zero crashes is e<sup>−2</sup> = {math.exp(-2):.3f}. Poisson assumes variance = mean. Crash counts are more spread out (overdispersion), so the negative binomial adds a parameter α: variance = mean + α × mean². With α = 1 the variance is 6 and the chance of zero crashes rises to 1 ÷ 3.</p>
<p><b>The weak spot of the multinomial logit.</b> If one outcome becomes less likely, its lost share is spread over all the others in proportion. That is wrong when two outcomes are close cousins, such as minor and severe injury, which share unrecorded causes.</p>
{box("SIMPLE CALCULATION 2 — nested logit", f"<ol><li>Three outcomes, all with score 0. Multinomial logit: 1 ÷ 3 = 0.333 each.</li><li>Nest minor and severe injury with a nest setting of 0.5 (1 = unrelated, near 0 = interchangeable).</li><li>Nest weight = (1 + 1)<sup>0.5</sup> = 1.414. Probability of the nest = 1.414 ÷ 2.414 = <b>{nst:.3f}</b>; each injury level gets half, <b>{nst / 2:.3f}</b>.</li><li>No injury = <b>{1 - nst:.3f}</b>. Two similar outcomes count for less than two separate ones.</li></ol>", "teal")}
{box("SIMPLE CALCULATION 3 — ordered logit", f"<ol><li>Thresholds 0 and 2; score 0.5; F(z) = 1 ÷ (1 + e<sup>−z</sup>).</li><li>No injury = F(0 − 0.5) = <b>{o1:.3f}</b>. Up to injury = F(2 − 0.5) = {o2:.3f}.</li><li>Injury = {o2:.3f} − {o1:.3f} = <b>{o2 - o1:.3f}</b>. Fatal = 1 − {o2:.3f} = <b>{1 - o2:.3f}</b>.</li></ol>", "amber")}
{fig(f_ord(), "Figure 9 — what to notice: one bump, two cuts. Raising the score slides the whole bump to the right, so the lowest level always shrinks and the highest always grows.")}
{box("SIMPLE CALCULATION 4 — mixed logit and latent class logit", f"<ol><li><b>Mixed.</b> Two equally common kinds of people with scores −1 and 2 (mean 0.5). Probabilities {L_(-1):.3f} and {L_(2):.3f}; average <b>{mx:.3f}</b>. A fixed-parameter logit at the mean score gives {L_(0.5):.3f}. Averaging probabilities is not the same as averaging scores.</li><li><b>Latent class.</b> Class A: 60% of crashes, severe-outcome probability 0.10. Class B: 40%, probability 0.40. Overall = 0.60 × 0.10 + 0.40 × 0.40 = <b>0.22</b>.</li></ol>", "plum")}
<p>Recent papers often use the mixed logit with <b>heterogeneity in means and variances</b>: the centre and the spread of a random effect are allowed to depend on other variables. <b>Correlated random parameters</b> let two random effects move together.</p>
{box("TRAP", "The ordered model looks like the natural choice for severity, but it forces a variable to push every level in one direction. An airbag that lowers fatalities and raises minor injuries cannot be described by it. That is one reason the multinomial family stays popular.", "rust")}
{box("PICTURE THIS — the Logit Hotel, six floors", "<ol start='0'>" + "".join(f"<li><b>{a}</b> ({m}). {t}</li>" for a, m, t in HOTEL) + "</ol>The road trip holds the seven concepts; the hotel holds the models. Climb it floor by floor: each floor adds one thing to the floor below.", "violet")}
{box("TRY IT NOW (4 minutes)", "<b>8.</b> Scores are 0, 1 and −1. What is the multinomial-logit probability of the second outcome?<br><b>9.</b> Thresholds 0 and 2, score 1: what is the ordered-logit probability of the highest level?<br><b>10.</b> 70% of crashes are in a class with probability 0.05, 30% in a class with 0.50. Overall probability?", "grey")}</div>"""

# ---------------------------------------------------------------- part 3: a full study
def _p3(r, f, a):
    si = -0.7 + 0.8 * r + 0.3 * f + 0.4 * a; sf = -2.6 + 1.4 * r + 0.9 * f + 0.5 * a; w = [1, math.exp(si), math.exp(sf)]; return w[2] / sum(w)
am = [_p3(1, f, a) - _p3(0, f, a) for f, a in ((0, 0), (1, 0), (1, 1))]; assert [round(v, 3) for v in am] == [0.078, 0.131, 0.144]
rp1 = 1 - norm.cdf(0.8 / 0.7); rp2s = 0.7 * math.exp(0.5); rp2 = 1 - norm.cdf(0.2 / rp2s); assert round(rp1, 3) == 0.127 and round(rp2, 3) == 0.431
c14, c10, c12, c2 = (chi2.ppf(0.95, k) for k in (14, 10, 12, 2))
PART3 = f"""<div class="section"><div class="band" style="background:{COL["teal"]}"><h2>Part 3 · A full severity study, step by step</h2><span class="prog">Ten steps</span></div>
{box("HOOK", "Nine models and forty-two statistical tests sound like a mountain. It is one small recipe, repeated: fit a model to one slice of the data, then ask whether another slice could have used the same model.", "teal")}
<p>Many recent papers split crashes by place and by year, fit a random-parameters logit to each part, and test whether the parts can share a model. This part follows such a study: truck crashes, three severity levels (property damage only, injury, fatal), three road classes and three years. <b>All numbers are invented.</b></p>
<table><tr><th>Step</th><th>What happens</th><th>Tool</th></tr>
<tr><td>1 Code</td><td>Categories become 0/1 indicators; one base category per variable</td><td>—</td></tr>
<tr><td>2 Split</td><td>3 road classes × 3 years = 9 subsets</td><td>chi-square test</td></tr>
<tr><td>3 Multinomial logit</td><td>Property damage only is the base outcome</td><td>Part 2</td></tr>
<tr><td>4 Select</td><td>Backward selection; keep a variable if |t| ≥ 1.645</td><td>t-statistic</td></tr>
<tr><td>5 Random parameters</td><td>Heterogeneity in means and variances</td><td>formula (7)</td></tr>
<tr><td>6 Estimate</td><td>Simulated maximum likelihood; 200 Halton draws to search, 1,000 for final models</td><td>concept 2</td></tr>
<tr><td>7 Interpret</td><td>Average marginal effects</td><td>formula (8)</td></tr>
<tr><td>8 Transfer</td><td>Likelihood ratio tests between road classes; merge test</td><td>formulas (9), (10)</td></tr>
<tr><td>9 Stability</td><td>Likelihood ratio tests between years; partially constrained model</td><td>formula (11)</td></tr>
<tr><td>10 Predict</td><td>Out-of-sample prediction</td><td>—</td></tr></table>
{box("STEPS 1–2 — indicators and the chi-square test", f"<ol><li><b>Coding.</b> Season has four categories. Choose summer as base and create Winter, Spring, Autumn. A spring crash is 0, 1, 0; a summer crash is 0, 0, 0.</li><li><b>Chi-square.</b> Expressway: 400 property damage only, 150 injury, 50 fatal. Other roads: 300, 200, 100. If road class made no difference, each row would be 350, 175, 75.</li><li>(observed − expected)² ÷ expected: 50² ÷ 350 = 7.14; 25² ÷ 175 = 3.57; 25² ÷ 75 = 8.33; the same again for row two. χ² = <b>38.10</b>.</li><li>Degrees of freedom (2 − 1) × (3 − 1) = 2; critical value {c2:.2f}. 38.10 is far larger: the severity mix differs.</li></ol>", "teal")}
{box("STEP 4 — the t-statistic", "<ol><li>t = estimate ÷ standard error. Coefficient 0.84, standard error 0.35: t = <b>2.40</b> ≥ 1.645, keep.</li><li>Coefficient −0.21, standard error 0.18: |t| = <b>1.17</b> &lt; 1.645, candidate for removal.</li><li>Backward selection removes the weakest variable, estimates again, and repeats. One at a time, because the other t-values change after each removal.</li></ol>", "teal")}
<p><b>Step 5.</b> A random parameter with heterogeneity in its mean and variance is written</p>
{formula("β<sub>n</sub> = β + Θ × Z<sub>n</sub> + σ × e<sup>ω × W<sub>n</sub></sup> × (standard normal draw)", 7)}
<p>β is the mean and σ the spread. Θ slides the mean for crashes where indicator Z = 1. ω stretches or shrinks the spread for crashes where W = 1. A parameter is kept as random only if σ is significant and a likelihood ratio test favours the random-parameter model.</p>
{box("STEP 5 — by hand", f"<ol><li>Rollover in the fatal function: β = −0.8, σ = 0.7. Bad weather shifts the mean (Θ = 0.6) and the spread (ω = 0.5).</li><li>Clear weather: mean −0.8, spread 0.7. Positive effect in 1 − Φ(0.8 ÷ 0.7) = <b>{rp1 * 100:.1f}%</b> of crashes.</li><li>Bad weather: mean = −0.8 + 0.6 = −0.2; spread = 0.7 × e<sup>0.5</sup> = <b>{rp2s:.2f}</b>. Positive in 1 − Φ(0.2 ÷ {rp2s:.2f}) = <b>{rp2 * 100:.1f}%</b>.</li></ol>", "teal")}
{fig(f_rp(), "Figure 10 — what to notice: bad weather slides the curve to the right (Θ) and widens it (ω). The share right of zero rises from 13% to 43%.")}
{formula("average marginal effect = average over crashes of [ P(outcome | indicator = 1) − P(outcome | indicator = 0) ]", 8)}
{box("STEP 7 — by hand", f"<ol><li>Coefficients (invented). Injury: −0.7, rollover +0.8, 140 km/h +0.3, bad weather +0.4. Fatal: −2.6, +1.4, +0.9, +0.5.</li><li>Crash A (120 km/h, clear): fatal with rollover {_p3(1, 0, 0):.3f}, without {_p3(0, 0, 0):.3f}; change <b>+{am[0]:.3f}</b>.</li><li>Crash B (140 km/h, clear): {_p3(1, 1, 0):.3f} − {_p3(0, 1, 0):.3f} = <b>+{am[1]:.3f}</b>. Crash C (140 km/h, bad weather): {_p3(1, 1, 1):.3f} − {_p3(0, 1, 1):.3f} = <b>+{am[2]:.3f}</b>.</li><li>Average = <b>{sum(am) / 3:.3f}</b>: a rollover raises the fatal probability by about 11.8 percentage points.</li></ol>", "teal")}
<p><b>Steps 8 and 9</b> use one idea four times. LL is the log-likelihood; K is a number of parameters.</p>
{formula("transfer:   χ² = −2 × [ LL(A’s parameters on B’s data) − LL(B’s own model) ]", 9)}
{formula("merge:   χ² = −2 × [ LL(pooled) − LL(class 1) − LL(class 2) ]", 10)}
{formula("constrained:   χ² = −2 × [ LL(constrained) − Σ LL(each year) ]", 11)}
<p>Degrees of freedom: (9) the number of parameters in model A; (10) K<sub>1</sub> + K<sub>2</sub> − K<sub>pooled</sub>; (11) the parameters saved, Σ K<sub>year</sub> − K<sub>constrained</sub>.</p>
{box("STEPS 8–9 — by hand", f"<ol><li><b>Transfer.</b> Expressway parameters (K = 14) on dual-carriageway data: −612.4. Dual’s own model: −588.1. χ² = −2 × (−24.3) = <b>48.6</b> &gt; {c14:.2f}: not transferable.</li><li><b>Merge.</b> Pooled −1,105.0 (K = 15); dual −640.2 (13); single −447.5 (12). χ² = −2 × (−17.3) = <b>34.6</b>; d.f. = 10; critical {c10:.2f}: model them separately.</li><li><b>Constrained.</b> Three yearly models, 40 parameters, LL sum −1,631.5. Constrained model: 28 parameters, −1,640.0. χ² = −2 × (−8.5) = <b>17.0</b>; d.f. = 12; critical {c12:.2f}: <i>not</i> rejected. The 6 effects held equal are the temporally stable ones.</li><li><b>Counting.</b> Between classes: 3 pairs × 2 directions × 3 years = 18. Between years: 3 pairs × 2 × 3 classes = 18. Merge: 3. Constrained: 3. Total <b>42</b>.</li></ol>", "teal")}
{fig(f_chi(), "Figure 11 — what to notice: the transfer statistic, 48.6, lies far inside the rejection region that starts at 23.68.")}
{box("TRAP", "A <i>rejected</i> transferability test is the interesting result: the models differ. For the partially constrained model it is the other way round: <i>not</i> rejecting is the good news, because it means the simpler model with shared parameters is acceptable.", "rust")}
{box("STEP 10 — prediction", "A model estimated on one year is applied to 500 crashes from the next. Predicted: 320 property damage only, 150 injury, 30 fatal. Observed: 300, 155, 45. It under-predicts fatal crashes by a third (30 against 45), which is what an unstable model looks like in practice.", "teal")}
{box("PICTURE THIS — the detective’s ten-room office", "<b>1</b> a clerk stamps every record 0 or 1 · <b>2</b> a butcher cuts the files into nine piles · <b>3</b> the balloon buffet is served · <b>4</b> a bouncer with 1.645 on his shirt throws out the weakest guest, one at a time · <b>5</b> two bells, teal and amber, slide and stretch when the weather turns · <b>6</b> the robot Halton throws 200 darts, then 1,000 · <b>7</b> a light switch is flipped for every guest and the average flicker written down · <b>8</b> a tailor tries one road’s suit on another road · <b>9</b> a judge chains together the calendar pages that match · <b>10</b> a fortune teller is tested on next year’s newspaper.", "violet")}
{box("TRY IT NOW (4 minutes)", "<b>11.</b> Random against fixed: LL(fixed) = −598.3, LL(random) = −591.0, 2 extra parameters, critical value 5.99. Keep the random parameters?<br><b>12.</b> A random parameter has β = 0.4, σ = 0.5; for night crashes Θ = −0.6 and ω = 0. What are the mean and spread at night, and for what share of night crashes is the effect positive?<br><b>13.</b> With 2 road classes and 4 years, how many between-year tests are there (both directions)?", "grey")}</div>"""

# ---------------------------------------------------------------- part 4: deeper foundations and current research
llr = 75 * math.log(.375) + 125 * math.log(.625); llu = 30 * math.log(.3) + 70 * math.log(.7) + 45 * math.log(.45) + 55 * math.log(.55); lrs = -2 * (llr - llu)
assert round(llr, 2) == -132.31 and round(llu, 2) == -129.90 and round(lrs, 2) == 4.82
aicA, aicB, bicA, bicB = 4 - 2 * llu, 2 - 2 * llr, 2 * math.log(200) - 2 * llu, math.log(200) - 2 * llr
RECENT = [r for r in REFS if r.get("kind") == "recent"]
PART4 = f"""<div class="section"><div class="band" style="background:{COL["plum"]}"><h2>Part 4 · Foundations and current research</h2><span class="prog">Logit · likelihood · literature</span></div>
{box("HOOK", "Adding a parameter to a model can never make it fit worse. So “my bigger model fits better” proves nothing. The whole craft is in asking: better <i>by more than luck</i>?", "plum")}
<h3>A. The logit, from odds</h3>
<p>The same chance can be written three ways. <b>Probability</b> 0.20. <b>Odds</b>, injuries against non-injuries: 0.20 ÷ 0.80 = 0.25. <b>Log-odds</b>: ln(0.25) = −1.39. A model adds things up, and a sum can be any number; only log-odds can be any number. So the model’s score <i>is</i> the log-odds. That is all “logit” means.</p>
{formula("ln( p ÷ (1 − p) ) = score     ⇔     p = 1 ÷ (1 + e<sup>−score</sup>)", 12)}
{box("BY HAND — what a coefficient does", f"<ol><li>Start: probability 0.20, odds 0.25, log-odds −1.386.</li><li>A variable with coefficient +1.6 applies: log-odds = −1.386 + 1.6 = <b>0.214</b>.</li><li>Odds = e<sup>0.214</sup> = <b>1.238</b>, which is 0.25 × e<sup>1.6</sup> = 0.25 × 4.953. The coefficient multiplies the odds by e<sup>1.6</sup>: the <b>odds ratio</b>.</li><li>Probability = 1.238 ÷ 2.238 = <b>0.553</b>. The same coefficient would move a starting probability of 0.90 only to 0.98: the change in probability depends on where you start.</li></ol>", "plum")}
<h3>B. Likelihood and log-likelihood</h3>
<p>The <b>likelihood</b> is the probability the model gave to what actually happened, multiplied over all crashes. The <b>log-likelihood</b> (LL) is its logarithm: a sum in place of a product. It is always negative, closer to zero is better, and it can only be compared between models fitted to the same data.</p>
{box("BY HAND", "<ol><li>Three crashes; the model says injury probabilities 0.8, 0.6, 0.3. What happened: injury, injury, no injury.</li><li>Likelihood = 0.8 × 0.6 × (1 − 0.3) = <b>0.336</b>.</li><li>Log-likelihood = ln(0.8) + ln(0.6) + ln(0.7) = −0.223 − 0.511 − 0.357 = <b>−1.091</b>.</li><li>A know-nothing model (0.5 each): 3 × ln(0.5) = <b>−2.079</b>. Further from zero, so worse.</li></ol>", "plum")}
<h3>C. The likelihood ratio test</h3>
<p>Two models, same data. The <b>restricted</b> one is simpler (parameters forced to zero or to be equal); the <b>unrestricted</b> one is free.</p>
<p><b>Restrictions are locks.</b> The unrestricted model is free to choose every parameter. The restricted model is the <i>same</i> model with some parameters locked: set to zero, set equal to each other, or fixed at values borrowed from another model. It is a special case of the free model (the two are <i>nested</i>), so the free model always fits at least as well. The test asks whether the locks cost more fit than chance alone would explain. <b>Degrees of freedom = number of locks.</b></p>
{fig(f_locks(), "Figure 12 — what to notice: merging two road classes locks three parameters of the second class to equal those of the first. Three locks, three degrees of freedom.", True)}
<table><tr><th>Kind of lock</th><th>Example question</th><th>Locks</th></tr>
<tr><td>= 0</td><td>Does adverse weather matter?</td><td>1 coefficient</td></tr>
<tr><td>= 0</td><td>Should two effects be random parameters?</td><td>2 spreads</td></tr>
<tr><td>= each other</td><td>Can two road classes share a model?</td><td>K<sub>1</sub> + K<sub>2</sub> − K<sub>pooled</sub></td></tr>
<tr><td>= each other</td><td>Is an effect the same in three years?</td><td>2 per effect held equal</td></tr>
<tr><td>= borrowed values</td><td>Does model A describe data B?</td><td>all K parameters of A</td></tr></table>
{formula("statistic = −2 × [ LL(restricted) − LL(unrestricted) ]", 13)}
<p>If the restriction is true, the statistic follows a <b>chi-square distribution</b> whose <b>degrees of freedom</b> equal the number of parameters removed. The <b>critical value</b> is the point chance alone exceeds only 5% of the time. Above it: reject the restriction.</p>
{box("BY HAND — does a seat belt matter?", f"<ol><li>100 belted crashes, 30 injuries. 100 unbelted crashes, 45 injuries.</li><li>Restricted (one share, 75 ÷ 200 = 0.375): LL = 75 × ln(0.375) + 125 × ln(0.625) = <b>{llr:.2f}</b>.</li><li>Unrestricted (0.30 and 0.45): LL = 30 × ln(0.30) + 70 × ln(0.70) + 45 × ln(0.45) + 55 × ln(0.55) = <b>{llu:.2f}</b>.</li><li>Statistic = −2 × [{llr:.2f} − ({llu:.2f})] = <b>{lrs:.2f}</b>. One extra parameter: 1 degree of freedom; critical value {chi2.ppf(.95, 1):.2f}.</li><li>{lrs:.2f} &gt; {chi2.ppf(.95, 1):.2f}: reject. The groups differ by more than chance explains (p = {1 - chi2.cdf(lrs, 1):.3f}).</li></ol>", "plum")}
{fig(f_sim(), "Figure 13 — what chance alone looks like. Even when the restriction is true, the free model fits a little better by luck, so the statistic is never exactly zero. The pile is the chi-square distribution; the share beyond your statistic is the p-value (here about 3%). At 99% confidence (critical value 6.63) the same data would not reject.")}
{box("TRAP", "“Not rejected” does not prove the simpler model is true; the data just cannot tell the two apart. And with tens of thousands of crashes, tiny differences become “significant”: check the marginal effects to see whether a difference matters. Run forty tests at 95% and about two false alarms are expected.", "rust")}
<table><tr><th>Yardstick</th><th>Formula</th><th>Seat-belt example</th></tr>
<tr><td>AIC (lower is better)</td><td>2 × K − 2 × LL</td><td>two shares {aicA:.2f}; one share {aicB:.2f} → prefers two</td></tr>
<tr><td>BIC (lower is better)</td><td>K × ln(N) − 2 × LL</td><td>two shares {bicA:.2f}; one share {bicB:.2f} → prefers one</td></tr></table>
<p class="small">K = parameters, N = observations. The two can disagree when evidence is borderline: BIC charges more per parameter.</p>
<table><tr><th>Six uses in severity papers</th><th>Restricted</th><th>Unrestricted</th><th>“Rejected” means</th></tr>
<tr><td>Do random parameters help?</td><td>fixed</td><td>random</td><td>keep them</td></tr>
<tr><td>Transferability</td><td>A’s parameters on B</td><td>B’s own model</td><td>not transferable</td></tr>
<tr><td>Merge two groups</td><td>pooled</td><td>separate</td><td>keep separate</td></tr>
<tr><td>Global temporal test</td><td>all years pooled</td><td>one model per year</td><td>not stable</td></tr>
<tr><td>Pairwise temporal test</td><td>one year’s parameters on another</td><td>that year’s model</td><td>these two years differ</td></tr>
<tr><td>Partially constrained</td><td>some effects equal across years</td><td>yearly models</td><td>free some constraints</td></tr></table>
{box("PICTURE THIS — the courtroom of Judge Chi", "Two tailors bring suits for the same customer: a plain one (restricted) and one with extra pockets (unrestricted). Judge Chi measures how much better the fancy suit fits, doubles it, and holds it against a ruler with one notch per extra pocket (degrees of freedom). Past the red notch, the pockets are worth it.", "violet")}
<h3>D. What current research is doing</h3>
<p class="small muted">Eight recent papers from <i>Analytic Methods in Accident Research</i>, checked in November 2026. Summaries follow the published abstracts; read the papers before citing them.</p>
<table><tr><th>Theme</th><th>Paper</th><th>In plain words</th></tr>
{"".join(f"<tr><td>{dict(time='Time', groups='Groups', learning='Machine learning', conflicts='Conflicts', practice='Good practice')[r['theme']]}</td><td>{esc(r['authors'].split(',')[0])} et al. ({r['year']})</td><td>{esc(r['plain'])}</td></tr>" for r in sorted(RECENT, key=lambda r: ['time', 'groups', 'learning', 'conflicts', 'practice'].index(r['theme'])))}</table>
{box("STILL OPEN", "<ul><li><b>Time:</b> do effects that look stable over three years stay stable when a fourth is added?</li><li><b>Groups:</b> do data-driven groups beat road class or region, and are they stable from year to year?</li><li><b>Machine learning:</b> how to get trustworthy variable effects from a prediction machine.</li><li><b>Conflicts:</b> how much video is enough, and how to set the threshold without guesswork.</li><li><b>Practice:</b> a shared standard for marginal effects and out-of-sample checks.</li></ul>", "plum")}
{box("SIX STARTER QUESTIONS FOR A FIRST PROJECT (suggestions, not findings)", "<ol><li><b>Add a year.</b> Extend a published design by one year; are the “stable” effects still stable?</li><li><b>Cluster first.</b> Split the same crashes by road class, by clustering and by hidden classes; compare fit.</li><li><b>Machine against model.</b> Same crashes, a random parameters logit and a classifier: do they agree on the direction of each effect?</li><li><b>Transfer across regions.</b> Does a model from one region fit another?</li><li><b>How fragile is the threshold?</b> Re-estimate conflict-based crash risk for several thresholds and sample sizes.</li><li><b>Report it twice.</b> Compute marginal effects by two methods and show where they differ.</li></ol>", "teal")}
{box("TRY IT NOW (4 minutes)", "<b>14.</b> A probability is 0.50 and a coefficient of −1.1 applies. New probability?<br><b>15.</b> LL(restricted) = −412.6, LL(unrestricted) = −407.1, 3 parameters removed, critical value 7.81. Verdict?<br><b>16.</b> Model A: LL = −407.1, K = 9. Model B: LL = −412.6, K = 6. Which has the lower AIC?", "grey")}</div>"""

MASTER = f'''<div class="section"><h2>Master mind map</h2>
{fig(mindmap("Crash-data methods", [
 ("1 Heterogeneity", ["27% positive"]), ("2 Simulation", ["4 draws → 0.605"]), ("3 Endogeneity", ["+100% seen, −20% true"]), ("4 Space and time", ["100 obs. worth 18"]), ("5 Instability", ["60 against 21.03"]), ("6 Causality", ["2.8 seen, 2 true"]), ("7 Conflicts", ["1 per 10,100"])], "navy"), "Figure 14 — master mind map with one number per idea.", True)}
<h3>Things students confuse</h3>
<table><tr><th>Pair</th><th>The one fact that separates them</th></tr>
<tr><td>Heterogeneity and endogeneity</td><td>Heterogeneity: the <i>effect</i> differs across people. Endogeneity: the <i>variable itself</i> is tangled with hidden causes.</td></tr>
<tr><td>Temporal correlation and temporal instability</td><td>Correlation: leftovers are alike from year to year. Instability: the effects change.</td></tr>
<tr><td>Mixing distribution and Halton draws</td><td>The mixing distribution is the shape assumed for the effects. Halton draws are a way of sampling from it.</td></tr>
<tr><td>Prediction and causality</td><td>Prediction: what will happen. Causality: what would happen if I changed something.</td></tr>
<tr><td>Conflict and crash</td><td>A conflict is a near miss (time-to-collision small). A crash is time-to-collision zero.</td></tr>
<tr><td>Random parameter and latent class</td><td>Random parameter: effects vary smoothly. Latent class: a few hidden groups, one effect each.</td></tr></table>
<h3>Real data have several at once</h3><p>One data set can contain varying effects, self-selected drivers, related neighbours and drifting parameters together. Mannering and Bhat (2014) noted that few studies address several of these in one model, and much current work aims at exactly that.</p></div>'''

scenes = ["One door, every customer leaves in a different costume; the rail is bell-shaped.", "A gambler’s darts clump; the robot Halton fills the gaps and is right after four.", "Signs sprout only above the sleeping ice troll; the tourist blames the signs.", "100 doors, each repeating the neighbour; 18 opinions in your notebook.", "Numbers slide down the tower; the judge weighs two calendars: 60 beats 21.", "The fortune teller forecasts, the mechanic asks why; only daredevils drive.", "200 pings; pull the dragon’s thinning tail to the red zero."]
ROUTE = f'''<div class="section"><h2>The route: the crash investigator’s road trip</h2>
<p>Memory works best with places and strange pictures. The seven ideas sit at seven stops along one road, in the order you learned them.</p>
{fig(route_map(STOPS, "The crash investigator’s road trip", color="navy"), "Figure 15 — seven stops, one per concept.", True)}
<div class="cols">{"".join(f"<p><b>{i + 1}. {STOPS[i]}.</b> {s}</p>" for i, s in enumerate(scenes))}</div>
{box("WALK-THROUGH DRILL", "Close the guide. Drive the route in your head and at each stop say the idea and its number: 27%, 0.605, +100% against −20%, 18, 60 against 21, 2.8 against 2, 1 per 10,100. Then drive it backwards from the arcade.", "navy")}</div>'''

QUIZ = f'''<div class="section"><h2>Quiz</h2><p class="small muted">Warm-up 1–4 · Core 5–10 · Challenge 11–13. Answers follow the cheat sheet.</p>
<div class="q"><b>1.</b> A fixed-parameter model assumes: (a) effects change over time (b) one effect for every observation (c) no missing data (d) normal errors.</div>
<div class="q"><b>2.</b> Halton draws are used because they: (a) are more random (b) cover the range more evenly (c) remove endogeneity (d) need no computer.</div>
<div class="q"><b>3.</b> Which is the extreme case of a traffic conflict? (a) a long queue (b) time-to-collision of zero (c) a speeding vehicle (d) a red-light violation.</div>
<div class="q"><b>4.</b> Label the seven stops of the route from memory.{fig(route_map(STOPS, "Fill in the stops", blank=True, color="navy"), "", True)}</div>
<div class="q"><b>5.</b> A random parameter is normal with mean 0.3 and standard deviation 0.6. What share of people have a negative effect?</div>
<div class="q"><b>6.</b> Draws of β: −1.0, 0, 0.5, 1.5. Compute the simulated probability with P = 1 ÷ (1 + e<sup>−β</sup>).</div>
<div class="q"><b>7.</b> 200 observations in clusters of 5 with ρ = 0.25. Effective sample?</div>
<div class="q"><b>8.</b> LL(pooled) = −980; periods −470 and −495; 10 parameters; critical value 18.31. Compute the statistic and decide.</div>
<div class="q"><b>9.</b> Name the issue: police patrols are assigned to high-crash roads, and a model finds patrols raise crashes.</div>
<div class="q"><b>10.</b> Name the issue: the sign of “night-time” differs between a 2015–2018 model and a 2021–2024 model.</div>
<div class="q"><b>11.</b> 600 experienced drivers crash on 0.2% of day trips and 0.4% of night trips; 400 novices on 0.6% and 1.2%. 75% of novices avoid the night. What night-to-day ratio do the data show, and why is it below 2?</div>
<div class="q"><b>12.</b> 150 of 10,000 interactions fall below a 2.0 s threshold; mean excess 0.4 s. Estimate the crash probability as “1 per …”.</div>
<div class="q"><b>13.</b> A study uses machine learning to rank sites by expected crashes and then recommends lowering speed limits because “speed limit” was the most important feature. Which two ideas from this guide should make you cautious, and why?</div>
<table><tr><th>If you missed</th><th>Reread</th></tr><tr><td>1, 5</td><td>Concept 1</td></tr><tr><td>2, 6</td><td>Concept 2</td></tr><tr><td>9</td><td>Concept 3</td></tr><tr><td>7</td><td>Concept 4</td></tr><tr><td>8, 10</td><td>Concept 5</td></tr><tr><td>11, 13</td><td>Concept 6</td></tr><tr><td>3, 12</td><td>Concept 7</td></tr><tr><td>4</td><td>The route</td></tr></table>
<h3>Consolidate</h3><ul><li><b>Build it (15 min).</b> Invent your own endogeneity example: two groups of sites, a treatment given only to the riskier group, and a true effect. Compute the naive comparison. Self-check: if you give the treatment to both groups in equal proportion, the naive comparison must equal the true effect.</li><li><b>Teach it (10 min).</b> Explain to a 14-year-old why warning signs seem to cause crashes, without the words endogenous, variable, bias or correlation.</li></ul></div>'''

cues = ["costume shop, bell-shaped rail", "dart casino, the robot Halton", "icy bridge, the hidden troll", "gossip street, 100 doors, 18 opinions", "melting clock, judge with two calendars", "fortune teller and mechanic", "arcade, dragon’s tail to zero"]
def cb(i, t): return f'<div class="box" style="background:{SOFT[C[i]]};border-color:{COL[C[i]]}"><span class="tag" style="color:{COL[C[i]]}">{i + 1} · {NAMES[i].upper()}</span>{t}<br><i>Route: {cues[i]}</i></div>'
CHEAT = f'''<div class="section cheat"><h2>One-page cheat sheet</h2><div class="cols">
{cb(0, "Effects differ across people for unrecorded reasons. <span class='math'>β<sub>i</sub> = β + σ × draw</span>. Mixing distributions: normal, lognormal (one sign), triangular, uniform. Share with opposite sign: standardise zero.")}
{cb(1, "No exact formula, so average P over R draws, then maximise. Halton draws fill gaps evenly (½, ¼, ¾, ⅛ …) and need fewer draws. Check by doubling R.")}
{cb(2, "Hidden cause drives both the variable and the outcome (ice → sign, ice → crashes; careful drivers → airbags). Plain comparison biased. Cures: instruments, control functions, joint models.")}
{cb(3, "Neighbours and consecutive years share unrecorded factors. Design effect <span class='math'>1 + (m − 1)ρ</span>; effective sample = n ÷ design effect. Ignoring it: false confidence, possible bias.")}
{cb(4, "Effects change between periods. Statistic <span class='math'>−2[LL<sub>pooled</sub> − ΣLL<sub>separate</sub>]</span>, chi-square, degrees of freedom = extra parameters.")}
{cb(5, "Prediction: what will happen. Causality: what if I change it. Self-selection separates them. Machine learning predicts; models handling concepts 1 and 3 explain.")}
{cb(6, "Conflict = measurable near miss. Time-to-collision, post-encroachment time. Extreme value theory: fit the tail, extend to zero. <span class='math'>p = share × e<sup>−u ÷ excess</sup></span> (simplest tail).")}
<div class="box" style="background:#fff"><span class="tag">MODELS (LOGIT HOTEL)</span>Binary: 1 ÷ (1 + e<sup>−score</sup>) · Multinomial: e<sup>score</sup> ÷ total · Nested: cousins share · Ordered: one score, thresholds · Mixed: average over people · Latent class: hidden groups</div>
<div class="box" style="background:#fff"><span class="tag">WORKED NUMBERS TO REMEMBER</span>N(−0.5, 0.8) → 27% positive<br>−0.2, 0.3, 0.6, 1.1 → 0.605<br>8 against 4 → +100% seen, −20% true<br>100 obs., m = 10, ρ = 0.5 → 18<br>−2[−1,250 − (−1,220)] = 60 &gt; 21.03<br>3.5% ÷ 1.25% = 2.8, truth 2<br>0.04 × e<sup>−6</sup> → 1 per 10,100</div></div></div>'''

q5 = norm.cdf(-0.5); q6 = sum(logit(b) for b in (-1, 0, .5, 1.5)) / 4; q11n = (600 * .004 + 100 * .012) / 700; q11d = (600 * .002 + 400 * .006) / 1000; q12 = 0.015 * math.exp(-5)
t6 = ((250 * .01 + 500 * .04) / 750) / clear
KEY = f'''<div class="section key" style="font-size:9.5pt;line-height:1.34"><h2>Answer key</h2><h3>Try it now</h3><ol>
<li>z = (0 − 0.5) ÷ 1.0 = −0.5; share below = <b>{t1:.3f}</b>, about 31%.</li>
<li>P(0) = 0.500, P(1) = {logit(1):.3f}; average = <b>{t2:.3f}</b>.</li>
<li>Camera sites: 12 × 0.75 = 9. Plain comparison 9 ÷ 5 = 1.8: cameras appear to raise crashes by <b>80%</b>; the truth is −25%.</li>
<li>Design effect = 1 + 3 × 0.5 = 2.5; 60 ÷ 2.5 = <b>{t4:.0f}</b>.</li>
<li>Separate: −492. Statistic = −2 × [−500 − (−492)] = <b>16</b>. 16 &gt; {crit8:.2f}, so stability is rejected, though not by much.</li>
<li>Snow: 250 cautious and 500 risk-takers. 250 × 1% + 500 × 4% = 22.5 per 750 = 3.0%. Ratio 3.0 ÷ 1.25 = <b>{t6:.1f}</b>.</li>
<li>Share = 0.02; e<sup>−2.0 ÷ 0.5</sup> = e<sup>−4</sup> = {math.exp(-4):.4f}; p = {t7:.6f}, about <b>1 per {round(1 / t7, -2):,.0f}</b>.</li><li>Weights 1, 2.718, 0.368; total 4.086; <b>0.665</b>.</li><li>1 − F(2 − 1) = 1 − 0.731 = <b>0.269</b>.</li><li>0.035 + 0.150 = <b>0.185</b>.</li><li>χ² = −2 × (−598.3 + 591.0) = <b>14.6</b> &gt; 5.99: keep them.</li><li>Mean 0.4 − 0.6 = <b>−0.2</b>; spread 0.5 × e<sup>0</sup> = <b>0.5</b>; positive share = 1 − Φ(0.4) = <b>34%</b>.</li><li>6 pairs of years × 2 directions × 2 classes = <b>24</b>.</li><li>Log-odds 0 − 1.1 = −1.1; p = 1 ÷ (1 + e<sup>1.1</sup>) = <b>0.25</b>.</li><li>−2 × (−412.6 + 407.1) = <b>11.0</b> &gt; 7.81: reject the restriction.</li><li>A: 18 + 814.2 = <b>832.2</b>; B: 12 + 825.2 = 837.2. A is lower.</li></ol>
<h3>Quiz</h3><ol>
<li><b>(b)</b>.</li><li><b>(b)</b>.</li><li><b>(b)</b>.</li><li>Costume shop, dart casino, icy bridge, gossip street, melting clock tower, fortune teller and mechanic, near-miss arcade.</li>
<li>z = −0.5; <b>{q5 * 100:.0f}%</b>.</li>
<li>0.269 + 0.500 + 0.622 + 0.818 = 2.209; ÷ 4 = <b>{q6:.3f}</b>.</li>
<li>Design effect 2; <b>100</b>.</li>
<li>−2 × [−980 − (−965)] = <b>30</b> &gt; 18.31: not stable.</li>
<li>Endogeneity: patrols respond to crash risk.</li><li>Temporal instability.</li>
<li>Day: 3.6 per 1,000 = 0.36%. Night: 2.4 + 1.2 = 3.6 per 700 = {q11n * 100:.3f}%. Ratio <b>{q11n / q11d:.2f}</b>. The high-risk group left the road at night, so the night sample is safer than the day sample.</li>
<li>0.015 × e<sup>−5</sup> = {q12:.6f}, about <b>1 per {round(1 / q12, -2):,.0f}</b>.</li>
<li>Prediction versus causality: feature importance in a forecasting model is not the effect of changing the feature. Endogeneity: speed limits are set in response to road type and risk, so the limit is tangled with hidden causes.</li></ol>
<p><span class="cb"></span>Today: read and do every Try it now. <span class="cb"></span>Day 1: drive the route from memory. <span class="cb"></span>Day 3: quiz 1–10. <span class="cb"></span>Day 7: quiz 11–13 and the website’s practice page. <span class="cb"></span>Day 14: explain all seven ideas aloud.</p>
<h3>References</h3>
{"".join(f'<p style="font-size:9pt;margin:2pt 0">{esc(r["authors"])} ({r["year"]}). {esc(r["title"])}. <i>{esc(r["journal"])}</i>{" " + r["volume"] + "," if r["volume"] else ","} {r["pages"]}.</p>' for r in REFS)}
<p class="small muted">Examples attributed to a paper (ice-warning signs, side airbags, drivers avoiding snow) come from that paper. All numbers, and the simplified formulas (3) and (5), are teaching devices chosen for this guide.</p></div>'''

BODY = MAP + "".join(S) + PART2 + PART3 + PART4 + MASTER + ROUTE + QUIZ + CHEAT + KEY
build(COVER, BODY, OUT, "Methods in accident research · study guide for beginners")
