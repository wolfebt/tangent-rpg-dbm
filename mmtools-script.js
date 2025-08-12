// Version 7.8 - Implemented Text & GM Notes Tool
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    const wallCanvas = document.getElementById('wallCanvas');
    const wallCtx = wallCanvas.getContext('2d');
    const fogCanvas = document.getElementById('fogCanvas');
    const fogCtx = fogCanvas.getContext('2d');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const drawingCtx = drawingCanvas.getContext('2d');
    const projectNameInput = document.getElementById('projectNameInput');
    const brushSizeSlider = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const terrainSelector = document.getElementById('terrainSelector');
    const objectSelector = document.getElementById('objectSelector');
    const resetViewBtn = document.getElementById('resetViewBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const gridColorPicker = document.getElementById('gridColorPicker');
    const gridVisibleCheckbox = document.getElementById('gridVisibleCheckbox');
    const layerList = document.getElementById('layerList');
    const addLayerBtn = document.getElementById('addLayerBtn');
    const deleteLayerBtn = document.getElementById('deleteLayerBtn');
    const textToolPanel = document.getElementById('textToolPanel');
    const textHeader = document.getElementById('textHeader');
    const textInput = document.getElementById('textInput');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const fontColorInput = document.getElementById('fontColorInput');
    const fileMenuBtn = document.getElementById('fileMenuBtn');
    const fileDropdownMenu = document.getElementById('fileDropdownMenu');
    const savePngBtn = document.getElementById('savePngBtn');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const loadProjectBtn = document.getElementById('loadProjectBtn');
    const loadJsonInput = document.getElementById('loadJsonInput');
    const toolTerrainBtn = document.getElementById('toolTerrainBtn');
    const toolPencilBtn = document.getElementById('toolPencilBtn');
    const toolSelectBtn = document.getElementById('toolSelectBtn');
    const toolWallBtn = document.getElementById('toolWallBtn');
    const toolTokenBtn = document.getElementById('toolTokenBtn');
    const toolTextBtn = document.getElementById('toolTextBtn'); // *** NEW ***
    const toolInteractBtn = document.getElementById('toolInteractBtn');
    const terrainOptionsPanel = document.getElementById('terrainOptionsPanel');
    const pencilOptionsPanel = document.getElementById('pencilOptionsPanel');
    const tokenOptionsPanel = document.getElementById('tokenOptionsPanel');
    const terrainBrushModeSelect = document.getElementById('terrainBrushMode');
    const pencilBrushModeSelect = document.getElementById('pencilBrushMode');
    const pencilColorPicker = document.getElementById('pencilColorPicker');
    const pencilWidthSlider = document.getElementById('pencilWidth');
    const pencilWidthValue = document.getElementById('pencilWidthValue');
    const pencilGmOnlyCheckbox = document.getElementById('pencilGmOnlyCheckbox');
    const tokenLightRadiusSlider = document.getElementById('tokenLightRadius');
    const tokenLightRadiusValue = document.getElementById('tokenLightRadiusValue');
    const tokenColorPicker = document.getElementById('tokenColor');
    const deleteTokenBtn = document.getElementById('deleteTokenBtn');
    const graphicsBtn = document.getElementById('graphicsBtn');
    const graphicsContent = document.getElementById('graphicsContent');
    const panelWrapper = document.getElementById('panelWrapper');
    const collapseBtn = document.getElementById('collapseBtn');
    const collapsedBar = document.getElementById('collapsedBar');
    const userGuideBtn = document.getElementById('userGuideBtn');
    const accordionHeaders = document.querySelectorAll('.collapsible-header');
    const settingsBtn = document.getElementById('settingsBtn');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const cancelApiKeyBtn = document.getElementById('cancelApiKey');
    const resizer = document.getElementById('resizer');
    const gmViewToggleBtn = document.getElementById('gmViewToggleBtn');
    const gmViewIconOn = document.getElementById('gmViewIconOn');
    const gmViewIconOff = document.getElementById('gmViewIconOff');
    const objectGmOnlyCheckbox = document.getElementById('objectGmOnlyCheckbox');
    const textGmOnlyCheckbox = document.getElementById('textGmOnlyCheckbox');
    const toolFogRevealBtn = document.getElementById('toolFogRevealBtn');
    const toolFogHideBtn = document.getElementById('toolFogHideBtn');
    const fogBrushSizeSlider = document.getElementById('fogBrushSize');
    const fogBrushSizeValue = document.getElementById('fogBrushSizeValue');
    const resetFogBtn = document.getElementById('resetFogBtn');
    const mapKeyBtn = document.getElementById('mapKeyBtn');
    const mapKeyWindow = document.getElementById('mapKeyWindow');
    const mapKeyHeader = document.getElementById('mapKeyHeader');
    const mapKeyContent = document.getElementById('mapKeyContent');
    const mapKeyCloseBtn = document.getElementById('mapKeyCloseBtn');
    const assetEditorBtn = document.getElementById('assetEditorBtn');
    const assetEditorOverlay = document.getElementById('asset-editor-overlay');
    const atlasPanel = document.getElementById('atlas-panel');
    const addNewMapBtn = document.getElementById('addNewMapBtn');
    const newMapModal = document.getElementById('newMapModal');
    const newMapNameInput = document.getElementById('newMapNameInput');
    const newMapScaleSelect = document.getElementById('newMapScaleSelect');
    const newMapWidthInput = document.getElementById('newMapWidthInput');
    const newMapHeightInput = document.getElementById('newMapHeightInput');
    const confirmNewMapBtn = document.getElementById('confirmNewMapBtn');
    const cancelNewMapBtn = document.getElementById('cancelNewMapBtn');
    const breadcrumbNav = document.getElementById('breadcrumb-nav');
    const selectedObjectPanel = document.getElementById('selectedObjectPanel');
    const selectionPanelHeader = document.getElementById('selection-panel-header');
    const selectionPanelContent = document.getElementById('selection-panel-content');
    const newMapAsChildCheckbox = document.getElementById('newMapAsChildCheckbox');
    const atlasContextMenu = document.getElementById('atlas-context-menu');
    const renameMapBtn = document.getElementById('renameMapBtn');
    const deleteMapBtn = document.getElementById('deleteMapBtn');
    const eraserToolBtn = document.getElementById('eraserToolBtn');
    const eraserDropdownMenu = document.getElementById('eraserDropdownMenu');
    const eraseTerrainBtn = document.getElementById('eraseTerrainBtn');
    const eraseObjectsBtn = document.getElementById('eraseObjectsBtn');
    const eraseDrawingsBtn = document.getElementById('eraseDrawingsBtn');
    const assetContextMenu = document.getElementById('asset-context-menu');
    const assetRotateLeftBtn = document.getElementById('asset-rotate-left-btn');
    const assetRotateRightBtn = document.getElementById('asset-rotate-right-btn');
    const assetScaleUpBtn = document.getElementById('asset-scale-up-btn');
    const assetScaleDownBtn = document.getElementById('asset-scale-down-btn');
    const aiBottomPanel = document.getElementById('aiBottomPanel');

    // --- Local State ---
    let view = { zoom: 1, offsetX: 0, offsetY: 0 };
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let isDrawingShape = false;
    let shapeStartPoint = null;
    let isPainting = false;
    let isPenciling = false;
    let currentPencilPath = null;
    let selection = null;
    let isDragging = false;
    let dragOffsetX, dragOffsetY;
    let isDraggingKey = false;
    let keyDragOffset = { x: 0, y: 0 };
    let assetCache = {};
    let isGmViewActive = true;
    let isSelecting = false;
    let selectionStartPoint = null;
    let selectionEndPoint = null;
    let isDrawingWall = false;
    let wallStartPoint = null;
    let isFogging = false;
    let fogBrushSize = 5;
    let isDraggingToken = false;
    let isDrawingPolygon = false;
    let currentPolygonPoints = [];
    let isDraggingWallEndpoint = false;
    let autoSaveInterval = null;
    let contextMapId = null;
    let draggedLayerId = null;
    let currentEraserMode = 'terrain';
    let currentTool = 'terrain';
    let selectedTerrain = 'grass';
    let selectedObject = null;
    let activeLayerId = null;
    let undoStack = [];
    let redoStack = [];

    // --- Core Drawing & Rendering ---

    function resizeCanvas() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        drawingCanvas.width = width;
        drawingCanvas.height = height;
        wallCanvas.width = width;
        wallCanvas.height = height;
        fogCanvas.width = width;
        fogCanvas.height = height;
        drawAll();
    }

    function drawAll() {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        wallCtx.clearRect(0, 0, wallCanvas.width, wallCanvas.height);
        fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);

        ctx.save();
        ctx.translate(view.offsetX, view.offsetY);
        ctx.scale(view.zoom, view.zoom);

        [...activeMap.layers].reverse().forEach(layer => {
            if (!layer.visible) return;
            drawLayerBackground(layer, ctx);
            drawLayerTerrain(layer, ctx);
            drawPlacedObjects(layer, ctx);
        });
        
        // *** MODIFIED: Text is drawn on top of all layers but below tokens ***
        drawTextLabels(ctx);
        drawTokens(ctx);
        
        ctx.restore();

        drawingCtx.save();
        drawingCtx.translate(view.offsetX, view.offsetY);
        drawingCtx.scale(view.zoom, view.zoom);
        
        if (gridVisibleCheckbox.checked) {
            drawGrid(drawingCtx);
        }
        drawPencilStrokes(drawingCtx);
        drawSelectionHighlight(drawingCtx);
        
        drawingCtx.restore();

        drawWalls();
        updateFogOfWar();
    }

    function drawLayerBackground(layer, targetCtx) {
        if (layer.backgroundImage && layer.backgroundImage.src) {
            const img = assetCache[layer.backgroundImage.src];
            const { minPxX, minPxY, mapPixelWidth, mapPixelHeight } = getMapPixelBounds();
            if (img && img.complete) {
                targetCtx.drawImage(img, minPxX, minPxY, mapPixelWidth, mapPixelHeight);
            } else if (!img) {
                const newImg = new Image();
                newImg.onload = () => {
                    assetCache[layer.backgroundImage.src] = newImg;
                    drawAll();
                };
                newImg.src = layer.backgroundImage.src;
            }
        }
    }

    function drawLayerTerrain(layer, targetCtx) {
        const hexSize = 30;
        for (const key in layer.data) {
            const cellData = layer.data[key];
            if (cellData && cellData.terrain) {
                const terrain = state.terrains[cellData.terrain];
                if (terrain) {
                    const [q, r] = key.split(',').map(Number);
                    const { x, y } = hexToPixel(q, r, hexSize);
                    drawHex(targetCtx, x, y, hexSize, terrain);
                }
            }
        }
    }

    function drawPlacedObjects(layer, targetCtx) {
        if (!layer.objects) return;

        layer.objects.forEach(obj => {
            if (isGmViewActive || !obj.isGmOnly) {
                const assetImg = assetCache[obj.assetId];
                if (assetImg) {
                    const drawX = obj.x - (assetImg.width / 2) * obj.scale;
                    const drawY = obj.y - (assetImg.height / 2) * obj.scale;
                    const drawWidth = assetImg.width * obj.scale;
                    const drawHeight = assetImg.height * obj.scale;
                    
                    targetCtx.save();
                    targetCtx.translate(obj.x, obj.y);
                    targetCtx.rotate(obj.rotation * Math.PI / 180);
                    targetCtx.translate(-obj.x, -obj.y);
                    targetCtx.drawImage(assetImg, drawX, drawY, drawWidth, drawHeight);
                    targetCtx.restore();
                }
            }
        });
    }

    // *** NEW: Implemented text rendering function ***
    function drawTextLabels(targetCtx) {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.labels) return;

        activeMap.labels.forEach(label => {
            if (isGmViewActive || !label.isGmOnly) {
                targetCtx.font = `${label.size}px 'Trebuchet MS'`;
                targetCtx.fillStyle = label.color;
                targetCtx.textAlign = 'center';
                targetCtx.textBaseline = 'middle';
                // Add a simple stroke for better readability
                targetCtx.strokeStyle = 'black';
                targetCtx.lineWidth = 2;
                targetCtx.strokeText(label.text, label.x, label.y);
                targetCtx.fillText(label.text, label.x, label.y);
            }
        });
    }

    function drawPencilStrokes(targetCtx) {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.drawings) return;

        activeMap.drawings.forEach(drawing => {
            if (isGmViewActive || !drawing.isGmOnly) {
                targetCtx.strokeStyle = drawing.color;
                targetCtx.lineWidth = drawing.width; 
                targetCtx.lineCap = 'round';
                targetCtx.lineJoin = 'round';
                targetCtx.beginPath();

                if (drawing.type === 'freestyle' && drawing.points.length > 0) {
                    targetCtx.moveTo(drawing.points[0].x, drawing.points[0].y);
                    for (let i = 1; i < drawing.points.length; i++) {
                        targetCtx.lineTo(drawing.points[i].x, drawing.points[i].y);
                    }
                } else if (drawing.type === 'line') {
                    targetCtx.moveTo(drawing.start.x, drawing.start.y);
                    targetCtx.lineTo(drawing.end.x, drawing.end.y);
                } else if (drawing.type === 'rectangle') {
                    targetCtx.rect(drawing.x, drawing.y, drawing.width, drawing.height);
                } else if (drawing.type === 'ellipse') {
                    targetCtx.ellipse(drawing.x, drawing.y, drawing.radiusX, drawing.radiusY, 0, 0, 2 * Math.PI);
                }
                targetCtx.stroke();
            }
        });
    }

    function drawTokens(targetCtx) {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.tokens) return;
        const hexSize = 30;

        activeMap.tokens.forEach(token => {
            if (token.lightRadius > 0) {
                targetCtx.fillStyle = 'rgba(255, 255, 150, 0.2)';
                targetCtx.beginPath();
                targetCtx.arc(token.x, token.y, token.lightRadius * hexSize * 1.5, 0, 2 * Math.PI);
                targetCtx.fill();
            }

            targetCtx.fillStyle = token.color;
            targetCtx.beginPath();
            targetCtx.arc(token.x, token.y, hexSize / 2, 0, 2 * Math.PI);
            targetCtx.fill();
            targetCtx.strokeStyle = 'black';
            targetCtx.lineWidth = 2;
            targetCtx.stroke();
        });
    }

    function drawSelectionHighlight(targetCtx) {
        if (!selection) return;

        const activeMap = state.getActiveMap();
        
        if (selection.type === 'object') {
            const layer = activeMap.layers.find(l => l.id === selection.layerId);
            if (!layer || !layer.objects[selection.index]) return;
            const obj = layer.objects[selection.index];
            const assetImg = assetCache[obj.assetId];
            if (!assetImg) return;

            const width = assetImg.width * obj.scale;
            const height = assetImg.height * obj.scale;

            targetCtx.save();
            targetCtx.translate(obj.x, obj.y);
            targetCtx.rotate(obj.rotation * Math.PI / 180);
            targetCtx.strokeStyle = '#3b82f6';
            targetCtx.lineWidth = 4 / view.zoom;
            targetCtx.setLineDash([10 / view.zoom, 5 / view.zoom]);
            targetCtx.strokeRect(-width / 2, -height / 2, width, height);
            targetCtx.restore();
        } else if (selection.type === 'token') {
            const token = activeMap.tokens[selection.index];
            if (!token) return;
            const hexSize = 30;
            targetCtx.strokeStyle = '#3b82f6';
            targetCtx.lineWidth = 4 / view.zoom;
            targetCtx.setLineDash([10 / view.zoom, 5 / view.zoom]);
            targetCtx.beginPath();
            targetCtx.arc(token.x, token.y, hexSize / 2 + 5, 0, 2 * Math.PI);
            targetCtx.stroke();
        } else if (selection.type === 'wall') {
            const wall = activeMap.walls[selection.index];
            if (!wall) return;
            targetCtx.strokeStyle = '#3b82f6';
            targetCtx.lineWidth = 4 / view.zoom;
            targetCtx.setLineDash([10 / view.zoom, 5 / view.zoom]);
            targetCtx.beginPath();
            targetCtx.moveTo(wall.start.x, wall.start.y);
            targetCtx.lineTo(wall.end.x, wall.end.y);
            targetCtx.stroke();
            
            targetCtx.fillStyle = '#3b82f6';
            targetCtx.setLineDash([]);
            targetCtx.beginPath();
            targetCtx.arc(wall.start.x, wall.start.y, 8 / view.zoom, 0, 2 * Math.PI);
            targetCtx.fill();
            targetCtx.beginPath();
            targetCtx.arc(wall.end.x, wall.end.y, 8 / view.zoom, 0, 2 * Math.PI);
            targetCtx.fill();
        }
    }

    function drawGrid(targetCtx) {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.grid) return;
        
        targetCtx.strokeStyle = gridColorPicker.value;
        targetCtx.lineWidth = 1; 

        const hexSize = 30;
        for (const key in activeMap.grid) {
            const coords = key.split(',').map(Number);
            const { x, y } = hexToPixel(coords[0], coords[1], hexSize);
            drawHexOutline(targetCtx, x, y, hexSize);
        }
    }

    function drawWalls() {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.walls) return;

        wallCtx.clearRect(0, 0, wallCanvas.width, wallCanvas.height);
        wallCtx.save();
        wallCtx.translate(view.offsetX, view.offsetY);
        wallCtx.scale(view.zoom, view.zoom);
        wallCtx.strokeStyle = '#000000';
        wallCtx.lineWidth = 5;
        wallCtx.lineCap = 'round';

        activeMap.walls.forEach(wall => {
            if (isGmViewActive || !wall.isGmOnly) {
                wallCtx.beginPath();
                wallCtx.moveTo(wall.start.x, wall.start.y);
                wallCtx.lineTo(wall.end.x, wall.end.y);
                wallCtx.stroke();
            }
        });

        wallCtx.restore();
    }

    function updateFogOfWar() {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.fog) return;

        fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
        fogCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);

        fogCtx.save();
        fogCtx.translate(view.offsetX, view.offsetY);
        fogCtx.scale(view.zoom, view.zoom);
        
        fogCtx.globalCompositeOperation = 'destination-out';

        activeMap.fog.revealedRects.forEach(rect => {
            fogCtx.fillRect(rect.x, rect.y, rect.width, rect.height);
        });

        fogCtx.restore();
    }

    function drawHex(targetCtx, x, y, size, terrain) {
        targetCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i + 30;
            const angle_rad = Math.PI / 180 * angle_deg;
            targetCtx.lineTo(x + size * Math.cos(angle_rad), y + size * Math.sin(angle_rad));
        }
        targetCtx.closePath();
        
        if (terrain && terrain.canvasPattern) {
            targetCtx.fillStyle = terrain.canvasPattern;
        } else if (terrain && terrain.color) {
            targetCtx.fillStyle = terrain.color;
        } else {
            targetCtx.fillStyle = '#888';
        }
        targetCtx.fill();
    }

    function drawHexOutline(targetCtx, x, y, size) {
        targetCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i + 30;
            const angle_rad = Math.PI / 180 * angle_deg;
            targetCtx.lineTo(x + size * Math.cos(angle_rad), y + size * Math.sin(angle_rad));
        }
        targetCtx.closePath();
        targetCtx.stroke();
    }

    function pixelToGridCoords(mouseX, mouseY) {
        const worldX = (mouseX - view.offsetX) / view.zoom;
        const worldY = (mouseY - view.offsetY) / view.zoom;
        
        const hexSize = 30;
        const q_frac = (Math.sqrt(3) / 3 * worldX - 1 / 3 * worldY) / hexSize;
        const r_frac = (2 / 3 * worldY) / hexSize;
        
        const s_frac = -q_frac - r_frac;
        let q = Math.round(q_frac);
        let r = Math.round(r_frac);
        let s = Math.round(s_frac);
        const q_diff = Math.abs(q - q_frac);
        const r_diff = Math.abs(r - r_frac);
        const s_diff = Math.abs(s - s_frac);

        if (q_diff > r_diff && q_diff > s_diff) {
            q = -r - s;
        } else if (r_diff > s_diff) {
            r = -q - s;
        }
        
        return { q, r };
    }

    function hexToPixel(q, r, size) {
        const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        const y = size * (3 / 2 * r);
        return { x, y };
    }

    function getMapPixelBounds() {
        return { minPxX: -1000, minPxY: -1000, mapPixelWidth: 2000, mapPixelHeight: 2000 };
    }

    function getPatternDataUri(patternId) {
        const pattern = document.getElementById(patternId);
        if (!pattern) return '';
        const width = pattern.getAttribute('width');
        const height = pattern.getAttribute('height');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.appendChild(pattern.cloneNode(true));
        svg.appendChild(defs);
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', `url(#${patternId})`);
        svg.appendChild(rect);
        const xml = new XMLSerializer().serializeToString(svg);
        return `data:image/svg+xml;base64,${btoa(xml)}`;
    }

    async function initializePatterns(targetCtx) {
        const promises = Object.values(state.terrains).map(terrain => {
            return new Promise((resolve) => {
                const patternEl = document.getElementById(terrain.pattern);
                if (!patternEl) return resolve();
                const img = new Image();
                img.onload = () => {
                    try {
                        terrain.canvasPattern = targetCtx.createPattern(img, 'repeat');
                    } catch (e) { console.error(`Error creating pattern for ${terrain.name}:`, e); }
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = getPatternDataUri(terrain.pattern);
            });
        });
        await Promise.all(promises);
    }

    async function loadAssets() {
        const promises = Object.keys(state.assetManifest).map(key => {
            return new Promise((resolve) => {
                const asset = state.assetManifest[key];
                if (asset.src && !assetCache[key]) {
                    const img = new Image();
                    img.onload = () => { assetCache[key] = img; resolve(); };
                    img.onerror = () => resolve();
                    img.src = asset.src;
                } else {
                    resolve();
                }
            });
        });
        await Promise.all(promises);
    }
    
    function saveState() {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;
        const serializableMap = JSON.parse(JSON.stringify(activeMap));
        undoStack.push(serializableMap);
        redoStack = [];
        updateUndoRedoButtons();
    }

    function undo() {
        if (undoStack.length === 0) return;
        const activeMap = state.getActiveMap();
        if(activeMap) redoStack.push(JSON.parse(JSON.stringify(activeMap)));
        
        const prevState = undoStack.pop();
        state.project.maps[state.activeMapId] = prevState;
        
        drawAll();
        updateUndoRedoButtons();
    }

    function redo() {
        if (redoStack.length === 0) return;
        const activeMap = state.getActiveMap();
        if(activeMap) undoStack.push(JSON.parse(JSON.stringify(activeMap)));

        const nextState = redoStack.pop();
        state.project.maps[state.activeMapId] = nextState;

        drawAll();
        updateUndoRedoButtons();
    }
    
    function updateUndoRedoButtons() {
        undoBtn.disabled = undoStack.length === 0;
        redoBtn.disabled = redoStack.length === 0;
    }

    function updateSelectionPanel() {
        selectionPanelContent.innerHTML = ''; // Clear previous controls
        if (!selection) {
            selectedObjectPanel.classList.add('hidden');
            return;
        }

        selectedObjectPanel.classList.remove('hidden');

        if (selection.type === 'object') {
            selectionPanelHeader.textContent = 'Selected Object';
            const mapLinkHtml = `
                <label for="mapLinkSelect">Link to Map</label>
                <select id="mapLinkSelect" class="w-full p-2 border-gray-600 bg-gray-700 rounded mb-2"></select>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <button id="setMapLinkBtn" class="w-full">Set Link</button>
                    <button id="removeMapLinkBtn" class="w-full">Remove Link</button>
                </div>`;
            selectionPanelContent.innerHTML = mapLinkHtml;
            populateMapLinkDropdown();
        } else if (selection.type === 'wall') {
            selectionPanelHeader.textContent = 'Selected Wall';
            const deleteWallBtn = document.createElement('button');
            deleteWallBtn.textContent = 'Delete Wall';
            deleteWallBtn.className = 'w-full';
            deleteWallBtn.onclick = () => {
                saveState();
                state.getActiveMap().walls.splice(selection.index, 1);
                selection = null;
                updateSelectionPanel();
                drawAll();
            };
            selectionPanelContent.appendChild(deleteWallBtn);
        } else if (selection.type === 'token') {
            selectionPanelHeader.textContent = 'Selected Token';
        }
    }

    function setActiveTool(toolName) {
        currentTool = toolName;
        const toolButtons = [toolTerrainBtn, toolPencilBtn, toolSelectBtn, toolWallBtn, toolTokenBtn, toolTextBtn, toolInteractBtn, eraserToolBtn, toolFogRevealBtn, toolFogHideBtn];
        toolButtons.forEach(btn => btn.classList.remove('active'));
        [terrainOptionsPanel, pencilOptionsPanel, tokenOptionsPanel, textToolPanel].forEach(p => p.classList.add('hidden'));
        
        if (toolName !== 'object') {
            selectedObject = null;
            document.querySelectorAll('#objectSelector .item-container.active').forEach(el => el.classList.remove('active'));
        }
        if (toolName !== 'select') {
            selection = null;
            assetContextMenu.classList.add('hidden');
            updateSelectionPanel();
        }

        if (toolName.startsWith('eraser-')) {
            eraserToolBtn.classList.add('active');
        }

        switch(toolName) {
            case 'terrain': toolTerrainBtn.classList.add('active'); terrainOptionsPanel.classList.remove('hidden'); canvas.style.cursor = 'crosshair'; break;
            case 'pencil': toolPencilBtn.classList.add('active'); pencilOptionsPanel.classList.remove('hidden'); canvas.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h9'/><path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/></svg>") 0 24, auto`; break;
            case 'select': toolSelectBtn.classList.add('active'); canvas.style.cursor = 'default'; break;
            case 'wall': toolWallBtn.classList.add('active'); canvas.style.cursor = 'crosshair'; break;
            case 'token': toolTokenBtn.classList.add('active'); tokenOptionsPanel.classList.remove('hidden'); canvas.style.cursor = 'copy'; break;
            case 'text': toolTextBtn.classList.add('active'); textToolPanel.classList.remove('hidden'); canvas.style.cursor = 'text'; break; // *** NEW ***
            case 'interact': toolInteractBtn.classList.add('active'); canvas.style.cursor = 'pointer'; break;
            case 'eraser-terrain':
            case 'eraser-objects':
            case 'eraser-drawings':
                eraserToolBtn.classList.add('active');
                terrainOptionsPanel.classList.remove('hidden');
                canvas.style.cursor = 'crosshair';
                break;
            case 'fog-reveal': toolFogRevealBtn.classList.add('active'); break;
            case 'fog-hide': toolFogHideBtn.classList.add('active'); break;
            case 'object': canvas.style.cursor = 'copy'; break;
        }
    }

    function applyEraser(coords) {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeLayerId) return;
        
        const worldCoords = {
            x: (coords.x - view.offsetX) / view.zoom,
            y: (coords.y - view.offsetY) / view.zoom
        };
        let changed = false;

        switch (currentEraserMode) {
            case 'terrain': {
                const gridCoords = pixelToGridCoords(coords.x, coords.y);
                const targetLayer = activeMap.layers.find(l => l.id === activeLayerId);
                if (targetLayer && targetLayer.data) {
                    const key = `${gridCoords.q},${gridCoords.r}`;
                    if (targetLayer.data[key] && targetLayer.data[key].terrain) {
                        delete targetLayer.data[key].terrain;
                        changed = true;
                    }
                }
                break;
            }
            case 'objects': {
                const targetLayer = activeMap.layers.find(l => l.id === activeLayerId);
                if (targetLayer && targetLayer.objects) {
                    for (let i = targetLayer.objects.length - 1; i >= 0; i--) {
                        const obj = targetLayer.objects[i];
                        const asset = assetCache[obj.assetId];
                        if (!asset) continue;

                        const objWidth = asset.width * obj.scale;
                        const objHeight = asset.height * obj.scale;
                        
                        if (worldCoords.x >= obj.x - objWidth / 2 && worldCoords.x <= obj.x + objWidth / 2 &&
                            worldCoords.y >= obj.y - objHeight / 2 && worldCoords.y <= obj.y + objHeight / 2) {
                            targetLayer.objects.splice(i, 1);
                            changed = true;
                            break;
                        }
                    }
                }
                break;
            }
            case 'drawings': {
                if (activeMap.drawings) {
                    for (let i = activeMap.drawings.length - 1; i >= 0; i--) {
                        const drawing = activeMap.drawings[i];
                        const tolerance = (drawing.width / 2) + 5;
                        const isNear = drawing.points.some(p => {
                            const dist = Math.sqrt(Math.pow(p.x - worldCoords.x, 2) + Math.pow(p.y - worldCoords.y, 2));
                            return dist < tolerance;
                        });
                        if (isNear) {
                            activeMap.drawings.splice(i, 1);
                            changed = true;
                        }
                    }
                }
                break;
            }
        }
        if (changed) {
            drawAll();
        }
    }


    function applyTool(coords, startCoords = null) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        const worldCoords = {
            x: (coords.x - view.offsetX) / view.zoom,
            y: (coords.y - view.offsetY) / view.zoom
        };

        if (currentTool === 'terrain') {
            if (!activeLayerId) return;
            let targetLayer = activeMap.layers.find(l => l.id === activeLayerId);
            if (!targetLayer) return;
            const gridCoords = pixelToGridCoords(coords.x, coords.y);
            const key = `${gridCoords.q},${gridCoords.r}`;
            if (activeMap.grid[key]) {
                if (!targetLayer.data) targetLayer.data = {};
                if (!targetLayer.data[key]) targetLayer.data[key] = {};
                targetLayer.data[key].terrain = selectedTerrain;
            }
        } else if (currentTool === 'object' && selectedObject) {
            if (!activeLayerId) return;
            let targetLayer = activeMap.layers.find(l => l.id === activeLayerId);
            if (!targetLayer) return;
            if (!targetLayer.objects) targetLayer.objects = [];
            const newObject = {
                id: `obj_${Date.now()}`,
                assetId: selectedObject,
                x: worldCoords.x,
                y: worldCoords.y,
                rotation: 0,
                scale: 1,
                isGmOnly: objectGmOnlyCheckbox.checked
            };
            targetLayer.objects.push(newObject);
        } else if (currentTool === 'token') {
            if (!activeMap.tokens) activeMap.tokens = [];
            activeMap.tokens.push({
                id: `token_${Date.now()}`,
                x: worldCoords.x,
                y: worldCoords.y,
                color: tokenColorPicker.value,
                lightRadius: parseInt(tokenLightRadiusSlider.value)
            });
        } else if (currentTool === 'wall' && startCoords) {
            const worldStartCoords = {
                x: (startCoords.x - view.offsetX) / view.zoom,
                y: (startCoords.y - view.offsetY) / view.zoom
            };
            if (!activeMap.walls) activeMap.walls = [];
            activeMap.walls.push({ start: worldStartCoords, end: worldCoords });
        } 
        // *** NEW: Logic for placing text ***
        else if (currentTool === 'text') {
            if (!activeMap.labels) activeMap.labels = [];
            const newLabel = {
                id: `label_${Date.now()}`,
                text: textInput.value || "Label",
                x: worldCoords.x,
                y: worldCoords.y,
                size: parseInt(fontSizeInput.value),
                color: fontColorInput.value,
                isGmOnly: textGmOnlyCheckbox.checked
            };
            activeMap.labels.push(newLabel);
        }
        else if (currentTool === 'fog-reveal' && startCoords) {
            const rect = {
                x: (Math.min(startCoords.x, coords.x) - view.offsetX) / view.zoom,
                y: (Math.min(startCoords.y, coords.y) - view.offsetY) / view.zoom,
                width: Math.abs(coords.x - startCoords.x) / view.zoom,
                height: Math.abs(coords.y - startCoords.y) / view.zoom
            };
            activeMap.fog.revealedRects.push(rect);
        } else if (currentTool === 'fog-hide' && startCoords) {
             const rect = {
                x: (Math.min(startCoords.x, coords.x) - view.offsetX) / view.zoom,
                y: (Math.min(startCoords.y, coords.y) - view.offsetY) / view.zoom,
                width: Math.abs(coords.x - startCoords.x) / view.zoom,
                height: Math.abs(coords.y - startCoords.y) / view.zoom
            };
            activeMap.fog.revealedRects = activeMap.fog.revealedRects.filter(r => {
                return r.x > rect.x + rect.width || r.x + r.width < rect.x || r.y > rect.y + rect.height || r.y + r.height < rect.y;
            });
        }
        drawAll();
    }

    function handleAIImage(e) {
        saveState();
        const { imageBase64 } = e.detail;
        const activeMap = state.getActiveMap();
        if (!activeMap) return;
        let groundLayer = activeMap.layers.find(l => l.name === 'Ground') || activeMap.layers[0];
        groundLayer.backgroundImage = { src: `data:image/png;base64,${imageBase64}` };
        drawAll();
    }

    function renderAtlas() {
        atlasPanel.innerHTML = '';
        Object.values(state.project.maps).forEach(map => {
            const mapItem = document.createElement('div');
            mapItem.className = 'item-container p-2';
            mapItem.textContent = map.name;
            mapItem.dataset.mapId = map.id;
            if (map.id === state.activeMapId) {
                mapItem.classList.add('active');
            }
            mapItem.addEventListener('click', () => {
                state.setActiveMapId(map.id);
                const newActiveMap = state.getActiveMap();
                if (newActiveMap && newActiveMap.layers.length > 0) {
                    activeLayerId = newActiveMap.layers[0].id;
                }
                renderAtlas();
                renderLayerList();
                drawAll();
            });
            atlasPanel.appendChild(mapItem);
        });
    }

    function handleAddNewMap() {
        const mapName = newMapNameInput.value || 'Untitled Map';
        const mapId = `map_${Date.now()}`;
        const newGrid = {};
        const width = parseInt(newMapWidthInput.value) || 50;
        const height = parseInt(newMapHeightInput.value) || 50;
        const halfWidth = Math.floor(width / 2);
        const halfHeight = Math.floor(height / 2);

        for(let q = -halfWidth; q <= halfWidth; q++) {
            for(let r = -halfHeight; r <= halfHeight; r++) {
                if (Math.abs(q+r) <= Math.max(halfWidth, halfHeight)) {
                     newGrid[`${q},${r}`] = true;
                }
            }
        }

        const firstLayerId = `layer_${Date.now()}`;
        state.project.maps[mapId] = {
            id: mapId, name: mapName, grid: newGrid,
            width: width, 
            height: height,
            layers: [{ 
                id: firstLayerId, 
                name: 'Ground', 
                visible: true, 
                data: {}, 
                backgroundImage: null,
                objects: [],
            }],
            tokens: [], 
            walls: [], 
            drawings: [],
            labels: [], // *** NEW: Initialize labels array ***
            fog: { revealedRects: [] },
        };
        
        state.setActiveMapId(mapId);
        activeLayerId = firstLayerId;
        renderAtlas();
        renderLayerList();
        drawAll();
        newMapModal.classList.add('hidden');
    }

    function populateObjectSelector() {
        objectSelector.innerHTML = '';
        for (const key in state.assetManifest) {
            const asset = state.assetManifest[key];
            const item = document.createElement('div');
            item.className = 'item-container';
            item.dataset.assetId = key;

            const swatch = document.createElement('div');
            swatch.className = 'object-swatch';
            const img = new Image();
            img.src = asset.src;
            swatch.appendChild(img);

            const label = document.createElement('span');
            label.className = 'item-label';
            label.textContent = asset.name;

            item.appendChild(swatch);
            item.appendChild(label);
            objectSelector.appendChild(item);
        }
    }

    function populateMapLinkDropdown() {
        const mapLinkSelect = document.getElementById('mapLinkSelect');
        if (!mapLinkSelect) return;
        mapLinkSelect.innerHTML = '<option value="">None</option>';
        Object.values(state.project.maps).forEach(map => {
            if (map.id !== state.activeMapId) {
                const option = document.createElement('option');
                option.value = map.id;
                option.textContent = map.name;
                mapLinkSelect.appendChild(option);
            }
        });
    }

    function renderLayerList() {
        const activeMap = state.getActiveMap();
        layerList.innerHTML = '';
        if (!activeMap || !activeMap.layers) return;

        activeMap.layers.forEach(layer => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.dataset.layerId = layer.id;
            item.draggable = true;
            if (layer.id === activeLayerId) {
                item.classList.add('active');
            }

            const label = document.createElement('span');
            label.className = 'layer-label';
            label.textContent = layer.name;
            item.appendChild(label);

            item.addEventListener('click', () => {
                activeLayerId = layer.id;
                renderLayerList();
            });

            layerList.appendChild(item);
        });
    }
    
    function openAssetEditor() {
        assetEditorOverlay.classList.remove('hidden');
    }

    async function initialize() {
        state.setState({ apiKey: localStorage.getItem('mapMakerApiKey') || '' });
        
        try {
            const [terrainsResponse, assetsResponse] = await Promise.all([ fetch('./terrains.json'), fetch('./assets.json') ]);
            if (!terrainsResponse.ok || !assetsResponse.ok) throw new Error('Failed to load core asset/terrain files.');
            const terrainsData = await terrainsResponse.json();
            const assetsData = await assetsResponse.json();
            state.setState({ terrains: terrainsData, assetManifest: assetsData });
            
            state.loadCustomAssets();

        } catch (error) {
            console.error(error);
            state.showModal(`Critical Error: Could not load core game files.`);
            return;
        }

        requestAnimationFrame(async () => {
            resizeCanvas();
            await initializePatterns(ctx);
            await loadAssets();
            
            if (Object.keys(state.project.maps).length === 0) {
                handleAddNewMap();
            } else {
                const firstMapId = Object.keys(state.project.maps)[0];
                state.setActiveMapId(firstMapId);
                activeLayerId = state.getActiveMap().layers[0].id;
            }
            
            populateObjectSelector();
            addEventListeners();
            renderAtlas();
            renderLayerList();
            updateUndoRedoButtons();
            setActiveTool('terrain');
            centerView();
        });
    }

    function centerView() {
        view.zoom = 1;
        view.offsetX = canvas.width / 2;
        view.offsetY = canvas.height / 2;
        drawAll();
    }

    function toggleAIPanelVisibility() { aiBottomPanel.classList.toggle('closed'); }
    function togglePanel(isCollapsing) {
        panelWrapper.classList.toggle('closed', isCollapsing);
        collapsedBar.classList.toggle('hidden', !isCollapsing);
        setTimeout(resizeCanvas, 300); 
    }

    function checkForRecovery() { /* ... */ }
    function autoSaveProject() { /* ... */ }
    
    function getHexesInLine(startCoords, endCoords) {
        const hexes = [];
        const N = Math.max(Math.abs(startCoords.q - endCoords.q), Math.abs(startCoords.r - endCoords.r), Math.abs(startCoords.s - endCoords.s));
        for (let i = 0; i <= N; i++) {
            const t = N === 0 ? 0.0 : i / N;
            const q = Math.round(startCoords.q + (endCoords.q - startCoords.q) * t);
            const r = Math.round(startCoords.r + (endCoords.r - startCoords.r) * t);
            hexes.push({q, r});
        }
        return hexes;
    }

    function getHexesInRectangle(startCoords, endCoords) {
        const hexes = [];
        const minQ = Math.min(startCoords.q, endCoords.q);
        const maxQ = Math.max(startCoords.q, endCoords.q);
        const minR = Math.min(startCoords.r, endCoords.r);
        const maxR = Math.max(startCoords.r, endCoords.r);
        for (let q = minQ; q <= maxQ; q++) {
            for (let r = minR; r <= maxR; r++) {
                hexes.push({q, r});
            }
        }
        return hexes;
    }

    function getHexesInEllipse(centerCoords, radiusX, radiusY) {
        const hexes = [];
        const {x: centerX, y: centerY} = hexToPixel(centerCoords.q, centerCoords.r, 30);
        
        const start = pixelToGridCoords(centerX - radiusX, centerY - radiusY);
        const end = pixelToGridCoords(centerX + radiusX, centerY + radiusY);
        
        for (let q = start.q; q <= end.q; q++) {
            for (let r = start.r; r <= end.r; r++) {
                const {x, y} = hexToPixel(q, r, 30);
                if (Math.pow((x - centerX) / radiusX, 2) + Math.pow((y - centerY) / radiusY, 2) <= 1) {
                    hexes.push({q, r});
                }
            }
        }
        return hexes;
    }

    function addEventListeners() {
        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('aiImageGenerated', handleAIImage);
        document.addEventListener('requestStateSave', saveState);
        document.addEventListener('mapStateUpdated', drawAll);
        
        document.addEventListener('assetCreated', (e) => {
            populateObjectSelector();
            loadAssets();
        });

        undoBtn.addEventListener('click', undo);
        redoBtn.addEventListener('click', redo);
        resetViewBtn.addEventListener('click', centerView);

        saveProjectBtn.addEventListener('click', () => {
            state.project.projectName = projectNameInput.value || 'Untitled Campaign';
            const projectData = JSON.stringify(state.project, null, 2);
            const blob = new Blob([projectData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${state.project.projectName.replace(/\s+/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            state.showToast('Project saved!', 'info');
        });

        loadProjectBtn.addEventListener('click', () => loadJsonInput.click());
        loadJsonInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const loadedProject = JSON.parse(event.target.result);
                    if (!loadedProject.maps || !loadedProject.projectName) {
                        throw new Error("Invalid project file format.");
                    }
                    state.setState({ project: loadedProject });
                    const firstMapId = Object.keys(loadedProject.maps)[0];
                    state.setActiveMapId(firstMapId);
                    
                    initialize(); 
                    
                    projectNameInput.value = loadedProject.projectName;
                    state.showToast('Project loaded successfully!', 'info');
                } catch (error) {
                    state.showModal(`Error loading project file: ${error.message}`);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });


        addLayerBtn.addEventListener('click', () => {
            const activeMap = state.getActiveMap();
            if (!activeMap) return;
            saveState();
            const newLayer = {
                id: `layer_${Date.now()}`,
                name: `Layer ${activeMap.layers.length + 1}`,
                visible: true,
                data: {},
                objects: []
            };
            activeMap.layers.push(newLayer);
            activeLayerId = newLayer.id;
            renderLayerList();
        });

        deleteLayerBtn.addEventListener('click', () => {
            const activeMap = state.getActiveMap();
            if (!activeMap || !activeLayerId || activeMap.layers.length <= 1) {
                state.showToast("Cannot delete the last layer.", "warning");
                return;
            }
            state.showModal("Are you sure you want to delete this layer? This cannot be undone.", () => {
                saveState();
                activeMap.layers = activeMap.layers.filter(l => l.id !== activeLayerId);
                activeLayerId = activeMap.layers[activeMap.layers.length - 1].id;
                renderLayerList();
                drawAll();
            });
        });

        gmViewToggleBtn.addEventListener('click', () => {
            isGmViewActive = !isGmViewActive;
            gmViewIconOn.classList.toggle('hidden', !isGmViewActive);
            gmViewIconOff.classList.toggle('hidden', isGmViewActive);
            gmViewToggleBtn.classList.toggle('gm-active', isGmViewActive);
            drawAll();
        });

        resetFogBtn.addEventListener('click', () => {
            const activeMap = state.getActiveMap();
            if (activeMap) {
                saveState();
                activeMap.fog.revealedRects = [];
                drawAll();
            }
        });

        collapseBtn.addEventListener('click', () => togglePanel(true));
        collapsedBar.addEventListener('click', () => togglePanel(false));
        aiBottomPanel.querySelector('#aiBottomPanelHeader').addEventListener('click', toggleAIPanelVisibility);
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                header.nextElementSibling.classList.toggle('hidden');
            });
        });
        terrainSelector.addEventListener('click', (e) => {
            const target = e.target.closest('.item-container');
            if (target && target.dataset.terrain) {
                selectedTerrain = target.dataset.terrain;
            }
        });

        objectSelector.addEventListener('click', (e) => {
            const target = e.target.closest('.item-container');
            if (target && target.dataset.assetId) {
                document.querySelectorAll('#objectSelector .item-container.active').forEach(el => el.classList.remove('active'));
                target.classList.add('active');
                selectedObject = target.dataset.assetId;
                setActiveTool('object');
            }
        });

        toolTerrainBtn.addEventListener('click', () => setActiveTool('terrain'));
        toolPencilBtn.addEventListener('click', () => setActiveTool('pencil'));
        toolSelectBtn.addEventListener('click', () => setActiveTool('select'));
        toolWallBtn.addEventListener('click', () => setActiveTool('wall'));
        toolTokenBtn.addEventListener('click', () => setActiveTool('token'));
        toolTextBtn.addEventListener('click', () => setActiveTool('text')); // *** NEW ***
        toolInteractBtn.addEventListener('click', () => setActiveTool('interact'));
        
        eraserToolBtn.addEventListener('click', () => eraserDropdownMenu.classList.toggle('hidden'));
        eraseTerrainBtn.addEventListener('click', () => {
            currentEraserMode = 'terrain';
            setActiveTool('eraser-terrain');
            eraserDropdownMenu.classList.add('hidden');
        });
        eraseObjectsBtn.addEventListener('click', () => {
            currentEraserMode = 'objects';
            setActiveTool('eraser-objects');
            eraserDropdownMenu.classList.add('hidden');
        });
        eraseDrawingsBtn.addEventListener('click', () => {
            currentEraserMode = 'drawings';
            setActiveTool('eraser-drawings');
            eraserDropdownMenu.classList.add('hidden');
        });

        toolFogRevealBtn.addEventListener('click', () => setActiveTool('fog-reveal'));
        toolFogHideBtn.addEventListener('click', () => setActiveTool('fog-hide'));

        brushSizeSlider.addEventListener('input', e => brushSizeValue.textContent = e.target.value);
        pencilWidthSlider.addEventListener('input', e => pencilWidthValue.textContent = e.target.value);
        fogBrushSizeSlider.addEventListener('input', e => fogBrushSizeValue.textContent = e.target.value);
        tokenLightRadiusSlider.addEventListener('input', e => tokenLightRadiusValue.textContent = e.target.value);

        addNewMapBtn.addEventListener('click', () => newMapModal.classList.remove('hidden'));
        cancelNewMapBtn.addEventListener('click', () => newMapModal.classList.add('hidden'));
        confirmNewMapBtn.addEventListener('click', handleAddNewMap);

        assetEditorBtn.addEventListener('click', openAssetEditor);

        canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        canvas.addEventListener('mousedown', e => {
            if (e.button === 2) {
                isPanning = true;
                panStart = { x: e.clientX, y: e.clientY };
                canvas.classList.add('panning');
                return;
            }
            if (e.button === 0) {
                const clickCoords = { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };
                const worldCoords = { x: (clickCoords.x - view.offsetX) / view.zoom, y: (clickCoords.y - view.offsetY) / view.zoom };
                
                if (currentTool === 'select') {
                    const activeMap = state.getActiveMap();
                    let found = false;

                    if (selection && selection.type === 'wall') {
                        const wall = activeMap.walls[selection.index];
                        const handleRadius = 8 / view.zoom;
                        const distToStart = Math.sqrt(Math.pow(worldCoords.x - wall.start.x, 2) + Math.pow(worldCoords.y - wall.start.y, 2));
                        const distToEnd = Math.sqrt(Math.pow(worldCoords.x - wall.end.x, 2) + Math.pow(worldCoords.y - wall.end.y, 2));
                        
                        if (distToStart <= handleRadius) {
                            isDraggingWallEndpoint = true;
                            selection.handle = 'start';
                            found = true;
                        } else if (distToEnd <= handleRadius) {
                            isDraggingWallEndpoint = true;
                            selection.handle = 'end';
                            found = true;
                        }
                    }

                    if (found) {
                        drawAll();
                        return;
                    }
                    
                    for (let i = activeMap.tokens.length - 1; i >= 0; i--) {
                        const token = activeMap.tokens[i];
                        const dist = Math.sqrt(Math.pow(worldCoords.x - token.x, 2) + Math.pow(worldCoords.y - token.y, 2));
                        if (dist <= (30 / 2)) {
                            selection = { type: 'token', index: i };
                            isDragging = true;
                            dragOffsetX = worldCoords.x - token.x;
                            dragOffsetY = worldCoords.y - token.y;
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        for (let layer of [...activeMap.layers].reverse()) {
                            if (layer.objects) {
                                for (let i = layer.objects.length - 1; i >= 0; i--) {
                                    const obj = layer.objects[i];
                                    const asset = assetCache[obj.assetId];
                                    if (!asset) continue;
                                    const objWidth = asset.width * obj.scale;
                                    const objHeight = asset.height * obj.scale;
                                    if (worldCoords.x >= obj.x - objWidth / 2 && worldCoords.x <= obj.x + objWidth / 2 &&
                                        worldCoords.y >= obj.y - objHeight / 2 && worldCoords.y <= obj.y + objHeight / 2) {
                                        selection = { type: 'object', layerId: layer.id, index: i };
                                        isDragging = true;
                                        dragOffsetX = worldCoords.x - obj.x;
                                        dragOffsetY = worldCoords.y - obj.y;
                                        found = true;
                                        break;
                                    }
                                }
                            }
                            if (found) break;
                        }
                    }

                    if (!found && activeMap.walls) {
                        const clickTolerance = 10 / view.zoom;
                        for (let i = activeMap.walls.length - 1; i >= 0; i--) {
                            const wall = activeMap.walls[i];
                            const dx = wall.end.x - wall.start.x;
                            const dy = wall.end.y - wall.start.y;
                            const lenSq = dx*dx + dy*dy;
                            const t = ((worldCoords.x - wall.start.x) * dx + (worldCoords.y - wall.start.y) * dy) / lenSq;
                            const tClamped = Math.max(0, Math.min(1, t));
                            const closestX = wall.start.x + tClamped * dx;
                            const closestY = wall.start.y + tClamped * dy;
                            const distSq = Math.pow(worldCoords.x - closestX, 2) + Math.pow(worldCoords.y - closestY, 2);
                            if (distSq < clickTolerance * clickTolerance) {
                                selection = { type: 'wall', index: i };
                                found = true;
                                break;
                            }
                        }
                    }

                    if (!found) selection = null;
                    
                    updateContextMenu();
                    updateSelectionPanel();
                    drawAll();
                    return;
                }

                saveState();
                
                const terrainBrush = terrainBrushModeSelect.value;
                const pencilBrush = pencilBrushModeSelect.value;

                if (currentTool.startsWith('eraser-')) {
                    isPainting = true;
                    applyEraser(clickCoords);
                } 
                // *** NEW: Text tool doesn't use shape drawing, it places on click ***
                else if (currentTool === 'text') {
                    applyTool(clickCoords);
                }
                else if (currentTool === 'pencil') {
                    if (pencilBrush === 'freestyle') {
                        isPenciling = true;
                        currentPencilPath = {
                            type: 'freestyle',
                            points: [worldCoords],
                            color: pencilColorPicker.value, width: parseInt(pencilWidthSlider.value), isGmOnly: pencilGmOnlyCheckbox.checked
                        };
                    } else {
                        isDrawingShape = true;
                        shapeStartPoint = clickCoords;
                    }
                } else if (currentTool === 'terrain' && (terrainBrush === 'hex' || terrainBrush === 'spray')) {
                    isPainting = true;
                    applyTool(clickCoords);
                } else {
                    isDrawingShape = true;
                    shapeStartPoint = clickCoords;
                }
            }
        });
        
        canvas.addEventListener('mousemove', e => {
            if (isPanning) {
                view.offsetX += e.clientX - panStart.x;
                view.offsetY += e.clientY - panStart.y;
                panStart = { x: e.clientX, y: e.clientY };
                drawAll();
                return;
            }
            
            const moveCoords = { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };
            const worldCoords = { x: (moveCoords.x - view.offsetX) / view.zoom, y: (moveCoords.y - view.offsetY) / view.zoom };

            if (isDraggingWallEndpoint && selection && selection.type === 'wall') {
                const wall = state.getActiveMap().walls[selection.index];
                wall[selection.handle] = worldCoords;
                drawAll();
            } else if (isDragging && selection) {
                const activeMap = state.getActiveMap();
                if (selection.type === 'object') {
                    const layer = activeMap.layers.find(l => l.id === selection.layerId);
                    const obj = layer.objects[selection.index];
                    obj.x = worldCoords.x - dragOffsetX;
                    obj.y = worldCoords.y - dragOffsetY;
                } else if (selection.type === 'token') {
                    const token = activeMap.tokens[selection.index];
                    token.x = worldCoords.x - dragOffsetX;
                    token.y = worldCoords.y - dragOffsetY;
                }
                updateContextMenu();
                drawAll();
            } else if (isPenciling && currentPencilPath) {
                currentPencilPath.points.push(worldCoords);
                drawAll(); 
            } else if (isPainting) {
                if (currentTool.startsWith('eraser-')) {
                    applyEraser(moveCoords);
                } else if (currentTool === 'terrain') {
                    applyTool(moveCoords);
                }
            } else if (isDrawingShape) {
                drawAll(); 
                drawingCtx.save();
                drawingCtx.translate(view.offsetX, view.offsetY);
                drawingCtx.scale(view.zoom, view.zoom);
                const worldStart = { x: (shapeStartPoint.x - view.offsetX) / view.zoom, y: (shapeStartPoint.y - view.offsetY) / view.zoom };
                drawingCtx.setLineDash([5, 5]);
                drawingCtx.lineWidth = 2 / view.zoom;

                if (currentTool === 'pencil') {
                    const pencilBrush = pencilBrushModeSelect.value;
                    drawingCtx.strokeStyle = pencilColorPicker.value;
                    drawingCtx.lineWidth = parseInt(pencilWidthSlider.value);
                    drawingCtx.setLineDash([]);
                    if (pencilBrush === 'line') {
                        drawingCtx.beginPath();
                        drawingCtx.moveTo(worldStart.x, worldStart.y);
                        drawingCtx.lineTo(worldCoords.x, worldCoords.y);
                        drawingCtx.stroke();
                    } else if (pencilBrush === 'rectangle') {
                        drawingCtx.strokeRect(worldStart.x, worldStart.y, worldCoords.x - worldStart.x, worldCoords.y - worldStart.y);
                    } else if (pencilBrush === 'ellipse') {
                        const radiusX = Math.abs(worldCoords.x - worldStart.x) / 2;
                        const radiusY = Math.abs(worldCoords.y - worldStart.y) / 2;
                        const centerX = worldStart.x + (worldCoords.x - worldStart.x) / 2;
                        const centerY = worldStart.y + (worldCoords.y - worldStart.y) / 2;
                        drawingCtx.beginPath();
                        drawingCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                        drawingCtx.stroke();
                    }
                } else if (currentTool === 'object' && selectedObject) {
                    const assetImg = assetCache[selectedObject];
                    if (assetImg) {
                        drawingCtx.globalAlpha = 0.5;
                        drawingCtx.drawImage(assetImg, worldCoords.x - assetImg.width / 2, worldCoords.y - assetImg.height / 2);
                        drawingCtx.globalAlpha = 1.0;
                    }
                } else if (currentTool === 'wall') {
                    drawingCtx.strokeStyle = 'rgba(0,0,0,0.7)';
                    drawingCtx.beginPath();
                    drawingCtx.moveTo(worldStart.x, worldStart.y);
                    drawingCtx.lineTo(worldCoords.x, worldCoords.y);
                    drawingCtx.stroke();
                }
                drawingCtx.restore();
            }
        });
        
        canvas.addEventListener('mouseup', e => {
            if (e.button === 2) { isPanning = false; canvas.classList.remove('panning'); return; }
            if (e.button === 0) {
                const endCoords = { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };
                const activeMap = state.getActiveMap();
                if (!activeMap) return;

                if (isPenciling) {
                    if (currentPencilPath && currentPencilPath.points.length > 1) {
                        if (!activeMap.drawings) activeMap.drawings = [];
                        activeMap.drawings.push(currentPencilPath);
                    }
                } else if (isDrawingShape) {
                    if (currentTool === 'object' && selectedObject || currentTool === 'token' || currentTool === 'wall') {
                        applyTool(endCoords, shapeStartPoint);
                    } else {
                        const worldStart = { x: (shapeStartPoint.x - view.offsetX) / view.zoom, y: (shapeStartPoint.y - view.offsetY) / view.zoom };
                        const worldEnd = { x: (endCoords.x - view.offsetX) / view.zoom, y: (endCoords.y - view.offsetY) / view.zoom };
                        
                        if (currentTool === 'terrain') {
                            const terrainBrush = terrainBrushModeSelect.value;
                            const startHex = pixelToGridCoords(shapeStartPoint.x, shapeStartPoint.y);
                            const endHex = pixelToGridCoords(endCoords.x, endCoords.y);
                            let hexesToPaint = [];

                            if (terrainBrush === 'line') {
                                hexesToPaint = getHexesInLine(startHex, endHex);
                            } else if (terrainBrush === 'rectangle') {
                                hexesToPaint = getHexesInRectangle(startHex, endHex);
                            } else if (terrainBrush === 'ellipse') {
                                const radiusX = Math.abs(worldEnd.x - worldStart.x) / 2;
                                const radiusY = Math.abs(worldEnd.y - worldStart.y) / 2;
                                hexesToPaint = getHexesInEllipse(startHex, radiusX, radiusY);
                            }
                            
                            const targetLayer = activeMap.layers.find(l => l.id === activeLayerId);
                            if(targetLayer) {
                                hexesToPaint.forEach(hex => {
                                    const key = `${hex.q},${hex.r}`;
                                    if (activeMap.grid[key]) {
                                        if (!targetLayer.data[key]) targetLayer.data[key] = {};
                                        targetLayer.data[key].terrain = selectedTerrain;
                                    }
                                });
                            }
                        } else if (currentTool === 'pencil') {
                            const pencilBrush = pencilBrushModeSelect.value;
                            if (!activeMap.drawings) activeMap.drawings = [];
                            let newDrawing = { color: pencilColorPicker.value, width: parseInt(pencilWidthSlider.value), isGmOnly: pencilGmOnlyCheckbox.checked };

                            if (pencilBrush === 'line') {
                                newDrawing = { ...newDrawing, type: 'line', start: worldStart, end: worldEnd };
                            } else if (pencilBrush === 'rectangle') {
                                newDrawing = { ...newDrawing, type: 'rectangle', x: Math.min(worldStart.x, worldEnd.x), y: Math.min(worldStart.y, worldEnd.y), width: Math.abs(worldStart.x - worldEnd.x), height: Math.abs(worldStart.y - worldEnd.y) };
                            } else if (pencilBrush === 'ellipse') {
                                newDrawing = { ...newDrawing, type: 'ellipse', x: worldStart.x + (worldEnd.x - worldStart.x) / 2, y: worldStart.y + (worldEnd.y - worldStart.y) / 2, radiusX: Math.abs(worldEnd.x - worldStart.x) / 2, radiusY: Math.abs(worldEnd.y - worldStart.y) / 2 };
                            }
                            activeMap.drawings.push(newDrawing);
                        }
                    }
                }

                isPenciling = false;
                isPainting = false;
                isDrawingShape = false;
                isDragging = false;
                isDraggingWallEndpoint = false;
                shapeStartPoint = null;
                currentPencilPath = null;
                drawAll();
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            isPanning = false;
            isPainting = false;
            isPenciling = false;
            isDrawingShape = false;
            isDragging = false;
            isDraggingWallEndpoint = false;
            currentPencilPath = null;
            canvas.classList.remove('panning');
            drawAll();
        });

        canvas.addEventListener('wheel', e => {
            e.preventDefault();
            const zoomIntensity = 0.1;
            const wheel = e.deltaY < 0 ? 1 : -1;
            const zoom = Math.exp(wheel * zoomIntensity);
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldX = (mouseX - view.offsetX) / view.zoom;
            const worldY = (mouseY - view.offsetY) / view.zoom;
            const newZoom = Math.max(0.1, Math.min(5, view.zoom * zoom));
            view.offsetX = mouseX - worldX * newZoom;
            view.offsetY = mouseY - worldY * newZoom;
            view.zoom = newZoom;
            drawAll();
        });

        window.addEventListener('keydown', e => {
            if (!selection) return;
            saveState();
            const activeMap = state.getActiveMap();
            let changed = true;

            if (selection.type === 'object') {
                const layer = activeMap.layers.find(l => l.id === selection.layerId);
                const obj = layer.objects[selection.index];
                switch(e.key) {
                    case 'Delete': case 'Backspace':
                        layer.objects.splice(selection.index, 1);
                        selection = null;
                        assetContextMenu.classList.add('hidden');
                        break;
                    case 'r': obj.rotation = (obj.rotation - 15) % 360; break;
                    case 'R': obj.rotation = (obj.rotation + 15) % 360; break;
                    case '+': case '=': obj.scale = Math.min(5, obj.scale + 0.1); break;
                    case '-': obj.scale = Math.max(0.1, obj.scale - 0.1); break;
                    default: changed = false;
                }
            } else if (selection.type === 'token') {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    activeMap.tokens.splice(selection.index, 1);
                    selection = null;
                } else {
                    changed = false;
                }
            } else if (selection.type === 'wall') {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    activeMap.walls.splice(selection.index, 1);
                    selection = null;
                } else {
                    changed = false;
                }
            }

            if (changed) {
                e.preventDefault();
                updateSelectionPanel();
                drawAll();
            }
        });

        assetRotateLeftBtn.addEventListener('click', () => {
            if (!selection || selection.type !== 'object') return;
            saveState();
            const obj = state.getActiveMap().layers.find(l => l.id === selection.layerId).objects[selection.index];
            obj.rotation = (obj.rotation - 15) % 360;
            drawAll();
        });
        assetRotateRightBtn.addEventListener('click', () => {
            if (!selection || selection.type !== 'object') return;
            saveState();
            const obj = state.getActiveMap().layers.find(l => l.id === selection.layerId).objects[selection.index];
            obj.rotation = (obj.rotation + 15) % 360;
            drawAll();
        });
        assetScaleUpBtn.addEventListener('click', () => {
            if (!selection || selection.type !== 'object') return;
            saveState();
            const obj = state.getActiveMap().layers.find(l => l.id === selection.layerId).objects[selection.index];
            obj.scale = Math.min(5, obj.scale + 0.1);
            drawAll();
        });
        assetScaleDownBtn.addEventListener('click', () => {
            if (!selection || selection.type !== 'object') return;
            saveState();
            const obj = state.getActiveMap().layers.find(l => l.id === selection.layerId).objects[selection.index];
            obj.scale = Math.max(0.1, obj.scale - 0.1);
            drawAll();
        });
        
        deleteTokenBtn.addEventListener('click', () => {
            if (!selection || selection.type !== 'token') return;
            saveState();
            state.getActiveMap().tokens.splice(selection.index, 1);
            selection = null;
            drawAll();
        });

        layerList.addEventListener('dragstart', e => {
            const target = e.target.closest('.layer-item');
            if (target) {
                draggedLayerId = target.dataset.layerId;
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => {
                    target.classList.add('dragging');
                }, 0);
            }
        });

        layerList.addEventListener('dragend', e => {
            const target = e.target.closest('.layer-item');
            if (target) {
                target.classList.remove('dragging');
            }
            draggedLayerId = null;
        });

        layerList.addEventListener('dragover', e => {
            e.preventDefault();
            const target = e.target.closest('.layer-item');
            if (target && target.dataset.layerId !== draggedLayerId) {
                document.querySelectorAll('.layer-item').forEach(el => el.style.borderTop = '');
                target.style.borderTop = '2px solid #3b82f6';
            }
        });

        layerList.addEventListener('dragleave', e => {
             const target = e.target.closest('.layer-item');
             if(target) {
                target.style.borderTop = '';
             }
        });

        layerList.addEventListener('drop', e => {
            e.preventDefault();
            document.querySelectorAll('.layer-item').forEach(el => el.style.borderTop = '');
            const targetElement = e.target.closest('.layer-item');
            if (!targetElement || !draggedLayerId || targetElement.dataset.layerId === draggedLayerId) {
                return;
            }

            saveState();
            const activeMap = state.getActiveMap();
            const draggedIndex = activeMap.layers.findIndex(l => l.id === draggedLayerId);
            const targetIndex = activeMap.layers.findIndex(l => l.id === targetElement.dataset.layerId);

            const [draggedLayer] = activeMap.layers.splice(draggedIndex, 1);
            activeMap.layers.splice(targetIndex, 0, draggedLayer);

            renderLayerList();
            drawAll();
        });

        userGuideBtn.addEventListener('click', () => {
            const guideContent = `
                <div class="space-y-4 text-gray-300">
                    <div>
                        <h4 class="text-lg font-bold text-white mb-2">Getting Started</h4>
                        <p>Welcome to the AI-Assisted Map Maker! Start by giving your project a name in the top right. Use the <strong>Add New Map</strong> button to create your first map in the Atlas.</p>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-white mb-2">Navigating the Canvas</h4>
                        <ul class="list-disc list-inside space-y-1">
                            <li><strong>Pan:</strong> Right-click and drag to move around the map.</li>
                            <li><strong>Zoom:</strong> Use your mouse wheel to zoom in and out.</li>
                            <li><strong>Reset View:</strong> Click the "Center" button in the Actions panel to reset the view.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-white mb-2">Core Tools</h4>
                        <ul class="list-disc list-inside space-y-1">
                            <li><strong>Terrain:</strong> Select a terrain type and use the brush options to paint hexes on the map.</li>
                            <li><strong>Pencil:</strong> Draw freehand lines or shapes. Check "GM-Only" to make secret drawings.</li>
                            <li><strong>Object:</strong> Select an object from the list and click on the map to place it.</li>
                            <li><strong>Wall:</strong> Click and drag to create impassable walls for line of sight.</li>
                            <li><strong>Token:</strong> Place colored tokens for players or monsters. Set their light radius in the options.</li>
                            <li><strong>Eraser:</strong> Use the dropdown to choose what to erase: Terrain, Objects, or Drawings.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-white mb-2">Selection & Editing</h4>
                        <p>Use the <strong>Select</strong> tool (arrow icon) to edit things on the map:</p>
                        <ul class="list-disc list-inside space-y-1">
                            <li><strong>Move:</strong> Click and drag any selected object, token, or wall handle.</li>
                            <li><strong>Delete:</strong> Select an item and press the <strong>Delete</strong> key.</li>
                            <li><strong>Rotate/Scale Objects:</strong> When an object is selected, use the on-canvas controls or keyboard shortcuts (<strong>R/r</strong> to rotate, <strong>+/-</strong> to scale).</li>
                        </ul>
                    </div>
                     <div>
                        <h4 class="text-lg font-bold text-white mb-2">Layers</h4>
                        <p>In the "Graphics Options" panel, you can manage layers. The map is drawn from the bottom of the list to the top. Drag and drop layers to reorder them.</p>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-white mb-2">GM Features</h4>
                        <ul class="list-disc list-inside space-y-1">
                            <li><strong>GM View:</strong> Click the eye icon in the header to toggle GM View. This shows/hides all GM-only objects and drawings.</li>
                            <li><strong>Fog of War:</strong> Use the Reveal and Hide tools to manage what your players can see.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-white mb-2">AI Assistant</h4>
                        <p>Open the AI panel at the bottom to generate maps. First, enter your API key in Settings (gear icon). Then, follow the two-step process: generate a landform, then apply biomes.</p>
                    </div>
                </div>
            `;
            state.showContentModal("User Guide", guideContent);
        });

    }

    function updateContextMenu() {
        if (!selection || selection.type !== 'object') {
            assetContextMenu.classList.add('hidden');
            return;
        }
        const activeMap = state.getActiveMap();
        const layer = activeMap.layers.find(l => l.id === selection.layerId);
        const obj = layer.objects[selection.index];

        const screenX = obj.x * view.zoom + view.offsetX;
        const screenY = obj.y * view.zoom + view.offsetY;

        assetContextMenu.classList.remove('hidden');
        assetContextMenu.style.left = `${screenX + 30}px`;
        assetContextMenu.style.top = `${screenY - assetContextMenu.offsetHeight / 2}px`;
    }

    initialize();
});
