// Version 5.6 - Phase 2, Part 3: AI Workflow Enhancements
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
    const mapLinkSelect = document.getElementById('mapLinkSelect');
    const setMapLinkBtn = document.getElementById('setMapLinkBtn');
    const removeMapLinkBtn = document.getElementById('removeMapLinkBtn');
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

    // Asset Editor UI
    const assetEditorCloseBtn = document.getElementById('asset-editor-close-btn');
    const assetGenerateBtn = document.getElementById('asset-generate-btn');
    const assetPromptInput = document.getElementById('asset-prompt');
    const assetCanvasMain = document.getElementById('asset-canvas-main');
    const assetCanvasDraw = document.getElementById('asset-canvas-draw');
    const assetCtxMain = assetCanvasMain.getContext('2d');
    const assetCtxDraw = assetCanvasDraw.getContext('2d');
    const assetExportBtn = document.getElementById('asset-export-btn');
    const assetExportOutput = document.getElementById('asset-export-output');
    const assetNameInput = document.getElementById('asset-name');
    const assetTagsInput = document.getElementById('asset-tags');
    const assetTypeSelect = document.getElementById('asset-type-select');
    const assetLoadingOverlay = document.getElementById('loading-overlay');


    // --- Local State ---
    let view = { zoom: 1, offsetX: 0, offsetY: 0 };
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let isDrawingShape = false;
    let shapeStartPoint = null;
    let previewCanvas = document.createElement('canvas');
    let previewCtx = previewCanvas.getContext('2d');
    let isPainting = false;
    let isPenciling = false;
    let currentPencilPath = null;
    let selectedPlacedAssetIndex = null;
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
    let selectedTokenIndex = -1;
    let isDraggingToken = false;
    let isDrawingPolygon = false;
    let currentPolygonPoints = [];
    let selectedWall = { index: -1, point: null };
    let isDraggingWallEndpoint = false;
    let autoSaveInterval = null;
    let contextMapId = null;
    let draggedLayerIndex = null;
    let currentEraserMode = 'terrain';
    let currentTool = 'terrain';
    let selectedTerrain = 'grass';
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
        drawLayers(ctx);
        ctx.restore();

        drawingCtx.save();
        drawingCtx.translate(view.offsetX, view.offsetY);
        drawingCtx.scale(view.zoom, view.zoom);
        if (gridVisibleCheckbox.checked) {
            drawGrid(drawingCtx);
        }
        drawingCtx.restore();

        drawWalls();
        updateFogOfWar();
    }

    function drawLayers(targetCtx) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        const { minPxX, minPxY, mapPixelWidth, mapPixelHeight } = getMapPixelBounds();
        const hexSize = 30;

        activeMap.layers.forEach(layer => {
            if (!layer.visible) return;

            if (layer.backgroundImage && layer.backgroundImage.src) {
                const img = assetCache[layer.backgroundImage.src];
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
        });
    }

    function drawGrid(targetCtx) {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeMap.grid) return;
        
        targetCtx.strokeStyle = gridColorPicker.value;
        targetCtx.lineWidth = 1 / view.zoom;

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
        wallCtx.lineWidth = 5 / view.zoom;
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

    function setActiveTool(toolName) {
        currentTool = toolName;
        const toolButtons = [toolTerrainBtn, toolPencilBtn, toolSelectBtn, toolWallBtn, toolTokenBtn, toolInteractBtn, eraserToolBtn, toolFogRevealBtn, toolFogHideBtn];
        toolButtons.forEach(btn => btn.classList.remove('active'));
        [terrainOptionsPanel, pencilOptionsPanel, tokenOptionsPanel].forEach(p => p.classList.add('hidden'));
        
        switch(toolName) {
            case 'terrain': toolTerrainBtn.classList.add('active'); terrainOptionsPanel.classList.remove('hidden'); canvas.style.cursor = 'crosshair'; break;
            case 'pencil': toolPencilBtn.classList.add('active'); pencilOptionsPanel.classList.remove('hidden'); canvas.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h9'/><path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/></svg>") 0 24, auto`; break;
            case 'select': toolSelectBtn.classList.add('active'); canvas.style.cursor = 'default'; break;
            case 'wall': toolWallBtn.classList.add('active'); canvas.style.cursor = 'crosshair'; break;
            case 'token': toolTokenBtn.classList.add('active'); tokenOptionsPanel.classList.remove('hidden'); canvas.style.cursor = 'copy'; break;
            case 'interact': toolInteractBtn.classList.add('active'); canvas.style.cursor = 'pointer'; break;
            case 'eraser': eraserToolBtn.classList.add('active'); terrainOptionsPanel.classList.remove('hidden'); break;
            case 'fog-reveal': toolFogRevealBtn.classList.add('active'); break;
            case 'fog-hide': toolFogHideBtn.classList.add('active'); break;
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
            const gridCoords = pixelToGridCoords(coords.x, coords.y);
            const key = `${gridCoords.q},${gridCoords.r}`;
            if (activeMap.grid[key]) {
                let targetLayer = activeMap.layers[0];
                if (targetLayer) {
                    if (!targetLayer.data[key]) targetLayer.data[key] = {};
                    targetLayer.data[key].terrain = selectedTerrain;
                }
            }
        } else if (currentTool === 'wall' && startCoords) {
            const worldStartCoords = {
                x: (startCoords.x - view.offsetX) / view.zoom,
                y: (startCoords.y - view.offsetY) / view.zoom
            };
            activeMap.walls.push({ start: worldStartCoords, end: worldCoords });
        } else if (currentTool === 'fog-reveal' && startCoords) {
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
                state.activeMapId = map.id;
                renderAtlas();
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

        state.project.maps[mapId] = {
            id: mapId, name: mapName, grid: newGrid,
            layers: [{ id: `layer_${Date.now()}`, name: 'Ground', visible: true, data: {}, backgroundImage: null }],
            tokens: [], walls: [], drawings: [], fog: { revealedRects: [] },
        };
        
        state.activeMapId = mapId;
        renderAtlas();
        drawAll();
        newMapModal.classList.add('hidden');
    }

    function populateMapLinkDropdown() {
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
    
    function openAssetEditor() {
        assetEditorOverlay.classList.remove('hidden');
        assetCtxMain.clearRect(0, 0, 512, 512);
        assetCtxDraw.clearRect(0, 0, 512, 512);
        assetExportOutput.value = '';
        assetNameInput.value = '';
        assetTagsInput.value = '';
    }

    function closeAssetEditor() {
        assetEditorOverlay.classList.add('hidden');
    }

    async function handleAssetAIGeneration() {
        const prompt = assetPromptInput.value;
        if (!prompt) {
            state.showModal("Please enter a prompt for the asset.");
            return;
        }
        
        const fullPrompt = `${prompt}, icon, white background, simple, clear outline, 2d, game asset`;
        
        assetLoadingOverlay.classList.remove('hidden');
        const generatedImageBase64 = await callImageGenerationAI(fullPrompt);
        assetLoadingOverlay.classList.add('hidden');

        if (generatedImageBase64) {
            const img = new Image();
            img.onload = () => {
                assetCtxMain.clearRect(0, 0, 512, 512);
                assetCtxMain.drawImage(img, 0, 0, 512, 512);
            };
            img.src = `data:image/png;base64,${generatedImageBase64}`;
        }
    }

    function handleAssetExport() {
        const name = assetNameInput.value || 'new-asset';
        const tags = assetTagsInput.value.split(',').map(t => t.trim()).filter(t => t);
        const type = assetTypeSelect.value;

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 512;
        finalCanvas.height = 512;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(assetCanvasMain, 0, 0);
        finalCtx.drawImage(assetCanvasDraw, 0, 0);

        const dataUrl = finalCanvas.toDataURL('image/png');

        const safeName = name.toLowerCase().replace(/\s+/g, '_');
        const exportObj = {
            [safeName]: {
                name: name,
                src: dataUrl,
                tags: tags
            }
        };

        assetExportOutput.value = JSON.stringify(exportObj, null, 2).slice(1, -1) + ',';
    }


    async function initialize() {
        state.setState({ apiKey: localStorage.getItem('mapMakerApiKey') || '' });
        
        try {
            const [terrainsResponse, assetsResponse] = await Promise.all([ fetch('./terrains.json'), fetch('./assets.json') ]);
            if (!terrainsResponse.ok || !assetsResponse.ok) throw new Error('Failed to load core asset/terrain files.');
            state.setState({ terrains: await terrainsResponse.json(), assetManifest: await assetsResponse.json() });
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
            }
            
            addEventListeners();
            renderAtlas();
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
    function drawTokens(){}
    function drawSelectionHighlights(){}
    function updateBreadcrumbs(){}
    
    function addEventListeners() {
        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('aiImageGenerated', handleAIImage);
        document.addEventListener('requestStateSave', saveState);
        undoBtn.addEventListener('click', undo);
        redoBtn.addEventListener('click', redo);
        resetViewBtn.addEventListener('click', centerView);

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

        toolTerrainBtn.addEventListener('click', () => setActiveTool('terrain'));
        toolPencilBtn.addEventListener('click', () => setActiveTool('pencil'));
        toolSelectBtn.addEventListener('click', () => setActiveTool('select'));
        toolWallBtn.addEventListener('click', () => setActiveTool('wall'));
        toolTokenBtn.addEventListener('click', () => setActiveTool('token'));
        toolInteractBtn.addEventListener('click', () => setActiveTool('interact'));
        eraserToolBtn.addEventListener('click', () => setActiveTool('eraser'));
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
        assetEditorCloseBtn.addEventListener('click', closeAssetEditor);
        assetGenerateBtn.addEventListener('click', handleAssetAIGeneration);
        assetExportBtn.addEventListener('click', handleAssetExport);

        canvas.addEventListener('contextmenu', e => e.preventDefault());
        canvas.addEventListener('mousedown', e => {
            if (e.button === 2) {
                isPanning = true;
                panStart = { x: e.clientX, y: e.clientY };
                canvas.classList.add('panning');
                return;
            }
            if (e.button === 0) {
                saveState();
                isPainting = true;
                shapeStartPoint = { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };
                if(currentTool === 'terrain') {
                    const coords = pixelToGridCoords(shapeStartPoint.x, shapeStartPoint.y);
                    applyTool(coords);
                }
            }
        });
        
        canvas.addEventListener('mousemove', e => {
            if (isPanning) {
                view.offsetX += e.clientX - panStart.x;
                view.offsetY += e.clientY - panStart.y;
                panStart = { x: e.clientX, y: e.clientY };
                drawAll();
            } else if (isPainting && currentTool === 'terrain') {
                const coords = pixelToGridCoords(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
                applyTool(coords);
            }
        });
        
        canvas.addEventListener('mouseup', e => {
            if (e.button === 2) { isPanning = false; canvas.classList.remove('panning'); }
            if (e.button === 0) {
                if (isPainting && (currentTool === 'wall' || currentTool.startsWith('fog-'))) {
                    const endCoords = { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };
                    applyTool(endCoords, shapeStartPoint);
                }
                isPainting = false;
                shapeStartPoint = null;
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            isPanning = false;
            isPainting = false;
            canvas.classList.remove('panning');
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
    }

    initialize();
});
