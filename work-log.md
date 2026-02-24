# Work Log

## 2026-02-24 - Reporting Log

### Summary
- Released v2.0-stable documentation and measurement tracking improvements.
- Added comprehensive data capture metrics for strokes and hover paths.
- Updated UI panels and export schemas to reflect all measurements.
- Commit: 2d64187

### Full Change List
- Measurements:
  - Added twist (0-359 degrees), width/height (px), distance (mm), velocity (px/s), trajectory length (px).
  - Added per-stroke averages and max velocity, average pressure.
  - Added per-hover averages and max velocity, trajectory length.
- UI:
  - Added Stroke Metrics panel with 5 fields (duration, length, avg/max speed, avg pressure).
  - Added Hover Metrics panel with 5 fields (duration, velocity, length, distance, count).
  - Added in-air status, twist, width/height, velocity display in session data.
- Data Capture Engine:
  - Velocity calculation for stroke and hover points.
  - Trajectory length calculation for stroke and hover paths.
  - Average metrics calculation (pressure, velocity) with max velocity.
- Export Schema:
  - Expanded JSON export with all new fields.
  - Added full schema and field descriptions in README.
- Documentation:
  - Overhauled README with complete architecture, UI panels, and export format.
  - Added future features roadmap (100+ items, 4-phase plan).

### Files Updated
- index.html
- advanced-final.js
- drawingCapture.js
- README.md
- future features.md
