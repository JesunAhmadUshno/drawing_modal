/**
 * Drawing Capture System - Sprint 2
 * Serverless version for GitHub Pages deployment
 * Captures drawing interaction data with timestamps, stroke events, and metadata
 * Includes: Session Duration Tracking, Idle Detection, Complete Button
 */

class DrawingCaptureSystem {
    constructor(canvas, skipListeners = false) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.session = null;
        this.currentStroke = null;
        this.currentBrushState = null;
        this.isDrawing = false;
        
        // Duration tracking variables
        this.sessionStartTime = null;
        this.activeDuration = 0;      // Time spent drawing
        this.pauseDuration = 0;       // Time spent not drawing
        this.lastActivityTime = null; // Track last user interaction
        this.idleTimeout = null;      // Timeout for idle detection
        this.isIdle = false;          // Idle status
        this.status = 'not-started';  // Session status
        this.events = [];             // All session events
        this.strokeCount = 0;         // Number of strokes
        this.lastDrawEndTime = null;  // Track when last draw ended
        
        // In-air trajectory tracking (hover movements)
        this.isHovering = false;      // Is stylus hovering?
        this.currentHoverPath = null; // Current hover trajectory
        this.hoverPaths = [];         // All hover trajectories
        this.lastHoverTime = null;    // Last hover event time
        this.lastCompletedHoverPathId = null; // Track last hover path for linking to strokes
        this.lastHoverPoint = null;   // Last hover point for velocity calculation
        this.lastStrokePoint = null;  // Last stroke point for velocity calculation
        
        // Only set up canvas and listeners if not integrated with another drawing app
        if (!skipListeners) {
            this.setupCanvas();
            this.attachEventListeners();
        }
    }

    setupCanvas() {
        // Set canvas background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set drawing defaults
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        return `s-${timestamp}-${random}`;
    }

    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            screenDPI: window.devicePixelRatio * 96,
            os: navigator.platform,
            language: navigator.language,
            timestamp: new Date().toISOString()
        };
    }

    detectInputType(event) {
        // Detailed input type detection based on PointerEvent properties
        if (event.pointerType === 'pen') {
            return 'stylus';
        } else if (event.pointerType === 'touch') {
            // Distinguish between finger and stylus by checking width/height
            const avgSize = (event.width + event.height) / 2;
            return avgSize > 10 ? 'finger' : 'stylus';
        } else if (event.pointerType === 'mouse') {
            return 'mouse';
        }
        return 'unknown';
    }

    setBrushState(brushState) {
        this.currentBrushState = brushState;
    }

    startSession(taskId = 'drawing_modal') {
        const now = Date.now();
        this.sessionStartTime = now;
        this.lastActivityTime = now;
        this.lastDrawEndTime = now;
        this.strokeCount = 0;
        this.activeDuration = 0;
        this.pauseDuration = 0;
        this.isIdle = false;
        this.events = [];
        
        // Reset hover tracking
        this.hoverPaths = [];
        this.currentHoverPath = null;
        this.isHovering = false;
        this.lastHoverTime = null;
        this.lastCompletedHoverPathId = null;
        
        this.session = {
            sessionId: this.generateSessionId(),
            taskId: taskId,
            sessionStartTime: new Date().toISOString(),
            sessionEndTime: null,
            totalDuration: 0,
            activeDuration: 0,
            pauseDuration: 0,
            status: 'active',
            strokes: 0,
            strokeData: [],
            deviceInfo: this.getDeviceInfo(),
            events: []
        };
        
        this.status = 'active';
        
        // Log session start event
        this.logEvent('session_start', {
            timestamp: now
        });
        
        // Start idle detection
        this.startIdleDetection();
        
        console.log('Session started:', this.session.sessionId);
    }

    // Start idle detection - marks as idle if no activity for 2 seconds
    startIdleDetection() {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        
        this.idleTimeout = setTimeout(() => {
            if (!this.isIdle && this.session) {
                this.isIdle = true;
                this.session.status = 'idle';
                this.status = 'idle';
                
                const now = Date.now();
                this.logEvent('idle_detect', {
                    timestamp: now,
                    reason: '2_seconds_no_interaction'
                });
                
                console.log('User IDLE - no activity for 2 seconds');
            }
        }, 2000); // 2 seconds
    }

    // Log all events throughout session
    logEvent(eventType, data) {
        const event = {
            type: eventType,
            timestamp: data.timestamp || Date.now(),
            ...data
        };
        this.events.push(event);
        if (this.session) {
            this.session.events.push(event);
        }
    }

    getCanvasCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: Math.round((event.clientX - rect.left) * (this.canvas.width / rect.width)),
            y: Math.round((event.clientY - rect.top) * (this.canvas.height / rect.height))
        };
    }

    handlePointerDown(event) {
        if (!this.session) return;
        
        this.isDrawing = true;
        this.status = 'active';
        this.isIdle = false;
        this.lastActivityTime = Date.now();
        
        // Clear and restart idle detection
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        this.startIdleDetection();
        
        const { x, y } = this.getCanvasCoordinates(event);
        const inputType = this.detectInputType(event);
        const now = Date.now();
        
        // Capture current hover path ID before ending it
        let hoverPathId = null;
        if (this.currentHoverPath) {
            hoverPathId = this.currentHoverPath.hoverPathId;
            this.endHoverPath();
        } else if (this.lastCompletedHoverPathId) {
            hoverPathId = this.lastCompletedHoverPathId;
        }
        
        // Calculate pause before this stroke
        let pauseBeforeStroke = 0;
        if (this.lastDrawEndTime) {
            // Pause is time between last stroke end and this stroke start
            pauseBeforeStroke = now - this.lastDrawEndTime;
        } else if (this.sessionStartTime) {
            // First stroke - pause is time since session start
            pauseBeforeStroke = now - this.sessionStartTime;
        }

        const brushState = this.currentBrushState || {};
        
        // Create new stroke
        this.currentStroke = {
            strokeId: `str-${now}-${this.strokeCount + 1}`,
            startTime: new Date().toISOString(),
            startTimeMs: now,
            endTime: null,
            hoverPathBeforeStroke: hoverPathId,
            pauseBeforeStroke: pauseBeforeStroke,
            inputType: inputType,
            pressureData: event.pressure !== undefined && event.pressure !== 0.5,
            color: brushState.color || null,
            size: brushState.size || null,
            opacity: brushState.opacity || null,
            tool: brushState.tool || null,
            points: []
        };
        
        // Reset last stroke point for velocity calculation
        this.lastStrokePoint = null;
        
        // Log draw start event
        this.logEvent('draw_start', {
            timestamp: now,
            x: x,
            y: y,
            inputType: inputType,
            hoverPathBeforeStroke: hoverPathId,
            pauseBeforeStroke: pauseBeforeStroke
        });
        
        // Add first point
        this.addPoint(event, x, y);
        
        // Begin drawing
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    handlePointerMove(event) {
        if (this.isDrawing && this.currentStroke) {
            // Active drawing - capture stroke points
            const { x, y } = this.getCanvasCoordinates(event);
            this.addPoint(event, x, y);
            
            // Draw line
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (!this.isDrawing && this.session) {
            // In-air hover - capture trajectory
            this.captureHoverPoint(event);
        }
    }

    handlePointerUp(event) {
        if (!this.isDrawing || !this.currentStroke) return;
        
        this.isDrawing = false;
        const now = Date.now();
        
        // Calculate stroke duration and add to active duration
        this.currentStroke.endTime = new Date().toISOString();
        this.currentStroke.endTimeMs = now;
        
        const strokeDuration = this.currentStroke.endTimeMs - this.currentStroke.startTimeMs;
        this.currentStroke.strokeDuration = strokeDuration;
        this.activeDuration += strokeDuration;
        
        // Calculate trajectory length
        this.currentStroke.trajectoryLength = this.calculateTrajectoryLength(this.currentStroke.points);
        
        // Calculate average metrics
        const avgMetrics = this.calculateAverageMetrics(this.currentStroke.points);
        this.currentStroke.averagePressure = avgMetrics.pressure;
        this.currentStroke.averageVelocity = avgMetrics.velocity;
        this.currentStroke.maxVelocity = avgMetrics.maxVelocity;
        
        // Record when drawing ended
        this.lastDrawEndTime = now;
        
        this.session.strokeData.push(this.currentStroke);
        this.session.strokes++;
        this.strokeCount++;
        
        // Log draw end event
        this.logEvent('draw_end', {
            timestamp: now,
            strokeId: this.currentStroke.strokeId,
            strokeDuration: strokeDuration,
            pointsCount: this.currentStroke.points.length,
            trajectoryLength: this.currentStroke.trajectoryLength
        });
        
        console.log(`Stroke ${this.currentStroke.strokeId} completed: ${this.currentStroke.points.length} points, duration: ${strokeDuration}ms, length: ${this.currentStroke.trajectoryLength}px`);
        
        // Reset last stroke point
        this.lastStrokePoint = null;
        this.currentStroke = null;
        
        // Start new hover path for in-air tracking
        this.startHoverPath();
        
        // Restart idle detection
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        this.startIdleDetection();
    }

    addPoint(event, x, y) {
        const now = event.timeStamp || Date.now();
        
        // Calculate velocity from last point
        let velocity = 0;
        if (this.lastStrokePoint) {
            const dx = x - this.lastStrokePoint.x;
            const dy = y - this.lastStrokePoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const timeDelta = (now - this.lastStrokePoint.timestamp) / 1000; // seconds
            velocity = timeDelta > 0 ? distance / timeDelta : 0; // pixels per second
        }
        
        const point = {
            x: x,
            y: y,
            timestamp: now,
            pressure: event.pressure || 0,
            tiltX: event.tiltX || 0,
            tiltY: event.tiltY || 0,
            twist: event.twist || 0,
            width: event.width || 1,
            height: event.height || 1,
            radiusX: event.width || 1,
            radiusY: event.height || 1,
            altitude: this.calculateAltitude(event.tiltX || 0, event.tiltY || 0),
            azimuth: this.calculateAzimuth(event.tiltX || 0, event.tiltY || 0),
            velocity: Math.round(velocity * 100) / 100 // px/s rounded to 2 decimals
        };
        
        this.currentStroke.points.push(point);
        this.lastStrokePoint = point;
    }

    // In-air trajectory tracking methods
    startHoverPath() {
        if (!this.session) return;
        
        const now = Date.now();
        this.currentHoverPath = {
            hoverPathId: `hover-${now}-${this.hoverPaths.length + 1}`,
            startTime: new Date().toISOString(),
            startTimeMs: now,
            endTime: null,
            endTimeMs: null,
            duration: 0,
            points: []
        };
        
        // Reset last hover point for velocity calculation
        this.lastHoverPoint = null;
        
        this.isHovering = true;
        
        this.logEvent('hover_start', {
            timestamp: now,
            hoverPathId: this.currentHoverPath.hoverPathId
        });
    }

    endHoverPath() {
        if (!this.currentHoverPath) return;
        
        const now = Date.now();
        this.currentHoverPath.endTime = new Date().toISOString();
        this.currentHoverPath.endTimeMs = now;
        this.currentHoverPath.duration = now - this.currentHoverPath.startTimeMs;
        
        // Calculate hover trajectory length
        this.currentHoverPath.trajectoryLength = this.calculateTrajectoryLength(this.currentHoverPath.points);
        
        // Calculate average hover metrics
        const avgMetrics = this.calculateAverageMetrics(this.currentHoverPath.points);
        this.currentHoverPath.averageVelocity = avgMetrics.velocity;
        this.currentHoverPath.maxVelocity = avgMetrics.maxVelocity;
        
        // Save hover path ID for linking to next stroke
        this.lastCompletedHoverPathId = this.currentHoverPath.hoverPathId;
        
        // Only save hover path if it has points
        if (this.currentHoverPath.points.length > 0) {
            this.hoverPaths.push(this.currentHoverPath);
            
            this.logEvent('hover_end', {
                timestamp: now,
                hoverPathId: this.currentHoverPath.hoverPathId,
                pointsCount: this.currentHoverPath.points.length,
                duration: this.currentHoverPath.duration,
                trajectoryLength: this.currentHoverPath.trajectoryLength
            });
            
            console.log(`Hover path ${this.currentHoverPath.hoverPathId} completed: ${this.currentHoverPath.points.length} points, duration: ${this.currentHoverPath.duration}ms, length: ${this.currentHoverPath.trajectoryLength}px`);
        }
        
        // Reset last hover point
        this.lastHoverPoint = null;
        this.currentHoverPath = null;
        this.isHovering = false;
    }

    captureHoverPoint(event) {
        const inputType = this.detectInputType(event);
        
        // Only track hover for pen/stylus - not for mouse or touch
        if (inputType !== 'stylus') return;
        
        // Start new hover path if needed
        if (!this.currentHoverPath) {
            this.startHoverPath();
        }
        
        const { x, y } = this.getCanvasCoordinates(event);
        const now = Date.now();
        
        // Throttle hover points - only capture every 50ms
        if (this.lastHoverTime && (now - this.lastHoverTime) < 50) {
            return;
        }
        
        this.lastHoverTime = now;
        
        // Calculate hover velocity from last hover point
        let hoverVelocity = 0;
        if (this.lastHoverPoint) {
            const dx = x - this.lastHoverPoint.x;
            const dy = y - this.lastHoverPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const timeDelta = (now - this.lastHoverPoint.timestamp) / 1000; // seconds
            hoverVelocity = timeDelta > 0 ? distance / timeDelta : 0; // pixels per second
        }
        
        const hoverPoint = {
            x: x,
            y: y,
            timestamp: event.timeStamp || now,
            pressure: event.pressure || 0,
            tiltX: event.tiltX || 0,
            tiltY: event.tiltY || 0,
            twist: event.twist || 0,
            width: event.width || 1,
            height: event.height || 1,
            distance: event.distance || 0, // Height above surface (if supported)
            altitude: this.calculateAltitude(event.tiltX || 0, event.tiltY || 0),
            azimuth: this.calculateAzimuth(event.tiltX || 0, event.tiltY || 0),
            velocity: Math.round(hoverVelocity * 100) / 100 // px/s rounded to 2 decimals
        };
        
        this.currentHoverPath.points.push(hoverPoint);
        this.lastHoverPoint = hoverPoint;
    }

    // Calculate altitude angle from tilt data (angle from surface)
    calculateAltitude(tiltX, tiltY) {
        if (tiltX === 0 && tiltY === 0) return 90; // Perpendicular to surface
        const tiltRadians = Math.sqrt(tiltX * tiltX + tiltY * tiltY) * (Math.PI / 180);
        return Math.max(0, 90 - (tiltRadians * (180 / Math.PI)));
    }

    // Calculate azimuth angle from tilt data (compass direction)
    calculateAzimuth(tiltX, tiltY) {
        if (tiltX === 0 && tiltY === 0) return 0;
        let azimuth = Math.atan2(tiltY, tiltX) * (180 / Math.PI);
        if (azimuth < 0) azimuth += 360;
        return azimuth;
    }

    // Calculate trajectory length from sequence of points
    calculateTrajectoryLength(points) {
        if (!points || points.length < 2) return 0;
        
        let length = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x;
            const dy = points[i].y - points[i-1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        
        return Math.round(length * 100) / 100; // Round to 2 decimals
    }

    // Calculate average metrics from points array
    calculateAverageMetrics(points) {
        if (!points || points.length === 0) {
            return { pressure: 0, velocity: 0, maxVelocity: 0 };
        }
        
        let totalPressure = 0;
        let totalVelocity = 0;
        let maxVelocity = 0;
        let velocityCount = 0;
        
        points.forEach(point => {
            totalPressure += point.pressure || 0;
            if (point.velocity !== undefined) {
                totalVelocity += point.velocity;
                velocityCount++;
                maxVelocity = Math.max(maxVelocity, point.velocity);
            }
        });
        
        return {
            pressure: Math.round((totalPressure / points.length) * 1000) / 1000,
            velocity: velocityCount > 0 ? Math.round((totalVelocity / velocityCount) * 100) / 100 : 0,
            maxVelocity: Math.round(maxVelocity * 100) / 100
        };
    }

    attachEventListeners() {
        // Use Pointer Events API for unified input handling
        this.canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.handlePointerDown(e);
        });
        
        this.canvas.addEventListener('pointermove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e);
        });
        
        this.canvas.addEventListener('pointerup', (e) => {
            e.preventDefault();
            this.handlePointerUp(e);
        });
        
        this.canvas.addEventListener('pointercancel', (e) => {
            e.preventDefault();
            this.handlePointerUp(e);
        });
        
        // Prevent default touch behavior
        this.canvas.style.touchAction = 'none';
    }

    clearCanvas() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clearSession() {
        if (this.session) {
            this.session.strokeData = [];
            this.session.strokes = 0;
            this.session.events = [];
        }
        this.currentStroke = null;
        this.isDrawing = false;
        this.activeDuration = 0;
        this.pauseDuration = 0;
        this.events = [];
        this.strokeCount = 0;
        this.isIdle = false;
        this.status = 'active';
        
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        
        this.clearCanvas();
    }

    // Complete the session - stops all tracking
    completeSession() {
        if (!this.session) return;
        
        const now = Date.now();
        const totalDurationMs = now - this.sessionStartTime;
        
        // End any active hover path
        if (this.currentHoverPath) {
            this.endHoverPath();
        }
        
        // Calculate pause time
        this.pauseDuration = totalDurationMs - this.activeDuration;
        
        // Update session data
        this.session.sessionEndTime = new Date().toISOString();
        this.session.totalDuration = totalDurationMs;
        this.session.activeDuration = this.activeDuration;
        this.session.pauseDuration = this.pauseDuration;
        this.session.status = 'completed';
        
        // Log completion event
        this.logEvent('session_complete', {
            timestamp: now,
            totalDuration: totalDurationMs,
            activeDuration: this.activeDuration,
            pauseDuration: this.pauseDuration,
            totalStrokes: this.session.strokes,
            totalHoverPaths: this.hoverPaths.length
        });
        
        // Stop idle detection
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        
        this.status = 'completed';
        
        console.log('Session completed:', {
            sessionId: this.session.sessionId,
            totalDuration: `${(totalDurationMs / 1000).toFixed(2)}s`,
            activeDuration: `${(this.activeDuration / 1000).toFixed(2)}s`,
            pauseDuration: `${(this.pauseDuration / 1000).toFixed(2)}s`,
            strokes: this.session.strokes,
            hoverPaths: this.hoverPaths.length
        });
        
        return this.session;
    }

    endSession() {
        if (!this.session) return;
        
        this.completeSession();
    }

    // Get current session metrics for live display
    getCurrentMetrics() {
        if (!this.session) {
            return null;
        }
        
        const now = Date.now();
        const elapsedMs = now - this.sessionStartTime;
        const activeDurationCurrent = this.activeDuration + (this.isDrawing ? now - this.lastActivityTime : 0);
        const pauseDurationCurrent = elapsedMs - activeDurationCurrent;
        
        return {
            sessionId: this.session.sessionId,
            totalDuration: elapsedMs,
            activeDuration: activeDurationCurrent,
            pauseDuration: pauseDurationCurrent,
            strokes: this.session.strokes,
            status: this.isIdle ? 'idle' : 'active',
            isDrawing: this.isDrawing,
            totalDurationSeconds: (elapsedMs / 1000).toFixed(2),
            activeDurationSeconds: (activeDurationCurrent / 1000).toFixed(2),
            pauseDurationSeconds: (pauseDurationCurrent / 1000).toFixed(2)
        };
    }

    getSessionData() {
        if (!this.session) {
            throw new Error('No active session');
        }
        
        // Calculate total points
        const totalPoints = this.session.strokeData.reduce((sum, stroke) => 
            sum + stroke.points.length, 0);
        
        // Calculate total hover points
        const totalHoverPoints = this.hoverPaths.reduce((sum, path) => 
            sum + path.points.length, 0);
        
        const sessionData = {
            sessionId: this.session.sessionId,
            taskId: this.session.taskId,
            sessionStartTime: this.session.sessionStartTime,
            sessionEndTime: this.session.sessionEndTime,
            totalDuration: this.session.totalDuration,
            activeDuration: this.session.activeDuration,
            pauseDuration: this.session.pauseDuration,
            status: this.session.status,
            strokes: this.session.strokes,
            deviceInfo: this.session.deviceInfo,
            events: this.session.events,
            metadata: {
                totalStrokes: this.session.strokes,
                totalPoints: totalPoints,
                avgPointsPerStroke: this.session.strokes > 0 
                    ? (totalPoints / this.session.strokes).toFixed(2)
                    : 0,
                totalDurationSeconds: this.session.totalDuration 
                    ? (this.session.totalDuration / 1000).toFixed(3)
                    : 0,
                activeDurationSeconds: this.session.activeDuration 
                    ? (this.session.activeDuration / 1000).toFixed(3)
                    : 0,
                pauseDurationSeconds: this.session.pauseDuration 
                    ? (this.session.pauseDuration / 1000).toFixed(3)
                    : 0,
                activePercentage: this.session.totalDuration > 0 
                    ? ((this.session.activeDuration / this.session.totalDuration) * 100).toFixed(2)
                    : 0,
                totalHoverPaths: this.hoverPaths.length,
                totalHoverPoints: totalHoverPoints,
                avgHoverPointsPerPath: this.hoverPaths.length > 0 
                    ? (totalHoverPoints / this.hoverPaths.length).toFixed(2)
                    : 0
            },
            strokeData: this.session.strokeData,
            hoverData: this.hoverPaths
        };
        
        return sessionData;
    }

    // Export session data as JSON file with all duration and event data
    downloadSession() {
        const sessionData = this.getSessionData();
        const blob = new Blob([JSON.stringify(sessionData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-${sessionData.sessionId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Session downloaded:', sessionData.sessionId);
    }

    // Save to localStorage for persistence (serverless alternative)
    saveToLocalStorage() {
        if (!this.session) return;
        
        const sessionData = this.getSessionData();
        const key = `drawing-session-${sessionData.sessionId}`;
        
        try {
            localStorage.setItem(key, JSON.stringify(sessionData));
            console.log('Session saved to localStorage:', key);
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }

    // Load all sessions from localStorage
    static loadAllSessions() {
        const sessions = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('drawing-session-')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    sessions.push(data);
                } catch (e) {
                    console.error('Failed to parse session:', key, e);
                }
            }
        }
        return sessions;
    }

    // Clear all sessions from localStorage
    static clearAllSessions() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('drawing-session-')) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));
        console.log(`Cleared ${keys.length} sessions from localStorage`);
    }
}
