// Shared by the page and by capture.check.mjs (node). Everything here takes the repo's own
// source text, so the engine that runs and the code facts that are shown come from the files.

const QUIET = { log() {}, info() {}, warn() {}, error() {}, debug() {} };

// drawingCapture.js is a classic script with no export. Evaluate it unmodified and hand back the class.
// console is shadowed so the engine's progress logging stays out of the visitor's console.
export function loadCaptureClass(src, env = {}) {
  const win = env.window ?? globalThis.window;
  const nav = env.navigator ?? globalThis.navigator;
  // eslint-disable-next-line no-new-func
  return new Function('console', 'window', 'navigator', `${src}\nreturn DrawingCaptureSystem;`)(QUIET, win, nav);
}

const D = Math.PI / 180;

// W3C Pointer Events Level 3 tilt -> altitude/azimuth conversion (spec section "Converting between tiltX/tiltY and altitudeAngle/azimuthAngle"), in degrees.
export function w3cAltitude(tx, ty) {
  if (tx === 0 && ty === 0) return 90;
  if (Math.abs(tx) === 90 || Math.abs(ty) === 90) return 0;
  return Math.atan(1 / Math.hypot(Math.tan(tx * D), Math.tan(ty * D))) / D;
}
export function w3cAzimuth(tx, ty) {
  if (tx === 0 && ty === 0) return 0;
  let a = Math.atan2(Math.tan(ty * D), Math.tan(tx * D)) / D;
  if (a < 0) a += 360;
  return a;
}

// Code facts parsed from source text.
export const lineCount = (src) => src.replace(/\n$/, '').split('\n').length;
export const classNames = (src) => [...src.matchAll(/^class (\w+)/gm)].map((m) => m[1]);
export const eventTypes = (src) => [...new Set([...src.matchAll(/logEvent\('(\w+)'/g)].map((m) => m[1]))];
export function pointFields(src) {
  const body = src.slice(src.indexOf('addPoint(event, x, y) {'));
  const lit = body.slice(body.indexOf('const point = {') + 15, body.indexOf('};'));
  return [...lit.matchAll(/^\s*(\w+):/gm)].map((m) => m[1]);
}
export const idleMs = (src) => +src.match(/\}, (\d+)\); \/\/ \d+ seconds/)[1];
export const hoverThrottleMs = (src) => +src.match(/now - this\.lastHoverTime\) < (\d+)/)[1];

// Pause and active segments of a session, from the engine's own event log.
export function segments(events) {
  const out = [];
  let open = null;
  for (const e of events) {
    if (e.type === 'draw_start') open = e.timestamp;
    if (e.type === 'draw_end' && open != null) { out.push([open, e.timestamp]); open = null; }
  }
  return { active: out, open };
}
