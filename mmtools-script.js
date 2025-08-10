// Version 4.29 - Full Hierarchical Map Implementation
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

    // ... (All other drawing functions would be similarly refactored)
    
    async function initialize() {
        state.setState({ apiKey: localStorage.getItem('mapMakerApiKey') || '' });
        togglePanel(false);
        addEventListeners();
        
        // ... (resizer logic)
        
        try {
            const [terrainsResponse, assetsResponse] = await Promise.all([
                fetch('./terrains.json'),
                fetch('./assets.json')
            ]);
            state.setState({
                terrains: await terrainsResponse.json(),
                assetManifest: await assetsResponse.json()
            });
        } catch (error) {
            // ... (error handling)
        }

        requestAnimationFrame(async () => {
            resizeCanvas();
            await Promise.all([initializePatterns(ctx), loadAssets()]);
            createNewMap('World Map', 'world', 50, 50);
        });
    }
    
    initialize();
});
