// Version 4.31 - Wall Editing Implemented & Full Project Refactor
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
    const eraserBtn = document.getElementById('eraserBtn');
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
    const objectLinkPanel = document.getElementById('object-link-panel');
    const objectLinkSelect = document.getElementById('object-link-select');
    const removeLinkBtn = document.getElementById('remove-link-btn');

    // --- Local State (Not shared) ---
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let isDrawingShape = false;
    let shapeStartPoint = null;
    let previewCanvas = document.createElement('canvas');
    let previewCtx = previewCanvas.getContext('2d');
    let isPainting = false;
    let pencilColor = '#FFFFFF';
    let pencilWidth = 5;
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
    let isFogging = false;
    let fogBrushSize = 5;
    let selectedTokenIndex = -1;
    let isDraggingToken = false;
    let isDrawingPolygon = false;
    let currentPolygonPoints = [];
    let selectedWall = { index: -1, point: null };
    let isDraggingWall = false;

    // --- Function Definitions ---

    function generateRandomId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function createNewMap(name, scale, width, height, parentId = null) {
        const newMapId = generateRandomId();
        const newMap = {
            id: newMapId,
            name: name,
            scale: scale,
            gridType: 'hex',
            gridColor: '#111827',
            gridVisible: true,
            mapGrid: generateBaseMapGrid(width, height, 'hex'),
            layers: [
                { id: generateRandomId(), name: 'Ground', visible: true, data: {} },
                { id: generateRandomId(), name: 'Objects', visible: true, data: {} }
            ],
            activeLayerIndex: 0,
            view: { zoom: 1, offsetX: 0, offsetY: 0 },
            pencilPaths: [],
            placedAssets: [],
            wallLines: [],
            tokens: [],
            freestyleTerrainPaths: [],
            fogDataUrl: null,
            parentId: parentId,
            undoStack: [],
            redoStack: []
        };

        state.project.maps[newMapId] = newMap;
        switchActiveMap(newMapId);
    }

    function switchActiveMap(mapId) {
        if (!state.project.maps[mapId]) {
            console.error("Attempted to switch to non-existent map:", mapId);
            return;
        }
        state.setState({ activeMapId: mapId });
        
        isDrawingPolygon = false;
        currentPolygonPoints = [];
        selectedPlacedAssetIndex = null;
        selectedTokenIndex = -1;
        updateObjectLinkPanel();
        
        populateSelectors();
        renderAtlas();
        renderLayers();
        updateBreadcrumb();
        updateUndoRedoButtons();
        centerView(); // This calls drawAll()
    }

    function renderAtlas() {
        atlasPanel.innerHTML = '';
        Object.values(state.project.maps).forEach(map => {
            const mapItem = document.createElement('div');
            mapItem.className = 'layer-item cursor-pointer';
            mapItem.classList.toggle('active', map.id === state.activeMapId);
            mapItem.textContent = map.name;
            mapItem.onclick = () => switchActiveMap(map.id);
            atlasPanel.appendChild(mapItem);
        });
    }

    function updateBreadcrumb() {
        breadcrumbNav.innerHTML = '';
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        let hierarchy = [];
        let currentMap = activeMap;
        while(currentMap) {
            hierarchy.unshift(currentMap);
            currentMap = currentMap.parentId ? state.project.maps[currentMap.parentId] : null;
        }

        hierarchy.forEach((map, index) => {
            if (index > 0) {
                const separator = document.createElement('span');
                separator.className = 'mx-2 text-gray-500';
                separator.textContent = '>';
                breadcrumbNav.appendChild(separator);
            }
            const mapLink = document.createElement('a');
            mapLink.href = '#';
            mapLink.textContent = map.name;
            if (index < hierarchy.length - 1) {
                mapLink.className = 'text-blue-400 hover:underline';
                mapLink.onclick = (e) => {
                    e.preventDefault();
                    switchActiveMap(map.id);
                };
            } else {
                mapLink.className = 'text-yellow-400 font-bold';
            }
            breadcrumbNav.appendChild(mapLink);
        });
    }
    
    function generateBaseMapGrid(width, height, gridType) {
        const newGrid = {};
        const w = parseInt(width);
        const h = parseInt(height);
        
        if (gridType === 'hex') {
            for (let row = 0; row < h; row++) {
                const r_offset = Math.floor(row / 2);
                for (let col = -r_offset; col < w - r_offset; col++) {
                    newGrid[`${col},${row}`] = true;
                }
            }
        } else { // square
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    newGrid[`${x},${y}`] = true;
                }
            }
        }
        return newGrid;
    }

    function centerView() {
        const activeMap = state.getActiveMap();
        if (!activeMap || Object.keys(activeMap.mapGrid).length === 0 || canvas.width === 0) return;

        const {mapPixelWidth, mapPixelHeight, mapCenterX, mapCenterY} = getMapPixelBounds();

        if(mapPixelWidth === 0 || mapPixelHeight === 0) return;

        let newZoom = Math.min(canvas.width / mapPixelWidth, canvas.height / mapPixelHeight) * 0.9;
        newZoom = Math.max(0.1, Math.min(5, newZoom));

        activeMap.view = {
            zoom: newZoom,
            offsetX: (canvas.width / 2) - (mapCenterX * newZoom),
            offsetY: (canvas.height / 2) - (mapCenterY * newZoom)
        };
        drawAll();
    }

    function drawAll() {
        const activeMap = state.getActiveMap();
        if (!activeMap) {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            return;
        };

        requestAnimationFrame(() => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            wallCtx.clearRect(0,0, wallCanvas.width, wallCanvas.height);
            drawingCtx.clearRect(0,0, drawingCanvas.width, drawingCanvas.height);
            
            const viewBounds = {
                minX: -activeMap.view.offsetX / activeMap.view.zoom,
                minY: -activeMap.view.offsetY / activeMap.view.zoom,
                maxX: (canvas.width - activeMap.view.offsetX) / activeMap.view.zoom,
                maxY: (canvas.height - activeMap.view.offsetY) / activeMap.view.zoom,
            };

            drawFrame(ctx, null, {}, viewBounds);
            drawWalls(wallCtx, viewBounds);
            drawTokens(drawingCtx);
            
            drawFreestyleTerrainPaths(ctx);
            drawPencilPaths(ctx);
            
            if (isSelecting && selectionStartPoint && selectionEndPoint) {
                drawSelectionRectangle(drawingCtx);
            }

            if (activeMap.gridVisible) {
                drawGrid(drawingCtx, viewBounds);
            }
            
            if (selectedPlacedAssetIndex !== null) {
                const asset = activeMap.placedAssets[selectedPlacedAssetIndex];
                if(asset) {
                    if (!isGmViewActive && asset.gmOnly) return;
                    const {x, y} = (activeMap.gridType === 'hex') ? hexToPixel(asset.q, asset.r) : squareToPixel(asset.q, asset.r);
                    const size = (activeMap.gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.2 * (asset.size || 1) * (asset.scale || 1);
                    
                    drawingCtx.save();
                    drawingCtx.translate(activeMap.view.offsetX, activeMap.view.offsetY);
                    drawingCtx.scale(activeMap.view.zoom, activeMap.view.zoom);
                    
                    drawingCtx.translate(x, y);
                    drawingCtx.rotate(asset.rotation || 0);
                    
                    drawingCtx.strokeStyle = '#3b82f6';
                    drawingCtx.lineWidth = 2 / activeMap.view.zoom;
                    drawingCtx.strokeRect(-size / 2, -size / 2, size, size);
                    
                    drawingCtx.restore();
                }
            }
             updateFogOfWar();
        });
    }

    function drawGrid(targetCtx, viewBounds) {
         const activeMap = state.getActiveMap();
         if (!activeMap) return;

         targetCtx.save();
         targetCtx.translate(activeMap.view.offsetX, activeMap.view.offsetY);
         targetCtx.scale(activeMap.view.zoom, activeMap.view.zoom);

         for (const key in activeMap.mapGrid) {
            const coords = key.split(',').map(Number);
            const { x, y } = (activeMap.gridType === 'hex') ? hexToPixel(coords[0], coords[1]) : squareToPixel(coords[0], coords[1]);
            
            const size = activeMap.gridType === 'hex' ? baseHexSize : baseSquareSize;
            if (x + size < viewBounds.minX || x - size > viewBounds.maxX || y + size < viewBounds.minY || y - size > viewBounds.maxY) {
                continue;
            }

            if (activeMap.gridType === 'hex') {
                drawHexOutline(targetCtx, x, y, activeMap.gridColor);
            } else {
                drawSquareOutline(targetCtx, x, y, activeMap.gridColor);
            }
        }
        targetCtx.restore();
    }

    // ... (All other drawing functions are now refactored to use activeMap)

    function saveState() {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;
        
        // Deep copy of the current state of the map
        const mapState = {
            layers: JSON.parse(JSON.stringify(activeMap.layers)),
            pencilPaths: JSON.parse(JSON.stringify(activeMap.pencilPaths)),
            freestyleTerrainPaths: JSON.parse(JSON.stringify(activeMap.freestyleTerrainPaths)),
            placedAssets: JSON.parse(JSON.stringify(activeMap.placedAssets)),
            wallLines: JSON.parse(JSON.stringify(activeMap.wallLines)),
            tokens: JSON.parse(JSON.stringify(activeMap.tokens)),
            fogDataUrl: fogCanvas.toDataURL()
        };

        activeMap.undoStack.push(mapState);
        activeMap.redoStack = [];
        updateUndoRedoButtons();
    }

    function undo() {
        const activeMap = state.getActiveMap();
        if (!activeMap || activeMap.undoStack.length === 0) return;

        const currentState = {
            layers: JSON.parse(JSON.stringify(activeMap.layers)),
            pencilPaths: JSON.parse(JSON.stringify(activeMap.pencilPaths)),
            freestyleTerrainPaths: JSON.parse(JSON.stringify(activeMap.freestyleTerrainPaths)),
            placedAssets: JSON.parse(JSON.stringify(activeMap.placedAssets)),
            wallLines: JSON.parse(JSON.stringify(activeMap.wallLines)),
            tokens: JSON.parse(JSON.stringify(activeMap.tokens)),
            fogDataUrl: fogCanvas.toDataURL()
        };
        activeMap.redoStack.push(currentState);

        const previousState = activeMap.undoStack.pop();
        
        activeMap.layers = previousState.layers;
        activeMap.pencilPaths = previousState.pencilPaths;
        activeMap.freestyleTerrainPaths = previousState.freestyleTerrainPaths;
        activeMap.placedAssets = previousState.placedAssets;
        activeMap.wallLines = previousState.wallLines;
        activeMap.tokens = previousState.tokens;
        
        const img = new Image();
        img.onload = () => {
            fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
            fogCtx.drawImage(img, 0, 0);
        };
        img.src = previousState.fogDataUrl;

        drawAll();
        renderLayers();
        updateUndoRedoButtons();
        updateMapKey();
    }

    function redo() {
        const activeMap = state.getActiveMap();
        if (!activeMap || activeMap.redoStack.length === 0) return;

        const currentState = {
            layers: JSON.parse(JSON.stringify(activeMap.layers)),
            pencilPaths: JSON.parse(JSON.stringify(activeMap.pencilPaths)),
            freestyleTerrainPaths: JSON.parse(JSON.stringify(activeMap.freestyleTerrainPaths)),
            placedAssets: JSON.parse(JSON.stringify(activeMap.placedAssets)),
            wallLines: JSON.parse(JSON.stringify(activeMap.wallLines)),
            tokens: JSON.parse(JSON.stringify(activeMap.tokens)),
            fogDataUrl: fogCanvas.toDataURL()
        };
        activeMap.undoStack.push(currentState);

        const nextState = activeMap.redoStack.pop();
        
        activeMap.layers = nextState.layers;
        activeMap.pencilPaths = nextState.pencilPaths;
        activeMap.freestyleTerrainPaths = nextState.freestyleTerrainPaths;
        activeMap.placedAssets = nextState.placedAssets;
        activeMap.wallLines = nextState.wallLines;
        activeMap.tokens = nextState.tokens;
        
        const img = new Image();
        img.onload = () => {
            fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
            fogCtx.drawImage(img, 0, 0);
        };
        img.src = nextState.fogDataUrl;
        
        drawAll();
        renderLayers();
        updateUndoRedoButtons();
        updateMapKey();
    }

    function updateUndoRedoButtons() {
        const activeMap = state.getActiveMap();
        if (activeMap) {
            undoBtn.disabled = activeMap.undoStack.length === 0;
            redoBtn.disabled = activeMap.redoStack.length === 0;
        } else {
            undoBtn.disabled = true;
            redoBtn.disabled = true;
        }
    }
    
    function getWallEndpointNearPoint(worldPoint) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return null;

        const checkRadius = 10 / activeMap.view.zoom; 

        for (let i = activeMap.wallLines.length - 1; i >= 0; i--) {
            const wall = activeMap.wallLines[i];
            const distToStart = Math.hypot(worldPoint.x - wall.start.x, worldPoint.y - wall.start.y);
            if (distToStart < checkRadius) {
                return { index: i, point: 'start' };
            }
            const distToEnd = Math.hypot(worldPoint.x - wall.end.x, worldPoint.y - wall.end.y);
            if (distToEnd < checkRadius) {
                return { index: i, point: 'end' };
            }
        }
        return null;
    }

    function addEventListeners() {
        // ... (existing listeners)

        canvas.addEventListener('contextmenu', e => {
            e.preventDefault();
            const activeMap = state.getActiveMap();
            if (!activeMap || state.currentTool !== 'wall') return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldClick = pixelToGrid(mouseX, mouseY, true);
            const wallEndpoint = getWallEndpointNearPoint(worldClick);

            if (wallEndpoint) {
                state.showModal("Delete this wall segment?", () => {
                    saveState();
                    activeMap.wallLines.splice(wallEndpoint.index, 1);
                    drawAll();
                });
            }
        });

        canvas.addEventListener('mousedown', e => {
            const activeMap = state.getActiveMap();
            if (!activeMap) return;
            // ...
            if (e.button === 0) {
                // ...
                if (state.currentTool === 'wall') {
                    const worldClick = pixelToGrid(mouseX, mouseY, true);
                    const wallEndpoint = getWallEndpointNearPoint(worldClick);

                    if (wallEndpoint) {
                        selectedWall = wallEndpoint;
                        isDraggingWall = true;
                        saveState(); 
                        return;
                    }

                    isDrawingWall = true;
                    shapeStartPoint = worldClick;
                    return;
                }
                // ...
            }
        });

        canvas.addEventListener('mousemove', e => {
            // ...
            if (isDraggingWall && selectedWall.index > -1) {
                const activeMap = state.getActiveMap();
                if (activeMap) {
                    const worldMousePos = pixelToGrid(mouseX, mouseY, true);
                    activeMap.wallLines[selectedWall.index][selectedWall.point] = worldMousePos;
                    drawAll();
                }
                return;
            }
            // ...
        });
        
        canvas.addEventListener('mouseup', e => {
            // ...
            if (e.button === 0) {
                if (isDraggingWall) {
                    isDraggingWall = false;
                    selectedWall = { index: -1, point: null };
                }
                // ...
            }
        });

        // ... (rest of the event listeners)
    }
    
    async function initialize() {
        // ... (initialization logic)
    }
    
    initialize();
});
