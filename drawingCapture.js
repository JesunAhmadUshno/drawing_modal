/**
 * Drawing Capture System - Sprint 2
 * Serverless version for GitHub Pages deployment
 * Captures drawing interaction data with timestamps, stroke events, and metadata
 */

class DrawingCaptureSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.session = null;
        this.currentStroke = null;
        this.isDrawing = false;
        this.setupCanvas();
        this.attachEventListeners();
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

    startSession(taskId = 'basic-drawing') {
        this.session = {
            sessionId: this.generateSessionId(),
            taskId: taskId,
            taskStartTime: new Date().toISOString(),
            taskEndTime: null,
            deviceInfo: this.getDeviceInfo(),
            strokes: []
        };
        
        console.log('Session started:', this.session.sessionId);
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
        const { x, y } = this.getCanvasCoordinates(event);
        const inputType = this.detectInputType(event);
        
        // Create new stroke
        this.currentStroke = {
            strokeId: `str-${Date.now()}-${this.session.strokes.length + 1}`,
            startTime: new Date().toISOString(),
            endTime: null,
            inputType: inputType,
            pressureData: event.pressure !== undefined && event.pressure !== 0.5,
            points: []
        };
        
        // Add first point
        this.addPoint(event, x, y);
        
        // Begin drawing
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    handlePointerMove(event) {
        if (!this.isDrawing || !this.currentStroke) return;
        
        const { x, y } = this.getCanvasCoordinates(event);
        this.addPoint(event, x, y);
        
        // Draw line
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    handlePointerUp(event) {
        if (!this.isDrawing || !this.currentStroke) return;
        
        this.isDrawing = false;
        
        // Finalize stroke
        this.currentStroke.endTime = new Date().toISOString();
        this.session.strokes.push(this.currentStroke);
        
        console.log(`Stroke ${this.currentStroke.strokeId} completed: ${this.currentStroke.points.length} points`);
        
        this.currentStroke = null;
    }

    addPoint(event, x, y) {
        const point = {
            x: x,
            y: y,
            timestamp: event.timeStamp || Date.now(),
            pressure: event.pressure || 0,
            tiltX: event.tiltX || 0,
            tiltY: event.tiltY || 0,
            radiusX: event.width || 1,
            radiusY: event.height || 1
        };
        
        this.currentStroke.points.push(point);
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
            this.session.strokes = [];
        }
        this.currentStroke = null;
        this.isDrawing = false;
        this.clearCanvas();
    }

    endSession() {
        if (!this.session) return;
        
        this.session.taskEndTime = new Date().toISOString();
        
        // Calculate summary statistics
        const totalPoints = this.session.strokes.reduce((sum, stroke) => 
            sum + stroke.points.length, 0);
        
        console.log('Session ended:', {
            sessionId: this.session.sessionId,
            strokes: this.session.strokes.length,
            points: totalPoints,
            duration: new Date(this.session.taskEndTime) - new Date(this.session.taskStartTime)
        });
    }

    getSessionData() {
        if (!this.session) {
            throw new Error('No active session');
        }
        
        // Calculate metadata
        const totalPoints = this.session.strokes.reduce((sum, stroke) => 
            sum + stroke.points.length, 0);
        
        const sessionData = {
            ...this.session,
            metadata: {
                totalStrokes: this.session.strokes.length,
                totalPoints: totalPoints,
                avgPointsPerStroke: this.session.strokes.length > 0 
                    ? totalPoints / this.session.strokes.length 
                    : 0,
                sessionDuration: this.session.taskEndTime 
                    ? new Date(this.session.taskEndTime) - new Date(this.session.taskStartTime)
                    : null
            }
        };
        
        return sessionData;
    }

    // Export session data as JSON file
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
