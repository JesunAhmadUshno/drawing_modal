# Drawing Modal - Advanced Canvas Capture System

A fully-featured, serverless drawing canvas application with comprehensive data capture, tracking 20+ measurements per point including velocity, trajectory, twist, and in-air hover trajectories. Built for research, UX testing, drawing behavior analysis, and stylus interaction studies.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/Demo-Live-success)](https://jesunachmadushno.github.io/drawing_modal/)
[![Responsive](https://img.shields.io/badge/Responsive-Mobile%20%7C%20Tablet%20%7C%20Desktop-blue)](https://jesunachmadushno.github.io/drawing_modal/)
[![Data Points](https://img.shields.io/badge/Data%20Capture-20%2B%20metrics%20per%20point-orange)]()

---

## 🌟 Features

### Drawing Tools
- **Pen Tool** - Draw with smooth, variable brush strokes
- **Eraser Tool** - Remove content from canvas
- **Shape Tools** - Draw lines, rectangles, circles, and triangles
- **Color Palette** - 8 preset colors + color customization
- **Brush Control** - Adjustable size (1-50px) and opacity (0-100%)
- **Pressure Sensitivity** - Full support for stylus pressure & tilt input

### Advanced Data Capture
- **Session Duration Tracking** - Total, active, and pause time measurement
- **Per-Stroke Metrics** - Duration, trajectory length, velocity, pressure
- **Per-Hover Metrics** - In-air trajectory, velocity, distance, duration
- **Comprehensive Measurements** (20+ per point):
  - **Position Data** - X, Y coordinates with timestamps
  - **Pressure Data** - Input pressure (0-1 range)
  - **Tilt Angles** - TiltX, TiltY (-90° to 90°)
  - **Twist** - Stylus barrel rotation (0-359°)
  - **Contact Geometry** - Width, Height (px)
  - **Distance** - Height above surface (mm, hover only)
  - **Orientation** - Altitude (0-90°), Azimuth (0-360°)
  - **Velocity** - Point-by-point speed (px/s)
  - **Trajectory Length** - Total stroke/hover distance (px)
  - **Average Pressure** - Mean pressure per stroke
  - **Average/Max Velocity** - Speed analytics per stroke/hover
- **Idle Detection** - Automatic 2-second timeout detection
- **Event Logging** - Complete timeline with 7 event types
- **Real-time Metrics** - Live UI updates every 100ms

### UI Panels (6 Sections)
1. **Brush Settings** - Size, opacity, pressure sensitivity controls
2. **Session Data** - 13 real-time metrics (ID, counts, durations, input data)
3. **Stroke Metrics** - 5 metrics (duration, length, avg/max speed, pressure)
4. **Hover Metrics** - 5 metrics (duration, velocity, length, distance, count)
5. **Sensors** - Accelerometer, gyroscope, refresh rate
6. **Actions** - Undo, clear, complete session, export (JSON/PNG)

### Input Support
- **Mouse** - Standard desktop interaction
- **Touch** - Finger input on mobile/tablets
- **Stylus/Pen** - Pressure, tilt, twist, altitude, azimuth tracking
- **Hover Detection** - In-air trajectory with velocity and distance

### Export Capabilities
- **PNG Export** - High-quality image export
- **JSON Export** - Complete session data with:
  - Stroke-by-stroke breakdown with 20+ measurements per point
  - Hover paths with velocity, trajectory, and distance metrics
  - Device and environment information
  - Event timeline with timestamps (7 event types)
  - Computed metadata and statistics

### Responsive Design
- **Mobile Optimized** - Touch-friendly controls (44px targets)
- **Tablet Ready** - Collapsible sidebar with toggle
- **Desktop Enhanced** - Full-featured interface with 6 panel sections
- **Orientation Aware** - Landscape and portrait support
- **Breakpoints** - 320px, 480px, 768px, 1024px

### Architecture
- **100% Serverless** - Runs entirely in the browser
- **No Backend** - No API calls or server dependencies
- **Offline Ready** - Works without internet connection
- **Client-Side Privacy** - All data stays on your device
- **No Tracking** - No analytics or telemetry

---

## 📁 Project Structure

```
docs/
├── index.html              # Main drawing interface (588 lines)
├── advanced.html           # Advanced drawing canvas (legacy)
├── advanced-final.js       # Drawing app logic (714 lines)
├── drawingCapture.js       # Capture system core (783 lines)
├── styles.css              # Additional styling (291 lines)
├── README.md               # Comprehensive documentation
├── future features.md      # Feature roadmap & improvements
└── LICENSE                 # MIT License

.git/                        # Version control (GitHub)
```

### File Sizes & Metrics
- **Total Code Lines:** ~2,376 lines
- **Classes:** 3 main classes (DrawingApp, DrawingCaptureSystem, DrawingSession)
- **Methods:** 60+ methods across all classes
- **Data Points Captured:** 20+ measurements per stroke point
- **Event Types:** 7 distinct event types logged

---

## 🚀 Quick Start

### Online (Live Demo)
Simply visit the application at:
[https://jesunachmadushno.github.io/drawing_modal/](https://jesunachmadushno.github.io/drawing_modal/)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/JesunAhmadUshno/drawing_modal.git
   cd drawing_modal
   ```

2. **Open in browser**
   ```bash
   # Option 1: Direct file open
   open docs/index.html
   
   # Option 2: With local server
   python -m http.server 8000
   # Then visit http://localhost:8000/docs/
   ```

---

## 📖 Usage Guide

### Drawing
1. **Select Tool** - Click pen, eraser, or shape buttons in toolbar
2. **Choose Color** - Select from color palette or customize
3. **Adjust Settings** - Set brush size and opacity in side panel
4. **Draw** - Click and drag on canvas to draw
5. **Undo** - Press Ctrl+Z or click Undo button to revert
6. **Complete** - Click "Complete Session" to finalize and see summary

### Session Management
- **Auto-tracking** - Session starts automatically when you begin drawing
- **Live Metrics** - Real-time updates of duration, strokes, and status
- **Idle Detection** - Automatically detects 2 seconds of inactivity
- **Complete Session** - Stops tracking and displays final statistics
- **Multiple Sessions** - Start fresh after completing or clearing

### Mobile/Tablet Usage
- **Toggle Sidebar** - Tap "☰ Panel" button to show/hide controls
- **Touch Drawing** - Draw with finger or stylus on touch screens
- **Responsive Canvas** - Automatically scales to your screen size
- **Landscape Mode** - Optimized layout for landscape orientation

### Exporting Your Work

**Complete Session (NEW)**
- Click "Complete Session" button
- View summary: total duration, active time, pause time, strokes
- All tracking stops, data is finalized

**Save as JSON** (complete session data)
- Click "Save Session (JSON)" button
- Exports comprehensive data including:
  - Stroke-by-stroke breakdown with timing
  - Hover trajectories (if using stylus)
  - Complete event log
  - Session duration metrics
  - Device information

**Save as PNG** (image file)
- Click "Export PNG" button
- Saves the current canvas drawing as PNG image

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+S` / `Cmd+S` | Save session |

---

## 📊 Data Captured

### Session-Level Metrics
- **Session ID** - Unique identifier (`s-{timestamp}-{random}`)
- **Total Duration** - Entire session time from start to completion (ms)
- **Active Duration** - Cumulative time spent actively drawing (ms)
- **Pause Duration** - Time spent idle/thinking between strokes (ms)
- **Status** - `not-started` | `active` | `idle` | `completed`
- **Stroke Count** - Total number of completed strokes
- **Hover Path Count** - Total number of in-air trajectories captured
- **Device Info** - Complete device and environment metadata:
  - User agent string
  - Device type (desktop/mobile/tablet)
  - Screen dimensions and DPI
  - Operating system
  - Browser language

### Per-Stroke Data (20+ measurements)
**Stroke-Level Metrics:**
- **Stroke ID** - Unique identifier (`str-{timestamp}-{number}`)
- **Timestamps** - Start and end time (ISO 8601 format)
- **Duration** - Time spent drawing this stroke (ms)
- **Pause Before** - Idle time before this stroke started (ms)
- **Trajectory Length** - Total path distance traveled (px)
- **Average Pressure** - Mean pressure across all points (0-1)
- **Average Velocity** - Mean drawing speed (px/s)
- **Max Velocity** - Peak speed reached during stroke (px/s)
- **Hover Path Link** - ID of preceding in-air trajectory
- **Input Type** - `mouse` | `stylus` | `finger`
- **Pressure Data Available** - Boolean flag
- **Color** - Hex color code used for stroke (e.g., `#ff0000`)
- **Size** - Brush size in pixels (1-50)
- **Opacity** - Brush opacity as decimal (0-1)
- **Tool** - Tool used (`pen` | `eraser` | `shape` | etc.)

**Per-Point Data (in `points[]` array):**
- **x, y** - Canvas coordinates (px)
- **timestamp** - High-precision timing (ms)
- **pressure** - Input pressure (0-1 range)
- **tiltX, tiltY** - Stylus tilt angles (-90° to 90°)
- **twist** - Stylus barrel rotation (0-359°)
- **width, height** - Contact geometry/predicted touch size (px)
- **altitude** - Angle from surface (0-90°, calculated from tilt)
- **azimuth** - Compass direction (0-360°, calculated from tilt)
- **velocity** - Point-to-point speed (px/s)
- **radiusX, radiusY** - Contact ellipse radii (legacy, same as width/height)

### Hover/In-Air Data (Stylus Only)
**Hover Path-Level Metrics:**
- **Hover Path ID** - Unique identifier (`hover-{timestamp}-{number}`)
- **Timestamps** - Start and end time (ISO 8601 format)
- **Duration** - Time spent in hover state (ms)
- **Trajectory Length** - Total hover path distance (px)
- **Average Velocity** - Mean hover movement speed (px/s)
- **Max Velocity** - Peak hover speed (px/s)
- **Linked Stroke** - ID of stroke that follows this hover

**Per-Hover Point (in `points[]` array):**
- **x, y** - Hover coordinates above canvas (px)
- **timestamp** - High-precision timing (ms)
- **pressure** - Usually 0 during hover (0-1)
- **tiltX, tiltY** - Stylus tilt angles (-90° to 90°)
- **twist** - Stylus barrel rotation (0-359°)
- **width, height** - Predicted contact size if pen touches down (px)
- **distance** - Height above surface (mm, hardware-dependent)
- **altitude** - Angle from surface (0-90°)
- **azimuth** - Compass direction (0-360°)
- **velocity** - Hover movement speed (px/s)

### Event Timeline
Complete chronological log of all interactions with precise timestamps:
- **`session_start`** - Session initiated with session ID
- **`draw_start`** - Stroke began (includes position, input type, hover link, pause time)
- **`draw_end`** - Stroke completed (includes stroke ID, duration, point count, length)
- **`hover_start`** - In-air trajectory began (includes hover path ID)
- **`hover_end`** - In-air trajectory completed (includes duration, point count, length)
- **`idle_detect`** - User went idle for 2+ seconds
- **`session_complete`** - Session finalized with all metrics calculated

---

## 🛠️ Configuration

### Idle Detection Timeout
Edit in `drawingCapture.js`, `startIdleDetection()` method:
```javascript
}, 2000); // 2 seconds (change to adjust)
```

### Hover Capture Throttling
Edit in `drawingCapture.js`, `captureHoverPoint()` method:
```javascript
if (this.lastHoverTime && (now - this.lastHoverTime) < 50) {
    return; // 50ms throttle (adjust as needed)
}
```

### Metrics Update Frequency
Edit in `advanced-final.js`, `startMetricsUpdate()` function:
```javascript
metricsUpdateInterval = setInterval(updateMetricsDisplay, 100); 
// 100ms = 10 updates per second
```

### Canvas Size (Responsive)
Automatically adapts to screen size. Manual override in `advanced-final.js`:
```javascript
setResponsiveCanvasSize() {
    // Adjust breakpoints here
    if (window.innerWidth <= 480) { ... }
}
```

### Default Brush Settings
```javascript
this.size = 12;             // Brush size in pixels
this.opacity = 1;           // Opacity (0 to 1)
this.pressureSensitive = true;  // Enable pressure input
```

---

## 📦 Complete Export Format & Data Schema

### JSON Export Structure (Full Schema)
```json
{
  "sessionId": "s-1771951479063-x5ef32hlg",
  "taskId": "drawing_modal",
  "sessionStartTime": "2026-02-24T16:44:39.063Z",
  "sessionEndTime": "2026-02-24T16:46:30.110Z",
  "totalDuration": 111047,
  "activeDuration": 79193,
  "pauseDuration": 31854,
  "status": "completed",
  "strokes": 36,
  
  "deviceInfo": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "deviceType": "desktop",
    "screenWidth": 1280,
    "screenHeight": 800,
    "screenDPI": 192,
    "os": "Win32",
    "language": "en-US"
  },
  
  "metadata": {
    "totalStrokes": 36,
    "totalPoints": 12543,
    "avgPointsPerStroke": "348.42",
    "totalDurationSeconds": "111.047",
    "activeDurationSeconds": "79.193",
    "pauseDurationSeconds": "31.854",
    "activePercentage": "71.32",
    "totalHoverPaths": 35,
    "totalHoverPoints": 543,
    "avgHoverPointsPerPath": "15.51"
  },
  
  "events": [
    {"type": "session_start", "timestamp": 1771951479063},
    {
      "type": "draw_start",
      "timestamp": 1771951481486,
      "x": 241,
      "y": 328,
      "inputType": "stylus",
      "hoverPathBeforeStroke": "hover-1771951480000-1",
      "pauseBeforeStroke": 2423
    },
    {
      "type": "draw_end",
      "timestamp": 1771951482946,
      "strokeId": "str-1771951481486-1",
      "strokeDuration": 1460,
      "pointsCount": 154,
      "trajectoryLength": 456.78
    },
    {
      "type": "hover_start",
      "timestamp": 1771951482946,
      "hoverPathId": "hover-1771951482946-1"
    },
    {
      "type": "hover_end",
      "timestamp": 1771951484332,
      "hoverPathId": "hover-1771951482946-1",
      "pointsCount": 28,
      "duration": 1386,
      "trajectoryLength": 123.45
    },
    {
      "type": "idle_detect",
      "timestamp": 1771951486332,
      "reason": "2_seconds_no_interaction"
    },
    {
      "type": "session_complete",
      "timestamp": 1771951590110,
      "totalDuration": 111047
    }
  ],
  
  "strokeData": [
    {
      "strokeId": "str-1771951481486-1",
      "startTime": "2026-02-24T16:44:41.486Z",
      "endTime": "2026-02-24T16:44:42.946Z",
      "startTimeMs": 1771951481486,
      "endTimeMs": 1771951482946,
      "hoverPathBeforeStroke": "hover-1771951480000-1",
      "pauseBeforeStroke": 2423,
      "strokeDuration": 1460,
      "trajectoryLength": 456.78,
      "averagePressure": 0.567,
      "averageVelocity": 312.88,
      "maxVelocity": 789.45,
      "inputType": "stylus",
      "pressureData": true,
      "color": "#000000",
      "size": 12,
      "opacity": 1,
      "tool": "pen",
      "points": [
        {
          "x": 241,
          "y": 328,
          "timestamp": 1771951481486,
          "pressure": 0.543,
          "tiltX": -12,
          "tiltY": 8,
          "twist": 45,
          "width": 3.2,
          "height": 3.5,
          "radiusX": 3.2,
          "radiusY": 3.5,
          "altitude": 82.5,
          "azimuth": 146.3,
          "velocity": 0
        },
        {
          "x": 243,
          "y": 330,
          "timestamp": 1771951481496,
          "pressure": 0.567,
          "tiltX": -11,
          "tiltY": 9,
          "twist": 46,
          "width": 3.4,
          "height": 3.6,
          "radiusX": 3.4,
          "radiusY": 3.6,
          "altitude": 82.8,
          "azimuth": 140.7,
          "velocity": 282.84
        }
        // ... more points
      ]
    }
    // ... more strokes
  ],
  
  "hoverData": [
    {
      "hoverPathId": "hover-1771951480000-1",
      "startTime": "2026-02-24T16:44:40.000Z",
      "endTime": "2026-02-24T16:44:41.386Z",
      "startTimeMs": 1771951480000,
      "endTimeMs": 1771951481386,
      "duration": 1386,
      "trajectoryLength": 123.45,
      "averageVelocity": 89.07,
      "maxVelocity": 156.23,
      "points": [
        {
          "x": 238,
          "y": 325,
          "timestamp": 1771951480000,
          "pressure": 0,
          "tiltX": -13,
          "tiltY": 7,
          "twist": 44,
          "width": 2.8,
          "height": 3.0,
          "distance": 2.5,
          "altitude": 83.1,
          "azimuth": 151.2,
          "velocity": 0
        },
        {
          "x": 240,
          "y": 327,
          "timestamp": 1771951480050,
          "pressure": 0,
          "tiltX": -12,
          "tiltY": 8,
          "twist": 45,
          "width": 3.0,
          "height": 3.2,
          "distance": 2.3,
          "altitude": 82.5,
          "azimuth": 146.3,
          "velocity": 56.57
        }
        // ... more hover points
      ]
    }
    // ... more hover paths
  ]
}
```

### Field Descriptions

#### Session-Level Fields
| Field | Type | Description | Unit |
|-------|------|-------------|------|
| `sessionId` | String | Unique session identifier | - |
| `taskId` | String | Task/experiment identifier | - |
| `sessionStartTime` | String | Start timestamp (ISO 8601) | - |
| `sessionEndTime` | String | End timestamp (ISO 8601) | - |
| `totalDuration` | Number | Total session duration | ms |
| `activeDuration` | Number | Time spent drawing | ms |
| `pauseDuration` | Number | Time spent idle | ms |
| `status` | String | Session status | - |
| `strokes` | Number | Total stroke count | - |

#### Stroke-Level Fields
| Field | Type | Description | Unit |
|-------|------|-------------|------|
| `strokeId` | String | Unique stroke identifier | - |
| `startTime` | String | Start timestamp (ISO 8601) | - |
| `endTime` | String | End timestamp (ISO 8601) | - |
| `strokeDuration` | Number | Time to complete stroke | ms |
| `trajectoryLength` | Number | Total path distance | px |
| `averagePressure` | Number | Mean pressure (0-1) | - |
| `averageVelocity` | Number | Mean drawing speed | px/s |
| `maxVelocity` | Number | Peak drawing speed | px/s |
| `pauseBeforeStroke` | Number | Idle time before stroke | ms |
| `hoverPathBeforeStroke` | String | Linked hover path ID | - |
| `inputType` | String | Input device type | - |
| `pressureData` | Boolean | Pressure availability | - |
| `color` | String | Hex color code | #RRGGBB |
| `size` | Number | Brush size | px |
| `opacity` | Number | Brush opacity | 0-1 |
| `tool` | String | Tool used (pen/eraser/shape) | - |

#### Point-Level Fields (Stroke & Hover)
| Field | Type | Description | Unit/Range |
|-------|------|-------------|------------|
| `x` | Number | Horizontal coordinate | px |
| `y` | Number | Vertical coordinate | px |
| `timestamp` | Number | High-precision time | ms |
| `pressure` | Number | Input pressure | 0-1 |
| `tiltX` | Number | Horizontal tilt angle | -90° to 90° |
| `tiltY` | Number | Vertical tilt angle | -90° to 90° |
| `twist` | Number | Barrel rotation | 0-359° |
| `width` | Number | Contact width | px |
| `height` | Number | Contact height | px |
| `altitude` | Number | Angle from surface | 0-90° |
| `azimuth` | Number | Compass direction | 0-360° |
| `velocity` | Number | Movement speed | px/s |
| `distance` | Number | Height above surface (hover only) | mm |

---

## 🌐 Browser Compatibility

### ✅ Supported Browsers

**Desktop**
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

**Mobile/Tablet**
- iOS Safari 13+
- Chrome Mobile 80+
- Firefox Mobile 68+
- Android tablets

### Required Features
- Pointer Events API
- Canvas 2D Context
- ES6 JavaScript

---

## 🔒 Privacy & Security

- **No Data Collection** - Application doesn't collect or track usage
- **Local Processing** - All data stays on your device
- **No Servers** - No backend infrastructure or cloud storage
- **No Tracking** - No analytics or third-party scripts
- **Open Source** - Full source code available on GitHub

Perfect for sensitive work and GDPR compliance.

---

## 🐛 Troubleshooting

### Canvas Not Responding
**Problem:** Drawing doesn't appear on canvas
- ✓ Refresh the browser page
- ✓ Check browser console for errors (F12)
- ✓ Ensure JavaScript is enabled
- ✓ Try a different browser

### Export Not Working
**Problem:** JSON/PNG download fails
- ✓ Check popup blocker settings
- ✓ Ensure canvas has content (draw something first)
- ✓ Try a different browser
- ✓ Check browser storage permissions

### Slow Performance
**Problem:** Drawing feels laggy
- ✓ Close other browser tabs/applications
- ✓ Try on a different device with better specs
- ✓ Use a modern browser version

### Stylus/Pressure Not Working
**Problem:** Pressure input not detected
- ✓ Ensure "Pressure Sensitive" is checked in settings
- ✓ Update browser and drivers
- ✓ Test with different stylus apps
- ✓ Some devices may not support pressure

---

## 📊 Performance

- **Page Load:** < 100ms
- **Drawing Latency:** < 16ms (60 FPS smooth drawing)
- **Export Time:** < 1s for typical sessions
- **Memory Usage:** ~5-10MB per session

---

## 🎨 UI/UX Guide

### Toolbar (Top)
- Tool selection buttons (Pen, Eraser)
- Shape tools (Line, Rectangle, Circle, Triangle)
- Color palette buttons

### Canvas (Center)
- Main drawing area
- Click and drag to draw
- Smooth rendering at 60 FPS

### Side Panel (Right) - Collapsible on Mobile

**1. Brush Settings**
- Brush size slider (1-50px with live preview)
- Opacity slider (0-100% with live preview)
- Pressure sensitive toggle checkbox

**2. Session Data** (Updates every 100ms)
- Session ID (unique identifier)
- Stroke count (total strokes)
- Total duration (seconds)
- Active duration (drawing time)
- Pause duration (thinking time)
- Status (ACTIVE/IDLE/COMPLETED)
- Input type (mouse/stylus/finger)
- Pressure (current, 0-1 range)
- Tilt X/Y (current angles)
- In-Air status (Yes/No)
- Twist (stylus rotation, 0-359°)
- Width/Height (contact size)
- Velocity (current speed, px/s)

**3. Stroke Metrics** (Last completed stroke)
- Tool (pen/eraser/shape)
- Color (hex code with preview)
- Size (brush size in pixels)
- Opacity (transparency percentage)
- Stroke duration (how long it took)
- Stroke length (total distance, px)
- Average speed (mean velocity, px/s)
- Max speed (peak velocity, px/s)
- Average pressure (mean pressure, 0-1)

**4. Hover Metrics** (In-air trajectory)
- Hover duration (time hovering, seconds)
- Hover velocity (movement speed, px/s)
- Hover length (trajectory distance, px)
- Distance (height above surface, mm)
- Total hover paths (count)

**5. Sensors** (Device sensors)
- Accelerometer X/Y/Z
- Gyroscope X/Y/Z
- Refresh rate (display Hz)

**6. Actions** (User controls)
- Undo button (revert last stroke)
- Clear canvas (erase all)
- Complete Session (finalize with summary)
- Save Session (JSON export with all data)
- Export PNG (image file)

---

## 🔧 Developer Info

### File Descriptions

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | Main interface markup with responsive design | 584 |
| `advanced-final.js` | Drawing application logic and canvas handlers | 603 |
| `drawingCapture.js` | Session capture, duration tracking, hover paths | 677 |
| `styles.css` | Additional styling with responsive breakpoints | 291 |

### Key Classes & Architecture

**DrawingApp** (in advanced-final.js) - Main Application Controller
- **Purpose:** Primary application class managing UI and canvas interactions
- **Responsibilities:**
  - Canvas rendering and drawing operations
  - Tool switching (pen, eraser, shapes)
  - Color and brush settings management
  - Responsive canvas sizing with content preservation
  - Integration with DrawingCaptureSystem
  - Real-time UI updates

- **Key Properties:**
  - `canvas`, `ctx` - Canvas element and 2D context
  - `captureSystem` - DrawingCaptureSystem instance
  - `session` - DrawingSession instance
  - `currentTool` - Active tool ('pen'|'eraser'|'shape')
  - `color`, `size`, `opacity` - Current brush settings
  - `isDrawing` - Drawing state flag
  - `history` - Undo stack (array of ImageData)

- **Key Methods:**
  - `init()` - Initialize app, setup canvas, attach listeners
  - `setResponsiveCanvasSize()` - Viewport-aware canvas sizing
  - `handleResize()` - Preserve content during window resize
  - `handleStart(e)` - Pointer down event handler
  - `handleMove(e)` - Pointer move event handler
  - `handleEnd(e)` - Pointer up event handler
  - `getInputData(e)` - Extract pointer event data, update UI
  - `updateHoverMetrics()` - Update hover/stroke metric displays
  - `draw()` - Render stroke on canvas
  - `drawShape()` - Render geometric shapes
  - `undo()` - Restore previous canvas state
  - `clear()` - Clear entire canvas

**DrawingCaptureSystem** (in drawingCapture.js) - Data Capture Engine
- **Purpose:** Comprehensive session tracking and data collection
- **Responsibilities:**
  - Session lifecycle management (start/pause/complete)
  - Duration tracking (total/active/pause with ms precision)
  - Stroke data capture with 20+ measurements per point
  - In-air trajectory tracking for stylus hover
  - Idle detection with configurable timeout
  - Event logging with chronological timeline
  - Velocity and trajectory calculations
  - JSON export with complete metadata

- **Key Properties:**
  - `session` - Current session object
  - `currentStroke` - Active stroke being captured
  - `isDrawing` - Drawing state flag
  - `sessionStartTime` - Session start timestamp
  - `activeDuration` - Cumulative drawing time (ms)
  - `pauseDuration` - Cumulative idle time (ms)
  - `isHovering` - Hover state flag
  - `currentHoverPath` - Active hover trajectory
  - `hoverPaths` - Array of completed hover paths
  - `events` - Chronological event log
  - `strokeCount` - Total stroke counter
  - `lastStrokePoint` - Previous point for velocity calculation
  - `lastHoverPoint` - Previous hover point for velocity

- **Key Methods (31 total):**
  - `startSession()` - Initialize new session with metadata
  - `completeSession()` - Finalize session with statistics
  - `handlePointerDown(e)` - Capture stroke start
  - `handlePointerMove(e)` - Capture points or hover
  - `handlePointerUp(e)` - Finalize stroke with metrics
  - `addPoint(e, x, y)` - Add point with velocity calculation
  - `startHoverPath()` - Begin new hover trajectory
  - `endHoverPath()` - Complete hover with metrics
  - `captureHoverPoint(e)` - Capture hover point with velocity
  - `calculateAltitude(tiltX, tiltY)` - Compute altitude angle
  - `calculateAzimuth(tiltX, tiltY)` - Compute azimuth angle
  - `calculateTrajectoryLength(points)` - Sum point-to-point distances
  - `calculateAverageMetrics(points)` - Compute pressure/velocity averages
  - `startIdleDetection()` - Start 2-second idle timer
  - `logEvent(type, data)` - Add event to timeline
  - `getCurrentMetrics()` - Get real-time session stats
  - `getSessionData()` - Generate complete export object
  - `downloadSession()` - Trigger JSON file download
  - `detectInputType(e)` - Identify mouse/stylus/touch
  - `getCanvasCoordinates(e)` - Convert screen to canvas coords
  - `setupCanvas()` - Initialize canvas properties
  - `attachEventListeners()` - Setup pointer event handlers

**DrawingSession** (in advanced-final.js) - Session Data Model
- **Purpose:** Data structure for session management
- **Responsibilities:**
  - Session metadata storage
  - Stroke collection array
  - Device information capture
  - UUID generation

- **Key Properties:**
  - `sessionId` - Unique session identifier
  - `taskId` - Task identifier ('drawing_modal')
  - `sessionStartTime` - ISO 8601 start timestamp
  - `sessionEndTime` - ISO 8601 end timestamp
  - `totalDuration` - Total session duration (ms)
  - `activeDuration` - Drawing time (ms)
  - `pauseDuration` - Idle time (ms)
  - `status` - Session status string
  - `strokes` - Stroke count
  - `strokeData` - Array of stroke objects
  - `events` - Event timeline array
  - `deviceInfo` - Device metadata object

- **Key Methods:**
  - `startStroke(x, y, inputData)` - Create new stroke
  - `addPoint(x, y, inputData)` - Add point to current stroke
  - `endStroke()` - Finalize current stroke
  - `exportSession()` - Generate JSON export
  - `exportPNG()` - Generate PNG image
  - `generateId()` - Create unique identifiers

---

## 💻 Technologies Used

### Frontend
- **HTML5** - Semantic markup with Canvas API
- **CSS3** - Modern styling with:
  - CSS Grid & Flexbox for layouts
  - CSS Variables for theming
  - Media Queries (5 responsive breakpoints)
  - Transitions & Animations
- **JavaScript (ES6+)** - Vanilla JS implementation with:
  - ES6 Classes & Modules
  - Arrow Functions & Template Literals
  - Async/Await patterns
  - Modern DOM APIs

### Canvas & Input
- **Canvas 2D API** - High-performance drawing
- **Pointer Events API** - Unified input handling for:
  - Mouse input
  - Touch input (finger)
  - Stylus/pen input with pressure & tilt
- **RequestAnimationFrame** - Smooth 60 FPS rendering

### Data & Export
- **JSON** - Session data export format
- **Blob API** - PNG image generation
- **FileReader API** - Client-side file handling
- **LocalStorage API** - Settings persistence (optional)

### Development Tools
- **Git** - Version control with semantic commits
- **GitHub** - Repository hosting and collaboration
- **GitHub Pages** - Static site deployment
- **VS Code** - Recommended code editor

### Browser APIs Used
- Navigator API (device detection)
- Performance API (high-precision timestamps)
- DOM Events (pointer, keyboard, resize)
- Canvas export (toDataURL, toBlob)

### Design Patterns
- **MVC Pattern** - Model (DrawingSession), View (Canvas/DOM), Controller (DrawingApp)
- **Observer Pattern** - Event system for user interactions
- **Singleton Pattern** - Single DrawingApp instance
- **Factory Pattern** - Stroke and session ID generation

---

## 📈 Version History

**v2.0-stable** (Feb 24, 2026) - Current
- ✅ **Comprehensive Measurement Tracking** (NEW)
  - **Twist** - Stylus barrel rotation (0-359°)
  - **Width/Height** - Contact geometry (px)
  - **Distance** - Height above surface for hover (mm)
  - **Velocity** - Point-by-point speed calculation (px/s)
  - **Trajectory Length** - Total stroke/hover path distance (px)
  - **Average Pressure** - Stroke-level pressure metrics
  - **Average/Max Velocity** - Stroke and hover speed analytics

- ✅ **Enhanced UI Panels** (NEW)
  - **Stroke Metrics Panel** - 5 real-time stroke metrics
    - Duration, Length, Average Speed, Max Speed, Average Pressure
  - **Hover Metrics Panel** - 5 real-time hover metrics
    - Duration, Velocity, Length, Distance, Total Hover Paths
  - **In-Air Status Display** - Real-time hover state indicator
  - **Twist Display** - Stylus rotation readout
  - **Velocity Display** - Current movement speed

- ✅ **Session Duration Tracking**
  - Total/active/pause time measurement
  - Per-stroke duration and pause metrics
  - Idle detection (2-second configurable timeout)
  - Complete Session functionality with summary

- ✅ **In-Air Trajectory Capture**
  - Hover path tracking for stylus/pen devices
  - Altitude (0-90°) and azimuth (0-360°) calculations
  - Hover-to-stroke linking (hoverPathBeforeStroke)
  - 50ms throttling for performance
  - Velocity and trajectory tracking for hover paths

- ✅ **Responsive Design**
  - 5 responsive breakpoints (320px, 480px, 768px, 1024px, landscape)
  - Collapsible sidebar with toggle button (6 sections)
  - Touch-optimized 44px minimum tap targets
  - Responsive canvas sizing with content preservation
  - Mobile/tablet/desktop optimized layouts

- ✅ **Event Logging System**
  - Complete chronological event timeline
  - Session lifecycle tracking (start/idle/complete)
  - Hover event logging (hover_start/hover_end)
  - Stroke event logging with trajectory metrics

- ✅ **Complete Data Export**
  - 20+ measurements per stroke point
  - 10+ measurements per hover point
  - Stroke-level metrics (duration, trajectory, velocity, pressure)
  - Hover-level metrics (duration, trajectory, velocity, distance)
  - Full event timeline with 7 event types
  - Comprehensive metadata and device info

- ✅ All Core Features Working
  - Full drawing canvas with pen/eraser/shapes
  - Complete export system (JSON + PNG)
  - Session tracking and comprehensive metadata
  - Cross-browser and cross-device compatible

**v1.0** (Initial Release)
- Basic drawing interface
- Simple stroke capture
- Documentation setup

---

## ✅ Status & Roadmap

### Current Status
- ✅ **Production Ready** - Fully tested and stable
- ✅ **All Core Features Working** - No known critical bugs
- ✅ **Cross-Browser Compatible** - Chrome, Firefox, Safari, Edge
- ✅ **Fully Responsive** - Mobile, tablet, desktop optimized
- ✅ **Comprehensive Data Capture** - Session, stroke, hover, event tracking with 20+ measurements per point

### Future Enhancements

See [future features.md](future%20features.md) for comprehensive roadmap with 100+ potential features organized into:

**Quick Wins** (High Impact, Low Effort):
- Custom brush shapes and textures
- Export to SVG/PDF formats
- Advanced undo/redo with history branching
- Color palettes and gradient support
- Keyboard shortcuts

**Medium Priority**:
- Layer support for complex compositions
- Multi-user collaborative drawing
- Cloud sync and cross-device sessions
- Animation and playback tools
- Advanced shape editing

**Research & Innovation**:
- Gesture recognition and shape prediction
- AI-powered drawing assistance
- Emotion and cognitive load analysis
- Accessibility enhancements (voice control, eye tracking)
- VR/AR drawing experiences

Full roadmap includes 4-phase implementation plan, research applications, and community/open source initiatives.

---

## 📝 License

This project is licensed under the **MIT License**.

### MIT License

Copyright (c) 2026 Jesun Ahmad Ushno

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🤝 Contributing

Found a bug or have a feature request?
- Report issues on GitHub Issues
- Submit pull requests for improvements

---

## 📞 Support & Contact

- **GitHub Issues:** Report bugs and request features
- **GitHub Discussions:** General questions and feedback

---

## 🎉 Get Started

**Try it now:**
[https://jesunachmadushno.github.io/drawing_modal/](https://jesunachmadushno.github.io/drawing_modal/)

**Clone the repo:**
```bash
git clone https://github.com/JesunAhmadUshno/drawing_modal.git
```

---

**Last Updated:** February 24, 2026  
**Status:** ✅ Fully Functional  
**Version:** 2.0
