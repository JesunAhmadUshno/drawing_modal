// Known-answer self-check, run by `npm run build` before vite: loads the unmodified ../drawingCapture.js
// and asserts its math, plus every code fact the page displays. About a second, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCaptureClass, w3cAltitude, w3cAzimuth, eventTypes, pointFields, classNames, idleMs, hoverThrottleMs, segments } from './capture.js';

const src = readFileSync(new URL('../../drawingCapture.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../../advanced-final.js', import.meta.url), 'utf8');
const Sys = loadCaptureClass(src, {
  window: { screen: { width: 1440, height: 900 }, devicePixelRatio: 1 },
  navigator: { userAgent: 'node', platform: 'node', language: 'en' },
});
const ctx = new Proxy({}, { get: () => () => {} });
const canvas = { width: 400, height: 200, getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 200 }) };
const sys = new Sys(canvas, true);

// Trajectory length: 3-4-5 triangles.
assert.equal(sys.calculateTrajectoryLength([{ x: 0, y: 0 }, { x: 3, y: 4 }]), 5);
assert.equal(sys.calculateTrajectoryLength([{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 6, y: 8 }]), 10);
assert.equal(sys.calculateTrajectoryLength([{ x: 1, y: 1 }]), 0);

// Averages.
assert.deepEqual(sys.calculateAverageMetrics([{ pressure: 0.2, velocity: 10 }, { pressure: 0.4, velocity: 30 }]), { pressure: 0.3, velocity: 20, maxVelocity: 30 });

// Azimuth quadrants (repo formula) and the W3C formula agree on the axes.
for (const [tx, ty, want] of [[10, 0, 0], [0, 10, 90], [-10, 0, 180], [0, -10, 270]]) {
  assert.equal(sys.calculateAzimuth(tx, ty), want);
  assert.ok(Math.abs(w3cAzimuth(tx, ty) - want) < 1e-9);
}
// Altitude: same at vertical, diverges with tilt (the documented gap).
assert.equal(sys.calculateAltitude(0, 0), 90);
assert.equal(w3cAltitude(0, 0), 90);
const r1 = (x) => Math.round(x * 10) / 10;
assert.equal(r1(sys.calculateAltitude(30, 30)), 47.6);
assert.equal(r1(w3cAltitude(30, 30)), 50.8);
assert.equal(r1(sys.calculateAltitude(60, 60)), 5.1);
assert.equal(r1(w3cAltitude(60, 60)), 22.2);
assert.equal(sys.calculateAltitude(70, 70), 0); // clamped: the repo formula hits 0 before the pen is flat
assert.equal(r1(w3cAltitude(30, 0)), 60); // single-axis tilt: spec gives 90 - tilt exactly
assert.equal(r1(sys.calculateAltitude(30, 0)), 60);

// A full stroke through the public handlers: 3 points, 5 px apart, 100 ms apart -> 50 px/s.
sys.startSession('check');
const ev = (x, y, t) => ({ clientX: x, clientY: y, timeStamp: t, pressure: 0.5, tiltX: 0, tiltY: 0, twist: 0, width: 1, height: 1, pointerType: 'mouse' });
sys.handlePointerDown(ev(0, 0, 1000));
sys.handlePointerMove(ev(3, 4, 1100));
sys.handlePointerMove(ev(6, 8, 1200));
sys.handlePointerUp(ev(6, 8, 1200));
const stroke = sys.session.strokeData[0];
assert.equal(stroke.points.length, 3);
assert.deepEqual(stroke.points.map((p) => p.velocity), [0, 50, 50]);
assert.equal(stroke.trajectoryLength, 10);
assert.equal(stroke.averageVelocity, 33.33);
assert.equal(stroke.maxVelocity, 50);
assert.equal(stroke.pressureData, false); // a real pen at exactly 0.5 is misclassified as "no pressure"

// Per-point fields: what addPoint writes equals what the source parse finds (shown on the page).
const fields = pointFields(src);
assert.deepEqual(Object.keys(stroke.points[0]), fields);
assert.equal(fields.length, 14);

// Hover clock mix: captureHoverPoint stores event.timeStamp but subtracts it from Date.now(),
// so a pen moving 100 px in 100 ms reports almost 0 px/s.
sys.handlePointerMove({ ...ev(0, 0, 5000), pointerType: 'pen' });
const t0 = Date.now(); while (Date.now() - t0 < 60); // pass the hover throttle
sys.handlePointerMove({ ...ev(100, 0, 5100), pointerType: 'pen' });
const hv = sys.currentHoverPath.points.at(-1).velocity;
assert.ok(hv < 0.01, `hover velocity ${hv} should be ~0 because of the clock mix`);

// Event log and code facts.
sys.completeSession();
const types = eventTypes(src);
assert.deepEqual(types, ['session_start', 'idle_detect', 'draw_start', 'draw_end', 'hover_start', 'hover_end', 'session_complete']);
assert.deepEqual(sys.session.events.map((e) => e.type), ['session_start', 'draw_start', 'draw_end', 'hover_start', 'hover_end', 'session_complete']);
assert.equal(segments(sys.session.events).active.length, 1);
assert.deepEqual(classNames(src), ['DrawingCaptureSystem']);
assert.deepEqual(classNames(app), ['DrawingSession', 'DrawingApp']);
assert.equal(idleMs(src), 2000);
assert.equal(hoverThrottleMs(src), 50);
assert.equal(sys.getSessionData().metadata.totalPoints, 3);

// Main-app hover wiring: handleMove returns before reaching the capture system when not drawing.
const hm = app.slice(app.indexOf('handleMove(e) {'));
assert.ok(hm.indexOf('if (!this.isDrawing) return;') < hm.indexOf('this.captureSystem.handlePointerMove(e)'), 'hover gap in advanced-final.js changed: update the audit');

console.log('capture ok', { fields: fields.length, events: types.length, altitude60: [r1(sys.calculateAltitude(60, 60)), r1(w3cAltitude(60, 60))], hoverVelocity: hv });
