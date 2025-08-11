 class CollaborativeCanvas {
            constructor() {
                this.canvas = document.getElementById('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.isDrawing = false;
                this.currentTool = 'pencil';
                this.currentColor = '#000000';
                this.currentThickness = 3;
                this.startX = 0;
                this.startY = 0;
                this.textMode = false;
                this.textPosition = { x: 0, y: 0 };
                this.remoteLastPoint = {};
                
                // Socket connection (simulate for demo)
                this.socket = null;
                this.connectedUsers = 1;
                
                this.initializeSocket();
                this.setupEventListeners();
                this.setupCanvas();
            }
            
            initializeSocket() {
                // In a real implementation, this would connect to your Socket.io server
                // For demo purposes, we'll simulate the connection
                try {
                    this.socket = io('http://localhost:8080');
                    console.log("socket is running")
                    
                    this.socket.on('draw', (data)=>{
                        this.handleRemoteDraw(data);
                    })
                    this.simulateSocketConnection();
                } catch (error) {
                    console.log('Socket.io server not available, running in offline mode');
                    this.simulateSocketConnection();
                }
            }
            
handleRemoteDraw(data) {
    if (!data) return;
    const key = data.userId || 'default';
    switch (data.tool) {
        case 'pencil':
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = data.color;
            this.ctx.lineWidth = data.thickness;
            this.ctx.beginPath();
            if (this.remoteLastPoint[key]) {
                this.ctx.moveTo(this.remoteLastPoint[key].x, this.remoteLastPoint[key].y);
            } else {
                this.ctx.moveTo(data.x, data.y);
            }
            this.ctx.lineTo(data.x, data.y);
            this.ctx.stroke();
            this.remoteLastPoint[key] = { x: data.x, y: data.y };
            if (data.drawing === false) {
                delete this.remoteLastPoint[key];
            }
            break;
        case 'eraser':
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineWidth = data.thickness;
            this.ctx.beginPath();
            if (this.remoteLastPoint[key]) {
                this.ctx.moveTo(this.remoteLastPoint[key].x, this.remoteLastPoint[key].y);
            } else {
                this.ctx.moveTo(data.x, data.y);
            }
            this.ctx.lineTo(data.x, data.y);
            this.ctx.stroke();
            this.remoteLastPoint[key] = { x: data.x, y: data.y };
            if (data.drawing === false) {
                delete this.remoteLastPoint[key];
            }
            break;
        // ...rest of your cases (rectangle, circle, etc.) remain unchanged...
        case 'rectangle':
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = data.color;
            this.ctx.lineWidth = data.thickness;
            this.ctx.beginPath();
            this.ctx.rect(data.startX, data.startY, data.endX - data.startX, data.endY - data.startY);
            this.ctx.stroke();
            break;
        case 'circle':
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = data.color;
            this.ctx.lineWidth = data.thickness;
            this.ctx.beginPath();
            const radius = Math.sqrt(Math.pow(data.endX - data.startX, 2) + Math.pow(data.endY - data.startY, 2));
            this.ctx.arc(data.startX, data.startY, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
            break;
        case 'square':
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = data.color;
            this.ctx.lineWidth = data.thickness;
            this.ctx.beginPath();
            const size = Math.max(Math.abs(data.endX - data.startX), Math.abs(data.endY - data.startY));
            this.ctx.rect(data.startX, data.startY, size, size);
            this.ctx.stroke();
            break;
        case 'text':
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = data.color;
            this.ctx.font = `${data.fontSize}px Arial`;
            this.ctx.fillText(data.text, data.x, data.y);
            break;
        case 'clear':
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            break;
    }
}

            simulateSocketConnection() {
                // Simulate socket connection for demo
                console.log('Connected to collaborative canvas (simulated)');
                document.getElementById('user-count').textContent = this.connectedUsers;
            }
            
            setupEventListeners() {
                // Tool selection
                document.querySelectorAll('.tool-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.selectTool(e.target.closest('button').id));
                });
                
                // Thickness control
                const thicknessSlider = document.getElementById('thickness');
                thicknessSlider.addEventListener('input', (e) => {
                    this.currentThickness = parseInt(e.target.value);
                    document.getElementById('thickness-value').textContent = `${this.currentThickness}px`;
                });
                
                // Color control
                document.getElementById('color').addEventListener('change', (e) => {
                    this.currentColor = e.target.value;
                });
                
                // Clear canvas
                document.getElementById('clear').addEventListener('click', () => this.clearCanvas());
                
                // Canvas events
                this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
                this.canvas.addEventListener('mousemove', (e) => this.draw(e));
                this.canvas.addEventListener('mouseup', () => this.stopDrawing());
                this.canvas.addEventListener('mouseout', () => this.stopDrawing());
                this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
                
                // Text modal events
                document.getElementById('text-ok').addEventListener('click', () => this.insertText());
                document.getElementById('text-cancel').addEventListener('click', () => this.closeTextModal());
                document.getElementById('text-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.insertText();
                });
                
                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => this.handleKeyboard(e));
            }
            
            setupCanvas() {
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.selectTool('pencil');
            }
            
            selectTool(toolName) {
                // Remove active class from all tools
                document.querySelectorAll('.tool-btn').forEach(btn => {
                    btn.classList.remove('ring-4', 'ring-opacity-50');
                });
                
                // Add active class to selected tool
                const selectedBtn = document.getElementById(toolName);
                selectedBtn.classList.add('ring-4', 'ring-opacity-50');
                
                this.currentTool = toolName;
                document.getElementById('active-tool').textContent = toolName.charAt(0).toUpperCase() + toolName.slice(1);
                
                // Update cursor
                this.updateCursor();
            }
            
            updateCursor() {
                const cursors = {
                    pencil: 'crosshair',
                    eraser: 'grab',
                    text: 'text',
                    rectangle: 'crosshair',
                    circle: 'crosshair',
                    square: 'crosshair'
                };
                this.canvas.style.cursor = cursors[this.currentTool];
            }
            
            getMousePos(e) {
                const rect = this.canvas.getBoundingClientRect();
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            }
            
            startDrawing(e) {
                if (this.currentTool === 'text') return;
                
                this.isDrawing = true;
                const pos = this.getMousePos(e);
                this.startX = pos.x;
                this.startY = pos.y;
                
                if (this.currentTool === 'pencil' || this.currentTool === 'eraser') {
                    this.ctx.beginPath();
                    this.ctx.moveTo(pos.x, pos.y);
                }
            }
            
            draw(e) {
                if (!this.isDrawing) return;
                
                const pos = this.getMousePos(e);
                
                if (this.currentTool === 'pencil') {
                    this.ctx.globalCompositeOperation = 'source-over';
                    this.ctx.strokeStyle = this.currentColor;
                    this.ctx.lineWidth = this.currentThickness;
                    this.ctx.lineTo(pos.x, pos.y);
                    this.ctx.stroke();
                    
                    this.emitDrawData({
                        tool: 'pencil',
                        x: pos.x,
                        y: pos.y,
                        color: this.currentColor,
                        thickness: this.currentThickness,
                        drawing: true
                    });
                } else if (this.currentTool === 'eraser') {
                    this.ctx.globalCompositeOperation = 'destination-out';
                    this.ctx.lineWidth = this.currentThickness * 2;
                    this.ctx.lineTo(pos.x, pos.y);
                    this.ctx.stroke();
                    
                    this.emitDrawData({
                        tool: 'eraser',
                        x: pos.x,
                        y: pos.y,
                        thickness: this.currentThickness * 2,
                        drawing: true
                    });
                }
            }
            
            stopDrawing() {
                if (!this.isDrawing) return;
                this.isDrawing = false;
                
                if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'square') {
                    this.drawShape();
                }
            }
            
            drawShape() {
                const endX = event.offsetX || this.getMousePos(event).x;
                const endY = event.offsetY || this.getMousePos(event).y;
                
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.strokeStyle = this.currentColor;
                this.ctx.lineWidth = this.currentThickness;
                this.ctx.beginPath();
                
                if (this.currentTool === 'rectangle') {
                    const width = endX - this.startX;
                    const height = endY - this.startY;
                    this.ctx.rect(this.startX, this.startY, width, height);
                } else if (this.currentTool === 'circle') {
                    const radius = Math.sqrt(Math.pow(endX - this.startX, 2) + Math.pow(endY - this.startY, 2));
                    this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                } else if (this.currentTool === 'square') {
                    const size = Math.max(Math.abs(endX - this.startX), Math.abs(endY - this.startY));
                    this.ctx.rect(this.startX, this.startY, size, size);
                }
                
                this.ctx.stroke();
                
                this.emitDrawData({
                    tool: this.currentTool,
                    startX: this.startX,
                    startY: this.startY,
                    endX: endX,
                    endY: endY,
                    color: this.currentColor,
                    thickness: this.currentThickness
                });
            }
            
            handleCanvasClick(e) {
                if (this.currentTool === 'text') {
                    const pos = this.getMousePos(e);
                    this.textPosition = pos;
                    this.showTextModal();
                }
            }
            
            showTextModal() {
                document.getElementById('text-modal').classList.remove('hidden');
                document.getElementById('text-modal').classList.add('flex');
                document.getElementById('text-input').focus();
            }
            
            closeTextModal() {
                document.getElementById('text-modal').classList.add('hidden');
                document.getElementById('text-modal').classList.remove('flex');
                document.getElementById('text-input').value = '';
            }
            
            insertText() {
                const text = document.getElementById('text-input').value;
                if (text.trim()) {
                    this.ctx.globalCompositeOperation = 'source-over';
                    this.ctx.fillStyle = this.currentColor;
                    this.ctx.font = `${this.currentThickness * 6}px Arial`;
                    this.ctx.fillText(text, this.textPosition.x, this.textPosition.y);
                    
                    this.emitDrawData({
                        tool: 'text',
                        text: text,
                        x: this.textPosition.x,
                        y: this.textPosition.y,
                        color: this.currentColor,
                        fontSize: this.currentThickness * 6
                    });
                }
                this.closeTextModal();
            }
            
            clearCanvas() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.emitDrawData({ tool: 'clear' });
            }
            
            emitDrawData(data) {
                // In a real implementation, this would emit to Socket.io server
                if (this.socket) {
                    this.socket.emit('draw', data);
                }
                console.log('Drawing data:', data);
            }
            
            handleKeyboard(e) {
                // Keyboard shortcuts
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key) {
                        case 'z':
                            e.preventDefault();
                            // Implement undo functionality
                            break;
                        case 'c':
                            e.preventDefault();
                            this.clearCanvas();
                            break;
                    }
                }
                
                // Tool shortcuts
                switch (e.key) {
                    case 'p':
                        this.selectTool('pencil');
                        break;
                    case 'e':
                        this.selectTool('eraser');
                        break;
                    case 't':
                        this.selectTool('text');
                        break;
                    case 'r':
                        this.selectTool('rectangle');
                        break;
                    case 'c':
                        this.selectTool('circle');
                        break;
                    case 's':
                        this.selectTool('square');
                        break;
                }
            }
        }
        
        // Initialize the collaborative canvas when the page loads
        window.addEventListener('load', () => {
            new CollaborativeCanvas();
        });