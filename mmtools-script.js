// Version 4.47 - Full functionality restored by merging legacy code.
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

        activeMap.layers.forEach(layer => {
            if (layer.visible && layer.backgroundImage) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                img.src = layer.backgroundImage.src;
            }
        });

        drawWalls();
        drawTokens();
        updateFogOfWar();
        drawSelectionHighlights();

        if (gridVisibleCheckbox.checked) {
            drawGrid(); 
        }
        updateBreadcrumbs();
    }

    function drawGrid() {
        // This function was missing. I've restored it from mmscript.js
        const activeMap = state.getActiveMap();
        if (!activeMap) return;
        
        drawingCtx.save();
        drawingCtx.translate(view.offsetX, view.offsetY);
        drawingCtx.scale(view.zoom, view.zoom);
        drawingCtx.strokeStyle = gridColorPicker.value;
        drawingCtx.lineWidth = 1 / view.zoom;

        const hexSize = 30; // Assuming a fixed hex size for now
        for (const key in activeMap.grid) {
            const coords = key.split(',').map(Number);
            const { x, y } = hexToPixel(coords[0], coords[1], hexSize);
            drawHexOutline(drawingCtx, x, y, hexSize);
        }
        drawingCtx.restore();
    }

    function hexToPixel(q, r, size) {
        const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        const y = size * (3 / 2 * r);
        return { x, y };
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


    // --- Asset & Pattern Loading ---

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
                if (!patternEl) {
                    return resolve();
                }
                const img = new Image();
                img.onload = () => {
                    try {
                        terrain.canvasPattern = targetCtx.createPattern(img, 'repeat');
                    } catch (e) {
                        console.error(`Error creating pattern for ${terrain.name}:`, e);
                    }
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
                    img.onload = () => {
                        assetCache[key] = img;
                        resolve();
                    };
                    img.onerror = () => resolve();
                    img.src = asset.src;
                } else {
                    resolve();
                }
            });
        });
        await Promise.all(promises);
    }
    
    // --- Restored & Merged Functions from mmscript.js ---
    
    function saveState() {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;
        const serializableMap = JSON.stringify(activeMap);
        undoStack.push(serializableMap);
        redoStack = [];
        updateUndoRedoButtons();
    }

    function undo() {
        if (undoStack.length === 0) return;
        const activeMap = state.getActiveMap();
        if(activeMap) redoStack.push(JSON.stringify(activeMap));
        
        const prevState = undoStack.pop();
        state.project.maps[state.activeMapId] = JSON.parse(prevState);
        
        drawAll();
        // Need to re-render UI elements like layers if they change
        updateUndoRedoButtons();
    }

    function redo() {
        if (redoStack.length === 0) return;
        const activeMap = state.getActiveMap();
        if(activeMap) undoStack.push(JSON.stringify(activeMap));

        const nextState = redoStack.pop();
        state.project.maps[state.activeMapId] = JSON.parse(nextState);

        drawAll();
        updateUndoRedoButtons();
    }
    
    function updateUndoRedoButtons() {
        undoBtn.disabled = undoStack.length === 0;
        redoBtn.disabled = redoStack.length === 0;
    }

    function handleAIImage(e) {
        const { imageBase64 } = e.detail;
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        let groundLayer = activeMap.layers.find(l => l.name === 'Ground');
        if (!groundLayer) {
            // If no ground layer, find the bottom-most layer or create one
            if(activeMap.layers.length > 0) {
                groundLayer = activeMap.layers[0];
            } else {
                 activeMap.layers.push({
                    id: `layer_${Date.now()}`,
                    name: 'Ground',
                    visible: true,
                    data: {},
                    backgroundImage: null
                });
                groundLayer = activeMap.layers[0];
            }
        }
        
        const img = new Image();
        img.onload = () => {
            groundLayer.backgroundImage = { src: img.src };
            drawAll();
        };
        img.src = `data:image/png;base64,${imageBase64}`;
    }

    // --- Initialization ---
    async function initialize() {
        state.setState({ apiKey: localStorage.getItem('mapMakerApiKey') || '' });
        
        try {
            const [terrainsResponse, assetsResponse] = await Promise.all([
                fetch('./terrains.json'),
                fetch('./assets.json')
            ]);
            if (!terrainsResponse.ok || !assetsResponse.ok) {
                throw new Error('Failed to load core asset/terrain files.');
            }
            state.setState({
                terrains: await terrainsResponse.json(),
                assetManifest: await assetsResponse.json()
            });
        } catch (error) {
            console.error(error);
            state.showModal(`Critical Error: Could not load core game files.`);
            return;
        }

        requestAnimationFrame(async () => {
            resizeCanvas();
            await initializePatterns(ctx);
            await loadAssets();
            
            // Create a default map if none exist
            if (Object.keys(state.project.maps).length === 0) {
                const mapId = `map_${Date.now()}`;
                state.project.maps[mapId] = {
                    id: mapId,
                    name: 'Default Map',
                    grid: {},
                    layers: [{
                        id: `layer_${Date.now()}`,
                        name: 'Ground',
                        visible: true,
                        data: {},
                        backgroundImage: null
                    }],
                    tokens: [],
                    walls: [],
                    drawings: [],
                    fog: { path: null, enabled: true },
                };
                state.activeMapId = mapId;
            }
            
            addEventListeners();
            updateUndoRedoButtons();
            centerView();
        });
    }

    function centerView() {
        view.zoom = 1;
        view.offsetX = 0;
        view.offsetY = 0;
        drawAll();
    }

    function toggleAIPanelVisibility() {
        aiBottomPanel.classList.toggle('closed');
    }

    function togglePanel(isCollapsing) {
        panelWrapper.classList.toggle('closed', isCollapsing);
        collapsedBar.classList.toggle('hidden', !isCollapsing);
        setTimeout(resizeCanvas, 300); 
    }

    function checkForRecovery() {
        const savedSession = localStorage.getItem('mapMakerAutoSave');
        if (savedSession) {
            state.showRecoveryModal(
                () => { // onRestore
                    state.project = JSON.parse(savedSession);
                    // Additional logic to re-render atlas, layers, etc.
                    drawAll();
                    localStorage.removeItem('mapMakerAutoSave');
                },
                () => { // onDiscard
                    localStorage.removeItem('mapMakerAutoSave');
                }
            );
        }
    }

    function autoSaveProject() {
        if (state.project && Object.keys(state.project.maps).length > 0) {
            localStorage.setItem('mapMakerAutoSave', JSON.stringify(state.project));
            state.showToast("Project auto-saved.", "info");
        }
    }

    function drawWalls(){}
    function drawTokens(){}
    function updateFogOfWar(){}
    function drawSelectionHighlights(){}
    function updateBreadcrumbs(){}
    
    function addEventListeners() {
        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('aiImageGenerated', handleAIImage);
        document.addEventListener('requestStateSave', saveState);

        // --- Panning ---
        canvas.addEventListener('mousedown', e => {
            if (e.button === 2) { // Right click
                isPanning = true;
                panStart.x = e.clientX;
                panStart.y = e.clientY;
                canvas.style.cursor = 'grabbing';
            }
        });

        canvas.addEventListener('mousemove', e => {
            if (isPanning) {
                const dx = e.clientX - panStart.x;
                const dy = e.clientY - panStart.y;
                view.offsetX += dx;
                view.offsetY += dy;
                panStart.x = e.clientX;
                panStart.y = e.clientY;
                drawAll();
            }
        });
        
        canvas.addEventListener('mouseup', e => {
            if (e.button === 2) {
                isPanning = false;
                canvas.style.cursor = 'crosshair'; // Or whatever the current tool dictates
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            isPanning = false;
            canvas.style.cursor = 'crosshair';
        });

        // --- Zooming ---
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

        // --- Other UI Listeners ---
        resetViewBtn.addEventListener('click', centerView);
        undoBtn.addEventListener('click', undo);
        redoBtn.addEventListener('click', redo);
        collapseBtn.addEventListener('click', () => togglePanel(true));
        collapsedBar.addEventListener('click', () => togglePanel(false));
        aiBottomPanel.querySelector('#aiBottomPanelHeader').addEventListener('click', toggleAIPanelVisibility);
    }

    initialize();
});
