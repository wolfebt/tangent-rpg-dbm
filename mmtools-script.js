// Version 12.0 - Implemented Free-form Circular Brush for Terrain
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
    
    // Tools
    const toolTerrainBtn = document.getElementById('toolTerrainBtn');
    const toolObjectBtn = document.getElementById('toolObjectBtn');
    const toolPencilBtn = document.getElementById('toolPencilBtn');
    const toolSelectBtn = document.getElementById('toolSelectBtn');
    const toolTokenBtn = document.getElementById('toolTokenBtn');
    const toolTextBtn = document.getElementById('toolTextBtn');
    const toolFogBtn = document.getElementById('toolFogBtn');

    // Options Panels
    const terrainContentPanel = document.getElementById('terrainContentPanel');
    const objectOptionsPanel = document.getElementById('objectOptionsPanel');
    const pencilOptionsPanel = document.getElementById('pencilOptionsPanel');
    const tokenOptionsPanel = document.getElementById('tokenOptionsPanel');
    const fogPanel = document.getElementById('fogPanel');

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
    let isPainting = false;
    let selection = null;
    let assetCache = {};
    let isGmViewActive = true;
    let currentTool = 'terrain';
    let selectedTerrain = 'grass';
    let selectedObject = null;
    let activeLayerId = null;
    let undoStack = [];
    let redoStack = [];
    let visibilityPolygons = [];
    const squareSize = 50; 

    // --- Core Drawing & Rendering ---

    function resizeCanvas() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        const { width, height } = container.getBoundingClientRect();
        
        [canvas, wallCanvas, lightCanvas, drawingCanvas, fogCanvas].forEach(c => {
            c.width = width;
            c.height = height;
        });

        drawAll();
    }

    function drawAll() {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        // Clear canvases
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        wallCtx.clearRect(0, 0, wallCanvas.width, wallCanvas.height);

        // --- Main Map Canvas (Terrain, Objects, Tokens) ---
        ctx.save();
        ctx.translate(view.offsetX, view.offsetY);
        ctx.scale(view.zoom, view.zoom);

        if(activeMap.layers) {
            [...activeMap.layers].reverse().forEach(layer => {
                if (!layer.visible) return;
                drawLayerTerrain(layer, ctx);
                drawPlacedObjects(layer, ctx);
            });
        }
        
        drawTextLabels(ctx);
        drawTokens(ctx);
        
        ctx.restore();

        // --- Drawing Canvas (Grid, Pencil Strokes) ---
        drawingCtx.save();
        drawingCtx.translate(view.offsetX, view.offsetY);
        drawingCtx.scale(view.zoom, view.zoom);
        
        if (gridVisibleCheckbox.checked) {
            drawGrid(drawingCtx);
        }
        drawPencilStrokes(drawingCtx);
        
        drawingCtx.restore();

        // --- Other Overlay Canvases ---
        drawWalls();
        drawLightMask();
        updateFogOfWar();
    }
    window.drawAll = drawAll;

    function drawLayerTerrain(layer, targetCtx) {
        // This function now iterates through terrain placements, which are independent of the grid
        if (!layer.terrainPatches) return;
    
        for (const patch of layer.terrainPatches) {
            const terrain = state.terrains[patch.terrain];
            if (terrain) {
                if (terrain.canvasPatternObject) {
                    targetCtx.fillStyle = terrain.canvasPatternObject;
                } else if (terrain.color) {
                    targetCtx.fillStyle = terrain.color;
                } else {
                    continue;
                }
    
                targetCtx.beginPath();
                targetCtx.arc(patch.x, patch.y, patch.radius, 0, 2 * Math.PI);
                targetCtx.fill();
            }
        }
    }
    

    function drawGrid(targetCtx) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;
        
        targetCtx.strokeStyle = gridColorPicker.value;
        targetCtx.lineWidth = 1;

        const startX = Math.floor((-view.offsetX / view.zoom) / squareSize);
        const startY = Math.floor((-view.offsetY / view.zoom) / squareSize);
        const endX = Math.ceil((canvas.width - view.offsetX) / view.zoom / squareSize);
        const endY = Math.ceil((canvas.height - view.offsetY) / view.zoom / squareSize);
        
        targetCtx.beginPath();
        for (let x = startX; x <= endX; x++) {
            targetCtx.moveTo(x * squareSize, startY * squareSize);
            targetCtx.lineTo(x * squareSize, endY * squareSize);
        }
        for (let y = startY; y <= endY; y++) {
            targetCtx.moveTo(startX * squareSize, y * squareSize);
            targetCtx.lineTo(endX * squareSize, y * squareSize);
        }
        targetCtx.stroke();
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
                }
                targetCtx.stroke();
            }
        });
    }

    function drawTokens(targetCtx) {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.tokens) return;
        
        activeMap.tokens.forEach(token => {
            targetCtx.fillStyle = token.color;
            targetCtx.beginPath();
            targetCtx.arc(token.x, token.y, squareSize / 2, 0, 2 * Math.PI);
            targetCtx.fill();
            targetCtx.strokeStyle = 'black';
            targetCtx.lineWidth = 2;
            targetCtx.stroke();
        });
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
        visibilityPolygons = [];
        drawAll();
    }

    function updateFogOfWar() {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.fog) return;

        if (isGmViewActive) {
            fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
            return;
        }

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

    function gridToPixel(x, y) {
        return { px: x * squareSize, py: y * squareSize };
    }

    function pixelToGrid(px, py) {
        return { x: Math.floor(px / squareSize), y: Math.floor(py / squareSize) };
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

    function applyTool(coords) {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeLayerId) return;
    
        const worldCoords = {
            x: (coords.x - view.offsetX) / view.zoom,
            y: (coords.y - view.offsetY) / view.zoom
        };
    
        const activeLayer = activeMap.layers.find(l => l.id === activeLayerId);
        if (!activeLayer) return;
    
        if (currentTool === 'terrain') {
            if (!activeLayer.terrainPatches) {
                activeLayer.terrainPatches = [];
            }
            const brushRadius = parseInt(brushSizeSlider.value) * 5; // Scale brush size for better feel
            activeLayer.terrainPatches.push({
                x: worldCoords.x,
                y: worldCoords.y,
                radius: brushRadius,
                terrain: selectedTerrain
            });
        } else if (currentTool === 'object' && selectedObject) {
            if (!activeLayer.objects) activeLayer.objects = [];
            const newObject = {
                id: `obj_${Date.now()}`,
                assetId: selectedObject,
                x: worldCoords.x,
                y: worldCoords.y,
                rotation: 0,
                scale: 1,
                isGmOnly: objectGmOnlyCheckbox.checked,
                notes: "",
                isContainer: false,
                inventory: []
            };
            activeLayer.objects.push(newObject);
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
    
    
    async function initialize() {
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
            
            if (Object.keys(state.project.maps).length === 0) {
                handleAddNewMap(true); 
            } else {
                const firstMapId = Object.keys(state.project.maps)[0];
                state.setActiveMapId(firstMapId);
                activeLayerId = state.project.maps[firstMapId].layers[0].id;
            }
            
            setupUI();
            updateLayerList();
            resizeCanvas();
            
        } catch (error) {
            console.error("Initialization failed:", error);
            state.showModal("Failed to load essential map data. Please refresh the page.");
        }
    }

    function createTerrainPatterns() {
        return new Promise(resolve => {
            const terrainKeys = Object.keys(state.terrains);
            if (terrainKeys.length === 0) return resolve();
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
                        if (patternsLoaded === terrainKeys.length) resolve();
                    };
                    img.onerror = () => {
                        patternsLoaded++;
                        if (patternsLoaded === terrainKeys.length) resolve();
                    }
                    img.src = "data:image/svg+xml;base64," + window.btoa(s);
                } else {
                    patternsLoaded++;
                    if (patternsLoaded === terrainKeys.length) resolve();
                }
            });
        });
    }

    function switchTool(tool) {
        currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`tool${tool.charAt(0).toUpperCase() + tool.slice(1)}Btn`)?.classList.add('active');

        const toolPanels = [terrainContentPanel, objectOptionsPanel, pencilOptionsPanel, tokenOptionsPanel, textToolPanel, fogPanel];
        toolPanels.forEach(p => p.classList.add('hidden'));

        if (tool === 'terrain') {
            terrainContentPanel.classList.remove('hidden');
        } else if (tool === 'object') {
            objectOptionsPanel.classList.remove('hidden');
        } else if (tool === 'pencil') {
            pencilOptionsPanel.classList.remove('hidden');
        } else if (tool === 'token') {
            tokenOptionsPanel.classList.remove('hidden');
        } else if (tool === 'text') {
            textToolPanel.classList.remove('hidden');
        } else if (tool === 'fog') {
            fogPanel.classList.remove('hidden');
        }
    }
    
    function updateLayerList() {
        const activeMap = state.getActiveMap();
        if (!activeMap) {
            layerList.innerHTML = '';
            return;
        }
        
        layerList.innerHTML = '';
        activeMap.layers.forEach(layer => {
            const layerItem = document.createElement('div');
            layerItem.className = `layer-item ${layer.id === activeLayerId ? 'active' : ''}`;
            layerItem.innerHTML = `
                <span class.layer-label">${layer.name}</span>
                <div class.layer-controls">
                    <button class="layer-visible-btn">${layer.visible ? '👁️' : '🙈'}</button>
                </div>
            `;
            
            layerItem.addEventListener('click', () => {
                activeLayerId = layer.id;
                updateLayerList();
            });

            layerItem.querySelector('.layer-visible-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                drawAll();
                updateLayerList();
            });

            layerList.appendChild(layerItem);
        });
    }


    function setupUI() {
        populateSelectors();
        
        window.addEventListener('resize', resizeCanvas);

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1) { 
                isPanning = true;
                panStart.x = e.clientX - view.offsetX;
                panStart.y = e.clientY - view.offsetY;
                canvas.classList.add('panning');
                e.preventDefault();
            } else if (e.button === 0) {
                 isPainting = true;
                 applyTool({x: e.offsetX, y: e.offsetY});
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isPanning) {
                view.offsetX = e.clientX - panStart.x;
                view.offsetY = e.clientY - panStart.y;
                drawAll();
            } else if (isPainting) {
                applyTool({x: e.offsetX, y: e.offsetY});
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isPanning = false;
            isPainting = false;
            canvas.classList.remove('panning');
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomIntensity = 0.1;
            const wheel = e.deltaY < 0 ? 1 : -1;
            const zoom = Math.exp(wheel * zoomIntensity);
            
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;

            const worldX = (mouseX - view.offsetX) / view.zoom;
            const worldY = (mouseY - view.offsetY) / view.zoom;

            view.zoom *= zoom;
            
            view.offsetX = mouseX - worldX * view.zoom;
            view.offsetY = mouseY - worldY * view.zoom;

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
        gridVisibleCheckbox.addEventListener('change', drawAll);
        gridColorPicker.addEventListener('input', drawAll);

        addLayerBtn.addEventListener('click', () => {
            const activeMap = state.getActiveMap();
            if (!activeMap) return;
            const layerName = prompt("Enter new layer name:", `Layer ${activeMap.layers.length + 1}`);
            if (layerName) {
                const newLayer = { id: `layer_${Date.now()}`, name: layerName, visible: true, data: {}, objects: [] };
                activeMap.layers.unshift(newLayer); 
                activeLayerId = newLayer.id;
                updateLayerList();
            }
        });
        
        deleteLayerBtn.addEventListener('click', () => {
            const activeMap = state.getActiveMap();
            if (!activeMap || activeMap.layers.length <= 1) {
                state.showModal("Cannot delete the last layer.");
                return;
            }
            if (confirm(`Are you sure you want to delete layer "${activeMap.layers.find(l => l.id === activeLayerId).name}"?`)) {
                activeMap.layers = activeMap.layers.filter(l => l.id !== activeLayerId);
                activeLayerId = activeMap.layers[0].id;
                updateLayerList();
                drawAll();
            }
        });


        // Tool selection
        toolTerrainBtn.addEventListener('click', () => switchTool('terrain'));
        toolObjectBtn.addEventListener('click', () => switchTool('object'));
        toolPencilBtn.addEventListener('click', () => switchTool('pencil'));
        toolSelectBtn.addEventListener('click', () => switchTool('select'));
        toolTokenBtn.addEventListener('click', () => switchTool('token'));
        toolTextBtn.addEventListener('click', () => switchTool('text'));
        toolFogBtn.addEventListener('click', () => switchTool('fog'));

        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                content.classList.toggle('hidden');
                header.classList.toggle('collapsed');
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

                const swatchCanvas = document.createElement('canvas');
                swatchCanvas.width = 32;
                swatchCanvas.height = 32;
                const swatchCtx = swatchCanvas.getContext('2d');
                if (terrain.canvasPatternObject) {
                    swatchCtx.fillStyle = terrain.canvasPatternObject;
                } else {
                    swatchCtx.fillStyle = terrain.color;
                }
                swatchCtx.fillRect(0,0,32,32);
                
                div.innerHTML = `
                    <div class="texture-swatch" style="background-image: url(${swatchCanvas.toDataURL()});"></div>
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
                if (asset.type !== 'terrain' && asset.src) {
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
        newMapModal.classList.remove('hidden');
    }

    function createNewMapData(name, width, height) {
        const newMap = {
            id: `map_${Date.now()}`, name, width, height, grid: {},
            layers: [{ id: `layer_${Date.now()}`, name: 'Ground', visible: true, data: {}, objects: [], terrainPatches: [] }],
            walls: [], tokens: [], labels: [], drawings: [],
            fog: { revealedRects: [] }, parentId: null, children: []
        };
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                newMap.grid[`${x},${y}`] = {};
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
        activeLayerId = state.project.maps[newMapId].layers[0].id;
        newMapModal.classList.add('hidden');
        updateLayerList();
        drawAll();
    });

    if(cancelNewMapBtn) cancelNewMapBtn.addEventListener('click', () => {
        newMapModal.classList.add('hidden');
    });

    if(addNewMapBtn) addNewMapBtn.addEventListener('click', () => handleAddNewMap());

    document.addEventListener('mapStateUpdated', () => {
        updateLayerList();
        drawAll();
    });

    initialize();
});

