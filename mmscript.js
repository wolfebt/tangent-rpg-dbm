// Version 4.22 - AI Dungeon Key Generator
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
    const savePlayerPngBtn = document.getElementById('savePlayerPngBtn');
    const saveJsonBtn = document.getElementById('saveJsonBtn');
    const loadJsonBtn = document.getElementById('loadJsonBtn');
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
    const genreSelector = document.getElementById('genreSelector');
    const scaleSelector = document.getElementById('scaleSelector');
    const settingsBtn = document.getElementById('settingsBtn');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const cancelApiKeyBtn = document.getElementById('cancelApiKey');
    const resizer = document.getElementById('resizer');
    // GM Layer UI Elements
    const gmViewToggleBtn = document.getElementById('gmViewToggleBtn');
    const gmViewIconOn = document.getElementById('gmViewIconOn');
    const gmViewIconOff = document.getElementById('gmViewIconOff');
    const objectGmOnlyCheckbox = document.getElementById('objectGmOnlyCheckbox');
    const textGmOnlyCheckbox = document.getElementById('textGmOnlyCheckbox');
    // Fog of War UI
    const toolFogRevealBtn = document.getElementById('toolFogRevealBtn');
    const toolFogHideBtn = document.getElementById('toolFogHideBtn');
    const fogBrushSizeSlider = document.getElementById('fogBrushSize');
    const fogBrushSizeValue = document.getElementById('fogBrushSizeValue');
    const resetFogBtn = document.getElementById('resetFogBtn');
    
    // AI Step UI
    const aiBottomPanel = document.getElementById('aiBottomPanel');
    const aiBottomPanelHeader = document.getElementById('aiBottomPanelHeader');
    const aiLayoutPrompt = document.getElementById('aiLayoutPrompt');
    const generateLayoutBtn = document.getElementById('generateLayoutBtn');
    const aiDressingPrompt = document.getElementById('aiDressingPrompt');
    const dressAreaBtn = document.getElementById('dressAreaBtn');
    const aiDataEditPrompt = document.getElementById('aiDataEditPrompt');
    const applyAiDataEditBtn = document.getElementById('applyAiDataEditBtn');
    const aiHexcrawlPrompt = document.getElementById('aiHexcrawlPrompt');
    const hexcrawlHexCount = document.getElementById('hexcrawlHexCount');
    const generateHexcrawlBtn = document.getElementById('generateHexcrawlBtn');
    const aiPointcrawlPrompt = document.getElementById('aiPointcrawlPrompt');
    const generatePointcrawlBtn = document.getElementById('generatePointcrawlBtn');
    const generateKeyBtn = document.getElementById('generateKeyBtn');
    
    // Map Key UI
    const mapKeyBtn = document.getElementById('mapKeyBtn');
    const mapKeyWindow = document.getElementById('mapKeyWindow');
    const mapKeyHeader = document.getElementById('mapKeyHeader');
    const mapKeyContent = document.getElementById('mapKeyContent');
    const mapKeyCloseBtn = document.getElementById('mapKeyCloseBtn');
    const gridTypeSelect = document.getElementById('gridTypeSelect');

    // Dungeon Key Modal UI
    const dungeonKeyModal = document.getElementById('dungeonKeyModal');
    const keyModalCloseBtn = document.getElementById('keyModalCloseBtn');
    const dungeonKeyContent = document.getElementById('dungeonKeyContent');

    
    // --- Configuration ---
    const baseHexSize = 30; 
    const baseSquareSize = 40;
    
    // --- State ---
    let terrains = {}; // Will be loaded from JSON
    let assetManifest = {}; // Will be loaded from JSON
    let gridType = 'hex';
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
    let selectedObjectKey = 'fantasy_world_tree';
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
    let undoStack = [];
    let redoStack = [];
    let currentGenre = 'fantasy';
    let currentScale = 'world';
    let placedAssets = [];
    let selectedPlacedAssetIndex = null;
    let isDragging = false;
    let dragOffsetX, dragOffsetY;
    let apiKey = '';
    let isDraggingKey = false;
    let keyDragOffset = { x: 0, y: 0 };
    let assetCache = {};
    let isGmViewActive = true;
    let isSelecting = false;
    let selectionStartPoint = null;
    let selectionEndPoint = null;
    let wallLines = [];
    let isDrawingWall = false;
    let currentWallPath = null;
    let fogDataUrl = null;
    let isFogging = false;
    let fogBrushSize = 5;
    let tokens = [];
    let selectedTokenIndex = -1;
    let isDraggingToken = false;
    let isDrawingPolygon = false;
    let currentPolygonPoints = [];

    // --- Data Definitions ---
    // Data is now loaded dynamically in the initialize() function

    // --- Function Definitions ---

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    async function loadAssets() {
        const promises = Object.keys(assetManifest).map(id => {
            return new Promise((resolve) => {
                const asset = assetManifest[id];
                const img = new Image();
                img.src = asset.src;
                img.onload = () => {
                    assetCache[id] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load asset: ${id}`);
                    resolve();
                };
            });
        });
        await Promise.all(promises);
        console.log("All assets pre-loaded.");
    }

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
        setTimeout(resizeCanvas, 300); 
    }

    function resizeCanvas() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        wallCanvas.width = width;
        wallCanvas.height = height;
        fogCanvas.width = width;
        fogCanvas.height = height;
        drawingCanvas.width = width;
        drawingCanvas.height = height;
        previewCanvas.width = width;
        previewCanvas.height = height;
        drawAll();
        resetFog();
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
        placedAssets = [];
        wallLines = [];
        tokens = [];
        undoStack = [];
        redoStack = [];
        activeLayerIndex = 0;
        mapName = generateRandomId(16);
        mapNameInput.value = mapName;
        renderLayers();
        updateUndoRedoButtons();
        updateMapKey();
        resetFog();
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
            wallCtx.clearRect(0,0, wallCanvas.width, wallCanvas.height);
            drawingCtx.clearRect(0,0, drawingCanvas.width, drawingCanvas.height);
            
            const viewBounds = {
                minX: -view.offsetX / view.zoom,
                minY: -view.offsetY / view.zoom,
                maxX: (canvas.width - view.offsetX) / view.zoom,
                maxY: (canvas.height - view.offsetY) / view.zoom,
            };

            drawFrame(ctx, null, {}, viewBounds);
            drawWalls(wallCtx, viewBounds);
            drawTokens(drawingCtx);
            
            drawFreestyleTerrainPaths(ctx);
            drawPencilPaths(ctx);
            
            if (isSelecting && selectionStartPoint && selectionEndPoint) {
                drawSelectionRectangle(drawingCtx);
            }

            if (gridVisibleCheckbox.checked) {
                drawGrid(drawingCtx, viewBounds);
            }
            
            if (selectedPlacedAssetIndex !== null) {
                const asset = placedAssets[selectedPlacedAssetIndex];
                if(asset) {
                    if (!isGmViewActive && asset.gmOnly) return;
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
             updateFogOfWar();
        });
    }

    function drawGrid(targetCtx, viewBounds) {
         targetCtx.save();
         targetCtx.translate(view.offsetX, view.offsetY);
         targetCtx.scale(view.zoom, view.zoom);

         for (const key in mapGrid) {
            const coords = key.split(',').map(Number);
            const { x, y } = (gridType === 'hex') ? hexToPixel(coords[0], coords[1]) : squareToPixel(coords[0], coords[1]);
            
            const size = gridType === 'hex' ? baseHexSize : baseSquareSize;
            if (x + size < viewBounds.minX || x - size > viewBounds.maxX || y + size < viewBounds.minY || y - size > viewBounds.maxY) {
                continue;
            }

            if (gridType === 'hex') {
                drawHexOutline(targetCtx, x, y, gridColor);
            } else {
                drawSquareOutline(targetCtx, x, y, gridColor);
            }
        }
        targetCtx.restore();
    }

    function drawFrame(targetCtx, bounds = null, options = {}, viewBounds = null) {
        const isPlayerFacing = options.isPlayerFacing || false;

        targetCtx.save();

        if (bounds) { 
            targetCtx.clearRect(0, 0, bounds.width, bounds.height);
            targetCtx.translate(-bounds.minPxX, -bounds.minPxY);
        } else { 
            targetCtx.translate(view.offsetX, view.offsetY);
            targetCtx.scale(view.zoom, view.zoom);
        }

        layers.forEach(layer => {
            if (!layer.visible) return;

            if (layer.backgroundImage && layer.backgroundImage.complete) {
                const { mapPixelWidth, mapPixelHeight, minPxX, minPxY } = getMapPixelBounds();
                targetCtx.drawImage(layer.backgroundImage, minPxX, minPxY, mapPixelWidth, mapPixelHeight);
            }

            for (const key in layer.data) {
                const hexData = layer.data[key];
                if ((!isGmViewActive || isPlayerFacing) && hexData.gmOnly) continue;

                const coords = key.split(',').map(Number);
                const {x, y} = (gridType === 'hex') ? hexToPixel(coords[0], coords[1]) : squareToPixel(coords[0], coords[1]);

                if (viewBounds) {
                    const size = gridType === 'hex' ? baseHexSize : baseSquareSize;
                    if (x + size < viewBounds.minX || x - size > viewBounds.maxX || y + size < viewBounds.minY || y - size > viewBounds.maxY) {
                        continue;
                    }
                }

                if (hexData.terrain) {
                    if (gridType === 'hex') {
                        drawHex(targetCtx, x, y, terrains[hexData.terrain]);
                    } else {
                        drawSquare(targetCtx, x, y, terrains[hexData.terrain]);
                    }
                }
                if (hexData.text) {
                    drawText(targetCtx, x, y, hexData.text, hexData.textSize, hexData.textColor, hexData.gmOnly);
                }
            }
        });
        
        placedAssets.forEach(asset => {
            if ((!isGmViewActive || isPlayerFacing) && asset.gmOnly) return;
            const {x, y} = (gridType === 'hex') ? hexToPixel(asset.q, asset.r) : squareToPixel(asset.q, asset.r);

            if (viewBounds) {
                const size = (gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.5 * asset.size;
                 if (x + size < viewBounds.minX || x - size > viewBounds.maxX || y + size < viewBounds.minY || y - size > viewBounds.maxY) {
                    return;
                }
            }

            drawObject(targetCtx, x, y, asset.assetId, asset.size, asset.gmOnly);
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
        targetCtx.lineWidth = 1.5 / view.zoom; 
        targetCtx.stroke();
    }

    function drawSquareOutline(targetCtx, x, y, strokeStyle) {
        targetCtx.strokeStyle = strokeStyle;
        targetCtx.lineWidth = 1.5 / view.zoom;
        targetCtx.strokeRect(x - baseSquareSize / 2, y - baseSquareSize / 2, baseSquareSize, baseSquareSize);
    }

     function drawObject(targetCtx, x, y, assetId, size = 1, isGmOnly = false) {
        const assetImage = assetCache[assetId];
        targetCtx.save();
        
        if (isGmViewActive && isGmOnly) {
            targetCtx.globalAlpha = 0.6;
        }

        if (assetImage && assetImage.complete) {
            const objectSize = (gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.5 * size;
            targetCtx.drawImage(assetImage, x - objectSize / 2, y - objectSize / 2, objectSize, objectSize);
        } else {
            const objectSize = (gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.2 * size;
            targetCtx.font = `${objectSize}px Arial`;
            targetCtx.textAlign = 'center';
            targetCtx.textBaseline = 'middle';
            targetCtx.fillText('?', x, y);
        }

        if (isGmViewActive && isGmOnly) {
            targetCtx.globalAlpha = 1.0;
            const objectSize = (gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.5 * size;
            targetCtx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // red-500
            targetCtx.lineWidth = 3 / view.zoom;
            targetCtx.strokeRect(x - objectSize/2, y - objectSize/2, objectSize, objectSize);
        }
        targetCtx.restore();
    }

    function drawText(targetCtx, x, y, text, size, color, isGmOnly = false) {
        targetCtx.save();
        if (isGmViewActive && isGmOnly) {
            targetCtx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // red-500
        } else {
            targetCtx.fillStyle = color;
        }
        targetCtx.font = `${size}px 'Trebuchet MS'`;
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText(text, x, y);
        targetCtx.restore();
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
            if (!isGmViewActive && path.gmOnly) return;

             if (path.type === 'freestyle') {
                if (path.points.length < 2) return;
                targetCtx.beginPath();
                targetCtx.strokeStyle = (isGmViewActive && path.gmOnly) ? 'rgba(239, 68, 68, 0.9)' : path.color;
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
                targetCtx.strokeStyle = (isGmViewActive && path.gmOnly) ? 'rgba(239, 68, 68, 0.9)' : path.color;
                targetCtx.lineWidth = path.width;
                targetCtx.moveTo(path.start.x, path.start.y);
                targetCtx.lineTo(path.end.x, path.end.y);
                targetCtx.stroke();
            } else if (path.type === 'rectangle') {
                targetCtx.beginPath();
                targetCtx.strokeStyle = (isGmViewActive && path.gmOnly) ? 'rgba(239, 68, 68, 0.9)' : path.color;
                targetCtx.lineWidth = path.width;
                targetCtx.rect(path.start.x, path.start.y, path.end.x - path.start.x, path.end.y - path.start.y);
                targetCtx.stroke();
            } else if (path.type === 'ellipse') {
                targetCtx.beginPath();
                targetCtx.strokeStyle = (isGmViewActive && path.gmOnly) ? 'rgba(239, 68, 68, 0.9)' : path.color;
                targetCtx.lineWidth = path.width;
                const rx = Math.abs(path.end.x - path.start.x) / 2;
                const ry = Math.abs(path.end.y - path.start.y) / 2;
                const cx = startPoint.x + (path.end.x - startPoint.x) / 2;
                const cy = startPoint.y + (path.end.y - startPoint.y) / 2;
                targetCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
                targetCtx.stroke();
            }
        });
        targetCtx.restore();
    }

    function drawWalls(targetCtx, viewBounds) {
        targetCtx.save();
        targetCtx.translate(view.offsetX, view.offsetY);
        targetCtx.scale(view.zoom, view.zoom);
        targetCtx.lineCap = 'round';

        wallLines.forEach(wall => {
            const inView = (wall.start.x < viewBounds.maxX && wall.end.x > viewBounds.minX) ||
                           (wall.end.x < viewBounds.maxX && wall.start.x > viewBounds.minX);
            if (!inView) return;
            
            targetCtx.strokeStyle = wall.blocksVision ? 'rgba(255, 255, 0, 0.8)' : 'rgba(255, 255, 0, 0.2)';
            targetCtx.lineWidth = wall.blocksVision ? 5 / view.zoom : 2 / view.zoom;

            targetCtx.beginPath();
            targetCtx.moveTo(wall.start.x, wall.start.y);
            targetCtx.lineTo(wall.end.x, wall.end.y);
            targetCtx.stroke();
        });

        targetCtx.restore();
    }

    function drawSelectionRectangle(targetCtx) {
        if (!selectionStartPoint || !selectionEndPoint) return;
        targetCtx.save();
        const startX = Math.min(selectionStartPoint.x, selectionEndPoint.x);
        const startY = Math.min(selectionStartPoint.y, selectionEndPoint.y);
        const width = Math.abs(selectionStartPoint.x - selectionEndPoint.x);
        const height = Math.abs(selectionStartPoint.y - selectionEndPoint.y);
        
        targetCtx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        targetCtx.fillRect(startX, startY, width, height);
        
        targetCtx.strokeStyle = 'rgba(96, 165, 250, 1)';
        targetCtx.lineWidth = 1;
        targetCtx.setLineDash([5, 5]);
        targetCtx.strokeRect(startX, startY, width, height);
        
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
        const angle_deg = 60 * i + 30;
        const angle_rad = Math.PI / 180 * angle_deg;
        return {
            x: center.x + size * Math.cos(angle_rad),
            y: center.y + size * Math.sin(angle_rad)
        };
    }

    function getTopTerrains() {
        const topTerrains = {};
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            if (!layer.visible || layer.type === 'grid') continue;
            for (const key in layer.data) {
                if (layer.data[key].terrain) {
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
            placedAssets: JSON.parse(JSON.stringify(placedAssets)),
            wallLines: JSON.parse(JSON.stringify(wallLines)),
            tokens: JSON.parse(JSON.stringify(tokens)),
            fogDataUrl: fogCanvas.toDataURL()
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
            placedAssets: JSON.parse(JSON.stringify(placedAssets)),
            wallLines: JSON.parse(JSON.stringify(wallLines)),
            tokens: JSON.parse(JSON.stringify(tokens)),
            fogDataUrl: fogCanvas.toDataURL()
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
        wallLines = previousState.wallLines;
        tokens = previousState.tokens;
        
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
            placedAssets: JSON.parse(JSON.stringify(placedAssets)),
            wallLines: JSON.parse(JSON.stringify(wallLines)),
            tokens: JSON.parse(JSON.stringify(tokens)),
            fogDataUrl: fogCanvas.toDataURL()
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
        wallLines = nextState.wallLines;
        tokens = nextState.tokens;
        
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
                    const assetData = assetManifest[selectedObjectKey];
                    if(assetData) {
                        const newAsset = { 
                            assetId: selectedObjectKey, 
                            q: hex.q, 
                            r: hex.r, 
                            size: brushSize,
                            gmOnly: objectGmOnlyCheckbox.checked
                        };
                        placedAssets.push(newAsset);
                    }
                } else if (toolToUse === 'placeText') {
                    activeLayer.data[key] = {
                        ...activeLayer.data[key],
                        text: textInput.value,
                        textSize: fontSizeInput.value,
                        textColor: fontColorInput.value,
                        gmOnly: textGmOnlyCheckbox.checked
                    };
                } else if (toolToUse === 'eraser') {
                   if(activeLayer.data[key]) {
                       delete activeLayer.data[key];
                   }
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
                // Polygon is handled by its own logic, not this function
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
        
        // Draw with GM view ON for this export
        const originalGmViewState = isGmViewActive;
        isGmViewActive = true;
        drawFrame(offscreenCtx, bounds, {});
        isGmViewActive = originalGmViewState;
        
        offscreenCtx.save();
        offscreenCtx.translate(-minPxX, -minPxY);
        drawFreestyleTerrainPathsForExport(offscreenCtx, {});
        drawPencilPathsForExport(offscreenCtx, {});
        offscreenCtx.restore();

        const tagText = "TTRPG HEX MAP MAKER by Wolfe.BT@TangentLLC";
        offscreenCtx.font = "200 14px 'Trebuchet MS'";
        offscreenCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
        offscreenCtx.textAlign = "left";
        offscreenCtx.fillText(tagText, 10, mapPixelHeight - 10);

        const dataUrl = offscreenCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${getSafeFilename(mapName)}_GM.png`;
        link.href = dataUrl;
        link.click();
    }

    // NEW: Player-facing export function
    function saveAsPlayerPNGLogic() {
        const { mapPixelWidth, mapPixelHeight, minPxX, minPxY } = getMapPixelBounds();
        
        if (mapPixelWidth <= 0 || mapPixelHeight <= 0) {
            showModal("Cannot save an empty map.");
            return;
        }

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = mapPixelWidth;
        offscreenCanvas.height = mapPixelHeight;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        // 1. Fill background
        offscreenCtx.fillStyle = '#374151'; // bg-gray-700
        offscreenCtx.fillRect(0, 0, mapPixelWidth, mapPixelHeight);

        const bounds = { width: mapPixelWidth, height: mapPixelHeight, minPxX, minPxY };
        
        // 2. Draw all player-visible elements
        drawFrame(offscreenCtx, bounds, { isPlayerFacing: true });
        
        offscreenCtx.save();
        offscreenCtx.translate(-minPxX, -minPxY);
        drawFreestyleTerrainPathsForExport(offscreenCtx, { isPlayerFacing: true });
        drawPencilPathsForExport(offscreenCtx, { isPlayerFacing: true });
        offscreenCtx.restore();

        // 3. Composite the fog of war on top
        // This is a simplified approach that scales the current fog view over the entire map.
        // A more advanced implementation would require a world-space fog canvas.
        offscreenCtx.drawImage(fogCanvas, 0, 0, mapPixelWidth, mapPixelHeight);

        // 4. Add watermark and download
        const tagText = "TTRPG HEX MAP MAKER by Wolfe.BT@TangentLLC";
        offscreenCtx.font = "200 14px 'Trebuchet MS'";
        offscreenCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
        offscreenCtx.textAlign = "left";
        offscreenCtx.fillText(tagText, 10, mapPixelHeight - 10);

        const dataUrl = offscreenCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${getSafeFilename(mapName)}_Player.png`;
        link.href = dataUrl;
        link.click();
    }

    function saveAsJSONLogic() {
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
            placedAssets: placedAssets,
            wallLines: wallLines,
            tokens: tokens,
            fogDataUrl: fogCanvas.toDataURL()
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
    
    function drawFreestyleTerrainPathsForExport(targetCtx, options = {}) {
        const isPlayerFacing = options.isPlayerFacing || false;
        freestyleTerrainPaths.forEach(path => {
            // For now, freestyle terrain is always visible. Add gmOnly flag later if needed.
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

    function drawPencilPathsForExport(targetCtx, options = {}) {
        const isPlayerFacing = options.isPlayerFacing || false;
        pencilPaths.forEach(path => {
            if (isPlayerFacing && path.gmOnly) return;
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
                const cx = startPoint.x + (path.end.x - startPoint.x) / 2;
                const cy = startPoint.y + (path.end.y - startPoint.y) / 2;
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
                    wallLines = loadedData.wallLines || [];
                    tokens = loadedData.tokens || [];
                    mapName = loadedData.name || 'Untitled Loaded Map';
                    
                    layers = loadedData.layers.map(layerData => {
                        if (layerData.backgroundImage && layerData.backgroundImage.src) {
                            const img = new Image();
                            img.src = layerData.backgroundImage.src;
                            layerData.backgroundImage = img;
                            img.onload = () => drawAll();
                        }
                        return layerData;
                    });

                    if (loadedData.fogDataUrl) {
                        const img = new Image();
                        img.onload = () => {
                            fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
                            fogCtx.drawImage(img, 0, 0);
                        };
                        img.src = loadedData.fogDataUrl;
                    } else {
                        resetFog();
                    }

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
            swatch.style.backgroundImage = `url(${getPatternDataUri(terrains[key].pattern)})`;
            
            const label = document.createElement('div');
            label.className = 'item-label';
            label.textContent = terrains[key].name;

            itemContainer.appendChild(swatch);
            itemContainer.appendChild(label);
            terrainSelector.appendChild(itemContainer);
        });

        objectSelector.innerHTML = '';
        Object.keys(assetManifest).forEach(assetId => {
            const asset = assetManifest[assetId];
            if (asset.tags.includes(currentGenre) && asset.tags.includes(currentScale)) {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'item-container';
                itemContainer.dataset.objectKey = assetId;
                itemContainer.addEventListener('click', () => { 
                    nextClickAction = 'placeObject'; 
                    selectedObjectKey = assetId;
                    updateActiveSwatches(); 
                });
                
                const swatch = document.createElement('div');
                swatch.className = 'object-swatch';
                const img = new Image();
                img.src = asset.src;
                swatch.appendChild(img);

                const label = document.createElement('div');
                label.className = 'item-label';
                label.textContent = asset.name;

                itemContainer.appendChild(swatch);
                itemContainer.appendChild(label);
                objectSelector.appendChild(itemContainer);
            }
        });
        
        updateActiveSwatches();
    }

    function updateActiveSwatches() {
        document.querySelectorAll('.item-container.active, .control-panel button.active, .collapsible-header.active').forEach(el => el.classList.remove('active'));

        terrainOptionsPanel.classList.add('hidden');
        pencilOptionsPanel.classList.add('hidden');
        tokenOptionsPanel.classList.add('hidden');
        canvas.classList.remove('pencil', 'selecting', 'wall-drawing', 'fogging', 'token-placement', 'interact');

        document.querySelector(`#genreSelector .control-btn[data-genre="${currentGenre}"]`)?.classList.add('active');
        document.querySelector(`#scaleSelector .control-btn[data-scale="${currentScale}"]`)?.classList.add('active');

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
        } else if (currentTool === 'select') {
            toolSelectBtn.classList.add('active');
            canvas.classList.add('selecting');
        } else if (currentTool === 'wall') {
            toolWallBtn.classList.add('active');
            canvas.classList.add('wall-drawing');
        } else if (currentTool === 'token') {
            toolTokenBtn.classList.add('active');
            tokenOptionsPanel.classList.remove('hidden');
            canvas.classList.add('token-placement');
        } else if (currentTool === 'interact') {
            toolInteractBtn.classList.add('active');
            canvas.classList.add('interact');
        } else if (currentTool === 'fogReveal' || currentTool === 'fogHide') {
            if(currentTool === 'fogReveal') toolFogRevealBtn.classList.add('active');
            if(currentTool === 'fogHide') toolFogHideBtn.classList.add('active');
            canvas.classList.add('fogging');
        } else if (currentTool === 'eraser') {
            eraserBtn.classList.add('active');
            terrainOptionsPanel.classList.remove('hidden');
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
        
        placedAssets.forEach(asset => {
            if (!asset.gmOnly) {
                usedObjects.add(asset.assetId);
            }
        });

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
            Array.from(usedObjects).sort().forEach(assetId => {
                const asset = assetManifest[assetId];
                 if (asset) {
                     const assetImage = assetCache[assetId];
                     contentHTML += `
                        <div class="key-item">
                            <div class="key-swatch">
                                ${assetImage ? `<img src="${assetImage.src}" alt="${asset.name}">` : ''}
                            </div>
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
                if (layer.data[key].terrain && !layer.data[key].gmOnly) usedTerrains.add(layer.data[key].terrain);
            }
        });
        
        placedAssets.forEach(asset => {
            if (!asset.gmOnly) usedObjects.add(asset.assetId);
        });

        if (usedTerrains.size === 0 && usedObjects.size === 0) return;

        const keyWidth = 150;
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

        targetCtx.fillStyle = 'rgba(31, 41, 55, 0.9)';
        targetCtx.fillRect(x, y, keyWidth, titleHeight + padding);
        
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
                    const asset = assetManifest[itemKey];
                    const assetImage = assetCache[itemKey];
                    if(asset && assetImage && assetImage.complete) {
                        targetCtx.drawImage(assetImage, itemX, itemY + (itemHeight - swatchSize) / 2, swatchSize, swatchSize);
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

    // NEW: Builds a detailed, context-aware prompt for the AI
    function buildContextualPrompt(userPrompt, actionType, additionalContext = {}) {
        let preamble = `You are an expert TTRPG map designer and game master. Your task is to interpret a user's request and provide a structured JSON response. `;
        preamble += `The current map genre is '${currentGenre}' and the scale is '${currentScale}'. `;

        // Add context based on action type
        switch (actionType) {
            case 'layout':
                preamble += `You are generating a new map layout. The grid type is '${gridType}'. `;
                break;
            case 'dressing':
                preamble += `You are dressing an existing area with objects. The user has selected a specific region on the map. You must only place objects within the provided coordinates. `;
                preamble += `Available assets for this genre/scale are: ${JSON.stringify(additionalContext.availableAssets)}. `;
                preamble += `The selected coordinates are: ${JSON.stringify(additionalContext.selectedHexes)}. `;
                break;
            case 'dataEdit':
                 preamble += `You are editing the terrain data of a selected area. You must only affect the provided coordinates. `;
                 preamble += `Available terrain types are: ${JSON.stringify(Object.keys(terrains))}. `;
                 preamble += `The selected coordinates are: ${JSON.stringify(additionalContext.selectedHexes)}. `;
                break;
            case 'hexcrawl':
                preamble += `You are generating content for a hexcrawl-style regional map. The user has requested details for ${additionalContext.hexCount} hexes. Generate a list of points of interest, brief descriptions, and suggest an appropriate terrain type for each. The map grid is ${mapWidthInput.value}x${mapHeightInput.value}. Choose random, valid coordinates within these bounds.`;
                break;
            case 'pointcrawl':
                preamble += `You are generating content for a pointcrawl-style map (like a city or region). Create a series of named locations (nodes) and the connections (edges) between them. Provide a brief description for each node and suggest logical coordinates on a ${mapWidthInput.value}x${mapHeightInput.value} grid.`;
                break;
            case 'keyGeneration':
                preamble += `You are an adventure writer creating a descriptive key for a dungeon map. Based on the provided room data (which includes room numbers, terrain types, and a list of objects in each room), write an evocative, sensory-rich description for each room. The descriptions should be suitable for a GM to read aloud.`;
                preamble += `Here is the map data: ${JSON.stringify(additionalContext.roomData)}`;
                break;
        }

        return `${preamble} The user's specific request is: "${userPrompt}". Please generate the appropriate JSON response.`;
    }
    
    async function callGenerativeAIForJSON(prompt, schema) {
        if (!apiKey) {
            showModal("Please set your API key in the settings first.");
            return null;
        }
        showModal("AI is generating... Please wait.", null);
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        };

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
            const jsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!jsonString) {
                console.error("Unexpected API response structure:", result);
                throw new Error("Could not find JSON data in the API response.");
            }
            
            document.querySelector('.modal-backdrop')?.remove();
            return JSON.parse(jsonString);

        } catch (error) {
            console.error("AI JSON Generation Error:", error);
            showModal(`An error occurred during AI generation: ${error.message}`);
            const loadingModal = document.querySelector('.modal-backdrop');
            if (loadingModal && loadingModal.textContent.includes("AI is generating")) {
                loadingModal.remove();
            }
            return null;
        }
    }
    
    // --- Event Handler Implementations ---

    async function handleLayoutGeneration() {
        const userPrompt = aiLayoutPrompt.value;
        if (!userPrompt) {
            showModal("Please describe the layout you want to generate.");
            return;
        }

        const schema = {
            type: "OBJECT",
            properties: {
                rooms: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "NUMBER" },
                            description: { type: "STRING" },
                            coordinates: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        q: { type: "NUMBER" },
                                        r: { type: "NUMBER" }
                                    },
                                    required: ["q", "r"]
                                }
                            }
                        },
                        required: ["id", "description", "coordinates"]
                    }
                },
                doors: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            coordinates: {
                                type: "OBJECT",
                                properties: {
                                    q: { type: "NUMBER" },
                                    r: { type: "NUMBER" }
                                },
                                required: ["q", "r"]
                            }
                        },
                        required: ["coordinates"]
                    }
                }
            },
            required: ["rooms", "doors"]
        };
        
        const fullPrompt = buildContextualPrompt(userPrompt, 'layout');
        const layoutData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (layoutData) {
            ingestGeneratedLayout(layoutData);
        }
    }

    function ingestGeneratedLayout(data) {
        saveState();
        generateBaseMap();

        const groundLayer = layers.find(l => l.name === 'Ground');
        if (!groundLayer) return;

        data.rooms.forEach(room => {
            room.coordinates.forEach(coord => {
                const key = `${coord.q},${coord.r}`;
                groundLayer.data[key] = { terrain: 'dirt' };
            });
        });

        data.doors.forEach(door => {
            const newAsset = {
                assetId: 'fantasy_location_door',
                q: door.coordinates.q,
                r: door.coordinates.r,
                size: 1,
                gmOnly: false
            };
            placedAssets.push(newAsset);
        });

        centerView();
        updateMapKey();
        drawAll();
    }

    async function handleAiDressing() {
        const userPrompt = aiDressingPrompt.value;
        if (!userPrompt) {
            showModal("Please describe how to dress the selected area.");
            return;
        }
        const selectedHexes = getHexesInSelection();
        if (selectedHexes.length === 0) {
            showModal("Please use the 'Select' tool to choose an area first.");
            return;
        }

        const availableAssets = Object.keys(assetManifest)
            .filter(id => assetManifest[id].tags.includes(currentGenre) && assetManifest[id].tags.includes(currentScale))
            .map(id => ({ id, name: assetManifest[id].name, tags: assetManifest[id].tags }));

        const schema = {
            type: "OBJECT",
            properties: {
                placements: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            assetId: { type: "STRING" },
                            coordinates: {
                                type: "OBJECT",
                                properties: {
                                    q: { type: "NUMBER" },
                                    r: { type: "NUMBER" }
                                },
                                required: ["q", "r"]
                            }
                        },
                        required: ["assetId", "coordinates"]
                    }
                }
            },
            required: ["placements"]
        };

        const additionalContext = { availableAssets, selectedHexes };
        const fullPrompt = buildContextualPrompt(userPrompt, 'dressing', additionalContext);
        const dressingData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (dressingData) {
            ingestGeneratedDressing(dressingData);
        }
    }

    function ingestGeneratedDressing(data) {
        saveState();
        if (data.placements && Array.isArray(data.placements)) {
            data.placements.forEach(placement => {
                if (assetManifest[placement.assetId]) {
                    const newAsset = {
                        assetId: placement.assetId,
                        q: placement.coordinates.q,
                        r: placement.coordinates.r,
                        size: 1,
                        gmOnly: false
                    };
                    placedAssets.push(newAsset);
                }
            });
        }
        drawAll();
        updateMapKey();
    }

    async function handleAiDataEdit() {
        const userPrompt = aiDataEditPrompt.value;
        if (!userPrompt) {
            showModal("Please provide an edit instruction.");
            return;
        }
        const selectedHexes = getHexesInSelection();
        if (selectedHexes.length === 0) {
            showModal("Please use the 'Select' tool to define an area for the edit.");
            return;
        }

        const schema = {
            type: "OBJECT",
            properties: {
                tool: {
                    type: "STRING",
                    enum: ["paintTerrain"]
                },
                parameters: {
                    type: "OBJECT",
                    properties: {
                        terrainType: { type: "STRING" },
                        coordinates: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    q: { type: "NUMBER" },
                                    r: { type: "NUMBER" }
                                },
                                required: ["q", "r"]
                            }
                        }
                    },
                    required: ["terrainType", "coordinates"]
                }
            },
            required: ["tool", "parameters"]
        };

        const additionalContext = { selectedHexes };
        const fullPrompt = buildContextualPrompt(userPrompt, 'dataEdit', additionalContext);
        const command = await callGenerativeAIForJSON(fullPrompt, schema);

        if (command) {
            ingestAiCommand(command);
        }
    }

    function ingestAiCommand(command) {
        saveState();
        if (!command || !command.tool) {
            console.error("Invalid command from AI:", command);
            return;
        }

        switch (command.tool) {
            case 'paintTerrain':
                const groundLayer = layers.find(l => l.name === 'Ground');
                if (groundLayer && command.parameters && command.parameters.coordinates && command.parameters.terrainType) {
                    if (terrains[command.parameters.terrainType]) {
                        command.parameters.coordinates.forEach(coord => {
                            const key = `${coord.q},${coord.r}`;
                            groundLayer.data[key] = { terrain: command.parameters.terrainType };
                        });
                    } else {
                        console.warn(`AI requested invalid terrain type: ${command.parameters.terrainType}`);
                    }
                }
                break;
            default:
                console.warn(`Unknown AI command tool: ${command.tool}`);
        }

        drawAll();
        updateMapKey();
    }

    async function handleHexcrawlGeneration() {
        const userPrompt = aiHexcrawlPrompt.value;
        if (!userPrompt) {
            showModal("Please describe the region for the hexcrawl.");
            return;
        }
        const hexCount = parseInt(hexcrawlHexCount.value);

        const schema = {
            type: "OBJECT",
            properties: {
                hexes: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            coordinates: {
                                type: "OBJECT",
                                properties: { q: { type: "NUMBER" }, r: { type: "NUMBER" } },
                                required: ["q", "r"]
                            },
                            poi: { type: "STRING", description: "A short, evocative name for the point of interest." },
                            description: { type: "STRING", description: "A one-sentence description of the location." },
                            terrain: { type: "STRING", description: "The suggested terrain type from the available list." }
                        },
                        required: ["coordinates", "poi", "description", "terrain"]
                    }
                }
            },
            required: ["hexes"]
        };

        const fullPrompt = buildContextualPrompt(userPrompt, 'hexcrawl', { hexCount });
        const hexcrawlData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (hexcrawlData) {
            ingestGeneratedHexcrawl(hexcrawlData);
        }
    }

    function ingestGeneratedHexcrawl(data) {
        saveState();
        const groundLayer = layers.find(l => l.name === 'Ground');
        const objectsLayer = layers.find(l => l.name === 'Objects');
        if (!groundLayer || !objectsLayer) return;

        data.hexes.forEach(hex => {
            const key = `${hex.coordinates.q},${hex.coordinates.r}`;
            if (mapGrid[key]) {
                // Set terrain
                if (terrains[hex.terrain]) {
                    groundLayer.data[key] = { terrain: hex.terrain };
                }
                // Add POI label
                objectsLayer.data[key] = {
                    ...objectsLayer.data[key],
                    text: hex.poi,
                    textSize: 16,
                    textColor: '#FFFFFF',
                    gmOnly: true // Hexcrawl details are GM-only by default
                };
            }
        });

        drawAll();
        updateMapKey();
    }

    async function handlePointcrawlGeneration() {
        const userPrompt = aiPointcrawlPrompt.value;
        if (!userPrompt) {
            showModal("Please describe the area for the pointcrawl.");
            return;
        }

        const schema = {
            type: "OBJECT",
            properties: {
                nodes: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "STRING" },
                            name: { type: "STRING" },
                            description: { type: "STRING" },
                            coordinates: {
                                type: "OBJECT",
                                properties: { q: { type: "NUMBER" }, r: { type: "NUMBER" } },
                                required: ["q", "r"]
                            }
                        },
                        required: ["id", "name", "description", "coordinates"]
                    }
                },
                edges: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            from: { type: "STRING" },
                            to: { type: "STRING" }
                        },
                        required: ["from", "to"]
                    }
                }
            },
            required: ["nodes", "edges"]
        };

        const fullPrompt = buildContextualPrompt(userPrompt, 'pointcrawl');
        const pointcrawlData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (pointcrawlData) {
            ingestGeneratedPointcrawl(pointcrawlData);
        }
    }

    function ingestGeneratedPointcrawl(data) {
        saveState();
        const objectsLayer = layers.find(l => l.name === 'Objects');
        if (!objectsLayer) return;

        const nodePositions = {};

        // Place nodes (POIs)
        data.nodes.forEach(node => {
            const key = `${node.coordinates.q},${node.coordinates.r}`;
            if (mapGrid[key]) {
                objectsLayer.data[key] = {
                    ...objectsLayer.data[key],
                    text: `[${node.id}] ${node.name}`,
                    textSize: 20,
                    textColor: '#fde047', // yellow-300
                    gmOnly: false
                };
                const pixelPos = gridType === 'hex' ? hexToPixel(node.coordinates.q, node.coordinates.r) : squareToPixel(node.coordinates.q, node.coordinates.r);
                nodePositions[node.id] = pixelPos;
            }
        });

        // Draw edges (connections)
        data.edges.forEach(edge => {
            const startNode = nodePositions[edge.from];
            const endNode = nodePositions[edge.to];

            if (startNode && endNode) {
                pencilPaths.push({
                    type: 'line',
                    start: startNode,
                    end: endNode,
                    color: 'rgba(255, 255, 255, 0.5)',
                    width: 3,
                    gmOnly: false
                });
            }
        });

        drawAll();
        updateMapKey();
    }


    function getHexesInSelection() {
        if (!selectionStartPoint || !selectionEndPoint) return [];

        const startCoords = pixelToGrid(selectionStartPoint.x, selectionStartPoint.y);
        const endCoords = pixelToGrid(selectionEndPoint.x, selectionEndPoint.y);

        const results = [];
        const q_min = Math.min(startCoords.q, endCoords.q);
        const q_max = Math.max(startCoords.q, endCoords.q);
        const r_min = Math.min(startCoords.r, endCoords.r);
        const r_max = Math.max(startCoords.r, endCoords.r);

        for (let q = q_min; q <= q_max; q++) {
            for (let r = r_min; r <= r_max; r++) {
                const key = `${q},${r}`;
                if (mapGrid[key]) {
                    results.push({ q, r });
                }
            }
        }
        return results;
    }

    function resetFog() {
        fogCtx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);
        fogDataUrl = fogCanvas.toDataURL();
    }


    function addEventListeners() {
        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        const throttledMouseMove = throttle(e => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (isPanning) {
                view.offsetX += e.clientX - panStart.x;
                view.offsetY += e.clientY - panStart.y;
                panStart = { x: e.clientX, y: e.clientY };
                drawAll();
                return;
            }
            
            if (isSelecting) {
                selectionEndPoint = { x: mouseX, y: mouseY };
                drawAll();
                return;
            }

            if (isDrawingWall) {
                previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                const endPoint = pixelToGrid(mouseX, mouseY, true);
                previewCtx.save();
                previewCtx.translate(view.offsetX, view.offsetY);
                previewCtx.scale(view.zoom, view.zoom);
                previewCtx.beginPath();
                previewCtx.moveTo(shapeStartPoint.x, shapeStartPoint.y);
                previewCtx.lineTo(endPoint.x, endPoint.y);
                previewCtx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                previewCtx.lineWidth = 5 / view.zoom;
                previewCtx.stroke();
                previewCtx.restore();
                drawAll();
                drawingCtx.drawImage(previewCanvas, 0, 0);
                return;
            }

            if (isFogging) {
                const fogBrushRadius = fogBrushSize * 5;
                fogCtx.beginPath();
                fogCtx.arc(mouseX, mouseY, fogBrushRadius, 0, 2 * Math.PI);
                fogCtx.globalCompositeOperation = currentTool === 'fogReveal' ? 'destination-out' : 'source-over';
                fogCtx.fill();
                return;
            }

            const worldMousePos = pixelToGrid(mouseX, mouseY);

            if(isDragging && selectedPlacedAssetIndex !== null) {
                const asset = placedAssets[selectedPlacedAssetIndex];
                asset.q = worldMousePos.q - dragOffsetX;
                asset.r = worldMousePos.r - dragOffsetY;
                drawAll();
            } else if (isDraggingToken && selectedTokenIndex !== -1) {
                const token = tokens[selectedTokenIndex];
                const {x, y} = pixelToGrid(mouseX, mouseY, true);
                token.x = x;
                token.y = y;
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
                drawingCtx.drawImage(previewCanvas, 0, 0);
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
            }
        }, 16); // Throttle to ~60fps

        canvas.addEventListener('mousemove', throttledMouseMove);

        canvas.addEventListener('mousedown', e => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldMousePos = pixelToGrid(mouseX, mouseY);
            const worldClick = pixelToGrid(mouseX, mouseY, true);

            if (e.button === 2) { // Right-click for panning
                isPanning = true;
                panStart = { x: e.clientX, y: e.clientY };
                canvas.classList.add('panning');
                return;
            }

            if (e.button === 0) { // Left-click for tools
                 if (currentTool === 'interact') {
                    handleInteraction(worldClick);
                    return;
                }
                if (currentTool === 'token') {
                     // Check if clicking an existing token
                    for (let i = tokens.length - 1; i >= 0; i--) {
                        const token = tokens[i];
                        const dist = Math.hypot(worldClick.x - token.x, worldClick.y - token.y);
                        const tokenRadius = (gridType === 'hex' ? baseHexSize : baseSquareSize) * 0.4;
                        if (dist < tokenRadius) {
                            selectedTokenIndex = i;
                            isDraggingToken = true;
                            updateTokenPanel();
                            return;
                        }
                    }
                    // If not clicking a token, place a new one
                    saveState();
                    const newToken = {
                        x: worldClick.x,
                        y: worldClick.y,
                        lightRadius: parseInt(tokenLightRadiusSlider.value),
                        color: tokenColorPicker.value
                    };
                    tokens.push(newToken);
                    selectedTokenIndex = tokens.length - 1;
                    updateTokenPanel();
                    drawAll();
                    return;
                }

                if (currentTool === 'select') {
                    isSelecting = true;
                    selectionStartPoint = { x: mouseX, y: mouseY };
                    selectionEndPoint = { x: mouseX, y: mouseY };
                    return;
                }
                
                if (currentTool === 'wall') {
                    isDrawingWall = true;
                    shapeStartPoint = pixelToGrid(mouseX, mouseY, true);
                    return;
                }

                if (currentTool === 'fogReveal' || currentTool === 'fogHide') {
                    isFogging = true;
                    const fogBrushRadius = fogBrushSize * 5;
                    fogCtx.beginPath();
                    fogCtx.arc(mouseX, mouseY, fogBrushRadius, 0, 2 * Math.PI);
                    fogCtx.globalCompositeOperation = currentTool === 'fogReveal' ? 'destination-out' : 'source-over';
                    fogCtx.fill();
                    return;
                }

                let assetClicked = false;
                if (currentTool !== 'mask') {
                    for (let i = placedAssets.length - 1; i >= 0; i--) {
                        const asset = placedAssets[i];
                        if (!isGmViewActive && asset.gmOnly) continue;

                        const {x, y} = (gridType === 'hex') ? hexToPixel(asset.q, asset.r) : squareToPixel(asset.q, asset.r);
                        const size = (gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.2 * asset.size;
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
                    currentPencilPath = { 
                        type: 'freestyle', 
                        color: pencilColor, 
                        width: pencilWidth, 
                        points: [pixelToGrid(mouseX, mouseY, true)],
                        gmOnly: pencilGmOnlyCheckbox.checked
                    };
                }
            }
        });
        
        canvas.addEventListener('mouseup', e => {
            if (e.button === 0) { // Left-click release
                if(isSelecting) {
                    isSelecting = false;
                    drawAll();
                    return;
                }
                
                if (isDrawingWall) {
                    const endPoint = pixelToGrid(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top, true);
                    wallLines.push({ start: shapeStartPoint, end: endPoint, id: generateRandomId(8), blocksVision: true });
                    isDrawingWall = false;
                    shapeStartPoint = null;
                    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                    drawAll();
                    return;
                }

                if (isFogging) {
                    isFogging = false;
                    fogDataUrl = fogCanvas.toDataURL(); // Save state after drawing
                    return;
                }

                isDragging = false;
                isDraggingToken = false;
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
                            width: pencilWidth,
                            gmOnly: pencilGmOnlyCheckbox.checked
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
            isPanning = false;
            isDrawingShape = false;
            isSelecting = false;
            isDrawingWall = false;
            isFogging = false;
            isDraggingToken = false;
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
        toolSelectBtn.addEventListener('click', () => { currentTool = 'select'; nextClickAction = null; updateActiveSwatches(); });
        toolWallBtn.addEventListener('click', () => { currentTool = 'wall'; nextClickAction = null; updateActiveSwatches(); });
        toolTokenBtn.addEventListener('click', () => { currentTool = 'token'; nextClickAction = null; updateActiveSwatches(); });
        toolInteractBtn.addEventListener('click', () => { currentTool = 'interact'; nextClickAction = null; updateActiveSwatches(); });
        toolFogRevealBtn.addEventListener('click', () => { currentTool = 'fogReveal'; updateActiveSwatches(); });
        toolFogHideBtn.addEventListener('click', () => { currentTool = 'fogHide'; updateActiveSwatches(); });
        resetFogBtn.addEventListener('click', () => {
            showModal("This will cover the entire map in fog again. Are you sure?", resetFog);
        });
        fogBrushSizeSlider.addEventListener('input', e => {
            fogBrushSize = parseInt(e.target.value);
            fogBrushSizeValue.textContent = fogBrushSize;
        });
        
        terrainBrushModeSelect.addEventListener('change', (e) => { terrainBrushMode = e.target.value; });
        pencilBrushModeSelect.addEventListener('change', (e) => { pencilBrushMode = e.target.value; });
        pencilColorPicker.addEventListener('input', e => { pencilColor = e.target.value; });
        pencilWidthSlider.addEventListener('input', e => {
            pencilWidth = parseInt(e.target.value);
            pencilWidthValue.textContent = pencilWidth;
        });
        tokenLightRadiusSlider.addEventListener('input', e => {
            const radius = parseInt(e.target.value);
            tokenLightRadiusValue.textContent = radius;
            if (selectedTokenIndex !== -1) {
                tokens[selectedTokenIndex].lightRadius = radius;
                drawAll();
            }
        });
        tokenColorPicker.addEventListener('input', e => {
            if (selectedTokenIndex !== -1) {
                tokens[selectedTokenIndex].color = e.target.value;
                drawAll();
            }
        });
        deleteTokenBtn.addEventListener('click', () => {
            if (selectedTokenIndex !== -1) {
                saveState();
                tokens.splice(selectedTokenIndex, 1);
                selectedTokenIndex = -1;
                updateTokenPanel();
                drawAll();
            }
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
        savePlayerPngBtn.addEventListener('click', () => promptForMapNameAndSave(saveAsPlayerPNGLogic));
        saveJsonBtn.addEventListener('click', () => promptForMapNameAndSave(saveAsJSONLogic));
        loadJsonBtn.addEventListener('click', () => loadJsonInput.click());
        loadJsonInput.addEventListener('change', loadFromJSON);
        accordionHeaders.forEach(clickedHeader => {
            clickedHeader.addEventListener('click', () => {
                const clickedContent = clickedHeader.nextElementSibling;
                const isCurrentlyCollapsed = clickedHeader.classList.contains('collapsed');

                accordionHeaders.forEach(header => {
                    header.classList.add('collapsed');
                    header.nextElementSibling.classList.add('hidden');
                });

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
            apiKeyInput.value = apiKey;
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
                    terrainBrushModeSelect.value = 'spray';
                    terrainBrushMode = 'spray';
                }
            }
            generateBaseMap();
            drawAll();
        });
        
        // GM View Toggle Listener
        gmViewToggleBtn.addEventListener('click', () => {
            isGmViewActive = !isGmViewActive;
            gmViewIconOn.classList.toggle('hidden', !isGmViewActive);
            gmViewIconOff.classList.toggle('hidden', isGmViewActive);
            gmViewToggleBtn.classList.toggle('gm-active', isGmViewActive);
            drawAll();
        });

        // AI Listeners
        aiBottomPanelHeader.addEventListener('click', () => {
            aiBottomPanel.classList.toggle('closed');
        });
        
        generateLayoutBtn.addEventListener('click', handleLayoutGeneration);
        dressAreaBtn.addEventListener('click', handleAiDressing);
        applyAiDataEditBtn.addEventListener('click', handleAiDataEdit);
        generateHexcrawlBtn.addEventListener('click', handleHexcrawlGeneration);
        generatePointcrawlBtn.addEventListener('click', handlePointcrawlGeneration);
        generateKeyBtn.addEventListener('click', handleKeyGeneration);

        // Dungeon Key Modal Listeners
        keyModalCloseBtn.addEventListener('click', () => dungeonKeyModal.classList.add('hidden'));
        dungeonKeyModal.addEventListener('click', (e) => {
            if (e.target === dungeonKeyModal) {
                dungeonKeyModal.classList.add('hidden');
            }
        });
    }

    async function initialize() {
        apiKey = localStorage.getItem('mapMakerApiKey') || '';
        togglePanel(false);
        
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
        
        // Load external data first
        try {
            // NOTE: In a real server environment, you would place these in a /data/ directory.
            // For this self-contained example, we'll assume they are in the same directory.
            const [terrainsResponse, assetsResponse] = await Promise.all([
                fetch('./terrains.json'),
                fetch('./assets.json')
            ]);
            if (!terrainsResponse.ok || !assetsResponse.ok) {
                throw new Error(`HTTP error! status: ${terrainsResponse.status}, ${assetsResponse.status}`);
            }
            terrains = await terrainsResponse.json();
            assetManifest = await assetsResponse.json();
            console.log("Game data loaded successfully.");
        } catch (error) {
            console.error("Could not load game data:", error);
            showModal("Fatal Error: Could not load essential game data. The application cannot start.");
            return; // Stop initialization if data fails to load
        }

        // Now that data is loaded, proceed with the rest of the initialization
        requestAnimationFrame(async () => {
            resizeCanvas();
            await Promise.all([initializePatterns(ctx), loadAssets()]);
            populateSelectors();
            generateBaseMap();
            centerView();
        });
    }
    
    // --- Initial Call ---
    initialize();
});
