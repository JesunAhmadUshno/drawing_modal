import { useState, useEffect, useRef, useId, useMemo, useCallback } from 'react';
import captureSrc from '../../drawingCapture.js?raw';
import appSrc from '../../advanced-final.js?raw';
import { loadCaptureClass, w3cAltitude, w3cAzimuth, lineCount, classNames, eventTypes, pointFields, idleMs, hoverThrottleMs, segments } from './capture.js';

const REPO = 'https://github.com/JesunAhmadUshno/drawing_modal';
const blob = (p) => `${REPO}/blob/main/${p}`;
const Capture = loadCaptureClass(captureSrc);

// Code facts, parsed from the source files at build time.
const FACTS = {
  captureLines: lineCount(captureSrc),
  appLines: lineCount(appSrc),
  classes: [...classNames(captureSrc), ...classNames(appSrc)],
  events: eventTypes(captureSrc),
  fields: pointFields(captureSrc),
  idleMs: idleMs(captureSrc),
  hoverMs: hoverThrottleMs(captureSrc),
};
const EVENT_COLOR = { session_start: 'var(--primary)', draw_start: 'var(--good)', draw_end: 'var(--good)', hover_start: 'var(--warn)', hover_end: 'var(--warn)', idle_detect: 'var(--muted)', session_complete: 'var(--bad)' };

const SECTIONS = [['top', 'Overview', '◎'], ['pad', 'Capture pad', '✎'], ['velocity', 'Velocity', '∿'], ['timeline', 'Timeline', '◷'], ['tilt', 'Tilt', '∠'], ['export', 'Export', '{}'], ['pipeline', 'Pipeline', '⇢'], ['audit', 'Audit', '✓']];
const fmt = (n, d = 0) => (Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }) : '0');

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

function MenuBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  return (
    <div className="menubar" role="banner">
      <span className="apple" aria-hidden="true">◆</span>
      <a className="app" href="#top">drawingCapture.js</a>
      <a className="m" href="../">Live app</a>
      <a className="m" href="../documentation.html">Documentation</a>
      <a className="m" href={blob('TECHNICAL_DOCUMENTATION.md')}>Technical notes</a>
      <span className="spacer" />
      <span className="status"><i /> Runs in your browser</span>
      <a href={REPO}>GitHub ↗</a>
      <span className="clock">{now.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
    </div>
  );
}

function Dock() {
  const [active, setActive] = useState('top');
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="dock" aria-label="Sections">
      {SECTIONS.map(([id, label, icon]) => (
        <a key={id} href={`#${id}`} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined}>
          <span className="ico" aria-hidden="true">{icon}</span><span className="lbl">{label}</span>
        </a>
      ))}
    </nav>
  );
}

function Range({ label, value, min, max, step, onChange, show }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label} <span>{show}</span></label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </div>
  );
}

// One engine instance per page; every live window reads from it.
function useEngine() {
  const canvasRef = useRef(null);
  const sysRef = useRef(null);
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    const sys = new Capture(canvasRef.current, true);
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#2457d6';
    Object.assign(sys.ctx, { lineWidth: 3, lineCap: 'round', lineJoin: 'round', strokeStyle: ink });
    sys.startSession('dashboard');
    sysRef.current = sys;
    bump();
    const t = setInterval(bump, 250);
    return () => { clearInterval(t); clearTimeout(sys.idleTimeout); };
  }, [bump]);
  return { canvasRef, sys: sysRef.current, tick, bump };
}

export default function App() {
  useReveal();
  const engine = useEngine();
  const { sys } = engine;
  const strokes = sys?.session?.strokeData ?? [];
  const live = sys?.currentStroke?.points?.length > 1 ? sys.currentStroke : null;
  const last = live ?? strokes.at(-1) ?? null;
  return (
    <div className="wrap">
      <MenuBar />
      <div className="glow" aria-hidden="true" />
      <Hero />
      <CapturePad engine={engine} />
      <Velocity stroke={last} isLive={!!live} />
      <Timeline sys={sys} />
      <Tilt />
      <Export sys={sys} />
      <Pipeline />
      <Audit />
      <Dock />
      <footer>
        Code: MIT. The capture pad runs the repo’s unmodified <code>drawingCapture.js</code> on your own pointer input; code facts are parsed from the source at build time. Nothing you draw leaves your browser.
      </footer>
    </div>
  );
}

function Hero() {
  return (
    <header className="card hero window" id="top" data-title="drawing_modal — README">
      <div className="head">
        <p className="eyebrow">Serverless pen-capture engine</p>
        <span className="pill info">● Live, in your browser</span>
      </div>
      <h1>Every stroke and pause, captured with no server. Draw here to watch it <em>measure</em> you.</h1>
      <p className="sub">
        drawing_modal is a browser drawing app whose engine records position, pressure, tilt, twist and speed for every point, plus pauses and in-air pen movement, then exports it as JSON.
        This page runs that same engine on your input, shows what it measures, and is honest about where its numbers are approximations or bugs.
      </p>
      <div className="actions">
        <a className="btn primary" href="#pad">Draw on the capture pad</a>
        <a className="btn ghost" href="../">Open the live app</a>
        <a className="btn ghost" href="../advanced.html">Standalone canvas</a>
        <a className="btn ghost" href="../documentation.html">Documentation</a>
      </div>
      <div className="tiles">
        <div className="tile"><div className="num">{FACTS.fields.length}</div><div className="cap">fields recorded per stroke point (counted in <code>addPoint</code>)</div></div>
        <div className="tile"><div className="num">{FACTS.events.length}</div><div className="cap">session event types logged by <code>logEvent</code></div></div>
        <div className="tile"><div className="num">{fmt(FACTS.captureLines + FACTS.appLines)}</div><div className="cap">lines across the engine ({fmt(FACTS.captureLines)}) and app ({fmt(FACTS.appLines)})</div></div>
        <div className="tile"><div className="num">{FACTS.classes.length}</div><div className="cap">classes: {FACTS.classes.join(', ')}</div></div>
      </div>
    </header>
  );
}

function CapturePad({ engine }) {
  const { canvasRef, sys, bump } = engine;
  const anim = useRef(0);
  const [scripted, setScripted] = useState(false);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);
  const m = sys?.getCurrentMetrics();
  const strokes = sys?.session?.strokeData ?? [];
  const points = strokes.flatMap((s) => s.points);
  const avg = sys ? sys.calculateAverageMetrics(points) : { pressure: 0, velocity: 0, maxVelocity: 0 };
  const length = strokes.reduce((a, s) => a + s.trajectoryLength, 0);
  const pd = (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); sys?.handlePointerDown(e.nativeEvent); bump(); };
  const pm = (e) => { sys?.handlePointerMove(e.nativeEvent); };
  const pu = (e) => { sys?.handlePointerUp(e.nativeEvent); bump(); };
  const reset = () => {
    cancelAnimationFrame(anim.current); setScripted(false);
    const c = canvasRef.current; c.getContext('2d').clearRect(0, 0, c.width, c.height);
    sys.isDrawing = false; sys.currentStroke = null; sys.startSession('dashboard'); bump();
  };
  // Scripted pen stroke: synthetic events sent through the same public handlers over real time.
  const script = () => {
    if (!sys || scripted) return;
    setScripted(true);
    const c = canvasRef.current, r = c.getBoundingClientRect();
    const at = (u, v, t, extra) => ({ clientX: r.left + u * r.width, clientY: r.top + v * r.height, timeStamp: t, pointerType: 'pen', width: 1, height: 1, twist: 0, ...extra });
    const t0 = performance.now(), dur = 1400, hoverDur = 500;
    let down = false;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const u = 0.08 + 0.84 * k, v = 0.5 + 0.28 * Math.sin(k * Math.PI * 3) * (1 - 0.5 * k);
      const ev = at(u, v, now, { pressure: 0.25 + 0.6 * Math.sin(k * Math.PI), tiltX: Math.round(-30 + 60 * k), tiltY: 20 });
      if (!down) { sys.handlePointerDown(ev); down = true; } else sys.handlePointerMove(ev);
      if (k < 1) { anim.current = requestAnimationFrame(step); return; }
      sys.handlePointerUp(ev); bump();
      const h0 = performance.now();
      const hover = (hn) => { // in-air pen movement back across the pad
        const q = Math.min(1, (hn - h0) / hoverDur);
        sys.handlePointerMove(at(0.92 - 0.4 * q, 0.5 - 0.2 * q, hn, { pressure: 0, tiltX: 0, tiltY: 0 }));
        if (q < 1) anim.current = requestAnimationFrame(hover); else { setScripted(false); bump(); }
      };
      anim.current = requestAnimationFrame(hover);
    };
    anim.current = requestAnimationFrame(step);
  };
  const tiles = [
    [m?.strokes ?? 0, 'strokes'],
    [points.length, 'points captured'],
    [fmt(length), 'trajectory length (px)'],
    [fmt(avg.velocity), 'average velocity (px/s)'],
    [fmt(avg.maxVelocity), 'peak velocity (px/s)'],
    [fmt(avg.pressure, 2), 'average pressure (0 to 1)'],
    [`${m?.activeDurationSeconds ?? '0.00'}s`, 'active (pen down)'],
    [`${m?.pauseDurationSeconds ?? '0.00'}s`, 'pause (everything else)'],
  ];
  return (
    <section id="pad" className="card window reveal" data-title="capture-pad.html — live">
      <div className="head">
        <div>
          <p className="eyebrow">Live capture</p>
          <h2>Draw with a mouse, finger or pen. The repo’s engine measures every point.</h2>
          <p className="sub">
            The pad below feeds your pointer events to an unmodified <code>DrawingCaptureSystem</code> (loaded from <a href={blob('drawingCapture.js')}>drawingCapture.js</a>) through
            {' '}<code>handlePointerDown/Move/Up</code>. The tiles read its own <code>getCurrentMetrics</code>, <code>calculateAverageMetrics</code> and stroke lengths, refreshed four times a second.
          </p>
        </div>
        <span className={`pill ${m?.status === 'idle' ? 'warn' : 'good'}`}>● {sys?.status === 'completed' ? 'completed' : m?.status ?? 'starting'}</span>
      </div>
      <canvas ref={canvasRef} className="pad" width={900} height={340} aria-label="Drawing pad: draw here to feed the capture engine"
        onPointerDown={pd} onPointerMove={pm} onPointerUp={pu} onPointerCancel={pu} />
      <div className="actions" style={{ marginTop: 14 }}>
        <button className="btn primary" onClick={script} disabled={scripted}>{scripted ? 'Sending…' : 'Send a scripted pen stroke'}</button>
        <button className="btn ghost" onClick={() => { sys?.completeSession(); bump(); }} disabled={!sys || sys.status === 'completed'}>Complete session</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
        <span className="hint">The scripted stroke is synthetic input (labelled as such), sent through the same handlers in real time. It is not a recording.</span>
      </div>
      <div className="tiles">
        {tiles.map(([n, c]) => <div className="tile" key={c}><div className="num">{n}</div><div className="cap">{c}</div></div>)}
      </div>
      <p className="hint" style={{ marginTop: 12 }}>
        A mouse reports pressure 0.5 whenever a button is held, so pressure is only meaningful with a pen. Idle is flagged after {fmt(FACTS.idleMs)} ms without input, a threshold hard-coded in the engine and never validated.
      </p>
    </section>
  );
}

function Velocity({ stroke, isLive }) {
  const W = 960, H = 260, pad = { l: 52, r: 44, t: 14, b: 28 };
  const pts = stroke?.points ?? [];
  const has = pts.length > 1;
  const t0 = has ? pts[0].timestamp : 0;
  const tmax = has ? Math.max(1, pts.at(-1).timestamp - t0) : 1;
  const vmax = has ? Math.max(100, ...pts.map((p) => p.velocity)) : 100;
  const x = (t) => pad.l + ((t - t0) / tmax) * (W - pad.l - pad.r);
  const yv = (v) => pad.t + (1 - v / vmax) * (H - pad.t - pad.b);
  const yp = (p) => pad.t + (1 - p) * (H - pad.t - pad.b);
  return (
    <section id="velocity" className="card window reveal" data-title="velocity.svg — live">
      <div className="head">
        <div>
          <p className="eyebrow">Live profile</p>
          <h2>Speed and pressure through your {isLive ? 'current' : 'last'} stroke.</h2>
          <p className="sub">
            Each point’s <code>velocity</code> is distance from the previous point divided by the gap between their event timestamps, in px/s, exactly as <code>addPoint</code> stores it.
            Pressure is the raw <code>PointerEvent.pressure</code>.
          </p>
        </div>
        {has && <span className="pill info">{pts.length} points · {fmt(tmax)} ms</span>}
      </div>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={has ? `Velocity and pressure across ${pts.length} points of the last stroke` : 'Empty velocity chart: draw a stroke to fill it'}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line className="axis" x1={pad.l} x2={W - pad.r} y1={yv(vmax * f)} y2={yv(vmax * f)} />
            <text x={pad.l - 8} y={yv(vmax * f) + 4} textAnchor="end">{fmt(vmax * f)}</text>
            <text x={W - pad.r + 8} y={yp(f) + 4}>{f}</text>
          </g>
        ))}
        {has ? (
          <>
            <polyline fill="none" stroke="var(--warn)" strokeWidth="2" strokeDasharray="5 4" points={pts.map((p) => `${x(p.timestamp)},${yp(p.pressure)}`).join(' ')} />
            <polyline fill="none" stroke="var(--primary)" strokeWidth="2.5" points={pts.map((p) => `${x(p.timestamp)},${yv(p.velocity)}`).join(' ')} />
          </>
        ) : (
          <text x={W / 2} y={H / 2} textAnchor="middle" style={{ fontSize: 14 }}>Draw a stroke on the pad (or send the scripted one) to plot it here.</text>
        )}
        <text x={pad.l} y={H - 6}>0 ms</text>
        <text x={W - pad.r} y={H - 6} textAnchor="end">{has ? `${fmt(tmax)} ms` : 'time'}</text>
      </svg>
      <div className="legend"><span><i style={{ background: 'var(--primary)' }} />velocity, px/s (left axis)</span><span><i style={{ background: 'var(--warn)' }} />pressure, 0 to 1 (right axis)</span></div>
    </section>
  );
}

function Timeline({ sys }) {
  const ev = sys?.session?.events ?? [];
  const start = sys?.sessionStartTime ?? 0;
  const done = ev.find((e) => e.type === 'session_complete');
  const end = done ? done.timestamp : Date.now();
  const span = Math.max(1000, end - start);
  const W = 960, H = 150, l = 16, r = 16;
  const x = (t) => l + ((t - start) / span) * (W - l - r);
  const { active, open } = segments(ev);
  const counts = Object.fromEntries(FACTS.events.map((t) => [t, ev.filter((e) => e.type === t).length]));
  const lane = (t) => (t.startsWith('draw') ? 62 : t.startsWith('hover') ? 92 : 32);
  return (
    <section id="timeline" className="card window reveal" data-title="session.timeline — live">
      <p className="eyebrow">Live event log</p>
      <h2>Your session as the engine logged it: active strokes, pauses and events.</h2>
      <p className="sub">
        Green bars are pen-down time between <code>draw_start</code> and <code>draw_end</code>; the gaps are pauses. The {FACTS.events.length} event types are parsed from the source.
        {' '}<code>hover_start</code> is logged after every stroke, but hover points and <code>hover_end</code> only appear when a real pen moves in the air: a mouse or finger never produces them.
      </p>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Session timeline with ${ev.length} logged events`} style={{ marginTop: 12 }}>
        <line className="axis" x1={l} x2={W - r} y1={62} y2={62} />
        {active.map(([a, b], i) => <rect key={i} x={x(a)} y={52} width={Math.max(2, x(b) - x(a))} height={20} rx={4} fill="var(--good)" opacity="0.75" />)}
        {open != null && <rect x={x(open)} y={52} width={Math.max(2, x(end) - x(open))} height={20} rx={4} fill="var(--good)" opacity="0.4" />}
        {ev.map((e, i) => <circle key={i} cx={x(e.timestamp)} cy={lane(e.type)} r={5} fill={EVENT_COLOR[e.type] ?? 'var(--muted)'} stroke="var(--surface-strong)" strokeWidth="1.5"><title>{e.type}</title></circle>)}
        <text x={l} y={18}>session</text><text x={l} y={118}>hover</text>
        <text x={l} y={H - 6}>0 s</text><text x={W - r} y={H - 6} textAnchor="end">{(span / 1000).toFixed(1)} s{done ? ' (completed)' : ''}</text>
      </svg>
      <div className="legend">
        {FACTS.events.map((t) => <span key={t}><i style={{ background: EVENT_COLOR[t] ?? 'var(--muted)' }} /><span className="mono">{t}</span> × {counts[t]}</span>)}
      </div>
    </section>
  );
}

function Tilt() {
  const [tx, setTx] = useState(60);
  const [ty, setTy] = useState(60);
  const repo = useMemo(() => new Capture({ getContext: () => null }, true), []);
  const ra = repo.calculateAltitude(tx, ty), sa = w3cAltitude(tx, ty);
  const rz = repo.calculateAzimuth(tx, ty), sz = w3cAzimuth(tx, ty);
  const W = 460, H = 240, pad = { l: 40, r: 10, t: 12, b: 28 };
  const x = (t) => pad.l + (t / 89) * (W - pad.l - pad.r);
  const y = (a) => pad.t + (1 - a / 90) * (H - pad.t - pad.b);
  const diag = Array.from({ length: 90 }, (_, t) => t);
  const mag = Math.max(Math.abs(tx), Math.abs(ty));
  return (
    <section id="tilt" className="card window reveal" data-title="tilt-calculator — live">
      <p className="eyebrow">Live calculator</p>
      <h2>The altitude formula drifts from the Pointer Events spec as the pen tilts.</h2>
      <p className="sub">
        The engine computes altitude as 90° minus the tilt magnitude (<code>calculateAltitude</code>) and azimuth as <code>atan2(tiltY, tiltX)</code>.
        The W3C Pointer Events conversion uses the tangents of the tilt angles. Both are computed here as you move the sliders; they agree near vertical and on a single axis, and diverge on diagonals.
      </p>
      <div className="grid2" style={{ marginTop: 16 }}>
        <div>
          <div className="controls" style={{ gridTemplateColumns: '1fr' }}>
            <Range label="tiltX" value={tx} min={-89} max={89} step={1} onChange={setTx} show={`${tx}°`} />
            <Range label="tiltY" value={ty} min={-89} max={89} step={1} onChange={setTy} show={`${ty}°`} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th></th><th>Repo</th><th>W3C spec</th><th>Gap</th></tr></thead>
              <tbody>
                <tr><td>Altitude</td><td>{ra.toFixed(1)}°</td><td>{sa.toFixed(1)}°</td><td className={Math.abs(ra - sa) < 1 ? 'ok' : 'no'}>{(ra - sa).toFixed(1)}°</td></tr>
                <tr><td>Azimuth</td><td>{rz.toFixed(1)}°</td><td>{sz.toFixed(1)}°</td><td className={Math.abs(rz - sz) < 1 ? 'ok' : 'no'}>{(rz - sz).toFixed(1)}°</td></tr>
              </tbody>
            </table>
          </div>
          <p className="hint">Sliders stop at ±89° because the spec’s tangent is undefined at 90°.</p>
        </div>
        <div>
          <h3>Altitude when tiltX = tiltY</h3>
          <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Altitude by equal tilt on both axes, repo formula versus W3C conversion">
            {[0, 30, 60, 90].map((a) => <g key={a}><line className="axis" x1={pad.l} x2={W - pad.r} y1={y(a)} y2={y(a)} /><text x={pad.l - 6} y={y(a) + 4} textAnchor="end">{a}°</text></g>)}
            <polyline fill="none" stroke="var(--bad)" strokeWidth="2.5" points={diag.map((t) => `${x(t)},${y(repo.calculateAltitude(t, t))}`).join(' ')} />
            <polyline fill="none" stroke="var(--primary)" strokeWidth="2.5" points={diag.map((t) => `${x(t)},${y(w3cAltitude(t, t))}`).join(' ')} />
            <line x1={x(mag)} x2={x(mag)} y1={pad.t} y2={H - pad.b} stroke="var(--muted)" strokeDasharray="4 4" />
            <text x={pad.l} y={H - 6}>0°</text><text x={W - pad.r} y={H - 6} textAnchor="end">89° on both axes</text>
          </svg>
          <div className="legend"><span><i style={{ background: 'var(--bad)' }} />repo: 90 − √(tx² + ty²)</span><span><i style={{ background: 'var(--primary)' }} />W3C: atan(1 / √(tan²tx + tan²ty))</span></div>
        </div>
      </div>
    </section>
  );
}

function Node({ k, v, depth = 0 }) {
  if (v === null || typeof v !== 'object') {
    return <div className="leaf"><span className="k">{k}</span>: <span className="v">{JSON.stringify(v)}</span></div>;
  }
  const arr = Array.isArray(v);
  const entries = arr ? v.slice(0, 3).map((x, i) => [i, x]) : Object.entries(v);
  return (
    <details open={depth < 1}>
      <summary><span className="k">{k}</span> <span className="hint">{arr ? `[${v.length}]` : `{${Object.keys(v).length}}`}</span></summary>
      {entries.map(([ck, cv]) => <Node key={ck} k={ck} v={cv} depth={depth + 1} />)}
      {arr && v.length > 3 && <div className="leaf hint">… {v.length - 3} more</div>}
    </details>
  );
}

function Export({ sys }) {
  const data = useMemo(() => (sys?.session ? JSON.parse(JSON.stringify(sys.getSessionData())) : null), [sys, sys?.session?.strokes, sys?.session?.events?.length, sys?.status]); // eslint-disable-line react-hooks/exhaustive-deps
  if (data) delete data.deviceInfo?.userAgent; // shown in the download, kept off the page
  return (
    <section id="export" className="card window reveal" data-title="export.json — your session">
      <div className="head">
        <div>
          <p className="eyebrow">Live export</p>
          <h2>The JSON the engine would hand a researcher, built from your own session.</h2>
          <p className="sub">
            This is <code>getSessionData()</code> for what you drew above: session, events, strokes, points (each with the {FACTS.fields.length} fields below) and hover paths.
            Long arrays show their first three items. The download is the engine’s own <code>downloadSession()</code>; it never leaves your machine.
          </p>
        </div>
        <button className="btn primary" onClick={() => sys?.downloadSession()} disabled={!sys}>Download my session JSON</button>
      </div>
      <div className="grid2">
        <div className="tree scroll-x" aria-label="Session data explorer">{data ? <Node k="session" v={data} /> : <span className="hint">Starting…</span>}</div>
        <div>
          <h3>Per-point fields written by <code>addPoint</code></h3>
          <div className="chips">{FACTS.fields.map((f) => <span key={f} className="mono">{f}</span>)}</div>
          {(() => {
            const hp = (data?.hoverData ?? []).filter((h) => h.points.length > 1).at(-1);
            if (!hp) return <p className="hint">No finished hover path yet: in-air points need a pen (or the scripted stroke), and a path closes on the next stroke or on Complete session.</p>;
            const span = hp.points.at(-1).timestamp - hp.points[0].timestamp;
            return <p className="hint">Last hover path: the engine reports {fmt(hp.averageVelocity, 2)} px/s average, while its own length over its own point timestamps gives {fmt(span > 0 ? hp.trajectoryLength / (span / 1000) : 0)} px/s. That gap is the clock mix in <code>captureHoverPoint</code>.</p>;
          })()}
          <p className="hint">Point timestamps are <code>event.timeStamp</code> (ms since page load) while stroke start and end use <code>Date.now()</code> (epoch ms), so the two clocks in one export can’t be compared directly.</p>
        </div>
      </div>
    </section>
  );
}

function Pipeline() {
  const steps = [
    ['PointerEvent', 'pointerdown / move / up from mouse, touch or pen'],
    [FACTS.classes.includes('DrawingApp') ? 'DrawingApp' : 'app', `advanced-final.js, ${fmt(FACTS.appLines)} lines: tools, brush state, canvas`],
    ['DrawingCaptureSystem', `drawingCapture.js, ${fmt(FACTS.captureLines)} lines: ${FACTS.fields.length} fields per point, hover sampled every ${FACTS.hoverMs} ms`],
    ['Logs', `strokes, hover paths, ${FACTS.events.length} event types`],
    ['Export', 'JSON download, PNG, localStorage'],
  ];
  return (
    <section id="pipeline" className="card window reveal" data-title="pipeline.md">
      <p className="eyebrow">Architecture</p>
      <h2>From a pointer event to a JSON file, entirely client-side.</h2>
      <ol className="flow" style={{ marginTop: 16 }}>
        {steps.map(([t, d]) => <li key={t}><b className="mono">{t}</b><small>{d}</small></li>)}
      </ol>
      <p className="sub">
        {FACTS.classes.length} classes across the two files ({FACTS.classes.join(', ')}). <code>DrawingSession</code> and <code>DrawingCaptureSystem</code> are parallel models that compute velocity in different units (px/ms and px/s) and export separately.
      </p>
    </section>
  );
}

function Audit() {
  const items = [
    ['bad', 'Hover capture is dead in the main app', 'DrawingApp.handleMove returns when the pen is not down, before it calls the capture system, so index.html never records in-air movement. It only works in advanced.html. The build check asserts this ordering.'],
    ['bad', 'Hover velocity reads about 0', 'captureHoverPoint subtracts event.timeStamp (ms since load) from Date.now() (epoch ms). The scripted stroke above reproduces it: its hover points report near-zero speed.'],
    ['warn', 'Altitude and azimuth are approximations', 'Up to tens of degrees off the W3C conversion on diagonal tilts (see the calculator). The technical notes now document the formula as implemented.'],
    ['warn', 'Mixed clocks in one export', 'Stroke times use Date.now(); point times use event.timeStamp.'],
    ['warn', 'Untested heuristics', `The ${fmt(FACTS.idleMs)} ms idle threshold, pressure-detected as pressure ≠ 0.5, and stroke splitting on pointerleave in the app are all unvalidated.`],
    ['info', 'No validation study', 'No recorded sessions, no ground-truth comparison (known-length line, known tilt) and no sampling-rate or latency measurement yet.'],
  ];
  return (
    <section id="audit" className="card window reveal" data-title="audit.log">
      <div className="head">
        <div>
          <p className="eyebrow">Engineering audit</p>
          <h2>Grade C+: broad capture, real defects, and until now no tests.</h2>
        </div>
        <a className="btn ghost" href={blob('docs/research-review.md')}>Full review</a>
      </div>
      <div className="grid2">
        {items.map(([k, t, d]) => (
          <div className="tile" key={t}>
            <div className="head" style={{ marginBottom: 6 }}><h3>{t}</h3><span className={`pill ${k}`}>{k === 'bad' ? 'Bug' : k === 'warn' ? 'Caveat' : 'Gap'}</span></div>
            <p className="hint" style={{ margin: 0, fontSize: 13 }}>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
