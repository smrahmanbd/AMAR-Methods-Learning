# AMAR Methods Learning

A beginner-friendly package on the statistical ideas that papers in *Analytic Methods in Accident Research* keep returning to. Each idea has an animation you can control, a calculation worked one step at a time, and a picture to remember it by.

**Website:** https://smrahmanbd.github.io/AMAR-Methods-Learning/

| # | Idea | In one sentence | Memory stop |
|---|---|---|---|
| 1 | Unobserved heterogeneity | The same variable affects different people differently, for reasons the data do not record. | The costume shop |
| 2 | Simulated maximum likelihood | When a formula has no exact answer, average over many draws. | The dart casino |
| 3 | Endogeneity | Something unseen drives both the variable and the outcome. | The icy bridge |
| 4 | Spatial and temporal correlation | Neighbouring sites and consecutive years are not independent. | Gossip street |
| 5 | Temporal instability | Effects drift from one period to the next. | The melting clock tower |
| 6 | Prediction versus causality | A good forecast is not the effect of a change. | The fortune teller and the mechanic |
| 7 | Crash–conflict relationship | Near misses can be used to estimate crash risk. | The near-miss arcade |

## What is here

| Part | Where | What it is |
|---|---|---|
| Learn | `docs/learn.html` | Seven sections, each with an interactive tool, a step-by-step worked example and a memory hook |
| Basics | `docs/basics.html` | Logit and likelihood from zero: probability, odds and log-odds; likelihood and log-likelihood; the likelihood ratio test, degrees of freedom, p-values; AIC and BIC |
| Restricted vs unrestricted | `docs/restricted.html` | Four animations (one line or two, restrictions as locks, what chance alone looks like, degrees of freedom) and three full examples of the likelihood ratio test |
| Models | `docs/models.html` | The logit family built up one model at a time: binary, multinomial, nested, ordered, mixed (random parameters) and latent class, each with a tool, a worked example and a "go deeper" note; plus count models (Poisson, negative binomial) |
| Multinomial logit from zero | `docs/mnl.html` | An eight-step walk-through of one crash: scores, weights, the base outcome, odds ratios, marginal effects, maximum likelihood, fit and the model's weak spot |
| Case study | `docs/study.html` | A full severity study in ten steps: 0/1 coding, splitting by road class and year, backward selection, random parameters with heterogeneity in means and variances, average marginal effects, transferability, merge and temporal-stability tests, partially constrained models and out-of-sample prediction; six tools including a likelihood ratio test calculator |
| Research | `docs/research.html` | Eight recent papers from the journal in plain words, sorted into five themes, with open questions, six starter project ideas and a fifteen-minute paper-reading routine |
| Practice | `docs/practice.html` | Eight "which issue is it?" scenarios and twelve numeric problems with stepwise solutions |
| Remember | `docs/memory.html` | A seven-stop memory route for the ideas, a six-floor "Logit Hotel" for the models, flip cards, an ordering self-test and a review plan |
| Study guide | `docs/materials/AMAR_Methods_Study_Guide.pdf` | 36 pages: mind maps, hand calculations, quiz, cheat sheet, answer key |
| Presentation | `docs/materials/AMAR_Methods_Presentation.pptx` (and `.pdf`) | 52 slides on the seven ideas, the basics of logit and likelihood, the logit family, a full study in ten steps and current research, with click-by-click hand calculations and speaker notes |
| Reading list | `research/literature.md` | The review papers the explanations follow |
| Build scripts | `tools/` | Scripts that generate the pages, the study guide and the presentation |

## Notes

- All data in the tools and all numbers in the examples are simulated or invented for teaching.
- The overview article "A note from the new Editor-in-Chief of Analytic Methods in Accident Research" (volume 47, 100389) is listed as recommended reading. It could not be opened while this material was prepared, so nothing here quotes it.
- This is an independent learning aid, not affiliated with the journal or its publisher.

## Run locally

```
python3 -m http.server -d docs 8000
```
