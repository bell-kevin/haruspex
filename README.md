<a name="readme-top"></a>

# haruspex

https://overconfident.org

**A local-first calibration ledger.** Log predictions about your own life with a probability attached, judge them when their day comes, and let the app read the entrails: Brier scores, a calibration curve, overconfidence detection, and a confidence-interval training ground.

A *haruspex* was the Etruscan diviner who read the future in a sacrificed animal's liver — the bronze [Liver of Piacenza](https://en.wikipedia.org/wiki/Liver_of_Piacenza) was literally a reference chart for doing it. This haruspex asks for a smaller offering: your honest probabilities. Then it tells you, with numbers, whether your "80% sure" actually means 80%.

## Why

Almost everyone is overconfident, and almost no one keeps score. Weather forecasters and professional superforecasters are well calibrated for exactly one reason: they write predictions down with probabilities and get graded. This app gives you the same loop with zero ceremony:

1. **Ledger** — state something the future can prove right or wrong ("the go/no-go review passes on the first try"), attach a credence from 1–99%, pick a judge-by date.
2. **Judge it** when the date arrives — came true, didn't, or void (excluded from scoring). Overdue predictions get a badge so they can't hide.
3. **Calibration** — the reading. Your Brier score (0 = prophet, 0.25 = coin flip), directional accuracy, a calibration curve of stated confidence vs. observed reality, a confidence histogram, a rolling trend, and a per-category breakdown so you can learn that you're sharp about work and delusional about the gym.
4. **Workout** — ten numeric trivia questions per round; for each you give a range you're *90% sure* contains the answer. Well-calibrated people capture ~9 of 10. Most people capture far fewer. Your capture rate is tracked across rounds against the 90% target.

Judgment days can be exported as an **.ics calendar** so your phone reminds you when a prediction is due. The whole vault exports/imports as plain JSON.

## Local-first, actually

- No accounts, no server, no database, no telemetry, no cookies, no web fonts, no CDN. The page makes **zero network requests** at runtime.
- All data lives in your browser's `localStorage` under the key `haruspex.v1`. The export button is the only way data leaves the page, and you press it.
- The only runtime dependencies are `react` and `react-dom`. Charts are hand-rolled SVG; the calendar export is hand-rolled RFC 5545; the math is ~100 lines you can audit in [`src/lib/scoring.ts`](src/lib/scoring.ts).

## Scoring, briefly

For a prediction with stated probability *p* and outcome *o* ∈ {0, 1}, the Brier score is (*p* − *o*)². Lower is better; always answering 50% scores exactly 0.25, so beating a coin flip means beating 0.25. For the calibration curve, predictions are *folded* so confidence always reads 50–100 (a 30% "yes" is a 70% "no"), then bucketed into 50s/60s/70s/80s/90s bins; each bin's observed hit rate is plotted against its mean stated confidence. Perfect calibration sits on the diagonal. Below it you were too bold; above it, too humble.

## Getting started

Requires Node ≥ 18.

```sh
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run typecheck  # strict TypeScript, no emit
```

## Deploying

The build is a fully static site — `index.html`, one JS bundle, one CSS file, one SVG favicon — so it publishes anywhere static files go:

- **Bolt.new**: import the GitHub repo (`bolt.new/~/github.com/<you>/haruspex`), then publish. No server config needed; there's nothing dynamic to configure.
- **Netlify / any static host**: build command `npm run build`, publish directory `dist`.

## Data format

The vault is versioned JSON:

```jsonc
{
  "v": 1,
  "predictions": [
    {
      "id": "…",
      "statement": "It snows in the valley before Thanksgiving",
      "p": 78,                    // credence it comes TRUE, integer 1–99
      "category": "world",
      "createdAt": "2026-07-18T…",
      "resolveBy": "2026-11-26",  // judge-by date
      "resolvedAt": "…",          // present once judged
      "outcome": "yes"            // "yes" | "no" | "void"
    }
  ],
  "workouts": [ { "id": "…", "at": "…", "hits": 8, "items": [ … ] } ]
}
```

Importing merges by `id` (incoming entries win), so a JSON export doubles as a backup and a device-to-device transfer.

## The question bank

The workout draws from ~50 numeric facts chosen to be verifiable, stable over time, and unambiguous (`src/lib/questions.ts`). Additions are very welcome — keep them boring in exactly that way.

## Stack

Every layer is free software: [React](https://react.dev) (MIT), [Vite](https://vitejs.dev) (MIT), [TypeScript](https://www.typescriptlang.org) (Apache-2.0). Everything else — storage, scoring, charts, calendar export — is original code in this repository under the AGPL.

## License

Copyright © 2026 Kevin Bell.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. See [LICENSE](LICENSE).


--------------------------------------------------------------------------------------------------------------------------
== We're Using GitHub Under Protest ==

This project is currently hosted on GitHub.  This is not ideal; GitHub is a
proprietary, trade-secret system that is not Free and Open Souce Software
(FOSS).  We are deeply concerned about using a proprietary system like GitHub
to develop our FOSS project. I have a [website](https://bellKevin.me) where the
project contributors are actively discussing how we can move away from GitHub
in the long term.  We urge you to read about the [Give up GitHub](https://GiveUpGitHub.org) campaign 
from [the Software Freedom Conservancy](https://sfconservancy.org) to understand some of the reasons why GitHub is not 
a good place to host FOSS projects.

If you are a contributor who personally has already quit using GitHub, please
email me at **kevinBell@Linux.com** for how to send us contributions without
using GitHub directly.

Any use of this project's code by GitHub Copilot, past or present, is done
without our permission.  We do not consent to GitHub's use of this project's
code in Copilot.

![Logo of the GiveUpGitHub campaign](https://sfconservancy.org/img/GiveUpGitHub.png)

<p align="right"><a href="#readme-top">back to top</a></p>
