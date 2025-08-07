// Version 4.3 - Mask Tool Upgrade & AI Edit Fix
document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    const maskCanvas = document.getElementById('maskCanvas');
    const maskCtx = maskCanvas.getContext('2d');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const drawingCtx = drawingCanvas.getContext('2d');
    const mapNameInput = document.getElementById('mapNameInput');
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
    const mapWidthInput = document.getElementById('mapWidth');
    const mapHeightInput = document.getElementById('mapHeight');
    const generateBaseMapBtn = document.getElementById('generateBaseMapBtn');
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
    const saveJsonBtn = document.getElementById('saveJsonBtn');
    const loadJsonBtn = document.getElementById('loadJsonBtn');
    const loadJsonInput = document.getElementById('loadJsonInput');
    const toolTerrainBtn = document.getElementById('toolTerrainBtn');
    const toolPencilBtn = document.getElementById('toolPencilBtn');
    const toolMaskBtn = document.getElementById('toolMaskBtn');
    const clearMaskBtn = document.getElementById('clearMaskBtn');
    const terrainOptionsPanel = document.getElementById('terrainOptionsPanel');
    const pencilOptionsPanel = document.getElementById('pencilOptionsPanel');
    const terrainBrushModeSelect = document.getElementById('terrainBrushMode');
    const pencilBrushModeSelect = document.getElementById('pencilBrushMode');
    const pencilColorPicker = document.getElementById('pencilColorPicker');
    const pencilWidthSlider = document.getElementById('pencilWidth');
    const pencilWidthValue = document.getElementById('pencilWidthValue');
    const graphicsBtn = document.getElementById('graphicsBtn');
    const graphicsContent = document.getElementById('graphicsContent');
    const panelWrapper = document.getElementById('panelWrapper');
    const collapseBtn = document.getElementById('collapseBtn');
    const collapsedBar = document.getElementById('collapsedBar');
    const userGuideBtn = document.getElementById('userGuideBtn');
    const accordionHeaders = document.querySelectorAll('.collapsible-header');
    const genreSelector = document.getElementById('genreSelector');
    const scaleSelector = document.getElementById('scaleSelector');
    const settingsBtn = document.getElementById('settingsBtn');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const cancelApiKeyBtn = document.getElementById('cancelApiKey');
    const resizer = document.getElementById('resizer');
    
    // AI Step UI (now in bottom panel)
    const aiBottomPanel = document.getElementById('aiBottomPanel');
    const aiBottomPanelHeader = document.getElementById('aiBottomPanelHeader');
    const aiStep1 = document.getElementById('aiStep1');
    const aiStep2 = document.getElementById('aiStep2');
    const aiStep3 = document.getElementById('aiStep3');
    const generateLandformBtn = document.getElementById('generateLandformBtn');
    const addWaterBtn = document.getElementById('addWaterBtn');
    const applyBiomeBtn = document.getElementById('applyBiomeBtn');
    const aiLandformPrompt = document.getElementById('aiLandformPrompt');
    const aiWaterPrompt = document.getElementById('aiWaterPrompt');
    const aiBiomePrompt = document.getElementById('aiBiomePrompt');
    const artStyleSelect = document.getElementById('artStyle');
    const aiEditPrompt = document.getElementById('aiEditPrompt');
    const applyAiEditBtn = document.getElementById('applyAiEditBtn');
    const lastPromptInput = document.getElementById('lastPromptInput');
    const regenerateBtn = document.getElementById('regenerateBtn');

    // NEW Advanced AI Controls
    const territoryStyleSelect = document.getElementById('territoryStyle');
    const routeNetworkSelect = document.getElementById('routeNetwork');
    const poiDensitySlider = document.getElementById('poiDensity');
    const poiDensityValue = document.getElementById('poiDensityValue');
    const districtStyleCheckboxes = document.getElementById('districtStyleCheckboxes');
    const infrastructureDensitySlider = document.getElementById('infrastructureDensity');
    const infrastructureDensityValue = document.getElementById('infrastructureDensityValue');
    const furnishingsDensitySlider = document.getElementById('furnishingsDensity');
    const furnishingsDensityValue = document.getElementById('furnishingsDensityValue');
    const tacticalCoverSlider = document.getElementById('tacticalCover');
    const tacticalCoverValue = document.getElementById('tacticalCoverValue');
    const hazardDensitySlider = document.getElementById('hazardDensity');
    const hazardDensityValue = document.getElementById('hazardDensityValue');
    const verticalitySelect = document.getElementById('verticality');
    
    // Map Key UI
    const mapKeyBtn = document.getElementById('mapKeyBtn');
    const mapKeyWindow = document.getElementById('mapKeyWindow');
    const mapKeyHeader = document.getElementById('mapKeyHeader');
    const mapKeyContent = document.getElementById('mapKeyContent');
    const mapKeyCloseBtn = document.getElementById('mapKeyCloseBtn');
    const gridTypeSelect = document.getElementById('gridTypeSelect');

    
    // --- Configuration ---
    const baseHexSize = 30; 
    const baseSquareSize = 40;
    
    // --- State ---
    let gridType = 'hex'; // 'hex' or 'square'
    let mapGrid = {}; 
    let mapName = '';
    let layers = [];
    let activeLayerIndex = 0;
    let currentTool = 'terrain';
    let nextClickAction = null;
    let terrainBrushMode = 'hex';
    let pencilBrushMode = 'freestyle';
    let brushSize = 1;
    let selectedTerrain = 'grass';
    let selectedObjectKey = 'fantasy.world.tree';
    let view = { zoom: 1, offsetX: 0, offsetY: 0 };
    let gridColor = '#111827';
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
    let pencilPaths = [];
    let freestyleTerrainPaths = [];
    let currentFreestyleTerrainPath = null;
    let isMasking = false;
    let currentMaskPath = null;
    let maskPaths = [];
    let undoStack = [];
    let redoStack = [];
    let currentGenre = 'fantasy';
    let currentScale = 'world';
    let placedAssets = [];
    let selectedPlacedAssetIndex = null;
    let isDragging = false;
    let dragOffsetX, dragOffsetY;
    let apiKey = '';
    // Map Key State
    let isDraggingKey = false;
    let keyDragOffset = { x: 0, y: 0 };
    // AI State
    let heightmapImage = null;
    let lastAIPrompt = '';
    let lastAIFunction = null;

    // --- Data Definitions ---
    const terrains = {
        water: { color: '#4c92c8', name: 'Water', pattern: 'pattern-water' },
        sand: { color: '#f0d9a0', name: 'Sand', pattern: 'pattern-sand' },
        grass: { color: '#86c440', name: 'Grass', pattern: 'pattern-grass' },
        plains: { color: '#a6d15a', name: 'Plains', pattern: 'pattern-plains' },
        forest: { color: '#4a8232', name: 'Forest', pattern: 'pattern-forest' },
        hills: { color: '#a08b6b', name: 'Hills', pattern: 'pattern-hills' },
        mountain: { color: '#6f6f6f', name: 'Mountain', pattern: 'pattern-mountain' },
        snow: { color: '#ffffff', name: 'Snow', pattern: 'pattern-snow' },
        dirt: { color: '#a07040', name: 'Dirt', pattern: 'pattern-dirt' },
        road: { color: '#b0a89f', name: 'Road', pattern: 'pattern-road' },
        lava: { color: '#e25822', name: 'Lava', pattern: 'pattern-lava' },
        crags: { color: '#5a5a5a', name: 'Crags', pattern: 'pattern-crags' },
        swamp: { color: '#4d6642', name: 'Swamp', pattern: 'pattern-swamp' },
        tundra: { color: '#cdd3d6', name: 'Tundra', pattern: 'pattern-tundra' },
    };

    const objectCategories = {
        "fantasy": {
            "world": { tree: { symbol: '🌳', name: 'Tree' }, rock: { symbol: '🪨', name: 'Rock' }, mountain: { symbol: '🏔️', name: 'Mountain' } },
            "city": { house: { symbol: '🏠', name: 'House' }, shop: { symbol: '🏪', name: 'Shop' }, fountain: { symbol: '⛲', name: 'Fountain' } },
            "location": { door: { symbol: '🚪', name: 'Door' }, stairs: { symbol: '🪜', name: 'Stairs' }, trap: { symbol: '🕸️', name: 'Trap' } },
            "battle": { chest: { symbol: '👑', name: 'Treasure' }, monster: { symbol: '👹', name: 'Monster' }, pillar: { symbol: '🏛️', name: 'Pillar' } }
        },
        "scifi": {
            "world": { alien_tree: { symbol: '🌴', name: 'Alien Flora' }, crystal: { symbol: '💎', name: 'Crystal' }, crater: { symbol: '☄️', name: 'Crater' } },
            "city": { habitat: { symbol: '🛖', name: 'Habitat Dome' }, lab: { symbol: '🔬', name: 'Lab' }, power_plant: { symbol: '⚡', name: 'Power Plant' } },
            "location": { console: { symbol: '💻', name: 'Console' }, stasis_pod: { symbol: '⚰️', name: 'Stasis Pod'}, airlock: { symbol: '🚪', name: 'Airlock'} },
            "battle": { robot: { symbol: '🤖', name: 'Robot' }, alien: { symbol: '👽', name: 'Alien' }, turret: { symbol: '🔫', name: 'Turret' } }
        },
        "modern": {
            "world": { cityscape: { symbol: '🏙️', name: 'Cityscape' }, highway: { symbol: '🛣️', name: 'Highway' }, airport: { symbol: '✈️', name: 'Airport' } },
            "city": { building: { symbol: '🏢', name: 'Building' }, house: { symbol: '🏠', name: 'House' }, park: { symbol: '🌳', name: 'Park' } },
            "location": { desk: { symbol: '💻', name: 'Desk' }, elevator: { symbol: '🛗', name: 'Elevator' }, seccam: { symbol: '📹', name: 'Security Camera' } },
            "battle": { car: { symbol: '🚗', name: 'Car' }, dumpster: { symbol: '🗑️', name: 'Dumpster' }, barricade: { symbol: '🚧', name: 'Barricade' } }
        }
    };

    // --- Function Definitions ---

    function generateRandomId(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function togglePanel(isCollapsing) {
        panelWrapper.classList.toggle('closed', isCollapsing);
        collapsedBar.classList.toggle('hidden', !isCollapsing);
        // Trigger a resize after the transition to redraw canvas correctly
        setTimeout(resizeCanvas, 300); 
    }

    function resizeCanvas() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        drawingCanvas.width = width;
        drawingCanvas.height = height;
        maskCanvas.width = width;
        maskCanvas.height = height;
        previewCanvas.width = width;
        previewCanvas.height = height;
        drawAll();
    }
    
    function generateBaseMap() {
        const width = mapWidthInput.value;
        const height = mapHeightInput.value;
        mapGrid = generateBaseMapGrid(width, height);
        
        layers = [
            { name: 'Ground', visible: true, data: {}, backgroundImage: null }, 
            { name: 'Objects', visible: true, data: {} }
        ];
        pencilPaths = [];
        freestyleTerrainPaths = [];
        maskPaths = [];
        placedAssets = [];
        undoStack = [];
        redoStack = [];
        activeLayerIndex = 0; // Default to ground layer
        mapName = generateRandomId(16);
        mapNameInput.value = mapName;
        renderLayers();
        updateUndoRedoButtons();
        updateMapKey();
        // Reset AI state
        heightmapImage = null;
        updateAiStep(1);
    }

    function generateBaseMapGrid(width, height) {
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
        if (Object.keys(mapGrid).length === 0 || canvas.width === 0) return;

        const {mapPixelWidth, mapPixelHeight, mapCenterX, mapCenterY} = getMapPixelBounds();

        if(mapPixelWidth === 0 || mapPixelHeight === 0) return;

        view.zoom = Math.min(canvas.width / mapPixelWidth, canvas.height / mapPixelHeight) * 0.9;
        view.zoom = Math.max(0.1, Math.min(5, view.zoom));

        view.offsetX = (canvas.width / 2) - (mapCenterX * view.zoom);
        view.offsetY = (canvas.height / 2) - (mapCenterY * view.zoom);
        drawAll();
    }

    function drawAll() {
        requestAnimationFrame(() => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            drawingCtx.clearRect(0,0, drawingCanvas.width, drawingCanvas.height);
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            
            // Draw map content first
            drawFrame(ctx);
            
            // Draw freestyle paths on the main canvas
            drawFreestyleTerrainPaths(ctx);
            drawPencilPaths(ctx);

            // Draw the mask
            drawMaskPaths(maskCtx);

            // Draw mask preview on drawing canvas
            if (isMasking && currentMaskPath) {
                drawMaskPreview(drawingCtx);
            }

            // Draw the grid on the drawing canvas so it's on top
            if (gridVisibleCheckbox.checked) {
                drawGrid(drawingCtx);
            }
            
            // Draw selection highlight for assets
            if (selectedPlacedAssetIndex !== null) {
                const asset = placedAssets[selectedPlacedAssetIndex];
                if(asset) {
                    drawingCtx.save();
                    drawingCtx.translate(view.offsetX, view.offsetY);
                    drawingCtx.scale(view.zoom, view.zoom);
                    drawingCtx.strokeStyle = '#3b82f6';
                    drawingCtx.lineWidth = 2 / view.zoom;
                    const {x, y} = (gridType === 'hex') ? hexToPixel(asset.q, asset.r) : squareToPixel(asset.q, asset.r);
                    const size = (gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.2 * asset.size;
                    drawingCtx.strokeRect(x - size / 2, y - size / 2, size, size);
                    drawingCtx.restore();
                }
            }
        });
    }

    function drawGrid(targetCtx) {
         targetCtx.save();
         targetCtx.translate(view.offsetX, view.offsetY);
         targetCtx.scale(view.zoom, view.zoom);

         for (const key in mapGrid) {
            const coords = key.split(',').map(Number);
            if (gridType === 'hex') {
                const { x, y } = hexToPixel(coords[0], coords[1]);
                drawHexOutline(targetCtx, x, y, gridColor);
            } else {
                const { x, y } = squareToPixel(coords[0], coords[1]);
                drawSquareOutline(targetCtx, x, y, gridColor);
            }
        }
        targetCtx.restore();
    }

    function drawFrame(targetCtx, bounds = null) {
        targetCtx.save();

        if (bounds) { 
            targetCtx.clearRect(0, 0, bounds.width, bounds.height);
            targetCtx.translate(-bounds.minPxX, -bounds.minPxY);
        } else { 
            targetCtx.translate(view.offsetX, view.offsetY);
            targetCtx.scale(view.zoom, view.zoom);
        }

        // Draw layers in order
        layers.forEach(layer => {
            if (!layer.visible) return;

            // Draw background image if it exists for this layer (e.g., ground, water)
            if (layer.backgroundImage && layer.backgroundImage.complete) {
                const { mapPixelWidth, mapPixelHeight, minPxX, minPxY } = getMapPixelBounds();
                targetCtx.drawImage(layer.backgroundImage, minPxX, minPxY, mapPixelWidth, mapPixelHeight);
            }

            // Draw hex/square data for this layer
            for (const key in layer.data) {
                const coords = key.split(',').map(Number);
                const hexData = layer.data[key];
                const {x, y} = (gridType === 'hex') ? hexToPixel(coords[0], coords[1]) : squareToPixel(coords[0], coords[1]);

                if (hexData.terrain) {
                    if (gridType === 'hex') {
                        drawHex(targetCtx, x, y, terrains[hexData.terrain]);
                    } else {
                        drawSquare(targetCtx, x, y, terrains[hexData.terrain]);
                    }
                }
                if (hexData.text) {
                    drawText(targetCtx, x, y, hexData.text, hexData.textSize, hexData.textColor);
                }
            }
        });
        
        placedAssets.forEach(asset => {
            const {x, y} = (gridType === 'hex') ? hexToPixel(asset.q, asset.r) : squareToPixel(asset.q, asset.r);
            drawObject(targetCtx, x, y, asset.symbol, asset.size);
        });
        
        targetCtx.restore();

        if(isDrawingShape && targetCtx === ctx) {
            ctx.drawImage(previewCanvas, 0, 0);
        }
    }
    
    function drawHex(targetCtx, x, y, terrainOrColor) {
        targetCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const corner = getHexCorner({x, y}, baseHexSize, i);
            targetCtx.lineTo(corner.x, corner.y);
        }
        targetCtx.closePath();
        
        if (typeof terrainOrColor === 'string') {
            targetCtx.fillStyle = terrainOrColor;
        } else if (terrainOrColor && terrainOrColor.canvasPattern) {
            targetCtx.fillStyle = terrainOrColor.canvasPattern;
        } else if (terrainOrColor && terrainOrColor.color) {
            targetCtx.fillStyle = terrainOrColor.color;
        }
        targetCtx.fill();
    }

    function drawSquare(targetCtx, x, y, terrainOrColor) {
        if (typeof terrainOrColor === 'string') {
            targetCtx.fillStyle = terrainOrColor;
        } else if (terrainOrColor && terrainOrColor.canvasPattern) {
            targetCtx.fillStyle = terrainOrColor.canvasPattern;
        } else if (terrainOrColor && terrainOrColor.color) {
            targetCtx.fillStyle = terrainOrColor.color;
        }
        targetCtx.fillRect(x - baseSquareSize / 2, y - baseSquareSize / 2, baseSquareSize, baseSquareSize);
    }

    function drawHexOutline(targetCtx, x, y, strokeStyle) {
        targetCtx.beginPath();
        for (let i = 0; i < 6; i++) {
             const corner = getHexCorner({x, y}, baseHexSize, i);
            targetCtx.lineTo(corner.x, corner.y);
        }
        targetCtx.closePath();
        targetCtx.strokeStyle = strokeStyle;
        targetCtx.lineWidth = 1.5 / (targetCtx === ctx ? view.zoom : 1); 
        targetCtx.stroke();
    }

    function drawSquareOutline(targetCtx, x, y, strokeStyle) {
        targetCtx.strokeStyle = strokeStyle;
        targetCtx.lineWidth = 1.5 / (targetCtx === ctx ? view.zoom : 1);
        targetCtx.strokeRect(x - baseSquareSize / 2, y - baseSquareSize / 2, baseSquareSize, baseSquareSize);
    }

     function drawObject(targetCtx, x, y, symbol, size = 1) {
        const objectSize = (gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.2 * size;
        targetCtx.font = `${objectSize}px Arial`;
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText(symbol, x, y);
    }

    function drawText(targetCtx, x, y, text, size, color) {
        targetCtx.font = `${size}px 'Trebuchet MS'`;
        targetCtx.fillStyle = color;
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText(text, x, y);
    }
    
    function drawFreestyleTerrainPaths(targetCtx) {
        targetCtx.save();
        targetCtx.translate(view.offsetX, view.offsetY);
        targetCtx.scale(view.zoom, view.zoom);
        
        const allPaths = [...freestyleTerrainPaths];
        if(isPainting && currentFreestyleTerrainPath) {
            allPaths.push(currentFreestyleTerrainPath);
        }

        allPaths.forEach(path => {
            if (path.points.length < 1) return;
            const terrain = terrains[path.terrain];
            if (!terrain || !terrain.canvasPattern) return;

            targetCtx.strokeStyle = terrain.canvasPattern;
            targetCtx.lineWidth = path.width;
            targetCtx.lineCap = 'round';
            targetCtx.lineJoin = 'round';
            
            if (path.points.length < 2) {
                targetCtx.fillStyle = terrain.canvasPattern;
                targetCtx.beginPath();
                targetCtx.arc(path.points[0].x, path.points[0].y, path.width / 2, 0, 2 * Math.PI);
                targetCtx.fill();
            } else {
                targetCtx.beginPath();
                targetCtx.moveTo(path.points[0].x, path.points[0].y);
                for(let i=1; i < path.points.length; i++) {
                    targetCtx.lineTo(path.points[i].x, path.points[i].y);
                }
                targetCtx.stroke();
            }
        });
        targetCtx.restore();
    }

    function drawPencilPaths(targetCtx) {
        targetCtx.save();
        targetCtx.translate(view.offsetX, view.offsetY);
        targetCtx.scale(view.zoom, view.zoom);
        
        const allPaths = [...pencilPaths];
        if(isPenciling && currentPencilPath) {
            allPaths.push(currentPencilPath);
        }

        allPaths.forEach(path => {
             if (path.type === 'freestyle') {
                if (path.points.length < 2) return;
                targetCtx.beginPath();
                targetCtx.strokeStyle = path.color;
                targetCtx.lineWidth = path.width;
                targetCtx.lineCap = 'round';
                targetCtx.lineJoin = 'round';
                targetCtx.moveTo(path.points[0].x, path.points[0].y);
                for(let i=1; i < path.points.length; i++) {
                    targetCtx.lineTo(path.points[i].x, path.points[i].y);
                }
                targetCtx.stroke();
            } else if (path.type === 'line') {
                targetCtx.beginPath();
                targetCtx.strokeStyle = path.color;
                targetCtx.lineWidth = path.width;
                targetCtx.moveTo(path.start.x, path.start.y);
                targetCtx.lineTo(path.end.x, path.end.y);
                targetCtx.stroke();
            } else if (path.type === 'rectangle') {
                targetCtx.beginPath();
                targetCtx.strokeStyle = path.color;
                targetCtx.lineWidth = path.width;
                targetCtx.rect(path.start.x, path.start.y, path.end.x - path.start.x, path.end.y - path.start.y);
                targetCtx.stroke();
            } else if (path.type === 'ellipse') {
                targetCtx.beginPath();
                targetCtx.strokeStyle = path.color;
                targetCtx.lineWidth = path.width;
                const rx = Math.abs(path.end.x - path.start.x) / 2;
                const ry = Math.abs(path.end.y - path.start.y) / 2;
                const cx = path.start.x + (path.end.x - start.x) / 2;
                const cy = path.start.y + (path.end.y - start.y) / 2;
                targetCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
                targetCtx.stroke();
            }
        });
        targetCtx.restore();
    }

    function drawMaskPaths(targetCtx) {
        targetCtx.save();
        targetCtx.fillStyle = 'rgba(59, 130, 246, 0.5)'; // blue-500 with opacity
        
        maskPaths.forEach(path => {
             if (path.points.length < 3) return;
             targetCtx.beginPath();
             targetCtx.moveTo(path.points[0].x, path.points[0].y);
             for(let i=1; i < path.points.length; i++) {
                 targetCtx.lineTo(path.points[i].x, path.points[i].y);
             }
             targetCtx.closePath();
             targetCtx.fill();
        });
        targetCtx.restore();
    }

    function drawMaskPreview(targetCtx) {
        if (!currentMaskPath || currentMaskPath.points.length < 1) return;
        targetCtx.save();
        targetCtx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
        targetCtx.lineWidth = 2;
        targetCtx.beginPath();
        targetCtx.moveTo(currentMaskPath.points[0].x, currentMaskPath.points[0].y);
        for(let i=1; i < currentMaskPath.points.length; i++) {
            targetCtx.lineTo(currentMaskPath.points[i].x, currentMaskPath.points[i].y);
        }
        targetCtx.stroke();
        targetCtx.restore();
    }

    function getMapPixelBounds() {
        let minPxX = Infinity, maxPxX = -Infinity, minPxY = Infinity, maxPxY = -Infinity;
        
        if (Object.keys(mapGrid).length === 0) {
            return { minPxX: 0, maxPxX: 0, minPxY: 0, maxPxY: 0, mapPixelWidth: 0, mapPixelHeight: 0, mapCenterX: 0, mapCenterY: 0};
        }

        if (gridType === 'hex') {
            const hexVisualWidth = baseHexSize * Math.sqrt(3);
            const hexVisualHeight = baseHexSize * 2;
            for (const key in mapGrid) {
                const [q, r] = key.split(',').map(Number);
                const { x, y } = hexToPixel(q, r);
                minPxX = Math.min(minPxX, x - hexVisualWidth / 2);
                maxPxX = Math.max(maxPxX, x + hexVisualWidth / 2);
                minPxY = Math.min(minPxY, y - hexVisualHeight / 2);
                maxPxY = Math.max(maxPxY, y + hexVisualHeight / 2);
            }
        } else { // square
            for (const key in mapGrid) {
                const [q, r] = key.split(',').map(Number);
                const { x, y } = squareToPixel(q, r);
                minPxX = Math.min(minPxX, x - baseSquareSize / 2);
                maxPxX = Math.max(maxPxX, x + baseSquareSize / 2);
                minPxY = Math.min(minPxY, y - baseSquareSize / 2);
                maxPxY = Math.max(maxPxY, y + baseSquareSize / 2);
            }
        }

        const mapPixelWidth = maxPxX - minPxX;
        const mapPixelHeight = maxPxY - minPxY;
        const mapCenterX = minPxX + mapPixelWidth / 2;
        const mapCenterY = minPxY + mapPixelHeight / 2;
        return {minPxX, maxPxX, minPxY, maxPxY, mapPixelWidth, mapPixelHeight, mapCenterX, mapCenterY};
    }

    function hexToPixel(q, r) {
        const x = baseHexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        const y = baseHexSize * (3 / 2 * r);
        return { x, y };
    }

    function pixelToHex(x, y) {
        const worldX = (x - view.offsetX) / view.zoom;
        const worldY = (y - view.offsetY) / view.zoom;

        const q_frac = (Math.sqrt(3) / 3 * worldX - 1 / 3 * worldY) / baseHexSize;
        const r_frac = (2 / 3 * worldY) / baseHexSize;
        return axialRound(q_frac, r_frac);
    }

    function squareToPixel(x, y) {
        return {
            x: x * baseSquareSize + baseSquareSize / 2,
            y: y * baseSquareSize + baseSquareSize / 2
        };
    }

    function pixelToSquare(px, py) {
        const worldX = (px - view.offsetX) / view.zoom;
        const worldY = (py - view.offsetY) / view.zoom;
        return {
            x: Math.floor(worldX / baseSquareSize),
            y: Math.floor(worldY / baseSquareSize)
        };
    }

    function pixelToGrid(px, py, isFreeform = false) {
        const worldX = (px - view.offsetX) / view.zoom;
        const worldY = (py - view.offsetY) / view.zoom;
        if(isFreeform) return { x: worldX, y: worldY };

        if (gridType === 'hex') {
            const q_frac = (Math.sqrt(3) / 3 * worldX - 1 / 3 * worldY) / baseHexSize;
            const r_frac = (2 / 3 * worldY) / baseHexSize;
            return axialRound(q_frac, r_frac);
        } else {
            return {
                q: Math.floor(worldX / baseSquareSize),
                r: Math.floor(worldY / baseSquareSize)
            };
        }
    }
    
    function axialRound(q_frac, r_frac) {
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

    function getHexCorner(center, size, i) {
        const angle_deg = 60 * i + 30; // Start angle at 30 degrees for pointy top
        const angle_rad = Math.PI / 180 * angle_deg;
        return {
            x: center.x + size * Math.cos(angle_rad),
            y: center.y + size * Math.sin(angle_rad)
        };
    }

    function getTopTerrains() {
        const topTerrains = {};
        for (let i = 0; i < layers.length; i++) { // Iterate from bottom to top
            const layer = layers[i];
            if (!layer.visible || layer.type === 'grid') continue;
            for (const key in layer.data) {
                if (layer.data[key].terrain) { // If terrain exists, it overwrites lower layers
                    topTerrains[key] = layer.data[key].terrain;
                }
            }
        }
        return topTerrains;
    }

    function saveState() {
        const serializableLayers = layers.map(layer => {
            const newLayer = { ...layer };
            if (newLayer.backgroundImage && newLayer.backgroundImage.src) {
                newLayer.backgroundImage = { src: newLayer.backgroundImage.src };
            } else {
                newLayer.backgroundImage = null;
            }
            return newLayer;
        });

        undoStack.push({
            layers: JSON.parse(JSON.stringify(serializableLayers)),
            pencilPaths: JSON.parse(JSON.stringify(pencilPaths)),
            freestyleTerrainPaths: JSON.parse(JSON.stringify(freestyleTerrainPaths)),
            placedAssets: JSON.parse(JSON.stringify(placedAssets))
        });
        redoStack = [];
        updateUndoRedoButtons();
    }

    function undo() {
        if (undoStack.length === 0) return;
        
        const serializableLayers = layers.map(layer => {
            const newLayer = { ...layer };
            if (newLayer.backgroundImage && newLayer.backgroundImage.src) {
                newLayer.backgroundImage = { src: newLayer.backgroundImage.src };
            } else {
                newLayer.backgroundImage = null;
            }
            return newLayer;
        });
        const currentState = {
            layers: JSON.parse(JSON.stringify(serializableLayers)),
            pencilPaths: JSON.parse(JSON.stringify(pencilPaths)),
            freestyleTerrainPaths: JSON.parse(JSON.stringify(freestyleTerrainPaths)),
            placedAssets: JSON.parse(JSON.stringify(placedAssets))
        };
        redoStack.push(currentState);
        
        const previousState = undoStack.pop();
        layers = previousState.layers.map(layerData => {
            if (layerData.backgroundImage && layerData.backgroundImage.src) {
                const img = new Image();
                img.src = layerData.backgroundImage.src;
                layerData.backgroundImage = img;
                img.onload = () => drawAll();
            }
            return layerData;
        });
        pencilPaths = previousState.pencilPaths;
        freestyleTerrainPaths = previousState.freestyleTerrainPaths;
        placedAssets = previousState.placedAssets;

        drawAll();
        renderLayers();
        updateUndoRedoButtons();
        updateMapKey();
    }

    function redo() {
        if (redoStack.length === 0) return;
        
        const serializableLayers = layers.map(layer => {
            const newLayer = { ...layer };
            if (newLayer.backgroundImage && newLayer.backgroundImage.src) {
                newLayer.backgroundImage = { src: newLayer.backgroundImage.src };
            } else {
                newLayer.backgroundImage = null;
            }
            return newLayer;
        });
        const currentState = {
            layers: JSON.parse(JSON.stringify(serializableLayers)),
            pencilPaths: JSON.parse(JSON.stringify(pencilPaths)),
            freestyleTerrainPaths: JSON.parse(JSON.stringify(freestyleTerrainPaths)),
            placedAssets: JSON.parse(JSON.stringify(placedAssets))
        };
        undoStack.push(currentState);

        const nextState = redoStack.pop();
        layers = nextState.layers.map(layerData => {
            if (layerData.backgroundImage && layerData.backgroundImage.src) {
                const img = new Image();
                img.src = layerData.backgroundImage.src;
                layerData.backgroundImage = img;
                img.onload = () => drawAll();
            }
            return layerData;
        });
        pencilPaths = nextState.pencilPaths;
        freestyleTerrainPaths = nextState.freestyleTerrainPaths;
        placedAssets = nextState.placedAssets;
        
        drawAll();
        renderLayers();
        updateUndoRedoButtons();
        updateMapKey();
    }

    function updateUndoRedoButtons() {
        undoBtn.disabled = undoStack.length === 0;
        redoBtn.disabled = redoStack.length === 0;
    }

    function applyTool(e, endHex, toolOverride = null) {
        if (!layers.length) return;
        const toolToUse = toolOverride || currentTool;

        const activeLayer = layers[activeLayerIndex];
        if (activeLayer.type === 'grid') {
            showModal("Cannot draw on the Grid layer. Please select another layer.");
            return;
        }
        const affectedHexes = getHexesForTool(e, endHex, toolToUse);

        affectedHexes.forEach(hex => {
            const key = `${hex.q},${hex.r}`;
            if (mapGrid[key]) {
                if (!activeLayer.data[key]) activeLayer.data[key] = {};
                
                if (toolToUse === 'terrain') {
                   activeLayer.data[key] = { ...activeLayer.data[key], terrain: selectedTerrain };
                } else if (toolToUse === 'placeObject') {
                    const [mainCat, subCat, objKey] = selectedObjectKey.split('.');
                    const assetData = objectCategories[mainCat]?.[subCat]?.[objKey];
                    if(assetData) {
                        const newAsset = { 
                            symbol: assetData.symbol, 
                            name: assetData.name, 
                            q: hex.q, 
                            r: hex.r, 
                            size: brushSize 
                        };
                        placedAssets.push(newAsset);
                    }
                } else if (toolToUse === 'placeText') {
                    activeLayer.data[key] = {
                        ...activeLayer.data[key],
                        text: textInput.value,
                        textSize: fontSizeInput.value,
                        textColor: fontColorInput.value
                    };
                } else if (toolToUse === 'eraser') {
                   if(activeLayer.data[key]) {
                       delete activeLayer.data[key];
                   }
                   // Also erase assets
                   placedAssets = placedAssets.filter(asset => !(asset.q === hex.q && asset.r === hex.r));
                }
            }
        });
        drawAll();
        updateMapKey();
    }
    
    function getHexesForTool(e, endHex, toolOverride = null) {
        const toolToUse = toolOverride || currentTool;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerHex = endHex || pixelToGrid(mouseX, mouseY);
        const startHex = shapeStartPoint ? shapeStartPoint : centerHex;

        if (toolToUse === 'terrain') {
            switch(terrainBrushMode) {
                case 'spray':
                {
                    const results = [];
                    const allHexesInBrush = getHexesInBrush(centerHex);
                    const density = Math.min(1, 0.1 + (brushSize / 10)); 
                    const numToPick = Math.max(1, Math.floor(allHexesInBrush.length * density));
                    
                    for (let i = 0; i < numToPick; i++) {
                        const randomIndex = Math.floor(Math.random() * allHexesInBrush.length);
                        results.push(allHexesInBrush[randomIndex]);
                        allHexesInBrush.splice(randomIndex, 1);
                    }
                    return results;
                }
                case 'hex':
                     return getHexesInBrush(centerHex);
                case 'line':
                    return getHexesForLine(startHex, centerHex);
                case 'rectangle':
                    return getHexesForRectangle(startHex, centerHex);
                case 'ellipse':
                    return getHexesForEllipse(startHex, centerHex);
            }
        } else if (toolToUse === 'placeObject' || toolToUse === 'placeText') {
             return [centerHex];
        } else if (toolToUse === 'eraser') {
             return getHexesInBrush(centerHex);
        }
        return [];
    }
    
    function getHexesInBrush(centerHex) {
        const results = [];
        const range = brushSize - 1;
        for (let q = -range; q <= range; q++) {
            for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
                if (gridType === 'hex') {
                     results.push({ q: centerHex.q + q, r: centerHex.r + r });
                } else {
                     results.push({ q: centerHex.q + q, r: centerHex.r + r });
                }
            }
        }
        return results;
    }

    function cubeLerp(a, b, t) {
        return { q: a.q * (1 - t) + b.q * t, r: a.r * (1 - t) + b.r * t };
    }

    function getHexesForLine(start, end) {
        if(!start || !end) return [];
        const n = axialDistance(start, end);
        const results = [];
        for (let i = 0; i <= n; i++) {
            const cubeCoords = cubeLerp(start, end, (1.0 / n) * i);
            results.push(axialRound(cubeCoords.q, cubeCoords.r));
        }
        return results;
    }
    
    function getHexesForRectangle(start, end) {
        if(!start || !end) return [];
        const results = [];
        const q_min = Math.min(start.q, end.q);
        const q_max = Math.max(start.q, end.q);
        const r_min = Math.min(start.r, end.r);
        const r_max = Math.max(start.r, end.r);

        for (let q = q_min; q <= q_max; q++) {
            for (let r = r_min; r <= r_max; r++) {
                results.push({ q, r });
            }
        }
        return results;
    }

    function getHexesForEllipse(start, end) {
        if(!start || !end) return [];
        const results = [];
        const centerQ = (start.q + end.q) / 2;
        const centerR = (start.r + end.r) / 2;
        const radiusQ = Math.abs(start.q - end.q) / 2;
        const radiusR = Math.abs(start.r - end.r) / 2;

        const q_min = Math.floor(centerQ - radiusQ);
        const q_max = Math.ceil(centerQ + radiusQ);
        const r_min = Math.floor(centerR - radiusR);
        const r_max = Math.ceil(centerR + radiusR);
        
        for (let q = q_min; q <= q_max; q++) {
            for (let r = r_min; r <= r_max; r++) {
                if (radiusQ === 0 || radiusR === 0) continue;
                const dq = (q - centerQ) / radiusQ;
                const dr = (r - centerR) / radiusR;
                if( (dq * dq) + (dr * dr) <= 1) {
                     results.push({ q, r });
                }
            }
        }
        return results;
    }
    
    function axialDistance(hexA, hexB) {
        return (Math.abs(hexA.q - hexB.q) + Math.abs(hexA.q + hexA.r - hexB.q - hexB.r) + Math.abs(hexA.r - hexB.r)) / 2;
    }

    function renderLayers() {
        layerList.innerHTML = '';
        layers.forEach((layer, index) => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.classList.toggle('active', index === activeLayerIndex);
            item.dataset.index = index;
            
            const label = document.createElement('div');
            label.className = 'layer-label';
            label.textContent = layer.name;
            
            const controls = document.createElement('div');
            controls.className = 'layer-controls';
            
            const visBtn = document.createElement('button');
            visBtn.innerHTML = layer.visible 
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            visBtn.title = "Toggle Visibility";
            visBtn.onclick = (e) => { e.stopPropagation(); toggleLayerVisibility(index); };
            
            const upBtn = document.createElement('button');
            upBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
            upBtn.title = "Move Up";
            upBtn.onclick = (e) => { e.stopPropagation(); moveLayer(index, -1); };
            
            const downBtn = document.createElement('button');
            downBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
            downBtn.title = "Move Down";
            downBtn.onclick = (e) => { e.stopPropagation(); moveLayer(index, 1); };
            
            item.onclick = () => { activeLayerIndex = index; renderLayers(); };
            
            controls.appendChild(visBtn);
            controls.appendChild(upBtn);
            controls.appendChild(downBtn);
            item.appendChild(label);
            item.appendChild(controls);
            layerList.appendChild(item);
        });
    }

    function addNewLayer(name = 'New Layer') {
        saveState();
        const newName = name === 'New Layer' ? `${name} ${layers.length + 1}` : name;
        layers.push({ name: newName, visible: true, data: {}, backgroundImage: null });
        activeLayerIndex = layers.length - 1;
        renderLayers();
    }

    function deleteActiveLayer() {
        const layer = layers[activeLayerIndex];
        if (layer.name === 'Ground' || layer.name === 'Objects') {
            showModal("The Ground and Objects layers cannot be deleted.");
            return;
        }
        if (layers.length <= 2) {
            showModal("You must keep at least the Ground and Objects layers.");
            return;
        }
        saveState();
        layers.splice(activeLayerIndex, 1);
        if (activeLayerIndex >= layers.length) {
            activeLayerIndex = layers.length - 1;
        }
        renderLayers();
        drawAll();
        updateMapKey();
    }

    function moveLayer(index, direction) {
        if ((index === 0 && direction === -1) || (index === layers.length - 1 && direction === 1)) {
            return;
        }
        saveState();
        const newIndex = index + direction;
        [layers[index], layers[newIndex]] = [layers[newIndex], layers[index]];
        activeLayerIndex = newIndex;
        renderLayers();
        drawAll();
    }

    function toggleLayerVisibility(index) {
        saveState();
        layers[index].visible = !layers[index].visible;
        renderLayers();
        drawAll();
        updateMapKey();
    }
    
    function getSafeFilename(name) {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'untitled-map';
    }

    function saveAsPNGLogic() {
        const { mapPixelWidth, mapPixelHeight, minPxX, minPxY } = getMapPixelBounds();
        
        if (mapPixelWidth <= 0 || mapPixelHeight <= 0) {
            showModal("Cannot save an empty map.");
            return;
        }

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = mapPixelWidth;
        offscreenCanvas.height = mapPixelHeight;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        offscreenCtx.fillStyle = '#374151'; // bg-gray-700
        offscreenCtx.fillRect(0, 0, mapPixelWidth, mapPixelHeight);

        const bounds = { width: mapPixelWidth, height: mapPixelHeight, minPxX, minPxY };
        
        drawFrame(offscreenCtx, bounds);
        
        offscreenCtx.save();
        offscreenCtx.translate(-minPxX, -minPxY);
        drawFreestyleTerrainPathsForExport(offscreenCtx);
        drawPencilPathsForExport(offscreenCtx);
        offscreenCtx.restore();

        if (!mapKeyWindow.classList.contains('hidden')) {
            const keyRect = mapKeyWindow.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const keyCanvasX = keyRect.left - canvasRect.left;
            const keyCanvasY = keyRect.top - canvasRect.top;
            const keyWorldX = (keyCanvasX - view.offsetX) / view.zoom;
            const keyWorldY = (keyCanvasY - view.offsetY) / view.zoom;
            const keyDrawX = keyWorldX - minPxX;
            const keyDrawY = keyWorldY - minPxY;
            drawKeyOnContext(offscreenCtx, keyDrawX, keyDrawY);
        }

        const tagText = "TTRPG HEX MAP MAKER by Wolfe.BT@TangentLLC";
        offscreenCtx.font = "200 14px 'Trebuchet MS'";
        offscreenCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
        offscreenCtx.textAlign = "left";
        offscreenCtx.fillText(tagText, 10, mapPixelHeight - 10);

        const dataUrl = offscreenCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${getSafeFilename(mapName)}.png`;
        link.href = dataUrl;
        link.click();
    }

    function saveAsJSONLogic() {
        // Create a serializable version of layers
        const serializableLayers = layers.map(layer => {
            const newLayer = { ...layer };
            if (newLayer.backgroundImage && newLayer.backgroundImage.src) {
                newLayer.backgroundImage = { src: newLayer.backgroundImage.src };
            } else {
                newLayer.backgroundImage = null;
            }
            return newLayer;
        });

        const mapData = {
            name: mapName,
            grid: mapGrid,
            layers: serializableLayers,
            pencilPaths: pencilPaths,
            freestyleTerrainPaths: freestyleTerrainPaths,
            placedAssets: placedAssets
        };
        const jsonString = JSON.stringify(mapData, null, 2);
        const blob = new Blob([jsonString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${getSafeFilename(mapName)}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    function promptForMapNameAndSave(saveFunction) {
        if (mapName.trim() === '' || mapName.toLowerCase().includes('untitled')) {
            showNamePromptModal(saveFunction);
        } else {
            saveFunction();
        }
    }
    
    function drawFreestyleTerrainPathsForExport(targetCtx) {
        freestyleTerrainPaths.forEach(path => {
            if (path.points.length < 1) return;
            const terrain = terrains[path.terrain];
            if (!terrain || !terrain.canvasPattern) return;

            targetCtx.strokeStyle = terrain.canvasPattern;
            targetCtx.lineWidth = path.width;
            targetCtx.lineCap = 'round';
            targetCtx.lineJoin = 'round';
            
            if (path.points.length < 2) {
                targetCtx.fillStyle = terrain.canvasPattern;
                targetCtx.beginPath();
                targetCtx.arc(path.points[0].x, path.points[0].y, path.width / 2, 0, 2 * Math.PI);
                targetCtx.fill();
            } else {
                targetCtx.beginPath();
                targetCtx.moveTo(path.points[0].x, path.points[0].y);
                for(let i=1; i < path.points.length; i++) {
                    targetCtx.lineTo(path.points[i].x, path.points[i].y);
                }
                targetCtx.stroke();
            }
        });
    }

    function drawPencilPathsForExport(targetCtx) {
        pencilPaths.forEach(path => {
             if (path.type === 'freestyle') {
                if (path.points.length < 2) return;
                targetCtx.beginPath();
                targetCtx.strokeStyle = path.color;
                targetCtx.lineWidth = path.width;
                targetCtx.lineCap = 'round';
                targetCtx.lineJoin = 'round';
                targetCtx.moveTo(path.points[0].x, path.points[0].y);
                for(let i=1; i < path.points.length; i++) {
                    targetCtx.lineTo(path.points[i].x, path.points[i].y);
                }
                targetCtx.stroke();
            } else if (path.type === 'line') {
                targetCtx.beginPath();
                targetCtx.strokeStyle = path.color;
                targetCtx.lineWidth = path.width;
                targetCtx.moveTo(path.start.x, path.start.y);
                targetCtx.lineTo(path.end.x, path.end.y);
                targetCtx.stroke();
            } else if (path.type === 'rectangle') {
                targetCtx.beginPath();
                targetCtx.strokeStyle = path.color;
                targetCtx.lineWidth = path.width;
                targetCtx.rect(path.start.x, path.start.y, path.end.x - path.start.x, path.end.y - path.start.y);
                targetCtx.stroke();
            } else if (path.type === 'ellipse') {
                targetCtx.beginPath();
                targetCtx.strokeStyle = path.color;
                targetCtx.lineWidth = path.width;
                const rx = Math.abs(path.end.x - path.start.x) / 2;
                const ry = Math.abs(path.end.y - path.start.y) / 2;
                const cx = path.start.x + (path.end.x - start.x) / 2;
                const cy = path.start.y + (path.end.y - start.y) / 2;
                targetCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
                targetCtx.stroke();
            }
        });
    }

    function loadFromJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedData = JSON.parse(event.target.result);
                if (loadedData && loadedData.grid && Array.isArray(loadedData.layers)) {
                    mapGrid = loadedData.grid;
                    pencilPaths = loadedData.pencilPaths || [];
                    freestyleTerrainPaths = loadedData.freestyleTerrainPaths || [];
                    placedAssets = loadedData.placedAssets || [];
                    mapName = loadedData.name || 'Untitled Loaded Map';
                    
                    // Re-hydrate layers with Image objects
                    layers = loadedData.layers.map(layerData => {
                        if (layerData.backgroundImage && layerData.backgroundImage.src) {
                            const img = new Image();
                            img.src = layerData.backgroundImage.src;
                            layerData.backgroundImage = img;
                            // Redraw when the image loads to ensure it appears
                            img.onload = () => drawAll();
                        }
                        return layerData;
                    });

                    mapNameInput.value = mapName;
                    activeLayerIndex = 0;
                    undoStack = [];
                    redoStack = [];
                    updateUndoRedoButtons();
                    renderLayers();
                    centerView();
                    setTimeout(updateMapKey, 100);
                } else {
                    throw new Error("Invalid map file format.");
                }
            } catch (err) {
                showModal("Error: Could not load map. File may be corrupt or in the wrong format.");
                console.error(err);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    async function initializePatterns(targetCtx) {
        const promises = Object.values(terrains).map(terrain => {
            return new Promise((resolve, reject) => {
                const patternEl = document.getElementById(terrain.pattern);
                if (!patternEl) {
                    console.warn(`Pattern element not found: ${terrain.pattern}`);
                    return resolve();
                }

                const img = new Image();
                img.onload = () => {
                    try {
                        terrain.canvasPattern = targetCtx.createPattern(img, 'repeat');
                        resolve();
                    } catch (e) {
                        console.error(`Error creating pattern for ${terrain.name}:`, e);
                        reject(e);
                    }
                };
                img.onerror = (err) => {
                    console.error(`Failed to load pattern image for ${terrain.name}`, err);
                    reject(err);
                };
                img.src = getPatternDataUri(terrain.pattern);
            });
        });
        await Promise.all(promises);
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

    function populateSelectors() {
        terrainSelector.innerHTML = '';
        Object.keys(terrains).forEach(key => {
            const terrain = terrains[key];
            const itemContainer = document.createElement('div');
            itemContainer.className = 'item-container';
            itemContainer.dataset.terrain = key;
            itemContainer.addEventListener('click', () => { 
                currentTool = 'terrain'; 
                selectedTerrain = key; 
                nextClickAction = null;
                updateActiveSwatches(); 
            });
            
            const swatch = document.createElement('div');
            swatch.className = 'texture-swatch';
            if (terrain.aiGenerated) {
                 swatch.style.backgroundImage = `url(${terrain.aiGenerated})`;
            } else {
                 swatch.style.backgroundImage = `url(${getPatternDataUri(terrain.pattern)})`;
            }
            
            const label = document.createElement('div');
            label.className = 'item-label';
            label.textContent = terrain.name;

            itemContainer.appendChild(swatch);
            itemContainer.appendChild(label);
            terrainSelector.appendChild(itemContainer);
        });

        objectSelector.innerHTML = '';
        const currentAssets = objectCategories[currentGenre]?.[currentScale] || {};
        Object.keys(currentAssets).forEach(objKey => {
            const item = currentAssets[objKey];
            const fullKey = `${currentGenre}.${currentScale}.${objKey}`;
            const itemContainer = document.createElement('div');
            itemContainer.className = 'item-container';
            itemContainer.dataset.objectKey = fullKey;
            itemContainer.addEventListener('click', () => { 
                nextClickAction = 'placeObject'; 
                selectedObjectKey = fullKey;
                updateActiveSwatches(); 
            });
            itemContainer.innerHTML = `
                 <div class="object-swatch">${item.symbol}</div>
                 <div class="item-label">${item.name}</div>
            `;
            objectSelector.appendChild(itemContainer);
        });
        
        updateActiveSwatches();
    }

    function updateActiveSwatches() {
        // --- Clear all dynamic active classes first ---
        document.querySelectorAll('.item-container.active, .control-panel button.active, .collapsible-header.active').forEach(el => el.classList.remove('active'));

        // --- Hide panels by default ---
        terrainOptionsPanel.classList.add('hidden');
        pencilOptionsPanel.classList.add('hidden');
        canvas.classList.remove('pencil');
        canvas.classList.remove('masking');

        // --- Set active states based on current variables ---

        // Highlight Genre and Scale
        document.querySelector(`#genreSelector .control-btn[data-genre="${currentGenre}"]`)?.classList.add('active');
        document.querySelector(`#scaleSelector .control-btn[data-scale="${currentScale}"]`)?.classList.add('active');

        // Handle tool-specific highlighting
        if (nextClickAction === 'placeObject') {
            document.querySelector(`.item-container[data-object-key="${selectedObjectKey}"]`)?.classList.add('active');
            toolTerrainBtn.classList.add('active');
            terrainOptionsPanel.classList.remove('hidden');
        } else if (nextClickAction === 'placeText') {
            textHeader.classList.add('active');
            toolTerrainBtn.classList.add('active');
            terrainOptionsPanel.classList.remove('hidden');
        } else if (currentTool === 'terrain') {
            toolTerrainBtn.classList.add('active');
            terrainOptionsPanel.classList.remove('hidden');
            document.querySelector(`.item-container[data-terrain="${selectedTerrain}"]`)?.classList.add('active');
        } else if (currentTool === 'pencil') {
            toolPencilBtn.classList.add('active');
            pencilOptionsPanel.classList.remove('hidden');
            canvas.classList.add('pencil');
        } else if (currentTool === 'mask') {
            toolMaskBtn.classList.add('active');
            terrainOptionsPanel.classList.remove('hidden'); // Mask uses brush size
            canvas.classList.add('masking');
        } else if (currentTool === 'eraser') {
            eraserBtn.classList.add('active');
            terrainOptionsPanel.classList.remove('hidden'); // Eraser also uses brush options
        }
    }

    function showUserGuide() {
        const guideHTML = `
            <div class="text-left text-sm text-gray-300 space-y-4">
                <h3 class="text-xl font-bold text-white">Welcome to the TTRPG Hex Map Maker!</h3>
                <p>This guide will walk you through all the features of the map maker, helping you create detailed and beautiful hex maps for your tabletop games.</p>
                
                <h4 class="text-lg font-bold text-white border-t border-gray-600 pt-3 mt-4">1. The Interface at a Glance</h4>
                <p>The screen is divided into three main areas:</p>
                <ul class="list-disc list-inside space-y-1 pl-4">
                    <li><strong>Left:</strong> The <strong>Control Panel</strong> is where you'll find all your tools for drawing, painting, and managing your map.</li>
                    <li><strong>Center:</strong> The <strong>Canvas</strong> is your main workspace where you'll build your map.</li>
                    <li><strong>Top-Right:</strong> Here you can set your <strong>Map Name</strong>.</li>
                </ul>

                <h4 class="text-lg font-bold text-white border-t border-gray-600 pt-3 mt-4">2. The Control Panel: Your Creative Toolkit</h4>
                <p>The control panel on the left contains everything you need to build your world.</p>
                
                <h5 class="text-md font-semibold text-white">Main Tools</h5>
                <p>At the very top, you have two primary tool modes:</p>
                <ul class="list-disc list-inside space-y-1 pl-4">
                    <li><strong>Terrain:</strong> This mode is for painting the landscape with different terrain types like grass, water, and mountains.</li>
                    <li><strong>Pencil:</strong> This mode is for drawing freehand lines and shapes on top of your map, perfect for roads, rivers, or political borders.</li>
                </ul>

                <h5 class="text-md font-semibold text-white">Actions Panel</h5>
                <p>This section gives you quick access to common map functions like <strong>Zoom</strong>, <strong>Undo/Redo</strong>, <strong>Eraser</strong>, and <strong>Center</strong> view.</p>

                <h5 class="text-md font-semibold text-white">Terrain, Objects, and Text</h5>
                <p>These sections work with a "select, then place" system.</p>
                 <ul class="list-disc list-inside space-y-1 pl-4">
                    <li><strong>To Place Terrain:</strong> Make sure the <strong>Terrain</strong> tool is active, select a terrain type, then click or drag on the canvas.</li>
                    <li><strong>To Place an Object or Text:</strong> Click an <strong>Object</strong> or the <strong>Text</strong> header. Your next single click on the map will place that item. The tool then reverts to Terrain mode.</li>
                </ul>

                <h4 class="text-lg font-bold text-white border-t border-gray-600 pt-3 mt-4">3. Graphics & Map Options (Bottom Panel)</h4>
                <p>Click the "Graphics Options" button to find advanced settings like <strong>Layers</strong>, <strong>Grid Options</strong>, and <strong>Map Generation</strong>.</p>
                
                <h4 class="text-lg font-bold text-white border-t border-gray-600 pt-3 mt-4">4. Saving and Loading</h4>
                <p>Click the <strong>File Icon</strong> (📄) at the top of the control panel to save your map as a PNG image or a ".json" project file (which you can load later).</p>
                
                <h4 class="text-lg font-bold text-white border-t border-gray-600 pt-3 mt-4">5. Navigating the Canvas</h4>
                <ul class="list-disc list-inside space-y-1 pl-4">
                    <li><strong>Pan:</strong> Hold down the <strong>right mouse button</strong> and drag.</li>
                    <li><strong>Zoom:</strong> Use your <strong>mouse wheel</strong>.</li>
                </ul>
                <div class="border-t border-gray-600 pt-3 mt-4 text-center text-xs text-gray-400">
                    <p>TTRPG HEX MAP MAKER by Wolfe.BT@TangentLLC</p>
                </div>
            </div>
        `;
        showContentModal("User's Guide", guideHTML);
    }

    function showContentModal(title, content) {
        const existingModal = document.querySelector('.modal-backdrop');
        if(existingModal) existingModal.remove();

        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        
        modalBackdrop.innerHTML = `
            <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl text-white flex flex-col" style="max-height: 90vh;">
                <div class="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 class="text-xl font-bold">${title}</h3>
                    <button id="modalClose" class="p-2 rounded-full hover:bg-gray-700">&times;</button>
                </div>
                <div class="p-6 overflow-y-auto">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modalBackdrop);
        modalBackdrop.querySelector('#modalClose').onclick = () => document.body.removeChild(modalBackdrop);
        modalBackdrop.onclick = (e) => {
            if (e.target === modalBackdrop) {
                 document.body.removeChild(modalBackdrop);
            }
        }
    }
    
    function showNamePromptModal(callback) {
        const existingModal = document.querySelector('.modal-backdrop');
        if(existingModal) existingModal.remove();

        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modalBackdrop.innerHTML = `
            <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-white">
                <h3 class="text-lg font-bold mb-4">Enter Map Name</h3>
                <p class="mb-4 text-sm text-gray-400">Please provide a name for your map before saving.</p>
                <input type="text" id="modalMapNameInput" class="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white mb-4" placeholder="My Awesome Map">
                <div class="flex justify-end gap-4">
                    <button id="modalSaveName" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition">Save</button>
                    <button id="modalCancelName" class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalBackdrop);

        const nameInput = modalBackdrop.querySelector('#modalMapNameInput');
        nameInput.focus();

        modalBackdrop.querySelector('#modalCancelName').onclick = () => document.body.removeChild(modalBackdrop);
        
        const saveButton = modalBackdrop.querySelector('#modalSaveName');
        saveButton.onclick = () => {
            const newName = nameInput.value.trim();
            if (newName) {
                mapName = newName;
                mapNameInput.value = newName;
                callback();
                document.body.removeChild(modalBackdrop);
            } else {
                nameInput.classList.add('border-red-500');
            }
        };

        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveButton.click();
            }
        });
    }

    function showModal(message, onConfirm) {
        const existingModal = document.querySelector('.modal-backdrop');
        if(existingModal) existingModal.remove();

        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modalBackdrop.innerHTML = `
            <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-white">
                <p class="mb-6 text-center">${message}</p>
                <div class="flex justify-end gap-4">
                    ${onConfirm ? `<button id="modalConfirm" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition">Confirm</button>` : ''}
                    <button id="modalCancel" class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition">${onConfirm ? 'Cancel' : 'OK'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalBackdrop);
        modalBackdrop.querySelector('#modalCancel').onclick = () => document.body.removeChild(modalBackdrop);
        if (onConfirm) {
            modalBackdrop.querySelector('#modalConfirm').onclick = () => {
                onConfirm();
                document.body.removeChild(modalBackdrop);
            };
        }
    }

    function updateMapKey() {
        if (mapKeyWindow.classList.contains('hidden')) return;

        const usedTerrains = new Set();
        const usedObjects = new Set();

        layers.forEach(layer => {
            if (!layer.visible) return;
            for (const key in layer.data) {
                const hexData = layer.data[key];
                if (hexData.terrain) {
                    usedTerrains.add(hexData.terrain);
                }
            }
        });
        
        placedAssets.forEach(asset => usedObjects.add(asset.name));

        mapKeyContent.innerHTML = '';
        let contentHTML = '';

        if (usedTerrains.size > 0) {
            contentHTML += '<h5 class="key-section-title">Terrain</h5>';
            Array.from(usedTerrains).sort().forEach(terrainKey => {
                const terrain = terrains[terrainKey];
                if (terrain) {
                    contentHTML += `
                        <div class="key-item">
                            <div class="key-swatch" style="background-image: url(${getPatternDataUri(terrain.pattern)})"></div>
                            <span>${terrain.name}</span>
                        </div>
                    `;
                }
            });
        }

        if (usedObjects.size > 0) {
            contentHTML += '<h5 class="key-section-title">Objects</h5>';
            Array.from(usedObjects).sort().forEach(objectName => {
                const asset = placedAssets.find(a => a.name === objectName);
                 if (asset) {
                     contentHTML += `
                        <div class="key-item">
                            <div class="key-swatch">${asset.symbol}</div>
                            <span>${asset.name}</span>
                        </div>
                    `;
                }
            });
        }
        
        if (contentHTML === '') {
            contentHTML = '<p class="text-xs text-gray-400" style="grid-column: 1 / -1;">No items on map to display in key.</p>';
        }

        mapKeyContent.innerHTML = contentHTML;
    }

    function drawKeyOnContext(targetCtx, x, y) {
        const usedTerrains = new Set();
        const usedObjects = new Set();
         layers.forEach(layer => {
            if (!layer.visible) return;
            for (const key in layer.data) {
                if (layer.data[key].terrain) usedTerrains.add(layer.data[key].terrain);
            }
        });
        
        placedAssets.forEach(asset => usedObjects.add(asset.name));

        if (usedTerrains.size === 0 && usedObjects.size === 0) return;

        const keyWidth = 150; // Match new narrow width
        const padding = 8;
        const itemHeight = 24;
        const swatchSize = 18;
        const titleHeight = 26;
        const sectionTitleHeight = 22;
        const textStyle = "12px 'Trebuchet MS'";
        const titleStyle = "bold 14px 'Trebuchet MS'";

        let terrainItems = Array.from(usedTerrains).sort();
        let objectItems = Array.from(usedObjects).sort();

        let keyHeight = padding * 2 + titleHeight;
        if(terrainItems.length > 0) keyHeight += sectionTitleHeight + terrainItems.length * itemHeight;
        if(objectItems.length > 0) keyHeight += sectionTitleHeight + objectItems.length * itemHeight;

        // Draw header background
        targetCtx.fillStyle = 'rgba(31, 41, 55, 0.9)';
        targetCtx.fillRect(x, y, keyWidth, titleHeight + padding);
        
        // Draw item backgrounds
        let itemBgY = y + titleHeight + padding;
        targetCtx.fillStyle = 'rgba(17, 24, 39, 0.7)';
        targetCtx.fillRect(x, itemBgY, keyWidth, keyHeight - titleHeight - padding);

        let currentY = y + padding;

        targetCtx.fillStyle = '#f9fafb';
        targetCtx.font = titleStyle;
        targetCtx.textAlign = 'left';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText('Map Key', x + padding, currentY + titleHeight / 2);
        currentY += titleHeight;

        const drawSection = (items, type) => {
            if(items.length === 0) return;
            
            targetCtx.font = "bold 13px 'Trebuchet MS'";
            targetCtx.fillStyle = '#f9fafb';
            targetCtx.fillText(type, x + padding, currentY + sectionTitleHeight / 2);
            currentY += sectionTitleHeight;

            items.forEach((itemKey) => {
                const itemX = x + padding;
                const itemY = currentY;
                
                targetCtx.font = textStyle;
                targetCtx.fillStyle = '#d1d5db';
                targetCtx.textAlign = 'left';
                targetCtx.textBaseline = 'middle';

                if (type === 'Terrain') {
                    const terrain = terrains[itemKey];
                    if (terrain && terrain.canvasPattern) {
                        targetCtx.fillStyle = terrain.canvasPattern;
                        targetCtx.fillRect(itemX, itemY + (itemHeight - swatchSize) / 2, swatchSize, swatchSize);
                        targetCtx.strokeStyle = '#4b5563';
                        targetCtx.strokeRect(itemX, itemY + (itemHeight - swatchSize) / 2, swatchSize, swatchSize);
                        targetCtx.fillStyle = '#d1d5db';
                        targetCtx.fillText(terrain.name, itemX + swatchSize + 5, itemY + itemHeight / 2);
                    }
                } else { // Objects
                    const asset = placedAssets.find(a => a.name === itemKey);
                    if(asset) {
                        targetCtx.font = `${swatchSize * 0.9}px Arial`;
                        targetCtx.textAlign = 'center';
                        targetCtx.fillText(asset.symbol, itemX + swatchSize / 2, itemY + itemHeight / 2);
                        
                        targetCtx.font = textStyle;
                        targetCtx.textAlign = 'left';
                        targetCtx.fillStyle = '#d1d5db';
                        targetCtx.fillText(asset.name, itemX + swatchSize + 5, itemY + itemHeight / 2);
                    }
                }
                currentY += itemHeight;
            });
        };

        drawSection(terrainItems, 'Terrain');
        drawSection(objectItems, 'Objects');
    }

    // --- AI and Helper Functions ---

    /**
     * A generic function to show a loading indicator and handle API calls to Google AI.
     * @param {string} prompt - The text prompt for the AI.
     * @param {string | null} imageBase64 - The base64 encoded source image (optional).
     * @param {string | null} maskBase64 - The base64 encoded mask image (optional).
     * @returns {Promise<string|null>} - A promise that resolves with the base64 string of the generated image.
     */
    async function callGenerativeAI(prompt, imageBase64 = null, maskBase64 = null) {
        if (!apiKey) {
            showModal("Please set your API key in the settings first.");
            return null;
        }

        showModal("AI is generating... Please wait.", null);

        let apiUrl;
        let payload;
        const modelForTextToImage = "imagen-3.0-generate-002"; 
        const modelForImageEdit = "gemini-2.0-flash-preview-image-generation";

        if (!imageBase64) {
            // --- Text-to-Image Generation (Step 1: Landform) ---
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelForTextToImage}:predict?key=${apiKey}`;
            payload = {
                instances: [{ prompt: prompt }],
                parameters: { "sampleCount": 1 }
            };
        } else {
            // --- Image-to-Image / Inpainting (Steps 2, 3, Edit) ---
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelForImageEdit}:generateContent?key=${apiKey}`;
            const parts = [{ text: prompt }];
            parts.push({
                inlineData: {
                    mimeType: "image/png",
                    data: imageBase64
                }
            });
            if (maskBase64) {
                parts.push({
                    inlineData: {
                        mimeType: "image/png",
                        data: maskBase64
                    }
                });
            }
            payload = {
                contents: [{ role: "user", parts: parts }],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE']
                },
            };
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("AI API Error:", error);
                throw new Error(`API request failed with status ${response.status}: ${error.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();
            let base64Data;

            if (!imageBase64) {
                // Imagen response structure
                base64Data = result.predictions?.[0]?.bytesBase64Encoded;
            } else {
                // Gemini Image Gen response structure
                base64Data = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
            }

            if (!base64Data) {
                console.error("Unexpected API response structure:", result);
                throw new Error("Could not find generated image data in the API response.");
            }

            document.querySelector('.modal-backdrop')?.remove(); // Hide loading
            return base64Data;

        } catch (error) {
            console.error("AI Generation Error:", error);
            showModal(`An error occurred during AI generation: ${error.message}`);
            const loadingModal = document.querySelector('.modal-backdrop');
            if (loadingModal && loadingModal.textContent.includes("AI is generating")) {
                loadingModal.remove();
            }
            return null;
        }
    }


    /**
     * Captures the current map view as a base64 encoded image.
     * @returns {string | null} - The base64 encoded PNG string, without the 'data:image/png;base64,' prefix.
     */
    function getCanvasAsBase64() {
        const { mapPixelWidth, mapPixelHeight, minPxX, minPxY } = getMapPixelBounds();
        if (mapPixelWidth <= 0 || mapPixelHeight <= 0) return null;
        
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = mapPixelWidth;
        offscreenCanvas.height = mapPixelHeight;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        
        const bounds = { width: mapPixelWidth, height: mapPixelHeight, minPxX, minPxY };
        drawFrame(offscreenCtx, bounds);
        
        return offscreenCanvas.toDataURL('image/png').split(',')[1];
    }

    /**
     * Gets the mask canvas as a black and white base64 image.
     * @returns {string} - The base64 encoded PNG string, without the 'data:image/png;base64,' prefix.
     */
    function getMaskAsBase64() {
        return maskCanvas.toDataURL('image/png').split(',')[1];
    }

    /**
     * Updates the UI to show the current AI generation step.
     * @param {number} stepNumber - The step to make active (1, 2, or 3).
     */
    function updateAiStep(stepNumber) {
        document.querySelectorAll('.ai-step').forEach(step => step.classList.remove('active-step'));
        const activeStep = document.getElementById(`aiStep${stepNumber}`);
        if (activeStep) {
            activeStep.classList.add('active-step');
        }
    }
    
    /**
     * Gathers all advanced AI settings from the UI controls.
     * @returns {string} A comma-separated string of descriptive phrases for the prompt.
     */
    function getAdvancedAISettings() {
        const settings = [];

        // Macro
        if (territoryStyleSelect.value) settings.push(territoryStyleSelect.value);
        if (routeNetworkSelect.value) settings.push(routeNetworkSelect.value);
        const poiMap = ['with only a few points of interest', 'dotted with some towns and landmarks', 'dotted with numerous towns, ruins, and other landmarks'];
        settings.push(poiMap[poiDensitySlider.value]);

        // Meso
        const districts = [];
        districtStyleCheckboxes.querySelectorAll('input:checked').forEach(cb => districts.push(cb.value));
        if (districts.length > 0) settings.push(`a city map featuring ${districts.join(', ')}`);
        const infraMap = ['a small town with simple dirt roads', 'a fortified city with stone walls and bridges', 'a metropolis with wide avenues and canals'];
        settings.push(infraMap[infrastructureDensitySlider.value]);
        
        // Micro
        const furnishMap = ['the rooms are bare and empty', 'the rooms are moderately furnished', 'the rooms are cluttered with furniture, crates, and debris'];
        settings.push(furnishMap[furnishingsDensitySlider.value]);
        const coverMap = ['an open area with little cover', 'a mix of open space and some tactical cover', 'a dense environment with many pillars and obstacles providing ample cover'];
        settings.push(coverMap[tacticalCoverSlider.value]);
        const hazardMap = ['a safe, clean area', 'containing a few minor hazards', 'filled with dangerous pits, rubble, and environmental hazards'];
        settings.push(hazardMap[hazardDensitySlider.value]);
        if (verticalitySelect.value) settings.push(verticalitySelect.value);

        return settings.filter(s => s).join(', ');
    }


    // --- Event Handler Implementations ---

    async function handleLandformGeneration(promptOverride = null) {
        saveState();
        const prompt = promptOverride || aiLandformPrompt.value;
        const style = artStyleSelect.value;
        if (!prompt) {
            showModal("Please describe the landform you want to generate.");
            return;
        }

        const advancedSettings = getAdvancedAISettings();
        const fullPrompt = `A ${style} map of ${prompt}, ${advancedSettings}. Grayscale heightmap.`;
        lastAIPrompt = fullPrompt;
        lastAIFunction = () => handleLandformGeneration(lastPromptInput.value);
        lastPromptInput.value = fullPrompt;

        const generatedImageBase64 = await callGenerativeAI(fullPrompt);

        if (generatedImageBase64) {
            const img = new Image();
            img.onload = () => {
                const groundLayer = layers.find(l => l.name === 'Ground');
                if (groundLayer) {
                    groundLayer.backgroundImage = img;
                    heightmapImage = img;
                    drawAll();
                    updateAiStep(2);
                }
            };
            img.src = `data:image/png;base64,${generatedImageBase64}`;
        }
    }

    async function handleWaterGeneration(promptOverride = null) {
        saveState();
        const prompt = promptOverride || aiWaterPrompt.value;
        if (!prompt || !heightmapImage) {
            showModal("Please generate a landform first and describe the water features.");
            return;
        }

        const landformBase64 = getCanvasAsBase64();
        if (!landformBase64) {
            showModal("Could not capture the current map to send to the AI.");
            return;
        }
        const fullPrompt = `Using the provided heightmap, add water features as described: ${prompt}. The water should realistically fill the low-lying areas. Return only the water on a transparent background.`;
        lastAIPrompt = fullPrompt;
        lastAIFunction = () => handleWaterGeneration(lastPromptInput.value);
        lastPromptInput.value = fullPrompt;
        
        const waterImageBase64 = await callGenerativeAI(fullPrompt, landformBase64);

        if (waterImageBase64) {
            const img = new Image();
            img.onload = () => {
                let waterLayer = layers.find(l => l.name === 'Water Features');
                if (!waterLayer) {
                    const newName = 'Water Features';
                    layers.push({ name: newName, visible: true, data: {}, backgroundImage: null });
                    activeLayerIndex = layers.length - 1;
                    renderLayers();
                    waterLayer = layers[activeLayerIndex];
                }
                waterLayer.backgroundImage = img;
                drawAll();
                updateAiStep(3);
            };
            img.src = `data:image/png;base64,${waterImageBase64}`;
        }
    }

    async function handleBiomeGeneration(promptOverride = null) {
        saveState();
        const prompt = promptOverride || aiBiomePrompt.value;
        const style = artStyleSelect.value;
        if (!prompt) {
            showModal("Please describe the biomes to apply.");
            return;
        }

        const currentMapBase64 = getCanvasAsBase64();
        if (!currentMapBase64) {
            showModal("Could not capture the current map to send to the AI.");
            return;
        }
        const advancedSettings = getAdvancedAISettings();
        const fullPrompt = `Based on the provided map with its landforms and water, apply biomes as described: ${prompt}, ${advancedSettings}. Use the specified art style: ${style}.`;
        lastAIPrompt = fullPrompt;
        lastAIFunction = () => handleBiomeGeneration(lastPromptInput.value);
        lastPromptInput.value = fullPrompt;

        const biomeImageBase64 = await callGenerativeAI(fullPrompt, currentMapBase64);

        if (biomeImageBase64) {
            const img = new Image();
            img.onload = () => {
                const groundLayer = layers.find(l => l.name === 'Ground');
                if (groundLayer) {
                    groundLayer.backgroundImage = img; 
                    let waterLayer = layers.find(l => l.name === 'Water Features');
                    if(waterLayer) waterLayer.backgroundImage = null;
                    
                    drawAll();
                }
            };
            img.src = `data:image/png;base64,${biomeImageBase64}`;
        }
    }

    async function handleAiEdit(promptOverride = null) {
        saveState();
        const prompt = promptOverride || aiEditPrompt.value;
        if (!prompt) {
            showModal("Please provide an edit instruction.");
            return;
        }

        const currentMapBase64 = getCanvasAsBase64();
        if (!currentMapBase64) {
            showModal("Could not capture the current map to send to the AI.");
            return;
        }
        const maskBase64 = maskPaths.length > 0 ? getMaskAsBase64() : null;
        
        let fullPrompt;
        if (maskBase64) {
            fullPrompt = `Perform this edit: "${prompt}" in the style of the base image. Apply this change ONLY to the non-black areas of the provided mask. Return the entire image with the change applied.`;
        } else {
            fullPrompt = `Perform this edit: "${prompt}" in the style of the base image. Apply it to the entire image.`;
        }
        lastAIPrompt = fullPrompt;
        lastAIFunction = () => handleAiEdit(lastPromptInput.value);
        lastPromptInput.value = fullPrompt;
        
        const editedImageBase64 = await callGenerativeAI(fullPrompt, currentMapBase64, maskBase64);

        if (editedImageBase64) {
            const img = new Image();
            img.onload = () => {
                const groundLayer = layers.find(l => l.name === 'Ground');
                if (groundLayer) {
                    groundLayer.backgroundImage = img;
                    maskPaths = []; // Clear the mask after use
                    drawAll(); // Redraw to clear the visual mask
                }
            };
            img.src = `data:image/png;base64,${editedImageBase64}`;
        }
    }


    function addEventListeners() {
        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        canvas.addEventListener('mousedown', e => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldMousePos = pixelToGrid(mouseX, mouseY);

            if (e.button === 2) { // Right-click for panning
                isPanning = true;
                panStart = { x: e.clientX, y: e.clientY };
                canvas.classList.add('panning');
                return;
            }

            if (e.button === 0) { // Left-click for tools
                let assetClicked = false;
                if (currentTool !== 'mask') {
                    for (let i = placedAssets.length - 1; i >= 0; i--) {
                        const asset = placedAssets[i];
                        const {x, y} = (gridType === 'hex') ? hexToPixel(asset.q, asset.r) : squareToPixel(asset.q, asset.r);
                        const size = (gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.2 * asset.size;
                        const worldClick = pixelToGrid(mouseX, mouseY, true);
                        if (worldClick.x > x - size/2 && worldClick.x < x + size/2 &&
                            worldClick.y > y - size/2 && worldClick.y < y + size/2) {
                            selectedPlacedAssetIndex = i;
                            isDragging = true;
                            dragOffsetX = worldMousePos.q - asset.q;
                            dragOffsetY = worldMousePos.r - asset.r;
                            assetClicked = true;
                            break;
                        }
                    }
                }
                
                if (!assetClicked) {
                    selectedPlacedAssetIndex = null;
                    if (nextClickAction) {
                        saveState();
                        applyTool(e, null, nextClickAction);
                        nextClickAction = null;
                        updateActiveSwatches();
                        return;
                    }
                }


                const brushMode = currentTool === 'terrain' ? terrainBrushMode : pencilBrushMode;
                const isShapeMode = ['line', 'rectangle', 'ellipse'].includes(brushMode);

                if (isShapeMode) {
                    isDrawingShape = true;
                    shapeStartPoint = pixelToGrid(mouseX, mouseY, currentTool === 'pencil');
                    saveState();
                } else if (currentTool === 'terrain' && terrainBrushMode === 'spray') {
                    isPainting = true;
                    saveState();
                    currentFreestyleTerrainPath = { terrain: selectedTerrain, width: brushSize * 10, points: [pixelToGrid(mouseX, mouseY, true)] };
                } else if (currentTool === 'terrain' || currentTool === 'eraser') {
                     isPainting = true;
                     saveState();
                     applyTool(e);
                } else if (currentTool === 'pencil') {
                    isPenciling = true;
                    saveState();
                    currentPencilPath = { type: 'freestyle', color: pencilColor, width: pencilWidth, points: [pixelToGrid(mouseX, mouseY, true)] };
                } else if (currentTool === 'mask') {
                    isMasking = true;
                    currentMaskPath = { points: [{x: mouseX, y: mouseY}] };
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

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldMousePos = pixelToGrid(mouseX, mouseY);

            if(isDragging && selectedPlacedAssetIndex !== null) {
                const asset = placedAssets[selectedPlacedAssetIndex];
                asset.q = worldMousePos.q - dragOffsetX;
                asset.r = worldMousePos.r - dragOffsetY;
                drawAll();
            }

            if (isDrawingShape) {
                previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                const endPoint = pixelToGrid(mouseX, mouseY, currentTool === 'pencil');
                const startPoint = shapeStartPoint;
                
                previewCtx.save();
                previewCtx.translate(view.offsetX, view.offsetY);
                previewCtx.scale(view.zoom, view.zoom);
                
                if (currentTool === 'terrain') {
                    const shapeHexes = getHexesForTool(e, endPoint);
                    shapeHexes.forEach(hex => {
                        const {x, y} = (gridType === 'hex') ? hexToPixel(hex.q, hex.r) : squareToPixel(hex.q, hex.r);
                        if (gridType === 'hex') {
                            drawHex(previewCtx, x, y, 'rgba(100, 150, 255, 0.5)');
                        } else {
                            drawSquare(previewCtx, x, y, 'rgba(100, 150, 255, 0.5)');
                        }
                    });
                } else if (currentTool === 'pencil') {
                    previewCtx.beginPath();
                    previewCtx.strokeStyle = pencilColor;
                    previewCtx.lineWidth = pencilWidth;
                    const brushMode = pencilBrushMode;
                    if (brushMode === 'line') {
                        previewCtx.moveTo(startPoint.x, startPoint.y);
                        previewCtx.lineTo(endPoint.x, endPoint.y);
                    } else if (brushMode === 'rectangle') {
                        previewCtx.rect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
                    } else if (brushMode === 'ellipse') {
                        const rx = Math.abs(endPoint.x - startPoint.x) / 2;
                        const ry = Math.abs(endPoint.y - startPoint.y) / 2;
                        const cx = startPoint.x + (endPoint.x - startPoint.x) / 2;
                        const cy = startPoint.y + (endPoint.y - startPoint.y) / 2;
                        previewCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
                    }
                    previewCtx.stroke();
                }
                
                previewCtx.restore();
                drawAll();
            } else if (isPainting) {
                if (currentTool === 'terrain' && terrainBrushMode === 'spray' && currentFreestyleTerrainPath) {
                    currentFreestyleTerrainPath.points.push(pixelToGrid(mouseX, mouseY, true));
                    drawAll();
                } else {
                    applyTool(e);
                }
            } else if (isPenciling) { // Pencil freestyle
                currentPencilPath.points.push(pixelToGrid(mouseX, mouseY, true));
                drawAll();
            } else if (isMasking && currentMaskPath) {
                currentMaskPath.points.push({x: mouseX, y: mouseY});
                drawAll();
            }
        });
        
        canvas.addEventListener('mouseup', e => {
            if (e.button === 0) { // Left-click release
                isDragging = false;
                const brushMode = currentTool === 'terrain' ? terrainBrushMode : pencilBrushMode;
                const isShapeMode = ['line', 'rectangle', 'ellipse'].includes(brushMode);

                if (isDrawingShape && isShapeMode) {
                    const endPoint = pixelToGrid(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top, currentTool === 'pencil');
                    if (currentTool === 'terrain') {
                        applyTool(e, endPoint);
                    } else if (currentTool === 'pencil') {
                        pencilPaths.push({
                            type: pencilBrushMode,
                            start: shapeStartPoint,
                            end: endPoint,
                            color: pencilColor,
                            width: pencilWidth
                        });
                    }
                }
                
                if (isPainting) {
                    if (currentTool === 'terrain' && terrainBrushMode === 'spray' && currentFreestyleTerrainPath) {
                        freestyleTerrainPaths.push(currentFreestyleTerrainPath);
                        currentFreestyleTerrainPath = null;
                    }
                    isPainting = false;
                }
                if (isPenciling) {
                    isPenciling = false;
                    pencilPaths.push(currentPencilPath);
                    currentPencilPath = null;
                }
                if (isMasking) {
                    isMasking = false;
                    maskPaths.push(currentMaskPath);
                    currentMaskPath = null;
                }
                isDrawingShape = false;
                shapeStartPoint = null;
                drawAll();
            }
            
            if (e.button === 2) { // Right-click release
                 isPanning = false;
                 canvas.classList.remove('panning');
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
             if (isPenciling) {
                 if(currentPencilPath && currentPencilPath.points.length > 1) {
                    pencilPaths.push(currentPencilPath);
                 }
                 isPenciling = false;
                 currentPencilPath = null;
             }
             if (isPainting) {
                if (currentTool === 'terrain' && terrainBrushMode === 'spray' && currentFreestyleTerrainPath) {
                    freestyleTerrainPaths.push(currentFreestyleTerrainPath);
                    currentFreestyleTerrainPath = null;
                }
                isPainting = false;
             }
             if (isMasking) {
                if(currentMaskPath && currentMaskPath.points.length > 1) {
                    maskPaths.push(currentMaskPath);
                }
                isMasking = false;
                currentMaskPath = null;
             }
            isPanning = false;
            isDrawingShape = false;
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

        mapNameInput.addEventListener('input', (e) => { mapName = e.target.value; });
        brushSizeSlider.addEventListener('input', e => {
            brushSize = parseInt(e.target.value);
            brushSizeValue.textContent = brushSize;
        });
        undoBtn.addEventListener('click', undo);
        redoBtn.addEventListener('click', redo);
        gridColorPicker.addEventListener('input', e => { gridColor = e.target.value; drawAll(); });
        gridVisibleCheckbox.addEventListener('change', e => { 
            drawAll();
        });
        toolTerrainBtn.addEventListener('click', () => { currentTool = 'terrain'; nextClickAction = null; updateActiveSwatches(); });
        toolPencilBtn.addEventListener('click', () => { currentTool = 'pencil'; nextClickAction = null; updateActiveSwatches(); });
        
        toolMaskBtn.addEventListener('click', () => {
            if (currentTool === 'mask') {
                currentTool = 'terrain';
            } else {
                currentTool = 'mask';
            }
            nextClickAction = null;
            updateActiveSwatches();
        });

        clearMaskBtn.addEventListener('click', () => {
            maskPaths = [];
            drawAll();
        });
        terrainBrushModeSelect.addEventListener('change', (e) => { terrainBrushMode = e.target.value; });
        pencilBrushModeSelect.addEventListener('change', (e) => { pencilBrushMode = e.target.value; });
        pencilColorPicker.addEventListener('input', e => { pencilColor = e.target.value; });
        pencilWidthSlider.addEventListener('input', e => {
            pencilWidth = parseInt(e.target.value);
            pencilWidthValue.textContent = pencilWidth;
        });
        resetViewBtn.addEventListener('click', centerView);
        addLayerBtn.addEventListener('click', () => addNewLayer());
        deleteLayerBtn.addEventListener('click', deleteActiveLayer);
        textHeader.addEventListener('click', () => { nextClickAction = 'placeText'; updateActiveSwatches(); });
        generateBaseMapBtn.addEventListener('click', () => {
            showModal("Generate a new blank map? This will delete all layers and current work.", () => {
                generateBaseMap();
                drawAll();
            });
        });
        graphicsBtn.addEventListener('click', () => {
            graphicsContent.classList.toggle('hidden');
        });
        fileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileDropdownMenu.classList.toggle('hidden');
        });
        window.addEventListener('click', (e) => { 
            if (!fileMenuBtn.contains(e.target) && !fileDropdownMenu.contains(e.target)) {
               fileDropdownMenu.classList.add('hidden');
            }
            if(!graphicsBtn.contains(e.target) && !graphicsContent.contains(e.target)) {
                graphicsContent.classList.add('hidden');
            }
        });
        savePngBtn.addEventListener('click', () => promptForMapNameAndSave(saveAsPNGLogic));
        saveJsonBtn.addEventListener('click', () => promptForMapNameAndSave(saveAsJSONLogic));
        loadJsonBtn.addEventListener('click', () => loadJsonInput.click());
        loadJsonInput.addEventListener('change', loadFromJSON);
        accordionHeaders.forEach(clickedHeader => {
            clickedHeader.addEventListener('click', () => {
                const clickedContent = clickedHeader.nextElementSibling;
                const isCurrentlyCollapsed = clickedHeader.classList.contains('collapsed');

                // First, collapse all headers
                accordionHeaders.forEach(header => {
                    header.classList.add('collapsed');
                    header.nextElementSibling.classList.add('hidden');
                });

                // If the clicked one was collapsed, open it
                if (isCurrentlyCollapsed) {
                    clickedHeader.classList.remove('collapsed');
                    clickedContent.classList.remove('hidden');
                }
            });
        });
        collapseBtn.addEventListener('click', () => togglePanel(true));
        collapsedBar.addEventListener('click', () => togglePanel(false));
        userGuideBtn.addEventListener('click', showUserGuide);
        eraserBtn.addEventListener('click', () => { currentTool = 'eraser'; updateActiveSwatches(); });

        genreSelector.addEventListener('click', (e) => {
            if (e.target.matches('.control-btn')) {
                currentGenre = e.target.dataset.genre;
                populateSelectors();
            }
        });

        scaleSelector.addEventListener('click', (e) => {
            if (e.target.matches('.control-btn')) {
                currentScale = e.target.dataset.scale;
                populateSelectors();
            }
        });
        
        settingsBtn.addEventListener('click', () => {
            apiKeyInput.value = apiKey; // Load current key into the input
            apiKeyModal.classList.remove('hidden');
        });

        cancelApiKeyBtn.addEventListener('click', () => {
            apiKeyModal.classList.add('hidden');
        });

        saveApiKeyBtn.addEventListener('click', () => {
            apiKey = apiKeyInput.value;
            localStorage.setItem('mapMakerApiKey', apiKey);
            console.log("API Key saved.");
            apiKeyModal.classList.add('hidden');
        });


        // Map Key Listeners
        mapKeyBtn.addEventListener('click', () => {
            mapKeyWindow.classList.toggle('hidden');
            updateMapKey();
        });
        mapKeyCloseBtn.addEventListener('click', () => mapKeyWindow.classList.add('hidden'));
        mapKeyHeader.addEventListener('mousedown', e => {
            isDraggingKey = true;
            keyDragOffset.x = e.clientX - mapKeyWindow.offsetLeft;
            keyDragOffset.y = e.clientY - mapKeyWindow.offsetTop;
            e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (isDraggingKey) {
                let newX = e.clientX - keyDragOffset.x;
                let newY = e.clientY - keyDragOffset.y;
                const mainContainerRect = document.getElementById('main-container').getBoundingClientRect();
                newX = Math.max(0, Math.min(newX, mainContainerRect.width - mapKeyWindow.offsetWidth));
                newY = Math.max(0, Math.min(newY, mainContainerRect.height - mapKeyWindow.offsetHeight));
                mapKeyWindow.style.left = `${newX}px`;
                mapKeyWindow.style.top = `${newY}px`;
            }
        });
        document.addEventListener('mouseup', () => {
            isDraggingKey = false;
        });
        
        gridTypeSelect.addEventListener('change', (e) => {
            gridType = e.target.value;
            const hexBrushOption = terrainBrushModeSelect.querySelector('option[value="hex"]');
            if (hexBrushOption) {
                hexBrushOption.disabled = gridType === 'square';
                if (gridType === 'square' && terrainBrushMode === 'hex') {
                    terrainBrushModeSelect.value = 'spray'; // default to spray
                    terrainBrushMode = 'spray';
                }
            }
            generateBaseMap();
            drawAll();
        });
        
        // AI Listeners
        aiBottomPanelHeader.addEventListener('click', () => {
            aiBottomPanel.classList.toggle('closed');
        });
        
        generateLandformBtn.addEventListener('click', () => handleLandformGeneration());
        addWaterBtn.addEventListener('click', () => handleWaterGeneration());
        applyBiomeBtn.addEventListener('click', () => handleBiomeGeneration());
        applyAiEditBtn.addEventListener('click', () => handleAiEdit());
        regenerateBtn.addEventListener('click', () => {
            if (typeof lastAIFunction === 'function') {
                lastAIFunction();
            } else {
                showModal("No previous AI action to regenerate.");
            }
        });
        lastPromptInput.addEventListener('focus', () => {
            lastPromptInput.readOnly = false;
        });
        lastPromptInput.addEventListener('blur', () => {
            lastPromptInput.readOnly = true;
        });
        
        // Listeners for advanced AI control labels
        const sliderLabelMap = {
            poiDensity: { el: poiDensityValue, map: ['Low', 'Medium', 'High'] },
            infrastructureDensity: { el: infrastructureDensityValue, map: ['Rural', 'Town', 'Metropolis'] },
            furnishingsDensity: { el: furnishingsDensityValue, map: ['Empty', 'Moderate', 'Cluttered'] },
            tacticalCover: { el: tacticalCoverValue, map: ['Open', 'Medium', 'Dense'] },
            hazardDensity: { el: hazardDensityValue, map: ['Low', 'Medium', 'High'] },
        };
        Object.keys(sliderLabelMap).forEach(id => {
            const slider = document.getElementById(id);
            const { el, map } = sliderLabelMap[id];
            slider.addEventListener('input', () => {
                el.textContent = map[slider.value];
            });
        });
    }

    async function initialize() {
        apiKey = localStorage.getItem('mapMakerApiKey') || '';
        togglePanel(false); // Start with panel open
        
        addEventListeners();
        
        const resizer = document.getElementById('resizer');
        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            const mouseMoveHandler = (e) => {
                if (!isResizing) return;
                const panel = document.getElementById('panelWrapper');
                const newWidth = e.clientX;
                const minWidth = 250;
                const maxWidth = window.innerWidth / 2;

                if (newWidth > minWidth && newWidth < maxWidth) {
                    panel.style.setProperty('--panel-width', `${newWidth}px`);
                    resizeCanvas();
                }
            };

            const mouseUpHandler = () => {
                isResizing = false;
                document.body.style.cursor = 'default';
                document.body.style.removeProperty('user-select');
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
        
        gridColorPicker.value = gridColor;
        gridVisibleCheckbox.checked = true;
        updateUndoRedoButtons();
        

        requestAnimationFrame(async () => {
            resizeCanvas();
            await initializePatterns(ctx);
            populateSelectors();
            generateBaseMap();
            centerView();
        });
    }
    
    // --- Initial Call ---
    initialize();
});
