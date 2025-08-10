// Version 4.38 - Hide AI Panel if No API Key is Present
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
    let isDraggingWallEndpoint = false;
    let autoSaveInterval = null;
    let contextMapId = null;
    let draggedLayerIndex = null;
    let currentEraserMode = 'terrain';

    // --- Function Definitions ---

    // NEW: Function to control AI panel visibility
    function toggleAIPanelVisibility() {
        if (state.apiKey && state.apiKey.trim() !== '') {
            aiBottomPanel.style.display = '';
        } else {
            aiBottomPanel.style.display = 'none';
        }
    }

    // ... (All other functions remain the same) ...
    
    async function initialize() {
        state.setState({ apiKey: localStorage.getItem('mapMakerApiKey') || '' });
        toggleAIPanelVisibility(); // Check visibility on startup
        togglePanel(false);
        addEventListeners();
        
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
            state.showModal(`Critical Error: Could not load core game files (terrains.json or assets.json). The application cannot start. Please check the files are present and correctly formatted.`);
            return;
        }

        requestAnimationFrame(async () => {
            resizeCanvas();
            await Promise.all([initializePatterns(ctx), loadAssets()]);
            checkForRecovery(); 
            if (autoSaveInterval) clearInterval(autoSaveInterval);
            autoSaveInterval = setInterval(autoSaveProject, 60000);
        });
    }

    function addEventListeners() {
        // ... (all other event listeners are unchanged)

        // MODIFIED: saveApiKeyBtn listener to update AI panel visibility
        saveApiKeyBtn.addEventListener('click', () => {
            const key = apiKeyInput.value; // Don't trim, some keys might have spaces
            state.setState({ apiKey: key });
            localStorage.setItem('mapMakerApiKey', key);
            apiKeyModal.classList.add('hidden');
            state.showToast("API Key saved.", "info");
            toggleAIPanelVisibility(); // Update visibility after saving
        });
    }
    
    // ... (rest of the file is unchanged)
    
    initialize();
});
