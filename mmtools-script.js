// Version 8.2 - Fixed terrain pattern rendering
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    const wallCanvas = document.getElementById('wallCanvas');
    const wallCtx = wallCanvas.getContext('2d');
    const lightCanvas = document.getElementById('lightCanvas');
    const lightCtx = lightCanvas.getContext('2d');
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
    const textInput = document.getElementById('textInput');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const fontColorInput = document.getElementById('fontColorInput');
    const fileMenuBtn = document.getElementById('fileMenuBtn');
    const fileDropdownMenu = document.getElementById('fileDropdownMenu');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const loadProjectBtn = document.getElementById('loadProjectBtn');
    const loadJsonInput = document.getElementById('loadJsonInput');
    const toolTerrainBtn = document.getElementById('toolTerrainBtn');
    const toolPencilBtn = document.getElementById('toolPencilBtn');
    const toolSelectBtn = document.getElementById('toolSelectBtn');
    const toolWallBtn = document.getElementById('toolWallBtn');
    const toolTokenBtn = document.getElementById('toolTokenBtn');
    const toolTextBtn = document.getElementById('toolTextBtn');
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
    const panelWrapper = document.getElementById('panelWrapper');
    const collapseBtn = document.getElementById('collapseBtn');
    const collapsedBar = document.getElementById('collapsedBar');
    const userGuideBtn = document.getElementById('userGuideBtn');
    const gmViewToggleBtn = document.getElementById('gmViewToggleBtn');
    const gmViewIconOn = document.getElementById('gmViewIconOn');
    const gmViewIconOff = document.getElementById('gmViewIconOff');
    const objectGmOnlyCheckbox = document.getElementById('objectGmOnlyCheckbox');
    const textGmOnlyCheckbox = document.getElementById('textGmOnlyCheckbox');
    const resetFogBtn = document.getElementById('resetFogBtn');
    const assetEditorBtn = document.getElementById('assetEditorBtn');
    const assetEditorOverlay = document.getElementById('asset-editor-overlay');
    const atlasPanel = document.getElementById('atlas-panel');
    const addNewMapBtn = document.getElementById('addNewMapBtn');
    const newMapModal = document.getElementById('newMapModal');
    const newMapNameInput = document.getElementById('newMapNameInput');
    const confirmNewMapBtn = document.getElementById('confirmNewMapBtn');
    const cancelNewMapBtn = document.getElementById('cancelNewMapBtn');
    const selectedObjectPanel = document.getElementById('selectedObjectPanel');
    const selectionPanelHeader = document.getElementById('selection-panel-header');
    const selectionPanelContent = document.getElementById('selection-panel-content');
    const eraserToolBtn = document.getElementById('eraserToolBtn');
    const eraserDropdownMenu = document.getElementById('eraserDropdownMenu');
    const assetContextMenu = document.getElementById('asset-context-menu');

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
    let assetCache = {};
    let isGmViewActive = true;
    let isDraggingWallEndpoint = false;
    let currentTool = 'terrain';
    let selectedTerrain = 'grass';
    let selectedObject = null;
    let activeLayerId = null;
    let undoStack = [];
    let redoStack = [];
    let visibilityPolygons = [];
    let hoveredObject = null;

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
        lightCanvas.width = width;
        lightCanvas.height = height;
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

        if(activeMap.layers) {
            [...activeMap.layers].reverse().forEach(layer => {
                if (!layer.visible) return;
                drawLayerBackground(layer, ctx);
                drawLayerTerrain(layer, ctx);
                drawPlacedObjects(layer, ctx);
            });
        }
        
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
        drawHoverHighlight(drawingCtx);
        
        drawingCtx.restore();

        drawWalls();
        drawLightMask();
        updateFogOfWar();
    }
    window.drawAll = drawAll;

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

    function drawTextLabels(targetCtx) {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.labels) return;

        activeMap.labels.forEach(label => {
            if (isGmViewActive || !label.isGmOnly) {
                targetCtx.font = `${label.size}px 'Trebuchet MS'`;
                targetCtx.fillStyle = label.color;
                targetCtx.textAlign = 'center';
                targetCtx.textBaseline = 'middle';
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

    function drawHoverHighlight(targetCtx) {
        if (!hoveredObject) return;

        const obj = hoveredObject;
        const assetImg = assetCache[obj.assetId];
        if (!assetImg) return;

        const width = assetImg.width * obj.scale;
        const height = assetImg.height * obj.scale;

        targetCtx.save();
        targetCtx.translate(obj.x, obj.y);
        targetCtx.rotate(obj.rotation * Math.PI / 180);
        targetCtx.strokeStyle = 'rgba(96, 165, 250, 0.8)'; // A semi-transparent blue
        targetCtx.lineWidth = 5 / view.zoom;
        targetCtx.shadowColor = 'rgba(96, 165, 250, 1)';
        targetCtx.shadowBlur = 15 / view.zoom;
        targetCtx.strokeRect(-width / 2, -height / 2, width, height);
        targetCtx.restore();
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

    function drawHexOutline(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i + 30;
            const angle_rad = Math.PI / 180 * angle_deg;
            ctx.lineTo(x + size * Math.cos(angle_rad), y + size * Math.sin(angle_rad));
        }
        ctx.closePath();
        ctx.stroke();
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
    
    function drawLightMask() {
        lightCtx.clearRect(0, 0, lightCanvas.width, lightCanvas.height);
        if (isGmViewActive) return;

        lightCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        lightCtx.fillRect(0, 0, lightCanvas.width, lightCanvas.height);

        if (visibilityPolygons.length === 0) return;

        lightCtx.save();
        lightCtx.translate(view.offsetX, view.offsetY);
        lightCtx.scale(view.zoom, view.zoom);
        lightCtx.globalCompositeOperation = 'destination-out';

        visibilityPolygons.forEach(poly => {
            lightCtx.beginPath();
            lightCtx.moveTo(poly[0].x, poly[0].y);
            for (let i = 1; i < poly.length; i++) {
                lightCtx.lineTo(poly[i].x, poly[i].y);
            }
            lightCtx.closePath();
            lightCtx.fill();
        });

        lightCtx.restore();
    }
    
    function updateLightAndSight() {
        // This function would calculate visibility polygons based on token positions and walls
        // For simplicity, we'll just clear and redraw for now.
        visibilityPolygons = [];
        drawAll();
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
        
        if (terrain && terrain.canvasPatternObject) {
            targetCtx.fillStyle = terrain.canvasPatternObject;
        } else if (terrain && terrain.color) {
            targetCtx.fillStyle = terrain.color;
        } else {
            targetCtx.fillStyle = '#888';
        }
        targetCtx.fill();
    }

    function hexToPixel(q, r, size) {
        const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        const y = size * (3 / 2 * r);
        return { x, y };
    }

    function pixelToHex(x, y, size) {
        const q = (Math.sqrt(3)/3 * x - 1/3 * y) / size;
        const r = (2/3 * y) / size;
        return hexRound(q, r);
    }

    function hexRound(q, r) {
        let x = q;
        let y = -q-r;
        let z = r;
        
        let rx = Math.round(x);
        let ry = Math.round(y);
        let rz = Math.round(z);

        const x_diff = Math.abs(rx - x);
        const y_diff = Math.abs(ry - y);
        const z_diff = Math.abs(rz - z);

        if (x_diff > y_diff && x_diff > z_diff) {
            rx = -ry - rz;
        } else if (y_diff > z_diff) {
            ry = -rx - rz;
        } else {
            rz = -rx - ry;
        }
        return { q: rx, r: rz };
    }

    function getMapPixelBounds() {
        return { minPxX: -2000, minPxY: -2000, mapPixelWidth: 4000, mapPixelHeight: 4000 };
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
        
        updateLightAndSight();
        drawAll();
        updateUndoRedoButtons();
    }

    function redo() {
        if (redoStack.length === 0) return;
        const activeMap = state.getActiveMap();
        if(activeMap) undoStack.push(JSON.parse(JSON.stringify(activeMap)));

        const nextState = redoStack.pop();
        state.project.maps[state.activeMapId] = nextState;

        updateLightAndSight();
        drawAll();
        updateUndoRedoButtons();
    }
    
    function updateUndoRedoButtons() {
        undoBtn.disabled = undoStack.length === 0;
        redoBtn.disabled = redoStack.length === 0;
    }

    function updateSelectionPanel() {
        selectionPanelContent.innerHTML = '';
        if (!selection) {
            selectedObjectPanel.classList.add('hidden');
            return;
        }

        selectedObjectPanel.classList.remove('hidden');
        const activeMap = state.getActiveMap();
        let selectedItem = null;
        const itemType = selection.type;

        if (itemType === 'object') {
            const layer = activeMap.layers.find(l => l.id === selection.layerId);
            selectedItem = layer?.objects[selection.index];
            selectionPanelHeader.textContent = 'Selected Object';
        } else if (itemType === 'token') {
            selectedItem = activeMap.tokens[selection.index];
            selectionPanelHeader.textContent = 'Selected Token';
        } else if (itemType === 'wall') {
            selectedItem = activeMap.walls[selection.index];
            selectionPanelHeader.textContent = 'Selected Wall';
        } else if (itemType === 'label') {
            selectedItem = activeMap.labels[selection.index];
            selectionPanelHeader.textContent = 'Selected Label';
        }

        if (!selectedItem) {
            selection = null;
            selectedObjectPanel.classList.add('hidden');
            return;
        }

        if (itemType === 'object' || itemType === 'token' || itemType === 'label') {
            const notesHeader = document.createElement('h4');
            notesHeader.className = 'text-md font-semibold mt-4 border-t border-gray-600 pt-2';
            notesHeader.textContent = 'GM Notes';
            selectionPanelContent.appendChild(notesHeader);

            const notesTextarea = document.createElement('textarea');
            notesTextarea.className = 'w-full p-2 border-gray-600 bg-gray-700 rounded mt-2';
            notesTextarea.value = selectedItem.notes || '';
            notesTextarea.placeholder = 'Add secret notes here...';
            notesTextarea.oninput = () => {
                selectedItem.notes = notesTextarea.value;
            };
            selectionPanelContent.appendChild(notesTextarea);
        }

        if (itemType === 'object') {
            // Container Logic
            const containerHeader = document.createElement('h4');
            containerHeader.className = 'text-md font-semibold mt-4 border-t border-gray-600 pt-2';
            containerHeader.textContent = 'Container';
            selectionPanelContent.appendChild(containerHeader);

            const containerCheckboxWrapper = document.createElement('div');
            containerCheckboxWrapper.className = 'flex items-center mt-2';
            const containerCheckbox = document.createElement('input');
            containerCheckbox.type = 'checkbox';
            containerCheckbox.id = 'isContainerCheckbox';
            containerCheckbox.checked = selectedItem.isContainer;
            containerCheckbox.onchange = () => {
                selectedItem.isContainer = containerCheckbox.checked;
                updateSelectionPanel();
            };
            containerCheckboxWrapper.appendChild(containerCheckbox);
            const containerLabel = document.createElement('label');
            containerLabel.htmlFor = 'isContainerCheckbox';
            containerLabel.textContent = 'Is Container';
            containerLabel.className = 'ml-2';
            containerCheckboxWrapper.appendChild(containerLabel);
            selectionPanelContent.appendChild(containerCheckboxWrapper);

            if (selectedItem.isContainer) {
                const inventoryContainer = document.createElement('div');
                inventoryContainer.id = 'inventory-section';
                selectionPanelContent.appendChild(inventoryContainer);
                renderInventory(selectedItem, inventoryContainer);
            }
        }
        
        if (itemType === 'wall') {
            const deleteWallBtn = document.createElement('button');
            deleteWallBtn.textContent = 'Delete Wall';
            deleteWallBtn.className = 'w-full mt-4';
            deleteWallBtn.onclick = () => {
                saveState();
                activeMap.walls.splice(selection.index, 1);
                selection = null;
                updateSelectionPanel();
                updateLightAndSight();
                drawAll();
            };
            selectionPanelContent.appendChild(deleteWallBtn);
        }
    }
    
    function renderInventory(item, container) {
        container.innerHTML = '';

        const list = document.createElement('ul');
        list.className = 'mt-2 space-y-1';
        (item.inventory || []).forEach((invItem, index) => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center bg-gray-900 p-1 rounded text-sm';
            li.textContent = invItem;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X';
            deleteBtn.className = 'text-red-500 hover:text-red-400 px-2 !mb-0';
            deleteBtn.onclick = () => {
                item.inventory.splice(index, 1);
                renderInventory(item, container);
            };
            li.appendChild(deleteBtn);
            list.appendChild(li);
        });
        container.appendChild(list);

        const addItemWrapper = document.createElement('div');
        addItemWrapper.className = 'flex gap-2 mt-2';
        const newItemInput = document.createElement('input');
        newItemInput.type = 'text';
        newItemInput.placeholder = 'New item...';
        newItemInput.className = 'flex-grow !mb-0';
        addItemWrapper.appendChild(newItemInput);
        
        const addItemBtn = document.createElement('button');
        addItemBtn.textContent = 'Add';
        addItemBtn.className = 'flex-shrink-0 !mb-0';
        addItemBtn.onclick = () => {
            const value = newItemInput.value.trim();
            if (value) {
                if (!item.inventory) item.inventory = [];
                item.inventory.push(value);
                newItemInput.value = '';
                renderInventory(item, container);
            }
        };
        addItemWrapper.appendChild(addItemBtn);
        container.appendChild(addItemWrapper);
    }

    function applyTool(coords, startCoords = null) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        const worldCoords = {
            x: (coords.x - view.offsetX) / view.zoom,
            y: (coords.y - view.offsetY) / view.zoom
        };

        if (currentTool === 'terrain') {
            const hexCoords = pixelToHex(worldCoords.x, worldCoords.y, 30);
            const key = `${hexCoords.q},${hexCoords.r}`;
            const activeLayer = activeMap.layers.find(l => l.id === activeLayerId);
            if (activeLayer && activeMap.grid[key]) {
                activeLayer.data[key] = { terrain: selectedTerrain };
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
                isGmOnly: objectGmOnlyCheckbox.checked,
                mapLink: null,
                notes: "",
                isContainer: false,
                inventory: []
            };
            targetLayer.objects.push(newObject);
        } else if (currentTool === 'token') {
            if (!activeMap.tokens) activeMap.tokens = [];
            activeMap.tokens.push({
                id: `token_${Date.now()}`,
                x: worldCoords.x,
                y: worldCoords.y,
                color: tokenColorPicker.value,
                lightRadius: parseInt(tokenLightRadiusSlider.value),
                notes: ""
            });
            updateLightAndSight();
        } else if (currentTool === 'text') {
            if (!activeMap.labels) activeMap.labels = [];
            const newLabel = {
                id: `label_${Date.now()}`,
                text: textInput.value || "Label",
                x: worldCoords.x,
                y: worldCoords.y,
                size: parseInt(fontSizeInput.value),
                color: fontColorInput.value,
                isGmOnly: textGmOnlyCheckbox.checked,
                notes: ""
            };
            activeMap.labels.push(newLabel);
        }
        drawAll();
    }
    
    // --- Initialization and Event Listeners ---
    
    async function initialize() {
        // Fetch initial data
        try {
            const [terrainsRes, assetsRes] = await Promise.all([
                fetch('terrains.json'),
                fetch('assets.json')
            ]);
            if (!terrainsRes.ok || !assetsRes.ok) {
                throw new Error("Failed to fetch initial data.");
            }
            const terrainsData = await terrainsRes.json();
            const assetsData = await assetsRes.json();
            
            state.setState({
                terrains: terrainsData,
                assetManifest: assetsData
            });
            
            await createTerrainPatterns();
            state.loadCustomAssets();
            await loadAssets();
            
            // Create a default map if none exist
            if (Object.keys(state.project.maps).length === 0) {
                handleAddNewMap(true); 
            } else {
                state.setActiveMapId(Object.keys(state.project.maps)[0]);
            }
            
            setupUI();
            resizeCanvas();
            
        } catch (error) {
            console.error("Initialization failed:", error);
            state.showModal("Failed to load essential map data. Please refresh the page.");
        }
    }

    function createTerrainPatterns() {
        return new Promise(resolve => {
            const terrainKeys = Object.keys(state.terrains);
            let patternsLoaded = 0;
            
            terrainKeys.forEach(key => {
                const terrain = state.terrains[key];
                const patternEl = document.getElementById(terrain.pattern);
                if (patternEl) {
                    const s = new XMLSerializer().serializeToString(patternEl);
                    const img = new Image();
                    img.onload = () => {
                        terrain.canvasPatternObject = ctx.createPattern(img, 'repeat');
                        patternsLoaded++;
                        if (patternsLoaded === terrainKeys.length) {
                            resolve();
                        }
                    };
                    img.onerror = () => {
                        patternsLoaded++;
                        if (patternsLoaded === terrainKeys.length) {
                            resolve();
                        }
                    }
                    img.src = "data:image/svg+xml;base64," + window.btoa(s);
                } else {
                    patternsLoaded++;
                    if (patternsLoaded === terrainKeys.length) {
                        resolve();
                    }
                }
            });
        });
    }

    function switchTool(tool) {
        currentTool = tool;
        // Update button active states
        document.querySelectorAll('.control-panel button[id^="tool"]').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`tool${tool.charAt(0).toUpperCase() + tool.slice(1)}Btn`);
        if(activeBtn) activeBtn.classList.add('active');

        // Show/hide options panels
        if(terrainOptionsPanel) terrainOptionsPanel.classList.toggle('hidden', tool !== 'terrain');
        if(pencilOptionsPanel) pencilOptionsPanel.classList.toggle('hidden', tool !== 'pencil');
        if(tokenOptionsPanel) tokenOptionsPanel.classList.toggle('hidden', tool !== 'token');
        if(textToolPanel) textToolPanel.classList.toggle('hidden', tool !== 'text');
    }

    function setupUI() {
        populateSelectors();
        
        window.addEventListener('resize', resizeCanvas);

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle mouse button
                isPanning = true;
                panStart.x = e.clientX - view.offsetX;
                panStart.y = e.clientY - view.offsetY;
                canvas.classList.add('panning');
                e.preventDefault();
            } else if (e.button === 0) { // Left mouse button
                 isPainting = true;
                 const coords = {x: e.offsetX, y: e.offsetY};
                 applyTool(coords);
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isPanning) {
                view.offsetX = e.clientX - panStart.x;
                view.offsetY = e.clientY - panStart.y;
                drawAll();
            } else if (isPainting) {
                const coords = {x: e.offsetX, y: e.offsetY};
                applyTool(coords);
            }
        });
        
        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 1) {
                isPanning = false;
                canvas.classList.remove('panning');
            } else if (e.button === 0) {
                isPainting = false;
            }
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomIntensity = 0.1;
            const wheel = e.deltaY < 0 ? 1 : -1;
            const zoom = Math.exp(wheel * zoomIntensity);
            
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;

            view.offsetX = (view.offsetX - mouseX) * zoom + mouseX;
            view.offsetY = (view.offsetY - mouseY) * zoom + mouseY;
            view.zoom *= zoom;

            drawAll();
        });

        resetViewBtn.addEventListener('click', () => {
            view.zoom = 1;
            view.offsetX = 0;
            view.offsetY = 0;
            drawAll();
        });

        undoBtn.addEventListener('click', undo);
        redoBtn.addEventListener('click', redo);

        // Tool selection
        toolTerrainBtn.addEventListener('click', () => switchTool('terrain'));
        toolPencilBtn.addEventListener('click', () => switchTool('pencil'));
        toolSelectBtn.addEventListener('click', () => switchTool('select'));
        toolWallBtn.addEventListener('click', () => switchTool('wall'));
        toolTokenBtn.addEventListener('click', () => switchTool('token'));
        toolTextBtn.addEventListener('click', () => switchTool('text'));
        toolInteractBtn.addEventListener('click', () => switchTool('interact'));

        // Collapsible panels
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('svg');
                content.classList.toggle('hidden');
                header.classList.toggle('collapsed');
                if(icon) icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(-90deg)';
            });
        });
    }
    
    function populateSelectors() {
        if(terrainSelector) {
            terrainSelector.innerHTML = '';
            Object.keys(state.terrains).forEach(key => {
                const terrain = state.terrains[key];
                const div = document.createElement('div');
                div.className = 'item-container';
                div.dataset.terrain = key;
                div.innerHTML = `
                    <div class="texture-swatch" style="background-color: ${terrain.color};"></div>
                    <span class="item-label">${terrain.name}</span>
                `;
                div.addEventListener('click', () => {
                    selectedTerrain = key;
                    document.querySelectorAll('#terrainSelector .item-container').forEach(el => el.classList.remove('active'));
                    div.classList.add('active');
                });
                terrainSelector.appendChild(div);
            });
        }

        if(objectSelector) {
            objectSelector.innerHTML = '';
            Object.keys(state.assetManifest).forEach(key => {
                const asset = state.assetManifest[key];
                if (asset.type !== 'terrain') {
                    const div = document.createElement('div');
                    div.className = 'item-container';
                    div.dataset.object = key;
                    div.innerHTML = `
                        <div class="object-swatch"><img src="${asset.src}" alt="${asset.name}"></div>
                        <span class="item-label">${asset.name}</span>
                    `;
                     div.addEventListener('click', () => {
                        selectedObject = key;
                        document.querySelectorAll('#objectSelector .item-container').forEach(el => el.classList.remove('active'));
                        div.classList.add('active');
                    });
                    objectSelector.appendChild(div);
                }
            });
        }
    }

    function handleAddNewMap(isDefault = false) {
        if (isDefault) {
            const defaultMapId = `map_${Date.now()}`;
            const newMap = createNewMapData("Default Map", 50, 50);
            state.project.maps[defaultMapId] = newMap;
            state.setActiveMapId(defaultMapId);
            activeLayerId = newMap.layers[0].id;
            return;
        }
        // Show modal for user input
        newMapModal.classList.remove('hidden');
    }

    function createNewMapData(name, width, height) {
        const newMap = {
            id: `map_${Date.now()}`,
            name: name,
            width: width,
            height: height,
            grid: {},
            layers: [
                { id: `layer_${Date.now()}`, name: 'Ground', visible: true, data: {}, objects: [] }
            ],
            walls: [],
            tokens: [],
            labels: [],
            drawings: [],
            fog: { revealedRects: [] },
            parentId: null,
            children: []
        };
        // Populate grid
        const size = Math.max(width, height);
        for (let q = -size; q <= size; q++) {
            for (let r = -size; r <= size; r++) {
                if (Math.abs(q + r) <= size) {
                    newMap.grid[`${q},${r}`] = {};
                }
            }
        }
        return newMap;
    }

    if(confirmNewMapBtn) confirmNewMapBtn.addEventListener('click', () => {
        const name = newMapNameInput.value || 'Untitled Map';
        const width = parseInt(newMapWidthInput.value) || 50;
        const height = parseInt(newMapHeightInput.value) || 50;
        const newMapId = `map_${Date.now()}`;
        state.project.maps[newMapId] = createNewMapData(name, width, height);
        state.setActiveMapId(newMapId);
        newMapModal.classList.add('hidden');
        // You would also update the atlas panel here
        drawAll();
    });

    if(cancelNewMapBtn) cancelNewMapBtn.addEventListener('click', () => {
        newMapModal.classList.add('hidden');
    });

    if(addNewMapBtn) addNewMapBtn.addEventListener('click', () => handleAddNewMap());

    document.addEventListener('mapStateUpdated', drawAll);

    initialize();
});
