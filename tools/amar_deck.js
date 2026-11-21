// Builds docs/materials/AMAR_Methods_Presentation.pptx. Shapes added after g(s, k) appear on the k-th click (see add_clicks.py).
const { make, HEX } = require("./deck_lib.js");
const H = make("Methods in Accident Research for Beginners", "AMAR Methods Learning · numbers in examples are illustrative");
const { pres, C } = H; const F = n => __dirname + "/figs/" + n + ".png";
const SA = "Why methods matter", SB = "Seven ideas", SC = "The model family", SD = "Remember and practise";
const SITE = "https://smrahmanbd.github.io/AMAR-Methods-Learning/";
let s, uid = 0;
const g = (sl, k) => { sl._g = k; };
function slide(sec, title, notes, master) {
  const sl = H.slide(sec, title, notes, master);
  ["addText", "addShape", "addImage"].forEach(fn => { const o = sl[fn].bind(sl); sl[fn] = (a, b) => { if (sl._g) { if (fn === "addImage") a = Object.assign({}, a, { objectName: `c${sl._g}_${++uid}` }); else if (!(b && b.placeholder)) b = Object.assign({}, b, { objectName: `c${sl._g}_${++uid}` }); } return o(a, b); }; });
  return sl;
}
const img = (sl, n, x, y, w, ratio, alt) => sl.addImage({ path: F(n), x, y, w, h: w / ratio, altText: alt });
const hdr = { bold: true, color: HEX.lt1, fill: { color: HEX.dk1 } };
const tbl = { fontSize: 15, color: HEX.dk1, border: { type: "solid", color: "D9D5C8", pt: 0.75 }, valign: "middle", fontFace: "Calibri" };

function idea(n, name, title, fig, ratio, alt, sentence, calcTitle, calc, stop, scene, notes) {
  const sl = slide(SB, title, notes);
  img(sl, fig, 0.6, 1.55, 6.5, ratio, alt);
  H.card(sl, 0.6, 4.75, 6.5, 1.85, n + " · " + name, sentence, C.accent1, { bodySize: 16 });
  g(sl, 1); H.card(sl, 7.4, 1.55, 5.3, 3.0, calcTitle, calc, C.text1, { bodySize: 16 });
  g(sl, 2); H.card(sl, 7.4, 4.75, 5.3, 1.85, "Remember: " + stop, scene, C.accent2, { bodySize: 15, fill: "FBEFD5" });
  return sl;
}

const MEM = (sl, x, y, w, h, t, b) => H.card(sl, x, y, w, h, t, b, C.accent2, { bodySize: 15, fill: "FBEFD5" });
// ---------------------------------------------------------------- opening
pres.addSection({ title: SA });
s = slide(SA, "Why do warning signs seem to cause crashes?", "Open with the question and let the audience guess. The answer, endogeneity, is idea 3. This deck covers seven ideas that papers in Analytic Methods in Accident Research keep returning to, then the family of logit models used in response. All numbers are invented for teaching.", "TITLE");
s.addText("Seven ideas behind modern crash-data analysis, and the logit family of models\nA beginner-friendly lecture with hand calculations and memory pictures", { placeholder: "body" });
[C.accent3, C.accent4, C.accent6].forEach((c, i) => H.lamp(s, 10.6, 1.5 + i * 1.3, 1.0, c));

s = slide(SA, "Crash data hide more than they show", "A crash report records a few dozen items. What decides the outcome is often not among them. Each of the seven ideas is one way this missing information can mislead an analysis.");
H.stat(s, 0.6, 1.7, 3.7, "27%", "of people can have the opposite effect to the average one (idea 1)", C.accent1);
H.stat(s, 4.8, 1.7, 3.7, "18", "independent observations: what 100 correlated ones can be worth (idea 4)", C.accent2);
H.stat(s, 9.0, 1.7, 3.7, "2.8 vs 2", "what the data show against what snow really does (idea 6)", C.accent3);
g(s, 1); H.card(s, 0.6, 4.6, 12.1, 1.9, "The thread through this lecture", "Whatever is not recorded does not disappear. It ends up inside the estimates. The seven ideas describe how; the models in the second half are the response.", C.text1, { bodySize: 18 });

// ---------------------------------------------------------------- seven ideas
pres.addSection({ title: SB });
s = slide(SB, "Seven ideas, in the order we will meet them", "Ideas 1 and 2 belong together: simulation is how models with heterogeneity are estimated. Ideas 3 and 6 are also close relatives, because self-selection is one source of endogeneity.");
[["Unobserved heterogeneity", "One variable, many effects"], ["Simulated maximum likelihood", "Average over many draws"], ["Endogeneity", "The “cause” responds to risk"], ["Spatial and temporal correlation", "Neighbours are not independent"],
 ["Temporal instability", "Effects drift over time"], ["Prediction versus causality", "A forecast is not an explanation"], ["Crash–conflict relationship", "From near misses to crashes"]].forEach(([t, b], i) => {
  const x = 0.6 + (i % 4) * 3.07, y = 1.65 + Math.floor(i / 4) * 2.5; if (i > 0) g(s, Math.ceil(i / 2));
  H.card(s, x, y, 2.9, 2.3, null, null); H.lamp(s, x + 0.25, y + 0.22, 0.55, [C.accent1, C.accent1, C.accent3, C.accent6, C.accent2, C.accent5, C.text2][i], i + 1);
  H.text(s, t, x + 0.25, y + 0.95, 2.4, 0.7, { fontSize: 17, bold: true }); H.text(s, b, x + 0.25, y + 1.62, 2.4, 0.6, { fontSize: 15, color: C.text2 }); });

idea(1, "Unobserved heterogeneity", "The same variable affects people differently", "f_het", 2200 / 1010, "Bell curve of effects with mean minus 0.5; 27 percent of the area lies above zero",
  "A fixed-parameter model gives everyone one effect. A random-parameters model lets the effect vary, with a shape called the mixing distribution.",
  "By hand", "Effect is normal: mean −0.5, standard deviation 0.8.\n\nz = (0 − (−0.5)) ÷ 0.8 = 0.625\nShare below z: 0.734\nShare above zero: 1 − 0.734 = 0.266\n\nThe variable raises risk for about 27% of people.",
  "the costume shop", "Everyone enters by the same door and leaves in a different costume. The rail of costumes is bell-shaped.",
  "The crash report is identical for two belted occupants, yet outcomes differ. Unrecorded factors such as posture or bone strength make the belt's effect vary. Mixing distributions: normal, lognormal (one sign only), triangular, uniform. Mannering, Shankar and Bhat (2016) review the approaches and note that none is clearly best. Click once for the calculation, again for the memory picture.");

idea(2, "Simulated maximum likelihood", "No exact formula? Draw, compute, average", "f_sml", 2200 / 1010, "Running average of simulated probabilities; the Halton line settles on the exact answer sooner than the random line",
  "The probability must be averaged over every possible effect. Simulation replaces that average with a sample. Halton draws cover the range evenly and need fewer draws.",
  "By hand", "P = 1 ÷ (1 + e^(−β)); four draws of β.\n\nβ = −0.2 → 0.450\nβ = 0.3 → 0.574\nβ = 0.6 → 0.646\nβ = 1.1 → 0.750\n\nAverage = 0.605",
  "the dart casino", "A gambler’s darts land in clumps. The robot Halton places each dart in the biggest gap and is right after four.",
  "Maximum likelihood chooses the parameters that make the observed data most probable. Simulated maximum likelihood does the same with every probability replaced by its simulated average. Real studies use hundreds or thousands of draws per observation. A check: results should not change when the number of draws is doubled.");

idea(3, "Endogeneity", "The sign is a response to the ice", "f_endo", 2200 / 948, "Diagram: hidden ice risk points to both warning sign and crashes; bars show 4 crashes without a sign and 8 with",
  "A variable is endogenous when something unseen drives both it and the outcome. A plain comparison then mixes the two.",
  "By hand", "100 icy segments: 10 crashes each without a sign.\n300 ordinary segments: 4 each.\nA sign truly cuts crashes by 20%.\n\nSigns on all icy segments: 10 × 0.8 = 8\nPlain comparison: 8 ÷ 4 = 2, “+100%”\nTruth: −20%",
  "the icy bridge", "Signs sprout only above the sleeping ice troll. A tourist counts the wrecks and blames the signs.",
  "This answers the title question. The ice-warning example is from Mannering and Bhat (2014). The same trap arises from personal choices: if careful drivers buy cars with side airbags, airbags look better than they are. Cures: instrumental variables, control functions, joint models. Adding more control variables does not help unless the hidden cause itself is added.");

idea(4, "Spatial and temporal correlation", "A hundred observations can be worth eighteen", "f_space", 2200 / 1010, "Curve of effective sample size falling from 100 to about 18 as within-cluster correlation rises to 0.5",
  "Neighbouring sites, and the same site in consecutive years, share unrecorded influences. Treating them as independent overstates how much we know.",
  "By hand", "100 observations: 10 segments on each of 10 corridors; correlation 0.5 within a corridor.\n\nDesign effect = 1 + (10 − 1) × 0.5 = 5.5\nEffective sample = 100 ÷ 5.5 ≈ 18",
  "gossip street", "100 houses, each repeating the neighbour. You knock on every door and hear only 18 opinions.",
  "The design effect is a teaching approximation for equal clusters; research models describe the correlation directly, for example with spatially correlated error terms. Mannering and Bhat (2014) warn that ignoring these correlations gives inefficient and possibly inconsistent estimates.");

idea(5, "Temporal instability", "Yesterday’s model may not describe today", "f_inst", 2200 / 1010, "Year-by-year estimates falling from 0.52 to minus 0.12 with a flat pooled line at 0.22",
  "The effect of a variable can change between periods. Test it: compare one pooled model with separate models for each period.",
  "By hand", "12 parameters. Log-likelihoods:\npooled −1,250; 2019–21 −600; 2022–24 −620.\n\nSeparate total = −1,220\nStatistic = −2 × [−1,250 − (−1,220)] = 60\nCritical value (12 d.f., 5%) = 21.03\n\n60 > 21.03: not stable",
  "the melting clock tower", "The numbers slide down the wall. A judge weighs two calendars: “Not the same year!” 60 beats 21.",
  "Mannering (2018) named the issue and argued it should be tested, not assumed away. Do not confuse it with temporal correlation: correlation means the unexplained part is similar from year to year; instability means the effects themselves change. The figure is stylised.");

s = slide(SB, "A good forecast is not the effect of a change", "Example from Mannering, Bhat, Shankar and Abdel-Aty (2020): cautious drivers stay home in snow, so the drivers observed in snow are a riskier group. Numbers are invented. Self-selection can push either way: if the high-risk group stays home, the data understate the effect.");
s.addChart(pres.charts.BAR, [{ name: "Crash rate (%)", labels: ["Clear day", "Snow, if everyone drove", "Snow, as observed"], values: [1.25, 2.5, 3.5] }], Object.assign({}, H.chartBase, { x: 0.6, y: 1.55, w: 6.5, h: 3.1, barDir: "col", chartColors: [HEX.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.00"%"', showLegend: false, showTitle: true, title: "Crash rate among drivers on the road (%)", titleFontSize: 13, titleColor: HEX.dk2, valAxisMaxVal: 4, valAxisMinVal: 0, barGapWidthPct: 60 }));
H.card(s, 0.6, 4.75, 6.5, 1.85, "6 · Prediction versus causality", "Prediction: what will happen? Causality: what if I change this? Machine learning is strong on the first; models that handle ideas 1 and 3 support the second.", C.accent1, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "By hand", "500 cautious: 0.5% clear, 1% snow.\n500 risk-takers: 2% clear, 4% snow.\n80% of cautious drivers stay home in snow.\n\nClear: 12.5 per 1,000 = 1.25%\nSnow: 21 per 600 = 3.5%\nData: 2.8 times. Cause: 2 times.", C.text1, { bodySize: 16 });
g(s, 2); H.card(s, 7.4, 4.75, 5.3, 1.85, "Remember: fortune teller and mechanic", "She forecasts tonight’s crashes; he asks why. Only daredevils are on the road.", C.accent2, { bodySize: 15, fill: "FBEFD5" });

idea(7, "Crash–conflict relationship", "Near misses can stand in for crashes", "f_tail", 2200 / 820, "Histogram of time-to-collision with a fitted tail extended from the 1.5 second threshold to zero",
  "A conflict is a measurable near miss. Extreme value theory fits the most severe conflicts and extends the curve to a time-to-collision of zero: a crash.",
  "By hand", "5,000 interactions; 200 below 1.5 s.\nShare = 200 ÷ 5,000 = 0.04\nMean distance below threshold: 0.25 s\n\nReach zero: e^(−1.5 ÷ 0.25) = e^(−6) = 0.00248\n0.04 × 0.00248 = 0.0000992\n\nAbout 1 crash per 10,100 interactions",
  "the near-miss arcade", "200 pings on the counter. Pull the dragon’s thinning tail straight until it touches the red zero.",
  "Time-to-collision and post-encroachment time are the most used measures (Arun, Haque, Sayed and Mannering, 2021). Ali, Haque and Mannering (2023) review extreme value theory for the conflict to crash link. The slide uses the simplest tail, an exponential; research uses the generalised Pareto and generalised extreme value distributions. The answer depends on the threshold.");

s = slide(SB, "Pairs that are easy to confuse", "Use as a quick oral quiz: cover the right-hand column and ask for the difference.");
s.addTable([[{ text: "Pair", options: hdr }, { text: "The one fact that separates them", options: hdr }],
  ["Heterogeneity and endogeneity", "Heterogeneity: the effect differs across people. Endogeneity: the variable itself is tangled with hidden causes."],
  ["Temporal correlation and temporal instability", "Correlation: leftovers are alike from year to year. Instability: the effects change."],
  ["Mixing distribution and Halton draws", "The mixing distribution is the shape assumed for the effects. Halton draws are a way of sampling from it."],
  ["Prediction and causality", "What will happen, against what would happen if I changed something."],
  ["Conflict and crash", "A conflict is a near miss. A crash is a time-to-collision of zero."]],
  Object.assign({ x: 0.6, y: 1.6, w: 12.1, colW: [4.0, 8.1], rowH: 0.72 }, tbl));
H.text(s, "Real data have several of these at once. Handling them together is where much current research lies.", 0.6, 6.15, 12.1, 0.5, { fontSize: 17, bold: true, color: C.accent1 });

// ---------------------------------------------------------------- models
pres.addSection({ title: SC });
s = slide(SC, "From ideas to models", "The second half: the models researchers use in response to the seven ideas.", "SECTION");
s.addText("Every model gives each outcome a score. They differ in how scores become probabilities.", { placeholder: "body" });

s = slide(SC, "Three ways to write the same chance", "The model adds things up, and a sum can be any number. Only log-odds can be any number, so the model's score is the log-odds. Logit simply means log-odds. A coefficient adds to the log-odds, which multiplies the odds by e to the power of the coefficient: the odds ratio.");
H.stat(s, 0.6, 1.7, 3.7, "0.20", "probability: 20 injuries in 100 crashes; between 0 and 1", C.accent1);
H.stat(s, 4.8, 1.7, 3.7, "0.25", "odds: 0.20 ÷ 0.80, injuries against non-injuries; 0 to infinity", C.accent2);
H.stat(s, 9.0, 1.7, 3.7, "−1.39", "log-odds: ln(0.25); any number. This is the model’s score", C.accent3);
g(s, 1); H.card(s, 0.6, 4.35, 7.0, 2.25, "By hand: what a coefficient of +1.6 does", "Log-odds: −1.386 + 1.6 = 0.214\nOdds: 0.25 × e^1.6 = 0.25 × 4.953 = 1.238\nProbability: 1.238 ÷ 2.238 = 0.553, up from 0.20", C.text1, { bodySize: 17 });
g(s, 2); H.card(s, 7.8, 4.35, 4.9, 2.25, "Logit in one line", "ln( p ÷ (1 − p) ) = score\np = 1 ÷ (1 + e^(−score))", C.accent5, { bodySize: 17 });

s = slide(SC, "Likelihood: how probable is what we saw?", "The likelihood multiplies the probabilities the model gave to what actually happened. Its logarithm, the log-likelihood, is a sum: always negative, closer to zero is better, and comparable only between models fitted to the same data. Estimation searches for the coefficients with the highest log-likelihood.");
H.card(s, 0.6, 1.55, 5.95, 2.5, "Likelihood", "Three crashes. Model: injury probabilities 0.8, 0.6, 0.3.\nWhat happened: injury, injury, no injury.\n\n0.8 × 0.6 × (1 − 0.3) = 0.336", C.accent1, { bodySize: 16 });
g(s, 1); H.card(s, 6.75, 1.55, 5.95, 2.5, "Log-likelihood", "ln(0.8) + ln(0.6) + ln(0.7)\n= −0.223 − 0.511 − 0.357 = −1.091\n\nKnow-nothing model (0.5 each): 3 × ln(0.5) = −2.079", C.accent5, { bodySize: 16 });
g(s, 2); H.card(s, 0.6, 4.25, 12.1, 2.35, "Three rules", "1  A log-likelihood is always negative.\n2  Closer to zero is better: −1.091 beats −2.079.\n3  Compare only models fitted to the same data.", C.text1, { bodySize: 18 });

s = slide(SC, "Restricted and unrestricted: locks on a model", "The unrestricted model is free to choose every parameter. The restricted model is the same model with some parameters locked. It is a special case of the free model (nested), so the free model always fits at least as well. Click: the locks drop onto the three single-carriageway parameters. Degrees of freedom = number of locks.");
H.text(s, "Unrestricted: two separate models, every parameter free", 0.6, 1.5, 12, 0.4, { fontSize: 17, bold: true });
H.text(s, "Restricted: one pooled model, three parameters locked", 0.6, 3.55, 12, 0.4, { fontSize: 17, bold: true });
["constant D", "rollover D", "speed D", "constant S", "rollover S", "speed S"].forEach((t, i) => { const x = 0.6 + i * 2.05;
  [1.95, 4.0].forEach(y => { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.9, h: 1.25, rectRadius: 0.08, fill: { color: C.background1 }, line: { color: C.accent1, width: 2 } }); H.text(s, t, x, y + 0.1, 1.9, 0.4, { align: "center", fontSize: 15 }); });
  H.text(s, "free", x, 2.55, 1.9, 0.45, { align: "center", fontSize: 17, bold: true, color: C.accent1 });
  if (i < 3) H.text(s, "free", x, 4.6, 1.9, 0.45, { align: "center", fontSize: 17, bold: true, color: C.accent1 }); });
g(s, 1); [3, 4, 5].forEach(i => { const x = 0.6 + i * 2.05; s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.35, y: 4.58, w: 1.2, h: 0.5, rectRadius: 0.08, fill: { color: C.accent4 }, line: { color: C.accent4, width: 0 } }); H.text(s, "locked = D", x + 0.35, 4.58, 1.2, 0.5, { align: "center", valign: "middle", fontSize: 15, bold: true }); });
g(s, 2); H.card(s, 0.6, 5.5, 12.1, 1.15, null, "Degrees of freedom = number of locks = 3.  The test asks: do the locks cost more fit than chance alone would explain?", C.text1, { bodySize: 17 });

s = slide(SC, "Five kinds of question, three kinds of lock", "Every likelihood ratio test in a severity paper is one of these. For transferability, rejected is the interesting finding; for a partially constrained model, not rejected is the good news.");
s.addTable([[{ text: "Question", options: hdr }, { text: "What is locked", options: hdr }, { text: "Locks (degrees of freedom)", options: hdr }, { text: "“Rejected” means", options: hdr }],
  ["Does adverse weather matter?", "its coefficient = 0", "1", "weather matters"],
  ["Should two effects be random?", "their spreads = 0", "2", "keep the random parameters"],
  ["Can two road classes share a model?", "class 2 parameters = class 1", "K1 + K2 − K pooled", "model them separately"],
  ["Is an effect the same in three years?", "year 2 and 3 = year 1", "2 per effect held equal", "the effect changed"],
  ["Does model A describe data B?", "all parameters = A’s values", "all K parameters of A", "not transferable"]],
  Object.assign({ x: 0.6, y: 1.6, w: 12.1, colW: [3.9, 3.1, 2.6, 2.5], rowH: 0.72 }, tbl));
H.text(s, "The restricted log-likelihood always goes first:  −2 × [ LL(restricted) − LL(unrestricted) ]", 0.6, 6.1, 12.1, 0.5, { fontSize: 17, bold: true, color: C.accent1 });

s = slide(SC, "What chance alone looks like", "5,000 imaginary studies in which the seat belt truly makes no difference: both groups have a 37.5% injury chance, 200 crashes are drawn, and both models are fitted. The free model still fits a little better each time, by luck. The pile of statistics is the chi-square distribution with 1 degree of freedom.");
img(s, "f_sim", 0.6, 1.55, 6.5, 2200 / 878, "Histogram of simulated likelihood ratio statistics piling up near zero, with about 5 percent beyond the critical value 3.84");
H.card(s, 0.6, 4.3, 6.5, 2.3, "Why the statistic is never exactly zero", "Even when the restriction is true, the free model bends towards the random quirks of the sample and fits a little better.", C.accent1, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 2.4, "Critical value", "The point that chance alone exceeds only 5% of the time: 3.84 with one lock. More locks move it to the right: 5.99, 7.81, 9.49 …", C.text1, { bodySize: 16 });
g(s, 2); H.card(s, 7.4, 4.15, 5.3, 2.45, "p-value", "The share of the pile beyond your statistic. For 4.82 it is about 3%: unusual enough to reject at 95% confidence, not at 99%.", C.accent3, { bodySize: 16 });

s = slide(SC, "The likelihood ratio test in one picture", "Adding parameters can never make the fit worse, so the question is whether the fit improves by more than chance alone would give. Restricted = simpler model; unrestricted = free model. Degrees of freedom = number of parameters removed by the restriction. At 99% confidence (critical value 6.63) the same data would not reject.");
img(s, "f_chi1", 0.6, 1.55, 6.5, 2200 / 812, "Chi-square distribution with one degree of freedom; the statistic 4.82 lies just beyond the critical value 3.84");
H.card(s, 0.6, 4.3, 6.5, 2.3, "statistic = −2 × [ LL(restricted) − LL(unrestricted) ]", "Zero if both fit equally well; grows as the simpler model falls behind. Compare with a chi-square critical value.", C.accent3, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "By hand: does a seat belt matter?", "Belted: 30 of 100 injured. Unbelted: 45 of 100.\n\nOne share for all (0.375): LL = −132.31\nSeparate shares: LL = −129.90\n\n−2 × (−132.31 + 129.90) = 4.82\n1 degree of freedom; critical value 3.84\n4.82 > 3.84: reject, the groups differ", C.text1, { bodySize: 15 });
g(s, 2); MEM(s, 7.4, 4.75, 5.3, 1.85, "Remember: Judge Chi", "Two tailors, a plain suit and one with extra pockets. The judge’s ruler has one notch per extra pocket.");

s = slide(SC, "Reading the verdict, and two other yardsticks", "With forty tests at 95% confidence, about two false alarms are expected. AIC = 2K − 2LL; BIC = K ln(N) − 2LL; lower is better for both. In the seat-belt example AIC prefers the two-share model (263.80 against 266.63) and BIC narrowly prefers the one-share model (269.92 against 270.40): the yardsticks can disagree when evidence is borderline.");
H.card(s, 0.6, 1.55, 3.9, 2.45, "“Rejected”", "The simpler model fits significantly worse. Keep the larger one.", C.accent3, { bodySize: 16 });
H.card(s, 4.7, 1.55, 3.9, 2.45, "“Not rejected”", "The simpler model is good enough for these data. Not proof that it is true.", C.accent6, { bodySize: 16 });
H.card(s, 8.8, 1.55, 3.9, 2.45, "Size is not importance", "With huge samples, tiny differences are “significant”. Check the marginal effects.", C.accent2, { bodySize: 16 });
g(s, 1); H.card(s, 0.6, 4.2, 5.95, 2.4, "AIC and BIC (lower is better)", "AIC = 2 × K − 2 × LL\nBIC = K × ln(N) − 2 × LL\n\nUsable when models are not nested.", C.text1, { bodySize: 16 });
g(s, 2); H.card(s, 6.75, 4.2, 5.95, 2.4, "Two rules for the likelihood ratio test", "Same crashes in both models.\nOne model must be a restricted version of the other (nested).", C.text1, { bodySize: 16 });

s = slide(SC, "Two questions, two families of models", "Counts are modelled with Poisson, or negative binomial when counts vary more than Poisson allows, which is the usual case for crashes. The rest of this section is about severity.");
H.card(s, 0.6, 1.6, 5.95, 3.0, "How many?  Crash frequency", "The number of crashes on a segment in a year: 0, 1, 2, 3 …\n\nCount models:\nPoisson (mean = variance)\nNegative binomial (variance can exceed the mean)", C.accent1, { bodySize: 17, titleSize: 20 });
H.card(s, 6.75, 1.6, 5.95, 3.0, "How bad?  Injury severity", "The outcome of one crash: no injury, injury or fatal.\n\nCategory models:\nthe logit family, six members on the next slides", C.accent3, { bodySize: 17, titleSize: 20 });
g(s, 1); H.card(s, 0.6, 4.8, 12.1, 1.75, "The score", "A weighted sum of what is known about the crash: speed limit, seat-belt use, lighting and so on. Estimating a model means finding the weights.", C.text1, { bodySize: 17 });

s = slide(SC, "The logit family: each step adds one thing", "Read from the bottom step up. Each model relaxes one assumption of the multinomial logit, except the binary logit, which is its two-outcome special case.");
[["Binary logit", "two outcomes", C.text2], ["Multinomial logit", "three or more outcomes", C.accent1], ["Nested logit", "similar outcomes share a nest", C.accent6], ["Ordered logit", "one score, thresholds", C.accent2], ["Mixed logit", "effects vary by person", C.accent5], ["Latent class logit", "a few hidden groups", C.accent3]].forEach(([t, b, c], i) => {
  const x = 0.6 + i * 2.05, y = 5.3 - i * 0.68, h = 6.55 - y; if (i > 0) g(s, i);
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.93, h, fill: { color: C.background2 }, line: { color: C.background2, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.93, h: 0.62, fill: { color: c }, line: { color: c, width: 0 } });
  H.text(s, t, x, y, 1.93, 0.62, { align: "center", valign: "middle", bold: true, color: C.background1, fontSize: 14 });
  H.text(s, b, x + 0.1, y + 0.72, 1.73, 0.6, { fontSize: 14, align: "center" }); });
s._g = 0; H.text(s, "Hotel floors: ground to fifth →", 0.6, 1.6, 6, 0.4, { fontSize: 16, color: C.text2 });

s = slide(SC, "Multinomial logit: weights, then shares", "Binary logit is the same recipe with two outcomes: probability = 1 ÷ (1 + e^(−score)); a score of 0.8 gives 0.69. Weak spot of the multinomial logit: if one outcome becomes less likely, its lost share is spread over all others in proportion (independence of irrelevant alternatives). That is wrong when outcomes are close cousins.");
s.addChart(pres.charts.BAR, [{ name: "Probability", labels: ["No injury (score 0)", "Injury (score −0.5)", "Fatal (score −2)"], values: [0.574, 0.348, 0.078] }], Object.assign({}, H.chartBase, { x: 0.6, y: 1.55, w: 6.5, h: 3.1, barDir: "col", chartColors: [HEX.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.000", showLegend: false, showTitle: true, title: "Probability of each outcome", titleFontSize: 13, titleColor: HEX.dk2, valAxisMaxVal: 0.7, valAxisMinVal: 0, barGapWidthPct: 60 }));
H.card(s, 0.6, 4.75, 6.5, 1.85, "The recipe", "Step 1: weight = e^score.  Step 2: probability = weight ÷ total of all weights. Only differences between scores matter.", C.accent1, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "By hand", "Scores: 0, −0.5, −2\n\nWeights: 1.000, 0.607, 0.135\nTotal: 1.742\n\nNo injury: 1.000 ÷ 1.742 = 0.574\nInjury: 0.607 ÷ 1.742 = 0.348\nFatal: 0.135 ÷ 1.742 = 0.078", C.text1, { bodySize: 16 });
g(s, 2); H.card(s, 7.4, 4.75, 5.3, 1.85, "Remember: floor 1, the balloon buffet", "Each dish has a balloon of size e^score. Your chance of a dish is its balloon’s share of all the air.", C.accent2, { bodySize: 15, fill: "FBEFD5" });

s = slide(SC, "Nested logit: cousins share", "The nest setting runs from 1 (unrelated, identical to multinomial logit) towards 0 (nearly interchangeable). With equal scores and setting 0.5: nest weight is 2 to the power 0.5 = 1.414; nest probability 1.414 ÷ 2.414 = 0.586; each injury level 0.293; no injury 0.414.");
s.addChart(pres.charts.BAR, [{ name: "Multinomial logit", labels: ["No injury", "Minor injury", "Severe injury"], values: [0.333, 0.333, 0.333] }, { name: "Nested logit (setting 0.5)", labels: ["No injury", "Minor injury", "Severe injury"], values: [0.414, 0.293, 0.293] }], Object.assign({}, H.chartBase, { x: 0.6, y: 1.55, w: 6.5, h: 3.1, barDir: "col", chartColors: [HEX.dk2, HEX.accent6], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.000", showLegend: true, legendPos: "b", showTitle: true, title: "Three outcomes with equal scores", titleFontSize: 13, titleColor: HEX.dk2, valAxisMaxVal: 0.5, valAxisMinVal: 0 }));
H.card(s, 0.6, 4.75, 6.5, 1.85, "Why nest?", "Minor and severe injury share unrecorded causes that “no injury” lacks. When one becomes less likely, most of its share should go to the other.", C.accent6, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "By hand", "All three scores are 0; nest setting 0.5.\n\nNest weight = (1 + 1)^0.5 = 1.414\nNest = 1.414 ÷ (1 + 1.414) = 0.586\nEach injury level = 0.586 ÷ 2 = 0.293\nNo injury = 1 − 0.586 = 0.414", C.text1, { bodySize: 16 });
g(s, 2); H.card(s, 7.4, 4.75, 5.3, 1.85, "Remember: floor 2, the twin rooms", "When one twin checks out, the other inherits nearly all the luggage. The guest across the corridor gets almost none.", C.accent2, { bodySize: 15, fill: "FBEFD5" });

s = slide(SC, "Ordered logit: one score, two cuts", "Fewer parameters than the multinomial logit, at the price of a restriction: a variable that raises the score must lower the lowest level and raise the highest. An airbag that reduces fatalities and increases minor injuries cannot be described this way. Ordered probit is the same idea with a normal curve.");
img(s, "f_ord", 0.6, 1.55, 6.5, 2200 / 858, "Bell-shaped curve cut by thresholds at 0 and 2 into no injury 0.378, injury 0.440 and fatal 0.182");
H.card(s, 0.6, 4.75, 6.5, 1.85, "The idea", "Severity levels have an order. The model places each crash on a hidden severity scale and cuts the scale with thresholds.", C.accent2, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "By hand", "Thresholds 0 and 2; score 0.5.\nF(z) = 1 ÷ (1 + e^(−z))\n\nNo injury = F(−0.5) = 0.378\nUp to injury = F(1.5) = 0.818\nInjury = 0.818 − 0.378 = 0.440\nFatal = 1 − 0.818 = 0.182", C.text1, { bodySize: 16 });
g(s, 2); H.card(s, 7.4, 4.75, 5.3, 1.85, "Remember: floor 3, thermometer stairs", "One blob of mercury rises with the score past two gates: no injury, injury, fatal.", C.accent2, { bodySize: 15, fill: "FBEFD5" });

s = slide(SC, "Mixed and latent class: effects that differ", "Mixed logit is the multinomial logit with idea 1 built in and estimated with idea 2. Recent papers often add heterogeneity in means and variances (the centre and spread of a random effect depend on other variables) and correlated random parameters. Latent class needs no mixing distribution but treats everyone in a class as identical.");
H.card(s, 0.6, 1.55, 5.95, 2.75, "Mixed (random parameters) logit", "Effects vary smoothly from person to person.\n\nTwo kinds of people, scores −1 and 2:\nprobabilities 0.269 and 0.881\nMixed logit: average = 0.575\nFixed-parameter logit at the mean score 0.5: 0.622", C.accent5, { bodySize: 16, titleSize: 19 });
H.card(s, 6.75, 1.55, 5.95, 2.75, "Latent class logit", "Effects differ between a few hidden groups.\n\nClass A: 60% of crashes, probability 0.10\nClass B: 40% of crashes, probability 0.40\nOverall = 0.60 × 0.10 + 0.40 × 0.40 = 0.22", C.accent3, { bodySize: 16, titleSize: 19 });
g(s, 1); H.card(s, 0.6, 4.5, 5.95, 2.1, "Remember: floor 4, the costume party", "Every guest from the costume shop has their own chance of dancing. The manager reports the average.", C.accent2, { bodySize: 15, fill: "FBEFD5" });
H.card(s, 6.75, 4.5, 5.95, 2.1, "Remember: floor 5, the masked ball", "Two secret clubs in masks. You know only that 60% belong to one, and each club dances to its own rules.", C.accent2, { bodySize: 15, fill: "FBEFD5" });

s = slide(SC, "Which model when?", "Mannering and Bhat (2014) and Mannering, Shankar and Bhat (2016) review these models and their variants.");
s.addTable([[{ text: "Model", options: hdr }, { text: "Use it when", options: hdr }, { text: "Watch out for", options: hdr }],
  ["Poisson, negative binomial", "The outcome is a count of crashes", "Poisson assumes mean = variance"],
  ["Binary logit", "Two outcomes", "—"],
  ["Multinomial logit", "Three or more outcomes; a flexible first model", "Treats all outcomes as equally unrelated"],
  ["Nested logit", "Some outcomes share unrecorded causes", "You must choose the nests"],
  ["Ordered logit or probit", "Outcomes are ordered; few parameters wanted", "One score moves all levels the same way"],
  ["Mixed logit", "Effects differ across people", "Needs simulation and a mixing distribution"],
  ["Latent class logit", "A few distinct hidden groups", "Everyone in a class is identical"]],
  Object.assign({ x: 0.6, y: 1.6, w: 12.1, colW: [3.2, 4.6, 4.3], rowH: 0.58 }, tbl));


// ---------------------------------------------------------------- a full study
const SE = "A full study, step by step";
pres.addSection({ title: SE });
s = slide(SE, "A full severity study in ten steps", "This section follows the recipe used in many recent papers: split crashes by place and year, fit a random-parameters logit to each part, then test whether parts can share a model. The running example is truck-crash severity on three road classes over three years. All numbers are invented.", "SECTION");
s.addText("Three road classes × three years = nine models, compared by likelihood ratio tests", { placeholder: "body" });

s = slide(SE, "The recipe: nine models, one question at a time", "Outcome: property damage only, injury, fatal. Steps 1 to 5 prepare and specify; 6 and 7 estimate and interpret; 8 to 10 compare and check. Click to reveal the steps in three groups.");
["Code the data as 0/1", "Split into 9 subsets", "Multinomial logit", "Choose the variables", "Random parameters", "Estimate by simulation", "Marginal effects", "Transfer between road classes", "Stability over time", "Predict"].forEach((t, i) => {
  const x = 0.6 + (i % 5) * 2.45, y = 1.7 + Math.floor(i / 5) * 2.0; if (i >= 5) g(s, i < 7 ? 1 : 2);
  H.card(s, x, y, 2.3, 1.75, null, null); H.lamp(s, x + 0.2, y + 0.2, 0.55, i < 5 ? C.accent1 : i < 7 ? C.accent5 : C.accent3, i + 1); H.text(s, t, x + 0.2, y + 0.9, 1.95, 0.75, { fontSize: 16, bold: true }); });
g(s, 3); H.card(s, 0.6, 5.75, 12.1, 0.85, null, "Question: do the factors linked to severity differ between road classes, and do they stay the same from year to year?", C.text1, { bodySize: 17 });

s = slide(SE, "Steps 1–2: indicators, subsets and a first check", "Base category: the one without an indicator; every coefficient is read against it. An indicator that never varies within a subset is dropped from that subset's model. The chi-square test only says that the severity mix differs; it does not say why.");
H.card(s, 0.6, 1.55, 5.95, 2.5, "Coding", "Season has four categories. Summer is the base.\nIndicators: Winter, Spring, Autumn.\n\nSpring crash → 0, 1, 0\nSummer crash → 0, 0, 0", C.accent1, { bodySize: 16 });
H.card(s, 0.6, 4.25, 5.95, 2.35, "Splitting", "3 road classes × 3 years = 9 subsets, one model each.\n\nMore subsets answer finer questions, but each has fewer crashes.", C.accent1, { bodySize: 16 });
g(s, 1); H.card(s, 6.75, 1.55, 5.95, 5.05, "Chi-square test, by hand", "Expressway: 400, 150, 50 (damage only, injury, fatal)\nOther roads: 300, 200, 100\n\nExpected if road class made no difference:\n350, 175, 75 in each row\n\n(observed − expected)² ÷ expected:\n7.14 + 3.57 + 8.33, twice = 38.10\n\nDegrees of freedom (2 − 1) × (3 − 1) = 2\nCritical value 5.99 → the mixes differ", C.text1, { bodySize: 16 });

s = slide(SE, "Step 4: keep a variable only if it earns its place", "Backward selection: start with all candidates, remove the weakest, estimate again, repeat. One at a time, because t-values of the others change after each removal. 1.645 corresponds to 90% confidence.");
s.addChart(pres.charts.BAR, [{ name: "|t|", labels: ["Winter", "Weekend", "Adverse weather", "140 km/h limit", "Multi-vehicle", "Rollover"], values: [0.48, 1.20, 1.92, 2.45, 3.10, 4.21] }], Object.assign({}, H.chartBase, { x: 0.6, y: 1.55, w: 6.5, h: 3.1, barDir: "bar", chartColors: [HEX.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", showLegend: false, showTitle: true, title: "|t| of each variable, first round (keep if at least 1.645)", titleFontSize: 13, titleColor: HEX.dk2, valAxisMaxVal: 5, valAxisMinVal: 0 }));
H.card(s, 0.6, 4.75, 6.5, 1.85, "The t-statistic", "t = estimate ÷ standard error: how many standard errors the estimate is away from zero.", C.accent1, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "By hand", "Coefficient 0.84, standard error 0.35\nt = 0.84 ÷ 0.35 = 2.40 → keep\n\nCoefficient −0.21, standard error 0.18\n|t| = 1.17 → remove\n\nRound 1 removes Winter (0.48);\nround 2 removes Weekend.", C.text1, { bodySize: 16 });
g(s, 2); MEM(s, 7.4, 4.75, 5.3, 1.85, "Remember: the bouncer", "A bouncer with 1.645 on his shirt throws out the weakest guest, one at a time.");

s = slide(SE, "Step 5: a mean and a spread that can move", "Often abbreviated RPLHMV: random parameters logit with heterogeneity in means and variances. Z and W are other indicators in the data. With Θ = 0 and ω = 0 it is an ordinary random parameter. Kept as random only if σ is significant and a likelihood ratio test favours it. Random draws are usually assumed normal.");
img(s, "f_rp", 0.6, 1.55, 6.5, 2200 / 878, "Two bell curves: clear weather with mean minus 0.8 and spread 0.7; bad weather with mean minus 0.2 and spread 1.15");
H.card(s, 0.6, 4.3, 6.5, 2.3, "β(n) = β + Θ × Z + σ × e^(ω × W) × draw", "β: mean effect.  σ: spread across crashes.\nΘ: slides the mean when Z = 1.\nω: stretches or shrinks the spread when W = 1.", C.accent5, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "By hand", "Rollover, fatal function: β = −0.8, σ = 0.7\nBad weather: Θ = 0.6, ω = 0.5\n\nClear: positive in 12.7% of crashes\nBad weather: mean −0.8 + 0.6 = −0.2\nspread 0.7 × e^0.5 = 1.15\npositive in 43.1% of crashes", C.text1, { bodySize: 16 });
g(s, 2); MEM(s, 7.4, 4.75, 5.3, 1.85, "Remember: two bells", "A teal bell and an amber bell. When the weather turns, the amber one slides and stretches.");

s = slide(SE, "Steps 6–7: simulate, then report effects", "Estimation is simulated maximum likelihood with Halton draws (idea 2): fewer draws while searching, many more for the final models. Coefficients behind the example (invented): injury −0.7, rollover +0.8, 140 km/h +0.3, bad weather +0.4; fatal −2.6, +1.4, +0.9, +0.5.");
s.addChart(pres.charts.BAR, [{ name: "Change in fatal probability (points)", labels: ["Crash A: 120 km/h, clear", "Crash B: 140 km/h, clear", "Crash C: 140 km/h, bad weather", "Average"], values: [7.8, 13.1, 14.4, 11.8] }], Object.assign({}, H.chartBase, { x: 0.6, y: 1.55, w: 6.5, h: 3.1, barDir: "col", chartColors: [HEX.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", showLegend: false, showTitle: true, title: "Effect of a rollover on the fatal probability (percentage points)", titleFontSize: 13, titleColor: HEX.dk2, valAxisMaxVal: 16, valAxisMinVal: 0, catAxisLabelFontSize: 10 }));
H.card(s, 0.6, 4.75, 6.5, 1.85, "Average marginal effect", "For every crash: probability with the indicator on, minus probability with it off. Then average over all crashes.", C.accent1, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "Draws", "200 Halton draws while searching for the specification (many trial models).\n\n1,000 Halton draws for the final models, so the reported numbers do not depend on the draws.", C.text1, { bodySize: 16 });
g(s, 2); MEM(s, 7.4, 4.75, 5.3, 1.85, "Remember: the light switch", "Flip the switch on and off for every guest and write down the average flicker.");

s = slide(SE, "Step 8: does one road’s model fit another road?", "Run in both directions for each pair of road classes in each year. Degrees of freedom: the number of parameters in the model being transferred. A rejected test is the interesting result here: the two road classes need separate models.");
img(s, "f_chi", 0.6, 1.55, 6.5, 2200 / 838, "Chi-square distribution with 14 degrees of freedom; the statistic 48.6 lies beyond the critical value 23.68");
H.card(s, 0.6, 4.3, 6.5, 2.3, "Transferability test", "χ² = −2 × [ LL(A’s parameters on B’s data) − LL(B’s own model) ]\n\nLarge value: A’s parameters do not describe B.", C.accent3, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "By hand", "Expressway model: 14 parameters\nOn dual-carriageway data: LL = −612.4\nDual’s own model: LL = −588.1\n\nχ² = −2 × (−612.4 + 588.1) = 48.6\nCritical value (14 d.f., 5%) = 23.68\n48.6 > 23.68: not transferable", C.text1, { bodySize: 16 });
g(s, 2); MEM(s, 7.4, 4.75, 5.3, 1.85, "Remember: the tailor", "A tailor tries one road’s suit on another road. If the seams split, each road needs its own.");

s = slide(SE, "Can two road classes be merged?", "The merge test compares one pooled model with two separate ones. Merging gives larger samples, which matters when a yearly subset has few fatal crashes, but it can hide opposite trends in the two classes.");
H.card(s, 0.6, 1.55, 5.95, 2.4, "Merge test", "χ² = −2 × [ LL(pooled) − LL(class 1) − LL(class 2) ]\n\nDegrees of freedom = K1 + K2 − K(pooled)", C.accent3, { bodySize: 17 });
H.card(s, 0.6, 4.15, 5.95, 2.45, "Why merge at all?", "Larger samples and steadier estimates.\n\nThe price: if the test rejects, pooling hides real differences.", C.accent1, { bodySize: 16 });
g(s, 1); H.card(s, 6.75, 1.55, 5.95, 5.05, "By hand", "Pooled dual + single: LL = −1,105.0, 15 parameters\nDual alone: LL = −640.2, 13 parameters\nSingle alone: LL = −447.5, 12 parameters\n\nχ² = −2 × (−1,105.0 + 640.2 + 447.5)\n    = −2 × (−17.3) = 34.6\n\nDegrees of freedom = 13 + 12 − 15 = 10\nCritical value = 18.31\n\n34.6 > 18.31: model them separately", C.text1, { bodySize: 16 });

s = slide(SE, "Step 9: which effects are stable over time?", "First the temporal version of the transfer test: one year's parameters on another year's crashes, both directions. Then the partially temporally constrained model: pool the years, hold a parameter equal across years whenever equality is not rejected. Here NOT rejecting is the good news.");
H.card(s, 0.6, 1.55, 5.95, 2.4, "Partially constrained model", "Pool the years of one road class. Hold a parameter equal across years when a test does not reject equality; leave the others free.", C.accent5, { bodySize: 16 });
H.card(s, 0.6, 4.15, 5.95, 2.45, "The test", "χ² = −2 × [ LL(constrained) − Σ LL(each year) ]\n\nDegrees of freedom = parameters saved", C.accent3, { bodySize: 16 });
g(s, 1); H.card(s, 6.75, 1.55, 5.95, 3.4, "By hand", "Three yearly models: 40 parameters, LL sum −1,631.5\nConstrained model: 28 parameters, LL −1,640.0\n\nχ² = −2 × (−1,640.0 + 1,631.5) = 17.0\nDegrees of freedom = 40 − 28 = 12\nCritical value = 21.03\n17.0 < 21.03: not rejected", C.text1, { bodySize: 16 });
g(s, 2); MEM(s, 6.75, 5.15, 5.95, 1.45, "Remember: the judge’s chain", "The judge chains together the calendar pages that match. Chained pages are the stable effects.");

s = slide(SE, "Forty-two tests from one small formula", "Three road classes and three years. The same counting works for any design: pairs × 2 directions × the other dimension.");
H.stat(s, 0.6, 1.7, 2.8, "18", "between road classes: 3 pairs × 2 directions × 3 years", C.accent1);
H.stat(s, 3.7, 1.7, 2.8, "18", "between years: 3 pairs × 2 directions × 3 road classes", C.accent2);
H.stat(s, 6.8, 1.7, 2.8, "3", "merge tests: one pair of classes, once per year", C.accent3);
H.stat(s, 9.9, 1.7, 2.8, "3", "constrained against unconstrained: once per road class", C.accent5);
g(s, 1); H.card(s, 0.6, 4.6, 12.1, 1.9, "18 + 18 + 3 + 3 = 42 likelihood ratio tests", "Every one of them is −2 × [ LL(restricted) − LL(unrestricted) ], compared with a chi-square critical value.", C.text1, { bodySize: 18, titleSize: 22 });

s = slide(SE, "Step 10: test the model on unseen crashes", "Out-of-sample prediction: apply the model estimated on one subset to another and compare predicted shares with observed ones. With random parameters, probabilities are simulated. Invented numbers.");
s.addChart(pres.charts.BAR, [{ name: "Predicted by the earlier year’s model", labels: ["Property damage only", "Injury", "Fatal"], values: [320, 150, 30] }, { name: "Observed", labels: ["Property damage only", "Injury", "Fatal"], values: [300, 155, 45] }], Object.assign({}, H.chartBase, { x: 0.6, y: 1.55, w: 6.5, h: 3.1, barDir: "col", chartColors: [HEX.dk2, HEX.accent1], showValue: true, dataLabelPosition: "outEnd", showLegend: true, legendPos: "b", showTitle: true, title: "500 crashes from the following year", titleFontSize: 13, titleColor: HEX.dk2, valAxisMaxVal: 350, valAxisMinVal: 0 }));
H.card(s, 0.6, 4.75, 6.5, 1.85, "Reading it", "The old model expects 30 fatal crashes; 45 occurred. It under-predicts fatal crashes by a third.", C.accent1, { bodySize: 16 });
g(s, 1); H.card(s, 7.4, 1.55, 5.3, 3.0, "What it means", "This is temporal instability seen in practice: the earlier year’s relationships do not carry over.\n\nA stable model would give predicted shares close to the observed ones.", C.text1, { bodySize: 16 });
g(s, 2); MEM(s, 7.4, 4.75, 5.3, 1.85, "Remember: next year’s newspaper", "The fortune teller is tested on next year’s newspaper.");

s = slide(SE, "Model names you will meet in this literature", "A decoder for the method column of literature-review tables.");
s.addTable([[{ text: "Label", options: hdr }, { text: "What it is", options: hdr }],
  ["Multinomial logit (MNL)", "Scores, weights, shares; unordered outcomes"],
  ["Mixed logit, random parameters logit (RPL)", "Multinomial logit whose coefficients vary across crashes"],
  ["RPL with heterogeneity in means (and variances)", "The mean (and spread) of a random coefficient depends on other variables"],
  ["Correlated random parameters", "Two random coefficients are allowed to move together"],
  ["Random parameters binary logit", "The same idea with two outcomes"],
  ["Random parameters ordered probit", "One score and thresholds, with varying coefficients"],
  ["Partially temporally constrained model", "Years pooled; stable parameters held equal, the rest free"],
  ["Machine learning (for example support vector machines)", "Data-driven classifiers: strong at prediction, no causal reading"]],
  Object.assign({ x: 0.6, y: 1.6, w: 12.1, colW: [5.2, 6.9], rowH: 0.54 }, tbl));

// ---------------------------------------------------------------- remember and practise
pres.addSection({ title: SD });
s = slide(SD, "Seven stops to remember seven ideas", "Walk the route aloud with the class: stop, picture, idea, number. Then ask someone to do it backwards. Numbers to attach: 27%, 0.605, +100% against −20%, 18, 60 against 21, 2.8 against 2, 1 per 10,100.");
img(s, "route", 0.6, 1.5, 7.6, 2200 / 1160, "A road with seven numbered stops: costume shop, dart casino, icy bridge, gossip street, melting clock tower, fortune teller and mechanic, near-miss arcade");
H.text(s, ["1  Costume shop: one door, many costumes", "2  Dart casino: the robot Halton fills the gaps", "3  Icy bridge: signs above the hidden troll", "4  Gossip street: 100 doors, 18 opinions", "5  Melting clock tower: 60 beats 21", "6  Fortune teller and mechanic", "7  Near-miss arcade: the dragon’s tail to zero"].join("\n"), 8.5, 1.6, 4.3, 4.2, { fontSize: 16, paraSpaceAfter: 8 });
H.text(s, "Place plus strange picture plus one number: enough to rebuild each idea.", 0.6, 5.85, 12.1, 0.6, { fontSize: 17, bold: true, color: C.accent1 });

s = slide(SD, "The Logit Hotel: one model per floor", "The hotel holds the models; the road trip holds the ideas. Climb from the ground floor: each floor adds one thing to the one below.");
[["Floor 5", "Masked ball", "Latent class logit", C.accent3], ["Floor 4", "Costume party", "Mixed logit", C.accent5], ["Floor 3", "Thermometer staircase", "Ordered logit", C.accent2], ["Floor 2", "Twin rooms", "Nested logit", C.accent6], ["Floor 1", "Balloon buffet", "Multinomial logit", C.accent1], ["Ground", "Two-way door", "Binary logit", C.text2]].forEach(([f, p, m, c], i) => {
  const y = 1.55 + i * 0.84; if (i < 5) g(s, 5 - i); else s._g = 0;
  s.addShape(pres.shapes.RECTANGLE, { x: 2.2, y, w: 8.9, h: 0.76, fill: { color: C.background2 }, line: { color: C.background2, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 2.2, y, w: 1.6, h: 0.76, fill: { color: c }, line: { color: c, width: 0 } });
  H.text(s, f, 2.2, y, 1.6, 0.76, { align: "center", valign: "middle", bold: true, color: C.background1, fontSize: 16 });
  H.text(s, p, 4.05, y, 3.4, 0.76, { valign: "middle", fontSize: 17, bold: true }); H.text(s, m, 7.5, y, 3.4, 0.76, { valign: "middle", fontSize: 17, color: C.text2 }); });

s = slide(SD, "Seven questions for any accident study", "A reading guide and a self-check for your own manuscript. A paper need not answer all seven, but it should be clear which ones its method addresses.");
["Does the model let effects differ across people and sites?", "If it is simulated, were enough draws used?", "Could any explanatory variable be a response to risk, or a personal choice?", "Are neighbouring sites and repeated years treated as related?", "Were the parameters tested for stability over time?", "Does it claim prediction or causation, and does the method support that?", "If it uses conflicts, how is the link to crashes established?"].forEach((t, i) => {
  const y = 1.6 + i * 0.7; if (i > 0) g(s, i); H.lamp(s, 0.6, y, 0.5, C.accent1, i + 1, { fontSize: 14 }); H.text(s, t, 1.3, y, 11.4, 0.5, { fontSize: 18, valign: "middle" }); });

s = slide(SD, "Try it yourself", "The website has a tool for every idea and every model, a ten-step case study with a likelihood ratio test calculator (study.html), twelve practice problems with stepwise solutions, both memory places and the study guide.");
[["Learn", "Seven ideas, each with a tool you can move", "learn.html", C.accent1], ["Models and case study", "The logit family, and a full study in ten steps", "models.html", C.accent5], ["Practice", "Eight scenarios and twelve problems", "practice.html", C.accent6], ["Remember", "The road trip and the Logit Hotel", "memory.html", C.accent2]].forEach(([t, b, u, c], i) => {
  const x = 0.6 + i * 3.07; H.card(s, x, 1.6, 2.9, 2.6, t, b, c, { bodySize: 16, titleSize: 22 });
  s.addText([{ text: "Open the page", options: { hyperlink: { url: SITE + u, tooltip: t + " page" } } }], { x: x + 0.25, y: 3.55, w: 2.4, h: 0.4, fontSize: 15, isTextBox: true, margin: 0, color: C.accent1 }); });
H.card(s, 0.6, 4.4, 12.1, 2.15, "Study guide", "36 pages: mind maps, hand calculations, a quiz, a one-page cheat sheet and an answer key.\nsmrahmanbd.github.io/AMAR-Methods-Learning", C.text1, { bodySize: 18 });

// ---------------------------------------------------------------- research
const SR = "Current research";
pres.addSection({ title: SR });
s = slide(SR, "What current research is doing", "Eight recent papers from Analytic Methods in Accident Research, checked in November 2026. The summaries follow the published abstracts; read the papers before citing them. The Editor-in-Chief's note could not be opened, so nothing is drawn from it.", "SECTION");
s.addText("Eight recent papers in plain words, what is still open, and six starter questions", { placeholder: "body" });

s = slide(SR, "Five directions in recent papers", "Each direction is one of the seven ideas, taken a step further. The next slides give one or two papers for each.");
[["Time", "Beyond one model per year: which effects change, and for whom?", C.accent2], ["Groups", "Let clustering or hidden segments suggest how to split the data", C.accent5], ["Machine learning", "Can variable effects from deep learning be trusted?", C.accent3], ["Conflicts", "How much data, which threshold, which measure?", C.text2], ["Good practice", "How to predict and report effects with random parameters", C.accent6]].forEach(([t, b, c], i) => {
  const x = 0.6 + i * 2.45; if (i > 0) g(s, i); H.card(s, x, 1.7, 2.3, 3.6, null, null); H.lamp(s, x + 0.2, 1.9, 0.55, c, i + 1); H.text(s, t, x + 0.2, 2.65, 1.95, 0.5, { fontSize: 18, bold: true }); H.text(s, b, x + 0.2, 3.2, 1.95, 1.9, { fontSize: 15, color: C.text2 }); });
s._g = 0; H.text(s, "Source: Analytic Methods in Accident Research, 2022–2026.", 0.6, 5.7, 12.1, 0.4, { fontSize: 14, color: C.text2 });

s = slide(SR, "Time: which effects change, and for whom?", "Shabab et al. (2024): only the title and citation were checked. Bhowmik et al. (2026) used three survey years five years apart. Still open: whether effects that look stable over three years stay stable when a fourth is added.");
H.card(s, 0.6, 1.55, 5.95, 2.9, "Bhowmik, Pervaz, Mannering and Eluru (2026)", "The model sorts crashes into hidden segments and asks which segment changes over time.\n\nChange was concentrated in a low-injury-risk segment; the high-risk segment stayed stable.", C.accent2, { bodySize: 16, titleSize: 17 });
H.card(s, 6.75, 1.55, 5.95, 2.9, "Shabab, Bhowmik, Zaki and Eluru (2024)", "Proposes one unified framework for temporal instability, in place of a separate model for every period.", C.accent2, { bodySize: 16, titleSize: 17 });
g(s, 1); H.card(s, 0.6, 4.65, 12.1, 1.95, "Still open", "Do effects that look stable over three years stay stable when a fourth year is added? How should we forecast when parameters keep drifting?", C.text1, { bodySize: 17 });

s = slide(SR, "Groups and machine learning", "Alnawmasi and Mannering (2025) used Virginia single-vehicle crashes from 2021 and 2022. Seyfi et al. (2025) studied motorcycle crashes at urban intersections in the UK, 2016 to 2019.");
H.card(s, 0.6, 1.55, 5.95, 2.9, "Alnawmasi and Mannering (2025)", "Group similar crashes with a simple clustering step, then fit random parameters models with heterogeneity in means and variances to each cluster and year.\n\nThe clustered models fitted better and gave more precise marginal effects.", C.accent5, { bodySize: 15, titleSize: 17 });
H.card(s, 6.75, 1.55, 5.95, 2.9, "Seyfi and co-authors (2025)", "Deep neural networks against random parameters logit models.\n\nVariable effects from deep learning often disagreed with the statistical models in size, and sometimes in direction.", C.accent3, { bodySize: 15, titleSize: 17 });
g(s, 1); H.card(s, 0.6, 4.65, 12.1, 1.95, "Still open", "Do data-driven groups beat road class or region, and are they stable from year to year? How can trustworthy variable effects be obtained from a prediction machine?", C.text1, { bodySize: 17 });

s = slide(SR, "Conflicts: making estimates dependable", "All three appeared in volume 44 (2024). Block maxima uses the most severe conflict in each time block; peak over threshold uses every conflict beyond a threshold. Copulas describe how two measures move together.");
H.card(s, 0.6, 1.55, 3.9, 3.0, "Niu, Sayed, Fu and Mannering (2024)", "Compared extreme value approaches. A threshold that adapts to conditions fitted better than a fixed one.", C.text2, { bodySize: 15, titleSize: 16 });
H.card(s, 4.7, 1.55, 3.9, 3.0, "Nazir, Ali and Haque (2024)", "How much data is enough? Peak-over-threshold models were more stable than block-maxima models; small samples give unreliable estimates.", C.text2, { bodySize: 15, titleSize: 16 });
H.card(s, 8.8, 1.55, 3.9, 3.0, "Chen and co-authors (2024)", "Combined copulas with extreme value theory so that interactions of all severities are used, not only the most extreme.", C.text2, { bodySize: 15, titleSize: 16 });
g(s, 1); H.card(s, 0.6, 4.75, 12.1, 1.85, "Still open", "How much video is enough, how to set the threshold without guesswork, and how to combine several conflict measures.", C.text1, { bodySize: 17 });

s = slide(SR, "Good practice: predicting and reporting effects", "Hou, Huo, Leng and Mannering (2022), volume 33. The global test pools all years against separate yearly models; the pairwise test applies one year's parameters to another year. This paper is the natural methodological reference for a study built on random parameters, marginal effects and temporal tests.");
H.card(s, 0.6, 1.55, 5.95, 5.05, "Hou, Huo, Leng and Mannering (2022)", "Compared a fixed-parameter multinomial logit with three random-parameter versions.\n\n1  The model with heterogeneity in means and variances predicted best out of sample.\n\n2  Two ways of computing marginal effects both gave defensible results.\n\n3  Testing years pair by pair revealed more detail than one global test.", C.accent6, { bodySize: 16, titleSize: 18 });
g(s, 1); H.card(s, 6.75, 1.55, 5.95, 2.4, "Why it matters to a beginner", "It tells you which choices are safe when you predict, compute marginal effects and test stability with random parameters.", C.accent1, { bodySize: 16 });
g(s, 2); H.card(s, 6.75, 4.15, 5.95, 2.45, "Still open", "A shared standard for reporting marginal effects and out-of-sample checks, so that studies can be compared.", C.text1, { bodySize: 16 });

s = slide(SR, "Six starter questions for a first project", "Suggestions for learning the methods on real data. They are not findings, and a literature search should come before any of them.");
[["Add a year", "Extend a published design by one year. Are the “stable” effects still stable?"], ["Cluster first", "Split by road class, by clustering and by hidden classes. Which fits best?"], ["Machine against model", "Do a classifier and a random parameters logit agree on the direction of each effect?"], ["Transfer across regions", "Does a model from one region fit another?"], ["How fragile is the threshold?", "Re-estimate conflict-based crash risk for several thresholds and sample sizes."], ["Report it twice", "Compute marginal effects by two methods and show where they differ."]].forEach(([t, b], i) => {
  const x = 0.6 + (i % 3) * 4.1, y = 1.6 + Math.floor(i / 3) * 2.55; if (i > 0) g(s, i); H.card(s, x, y, 3.9, 2.35, (i + 1) + " · " + t, b, [C.accent2, C.accent5, C.accent3, C.accent1, C.text2, C.accent6][i], { bodySize: 15, titleSize: 17 }); });

s = slide(SR, "How to read a methods paper in fifteen minutes", "Practise on one of the eight papers. Read the marginal effects, not the coefficients.");
["Abstract and end of the introduction: what is the one methodological claim?  (2 min)", "Data: what is one observation, how many, which years?  (2 min)", "Method: find the score function. Which of the seven ideas does it address?  (4 min)", "Tables: log-likelihood, number of parameters, which parameters are random, marginal effects  (4 min)", "Tests: which likelihood ratio tests were run, and which were rejected?  (2 min)", "Conclusions: prediction or cause, and did the method earn that claim?  (1 min)"].forEach((t, i) => {
  const y = 1.65 + i * 0.8; if (i > 0) g(s, i); H.lamp(s, 0.6, y, 0.5, C.accent1, i + 1, { fontSize: 14 }); H.text(s, t, 1.3, y, 11.4, 0.5, { fontSize: 17, valign: "middle" }); });

s = slide(SR, "References: foundations", "The Editor-in-Chief's note is the recommended overview; it could not be opened while this lecture was prepared, so nothing here quotes it. Examples attributed to a paper come from that paper; all numbers are invented for teaching.");
H.text(s, ["A note from the new Editor-in-Chief of Analytic Methods in Accident Research. Analytic Methods in Accident Research 47, 100389 (2025).",
  "Mannering, F. and Bhat, C. (2014). Analytic methods in accident research: Methodological frontier and future directions. AMAR 1, 1–22.",
  "Mannering, F., Shankar, V. and Bhat, C. (2016). Unobserved heterogeneity and the statistical analysis of highway accident data. AMAR 11, 1–16.",
  "Mannering, F. (2018). Temporal instability and the analysis of highway accident data. AMAR 17, 1–13.",
  "Mannering, F., Bhat, C., Shankar, V. and Abdel-Aty, M. (2020). Big data, traditional data and the tradeoffs between prediction and causality in highway-safety analysis. AMAR 25, 100113.",
  "Arun, A., Haque, M., Sayed, T. and Mannering, F. (2021). A systematic review of traffic conflict-based safety measures with a focus on application context. AMAR 32, 100185.",
  "Ali, Y., Haque, M. and Mannering, F. (2023). Assessing traffic conflict/crash relationships with extreme value theory. AMAR 39, 100276."].join("\n"), 0.6, 1.6, 12.1, 4.6, { fontSize: 15, paraSpaceAfter: 9 });
H.text(s, "AMAR = Analytic Methods in Accident Research. Numbers in examples are illustrative.", 0.6, 6.3, 12.1, 0.4, { fontSize: 14, color: C.text2 });

s = slide(SR, "References: recent papers", "All in Analytic Methods in Accident Research. The volume of Shabab et al. (2024) could not be confirmed and is omitted.");
H.text(s, ["Hou, Q., Huo, X., Leng, J. and Mannering, F. (2022). A note on out-of-sample prediction, marginal effects computations, and temporal testing with random parameters crash-injury severity models. AMAR 33, 100191.",
  "Shabab, K. R., Bhowmik, T., Zaki, M. H. and Eluru, N. (2024). A systematic unified approach for addressing temporal instability in road safety analysis. AMAR, 100335.",
  "Chen, Z., Yastremska-Kravchenko, O., Laureshyn, A., Johnsson, C. and D’Agostino, C. (2024). Stochastic method based on copulas for predicting severe road traffic interactions. AMAR 44, 100347.",
  "Niu, D., Sayed, T., Fu, C. and Mannering, F. (2024). A cross-comparison of different extreme value modeling techniques for traffic conflict-based crash risk estimation. AMAR 44, 100352.",
  "Nazir, F., Ali, Y. and Haque, M. M. (2024). Effects of sample size on pedestrian crash risk estimation from traffic conflicts using extreme value models. AMAR 44, 100353.",
  "Seyfi, M. A., Karimi Mamaghan, A. M., Behnood, A. and Mannering, F. (2025). Analyzing crash injury severities with deep learning and advanced statistical models: An assessment of methodological challenges. AMAR 48, 100405.",
  "Alnawmasi, N. and Mannering, F. (2025). A note on random parameters models of crash injury severities with k-means clustering for data preprocessing. AMAR 48, 100408.",
  "Bhowmik, T., Pervaz, S., Mannering, F. and Eluru, N. (2026). An exploratory latent segmentation approach to account for temporally shifting parameters in driver injury-severity models. AMAR 50, 100428."].join("\n"), 0.6, 1.55, 12.1, 4.9, { fontSize: 14, paraSpaceAfter: 7 });

H.save(__dirname + "/../docs/materials/AMAR_Methods_Presentation.pptx");
