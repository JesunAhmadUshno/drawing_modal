# Research and engineering review

Scope: `drawingCapture.js` (DrawingCaptureSystem), `advanced-final.js` (DrawingSession, DrawingApp), the three HTML pages and the docs, reviewed on branch `site/live-dashboard`.
This is a product app pitched for research use, so it is graded on an engineering rubric, with the research criteria applied to its measurement claims.

**Overall grade: C+.** Wide capture scope and a lot of documentation, but until this branch there was no verification, and several core measurements are wrong or unvalidated.

## How to check the claims below

```bash
node site/src/capture.check.mjs      # no install needed; about a second
cd site && npm ci && npm run build   # runs the same check, then builds the dashboard
```

The check loads the unmodified `drawingCapture.js` and asserts trajectory length (3-4-5 triangles), per-point velocity (5 px in 100 ms = 50 px/s), stroke averages, azimuth quadrants, the altitude divergence from the W3C conversion, the 14 per-point fields, the 7 event types, the near-zero hover velocity, and the hover-wiring order in `advanced-final.js`.

## Rubric

| Criterion | Grade | Evidence |
|---|---|---|
| Question / purpose | B | Clear product goal: capture drawing behaviour in the browser with no server. The research question the data should answer is never stated. |
| Hypotheses | n/a | A capture tool, not a study. The implicit claim is "the recorded values are accurate", which is testable but untested (see Validation). |
| Method / correctness | C- | Velocity and trajectory math are correct (asserted). Altitude, azimuth, hover velocity and clock handling are not (below). |
| Baselines | D | No comparison against device ground truth or the W3C spec conversion. The dashboard now shows the spec side by side. |
| Statistics / uncertainty | D | No sampling-rate, jitter or latency figures; derived values are reported to 2 decimals with no error estimate. |
| Reproducibility | C | Static files, no build, works offline. No sample sessions committed, so nobody can rerun an analysis. |
| Tests | F, now C | No tests before this branch. Now one known-answer check, run by the dashboard build. No tests for DrawingApp UI paths. |
| Threats / limitations | D, now B- | Not documented before. Now listed here and in the dashboard's audit window. |
| Related work | D | No reference to the Pointer Events spec or prior stylus-capture tools. The spec is now cited for the tilt conversion. |
| Docs accuracy | D, now C+ | See "Fixed on this branch". |

## Defects found

1. **Hover capture is dead in the shipped app.** `DrawingApp.handleMove` returns on `!this.isDrawing` before calling `captureSystem.handlePointerMove`, so `index.html` never records in-air points. It only works in `advanced.html`. Asserted by the check.
2. **Hover velocity reads about 0.** `captureHoverPoint` stores `event.timeStamp` (ms since page load) but subtracts it from `Date.now()` (epoch ms). Asserted: a pen moving 100 px in 100 ms reports under 0.01 px/s. The dashboard reproduces it live.
3. **Mixed clocks in one export.** Stroke `startTimeMs/endTimeMs` use `Date.now()`; point `timestamp` uses `event.timeStamp`.
4. **Altitude is not the Pointer Events conversion.** The code computes `90 - sqrt(tiltX² + tiltY²)` (it converts to radians and straight back). 30°/30° gives 47.6° vs 50.8° from the spec; 60°/60° gives 5.1° vs 22.2°; 70°/70° clamps to 0. Azimuth uses `atan2(tiltY, tiltX)` rather than `atan2(tan tiltY, tan tiltX)`; the two agree on the axes and differ off them. All asserted.
5. **`pressureData` heuristic.** `pressure !== 0.5` marks a real pen at exactly 0.5 as "no pressure". Asserted.
6. **`activeDuration` counts pointer-down time only**; shape-tool drags and the 2,000 ms idle threshold are hard-coded and unvalidated.
7. **`pointerleave` calls `handleEnd`** in the app, silently splitting strokes that leave the canvas.
8. **Two parallel models.** DrawingSession (px/ms) and DrawingCaptureSystem (px/s) compute velocity in different units and export separately.

## Fixed on this branch (cheap, no product behaviour change)

- README Pages host typo `jesunachmadushno` corrected (4 places); the non-existent `docs/` paths removed from the project tree and local-setup steps.
- "20+ measurements per point" (README) and "13+" (technical docs) reconciled to the counted 14 fields written by `addPoint`.
- TECHNICAL_DOCUMENTATION now documents the altitude formula as implemented (it claimed an arctan the code never applies) and states the spec divergence.
- First known-answer check (`site/src/capture.check.mjs`), run on every dashboard build.
- `.gitignore` for build output.

## Deliberately not changed (needs the Owner's call, and a stylus)

These are one- or two-line fixes, but each changes values in the live product's exports, and the hover fixes can only be verified with a real pen:

- Hover wiring: in `advanced-final.js` `handleMove`, call `this.captureSystem.handlePointerMove(e)` before the `!this.isDrawing` return. Verify with a stylus on `index.html`.
- Hover clock: in `captureHoverPoint`, use `const now = event.timeStamp || performance.now()` for both the throttle and the velocity delta. The check's hover assertion flips to expecting ~1,000 px/s.
- Altitude/azimuth: switch to the W3C conversion (already implemented as `w3cAltitude/w3cAzimuth` in `site/src/capture.js`); update the check's expected values.
- Clocks: put stroke start/end on `event.timeStamp` too, or record both clocks explicitly.

## Remaining gaps and what each needs

| Gap | What closes it | Compute / data needed |
|---|---|---|
| No validation of position and length | Draw a ruler-guided straight line of known length on 2 devices, compare `trajectoryLength` | A tablet and a ruler; about 30 minutes; commit the session JSONs |
| No tilt ground truth | Hold a pen in a printed angle jig at 0/30/60°, compare reported tilt and both altitude formulas | One stylus (Apple Pencil or Wacom), a printed jig; under an hour |
| No sampling-rate / latency figures | Log inter-event intervals over 10 s of continuous drawing per device and browser | 3 to 4 device-browser pairs; a short script over exported JSON; no GPU |
| No sample data for replay | Commit 3 to 5 consented, anonymised sessions (user agent stripped) | Volunteer sessions; then the dashboard can add a replay labelled "recorded" |
| Idle threshold unvalidated | Distribution of inter-stroke pauses from the sessions above | Same sessions; seconds of CPU |
| No UI tests for DrawingApp | jsdom or Playwright tests for tool switching, shape drag and export | Adds a dev dependency; under a minute to run |
