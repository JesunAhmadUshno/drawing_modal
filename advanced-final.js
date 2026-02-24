// Advanced Drawing Capture - Complete Clean Implementation
// Sprint 2 - All Features Working

class DrawingSession {
    constructor() {
        this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.taskStartTime = new Date().toISOString();
        this.taskEndTime = null;
        this.strokes = [];
        this.currentStroke = null;
        this.deviceInfo = this.captureDeviceInfo();
        this.sensorData = { accelerometer: [], gyroscope: [] };
        this.startTimer();
        this.initSensors();
        this.measureRefreshRate();
    }

    captureDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            devicePixelRatio: window.devicePixelRatio,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            timestamp: new Date().toISOString()
        };
    }

    startTimer() {
        setInterval(() => {
            const duration = Math.floor((Date.now() - new Date(this.taskStartTime)) / 1000);
            document.getElementById('duration').textContent = `${duration}s`;
        }, 1000);
    }

    initSensors() {
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => {
                if (e.accelerationIncludingGravity) {
                    const data = {
                        x: e.accelerationIncludingGravity.x?.toFixed(2) || 0,
                        y: e.accelerationIncludingGravity.y?.toFixed(2) || 0,
                        z: e.accelerationIncludingGravity.z?.toFixed(2) || 0,
                        timestamp: Date.now()
                    };
                    this.sensorData.accelerometer.push(data);
                    if (this.sensorData.accelerometer.length > 50) {
                        this.sensorData.accelerometer.shift();
                    }
                    document.getElementById('accelerometer').textContent = `${data.x}/${data.y}/${data.z}`;
                }
            });
        }

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                const data = {
                    alpha: (e.alpha || 0).toFixed(1),
                    beta: (e.beta || 0).toFixed(1),
                    gamma: (e.gamma || 0).toFixed(1),
                    timestamp: Date.now()
                };
                this.sensorData.gyroscope.push(data);
                if (this.sensorData.gyroscope.length > 50) {
                    this.sensorData.gyroscope.shift();
                }
                document.getElementById('gyroscope').textContent = `${data.alpha}/${data.beta}/${data.gamma}`;
            });
        }
    }

    measureRefreshRate() {
        let frames = 0;
        let lastTime = performance.now();

        const measure = (currentTime) => {
            frames++;
            if (frames === 60) {
                const delta = currentTime - lastTime;
                const rate = Math.round(60000 / delta);
                document.getElementById('refreshRate').textContent = `${rate}Hz`;
                this.deviceInfo.refreshRate = rate;
                return;
            }
            requestAnimationFrame(measure);
        };
        requestAnimationFrame(measure);
    }

    startStroke(x, y, inputData) {
        const strokeId = `stroke-${this.strokes.length + 1}`;
        this.currentStroke = {
            strokeId,
            points: [{ x, y, timestamp: Date.now(), pressure: inputData.pressure, tiltX: inputData.tiltX, tiltY: inputData.tiltY }],
            inputType: inputData.inputType,
            pointerType: inputData.pointerType,
            startTime: new Date().toISOString(),
            endTime: null,
            color: inputData.color,
            size: inputData.size,
            opacity: inputData.opacity,
            tool: inputData.tool,
            interStrokeGap: this.calculateInterStrokeGap()
        };
    }

    addPoint(x, y, inputData) {
        if (this.currentStroke) {
            this.currentStroke.points.push({
                x, y,
                timestamp: Date.now(),
                pressure: inputData.pressure,
                tiltX: inputData.tiltX,
                tiltY: inputData.tiltY
            });
        }
    }

    endStroke() {
        if (this.currentStroke) {
            this.currentStroke.endTime = new Date().toISOString();
            this.currentStroke.duration = this.calculateDuration();
            this.currentStroke.velocity = this.calculateVelocity();
            this.currentStroke.averageVelocity = this.calculateAverageVelocity();
            this.currentStroke.averagePressure = this.calculateAveragePressure();
            this.strokes.push(this.currentStroke);
            this.currentStroke = null;
            document.getElementById('strokeCount').textContent = this.strokes.length;
        }
    }

    calculateInterStrokeGap() {
        if (this.strokes.length === 0) return 0;
        const lastStroke = this.strokes[this.strokes.length - 1];
        return Date.now() - new Date(lastStroke.endTime).getTime();
    }

    calculateDuration() {
        if (!this.currentStroke || this.currentStroke.points.length < 2) return 0;
        const points = this.currentStroke.points;
        return points[points.length - 1].timestamp - points[0].timestamp;
    }

    calculateVelocity() {
        if (!this.currentStroke || this.currentStroke.points.length < 2) return [];
        const velocities = [];
        const points = this.currentStroke.points;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            const dt = points[i].timestamp - points[i - 1].timestamp;
            const distance = Math.sqrt(dx * dx + dy * dy);
            velocities.push(dt > 0 ? distance / dt : 0);
        }
        return velocities;
    }

    calculateAverageVelocity() {
        const velocities = this.calculateVelocity();
        if (velocities.length === 0) return 0;
        return velocities.reduce((a, b) => a + b, 0) / velocities.length;
    }

    calculateAveragePressure() {
        if (!this.currentStroke) return 0;
        const pressures = this.currentStroke.points.map(p => p.pressure);
        return pressures.reduce((a, b) => a + b, 0) / pressures.length;
    }

    exportData() {
        this.taskEndTime = new Date().toISOString();
        return {
            sessionId: this.sessionId,
            taskStartTime: this.taskStartTime,
            taskEndTime: this.taskEndTime,
            strokes: this.strokes,
            deviceInfo: this.deviceInfo,
            sensorData: {
                accelerometer: this.sensorData.accelerometer.slice(-10),
                gyroscope: this.sensorData.gyroscope.slice(-10)
            },
            metadata: {
                totalStrokes: this.strokes.length,
                totalPoints: this.strokes.reduce((sum, s) => sum + s.points.length, 0),
                sessionDuration: Date.now() - new Date(this.taskStartTime).getTime()
            }
        };
    }

    downloadJSON() {
        const data = this.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-${this.sessionId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.session = new DrawingSession();
        
        // Initialize capture system for duration tracking (skip its own event listeners)
        this.captureSystem = new DrawingCaptureSystem(this.canvas, true);
        
        // Drawing state
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentShape = null;
        this.color = '#000000';
        this.size = 12;
        this.opacity = 1;
        this.pressureSensitive = true;
        
        // History
        this.history = [];
        this.historyIndex = -1;
        
        // Shape drawing
        this.shapeStart = null;
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');
        
        this.init();
    }

    init() {
        // Set responsive canvas size
        this.setResponsiveCanvasSize();
        
        // White background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveHistory();
        
        // Update UI
        document.getElementById('sessionId').textContent = this.session.sessionId;
        
        // Event listeners
        this.attachEventListeners();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setResponsiveCanvasSize() {
        const canvasArea = this.canvas.parentElement;
        const rect = canvasArea.getBoundingClientRect();
        
        // Calculate available space
        let width = 900;
        let height = 600;
        
        // Adjust for different screen sizes
        if (window.innerWidth <= 480) {
            // Mobile phones
            width = Math.min(rect.width - 20, 600);
            height = Math.min(rect.height - 20, 400);
        } else if (window.innerWidth <= 768) {
            // Tablets
            width = Math.min(rect.width - 30, 750);
            height = Math.min(rect.height - 30, 500);
        } else if (window.innerWidth <= 1024) {
            // Small desktops
            width = Math.min(rect.width - 40, 850);
            height = Math.min(rect.height - 40, 580);
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.tempCanvas.width = width;
        this.tempCanvas.height = height;
    }

    handleResize() {
        // Save current canvas content
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        
        // Resize canvas
        this.setResponsiveCanvasSize();
        
        // Restore content (scaled if necessary)
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the old image data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = oldWidth;
        tempCanvas.height = oldHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        
        // Scale to new size
        this.ctx.drawImage(tempCanvas, 0, 0, oldWidth, oldHeight, 0, 0, this.canvas.width, this.canvas.height);
    }

    attachEventListeners() {
        // Canvas events - use pointer events for full support
        this.canvas.addEventListener('pointerdown', (e) => this.handleStart(e));
        this.canvas.addEventListener('pointermove', (e) => this.handleMove(e));
        this.canvas.addEventListener('pointerup', (e) => this.handleEnd(e));
        this.canvas.addEventListener('pointercancel', (e) => this.handleEnd(e));
        this.canvas.addEventListener('pointerleave', (e) => this.handleEnd(e));

        // Tool buttons
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTool = btn.dataset.tool;
                this.currentShape = null;
                document.querySelectorAll('[data-tool], [data-shape]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Shape buttons
        document.querySelectorAll('[data-shape]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTool = 'shape';
                this.currentShape = btn.dataset.shape;
                document.querySelectorAll('[data-tool], [data-shape]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Color buttons
        document.querySelectorAll('[data-color]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.color = btn.dataset.color;
                document.querySelectorAll('[data-color]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Controls
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.size = parseInt(e.target.value);
            document.getElementById('sizeValue').textContent = this.size;
        });

        document.getElementById('opacity').addEventListener('input', (e) => {
            this.opacity = parseInt(e.target.value) / 100;
            document.getElementById('opacityValue').textContent = e.target.value;
        });

        document.getElementById('pressureSensitive').addEventListener('change', (e) => {
            this.pressureSensitive = e.target.checked;
        });

        // Action buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        document.getElementById('saveBtn').addEventListener('click', () => {
            if (this.captureSystem && this.captureSystem.session) {
                this.captureSystem.downloadSession();
            }
        });
        document.getElementById('exportPngBtn').addEventListener('click', () => this.exportPNG());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.captureSystem && this.captureSystem.session) {
                    this.captureSystem.downloadSession();
                }
            }
        });
    }

    getCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    getInputData(e) {
        const pointerType = e.pointerType || 'mouse';
        let inputType = pointerType === 'pen' ? 'stylus' : (pointerType === 'touch' ? 'finger' : 'mouse');
        const pressure = this.pressureSensitive && e.pressure !== undefined ? e.pressure : 0.5;
        const tiltX = e.tiltX || 0;
        const tiltY = e.tiltY || 0;
        const twist = e.twist || 0;
        const width = e.width || 1;
        const height = e.height || 1;
        const distance = e.distance || 0;

        // Update UI - Basic Input
        document.getElementById('inputType').textContent = inputType;
        document.getElementById('pressure').textContent = pressure.toFixed(3);
        document.getElementById('tilt').textContent = `${tiltX}°/${tiltY}°`;
        document.getElementById('twist').textContent = twist > 0 ? `${twist}°` : '-';
        document.getElementById('contactSize').textContent = `${width.toFixed(1)} / ${height.toFixed(1)}`;
        
        // Update In-Air status
        const isInAir = this.captureSystem.isHovering;
        document.getElementById('inAir').textContent = isInAir ? 'Yes (Hovering)' : 'No';
        
        // Update Hover Metrics
        this.updateHoverMetrics();

        return {
            inputType,
            pointerType,
            pressure,
            tiltX,
            tiltY,
            color: this.color,
            size: this.size,
            opacity: this.opacity,
            tool: this.currentTool
        };
    }

    updateHoverMetrics() {
        const captureSystem = this.captureSystem;
        
        // Display total hover path count
        document.getElementById('hoverPathCount').textContent = captureSystem.hoverPaths.length;
        
        // Update last stroke metrics
        if (captureSystem.session && captureSystem.session.strokeData.length > 0) {
            const lastStroke = captureSystem.session.strokeData[captureSystem.session.strokeData.length - 1];
            document.getElementById('strokeDuration').textContent = lastStroke.strokeDuration ? 
                `${(lastStroke.strokeDuration / 1000).toFixed(2)}s` : '-';
            document.getElementById('strokeLength').textContent = lastStroke.trajectoryLength ? 
                `${lastStroke.trajectoryLength} px` : '-';
            document.getElementById('strokeAvgSpeed').textContent = lastStroke.averageVelocity ? 
                `${lastStroke.averageVelocity} px/s` : '-';
            document.getElementById('strokeMaxSpeed').textContent = lastStroke.maxVelocity ? 
                `${lastStroke.maxVelocity} px/s` : '-';
            document.getElementById('strokeAvgPressure').textContent = lastStroke.averagePressure ? 
                `${lastStroke.averagePressure.toFixed(3)}` : '-';
        } else {
            document.getElementById('strokeDuration').textContent = '-';
            document.getElementById('strokeLength').textContent = '-';
            document.getElementById('strokeAvgSpeed').textContent = '-';
            document.getElementById('strokeMaxSpeed').textContent = '-';
            document.getElementById('strokeAvgPressure').textContent = '-';
        }
        
        // If currently hovering, show real-time metrics
        if (captureSystem.isHovering && captureSystem.currentHoverPath) {
            const hoverPath = captureSystem.currentHoverPath;
            const duration = Date.now() - hoverPath.startTimeMs;
            const lastPoint = hoverPath.points[hoverPath.points.length - 1];
            
            document.getElementById('hoverDuration').textContent = `${(duration / 1000).toFixed(2)}s`;
            document.getElementById('hoverVelocity').textContent = lastPoint && lastPoint.velocity ? `${lastPoint.velocity} px/s` : '-';
            document.getElementById('hoverLength').textContent = hoverPath.points.length > 0 ? 
                `${captureSystem.calculateTrajectoryLength(hoverPath.points)} px` : '-';
            document.getElementById('hoverDistance').textContent = lastPoint && lastPoint.distance > 0 ? 
                `${lastPoint.distance.toFixed(2)} mm` : '-';
        } else {
            // Show last completed hover path stats
            const lastHoverPath = captureSystem.hoverPaths[captureSystem.hoverPaths.length - 1];
            if (lastHoverPath) {
                document.getElementById('hoverDuration').textContent = `${(lastHoverPath.duration / 1000).toFixed(2)}s`;
                document.getElementById('hoverVelocity').textContent = lastHoverPath.averageVelocity ? 
                    `${lastHoverPath.averageVelocity} px/s (avg)` : '-';
                document.getElementById('hoverLength').textContent = lastHoverPath.trajectoryLength ? 
                    `${lastHoverPath.trajectoryLength} px` : '-';
                document.getElementById('hoverDistance').textContent = '-';
            } else {
                document.getElementById('hoverDuration').textContent = '-';
                document.getElementById('hoverVelocity').textContent = '-';
                document.getElementById('hoverLength').textContent = '-';
                document.getElementById('hoverDistance').textContent = '-';
            }
        }
        
        // Calculate and show current/last stroke velocity
        if (this.session && this.session.currentStroke && this.session.currentStroke.points.length > 0) {
            const lastPoint = this.session.currentStroke.points[this.session.currentStroke.points.length - 1];
            document.getElementById('velocity').textContent = lastPoint.velocity ? `${lastPoint.velocity} px/s` : '-';
        } else {
            document.getElementById('velocity').textContent = '-';
        }
    }

    handleStart(e) {
        e.preventDefault();
        this.isDrawing = true;
        const coords = this.getCoords(e);
        const inputData = this.getInputData(e);

        // Notify capture system of pointer down
        this.captureSystem.handlePointerDown(e);

        if (this.currentTool === 'shape') {
            this.shapeStart = coords;
            // Save current canvas state
            this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
            this.tempCtx.drawImage(this.canvas, 0, 0);
        } else {
            this.session.startStroke(coords.x, coords.y, inputData);
            this.ctx.beginPath();
            this.ctx.moveTo(coords.x, coords.y);
        }
    }

    handleMove(e) {
        if (!this.isDrawing) return;
        e.preventDefault();

        const coords = this.getCoords(e);
        const inputData = this.getInputData(e);

        // Notify capture system of pointer move
        this.captureSystem.handlePointerMove(e);

        if (this.currentTool === 'shape') {
            this.drawShapePreview(coords);
        } else {
            this.session.addPoint(coords.x, coords.y, inputData);
            this.drawStroke(coords, inputData);
        }
    }

    handleEnd(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        // Notify capture system of pointer up
        this.captureSystem.handlePointerUp(e);

        if (this.currentTool === 'shape' && this.shapeStart) {
            const coords = this.getCoords(e);
            this.drawShapeFinal(coords);
            this.shapeStart = null;
        } else {
            this.session.endStroke();
        }

        this.saveHistory();
    }

    drawStroke(coords, inputData) {
        const actualSize = this.pressureSensitive ? this.size * inputData.pressure : this.size;

        if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
        }

        this.ctx.globalAlpha = this.opacity;
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = actualSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineTo(coords.x, coords.y);
        this.ctx.stroke();

        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
    }

    drawShapePreview(coords) {
        // Restore temp canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.tempCanvas, 0, 0);

        // Draw preview with dashed line
        this.ctx.globalAlpha = 0.7;
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.size;
        this.ctx.setLineDash([5, 5]);
        this.drawShape(this.shapeStart, coords);
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1;
    }

    drawShapeFinal(coords) {
        // Restore temp canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.tempCanvas, 0, 0);

        // Draw final shape
        this.ctx.globalAlpha = this.opacity;
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.size;
        this.drawShape(this.shapeStart, coords);
        this.ctx.globalAlpha = 1;
    }

    drawShape(start, end) {
        this.ctx.beginPath();

        if (this.currentShape === 'line') {
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
        } else if (this.currentShape === 'rectangle') {
            this.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (this.currentShape === 'circle') {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            this.ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        } else if (this.currentShape === 'triangle') {
            this.ctx.moveTo(start.x, end.y);
            this.ctx.lineTo((start.x + end.x) / 2, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.closePath();
        }

        this.ctx.stroke();
    }

    saveHistory() {
        this.historyIndex++;
        this.history = this.history.slice(0, this.historyIndex);
        this.history.push(this.canvas.toDataURL());
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = this.history[this.historyIndex];
        }
    }

    clear() {
        if (confirm('Clear the entire canvas?')) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.saveHistory();
        }
    }

    exportPNG() {
        const link = document.createElement('a');
        link.download = `drawing-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// Global reference to app instance
let appInstance = null;
let metricsUpdateInterval = null;

// Update metrics display from capture system
function updateMetricsDisplay() {
    if (!appInstance || !appInstance.captureSystem) return;
    
    const metrics = appInstance.captureSystem.getCurrentMetrics();
    if (metrics) {
        document.getElementById('strokeCount').textContent = metrics.strokes;
        document.getElementById('totalDuration').textContent = metrics.totalDurationSeconds + 's';
        document.getElementById('activeDuration').textContent = metrics.activeDurationSeconds + 's';
        document.getElementById('pauseDuration').textContent = metrics.pauseDurationSeconds + 's';
        document.getElementById('status').textContent = metrics.status.toUpperCase();
    }
    
    // Update hover metrics
    if (appInstance.updateHoverMetrics) {
        appInstance.updateHoverMetrics();
    }
}

// Start periodic metrics display update
function startMetricsUpdate() {
    metricsUpdateInterval = setInterval(updateMetricsDisplay, 100);
}

// Stop metrics update
function stopMetricsUpdate() {
    if (metricsUpdateInterval) {
        clearInterval(metricsUpdateInterval);
    }
}

// Handle complete button click
function handleCompleteSession() {
    if (!appInstance || !appInstance.captureSystem || !appInstance.captureSystem.session) return;
    
    const finalData = appInstance.captureSystem.completeSession();
    stopMetricsUpdate();
    
    const alert_msg = `Session Completed!\n\n` +
        `Total Duration: ${(finalData.totalDuration / 1000).toFixed(2)}s\n` +
        `Active Duration: ${(finalData.activeDuration / 1000).toFixed(2)}s\n` +
        `Pause Duration: ${(finalData.pauseDuration / 1000).toFixed(2)}s\n` +
        `Strokes: ${finalData.strokes}`;
    
    alert(alert_msg);
    
    // Enable save button to export the completed session
    console.log('Session completed. Ready for export.');
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    try {
        appInstance = new DrawingApp();
        
        // Start capture system session
        appInstance.captureSystem.startSession('drawing_modal');
        
        // Initialize UI values
        updateMetricsDisplay();
        
        // Start metrics update
        startMetricsUpdate();
        
        // Add complete button handler
        const completeBtn = document.getElementById('completeBtn');
        if (completeBtn) {
            completeBtn.addEventListener('click', handleCompleteSession);
        }
        
        console.log('Canvas app initialized successfully');
    } catch (error) {
        console.error('Failed to initialize canvas app:', error);
    }
});
