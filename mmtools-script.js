// Version 4.26 - Dynamic Terrain Palette
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
    let freestyleTerrainPaths = [];
    let currentFreestyleTerrainPath = null;
    let undoStack = [];
    let redoStack = [];
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
        const promises = Object.keys(state.assetManifest).map(id => {
            return new Promise((resolve) => {
                const asset = state.assetManifest[id];
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
        
        state.setState({
            mapGrid: generateBaseMapGrid(width, height),
            layers: [
                { name: 'Ground', visible: true, data: {}, backgroundImage: null }, 
                { name: 'Objects', visible: true, data: {} }
            ],
            pencilPaths: [],
            placedAssets: [],
            mapName: generateRandomId(16),
            activeLayerIndex: 0
        });
        
        freestyleTerrainPaths = [];
        wallLines = [];
        tokens = [];
        undoStack = [];
        redoStack = [];
        mapNameInput.value = state.mapName;
        renderLayers();
        updateUndoRedoButtons();
        updateMapKey();
        resetFog();
    }

    function generateBaseMapGrid(width, height) {
        const newGrid = {};
        const w = parseInt(width);
        const h = parseInt(height);

        if (state.gridType === 'hex') {
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
        if (Object.keys(state.mapGrid).length === 0 || canvas.width === 0) return;

        const {mapPixelWidth, mapPixelHeight, mapCenterX, mapCenterY} = getMapPixelBounds();

        if(mapPixelWidth === 0 || mapPixelHeight === 0) return;

        let newZoom = Math.min(canvas.width / mapPixelWidth, canvas.height / mapPixelHeight) * 0.9;
        newZoom = Math.max(0.1, Math.min(5, newZoom));

        state.setState({
            view: {
                zoom: newZoom,
                offsetX: (canvas.width / 2) - (mapCenterX * newZoom),
                offsetY: (canvas.height / 2) - (mapCenterY * newZoom)
            }
        });
        drawAll();
    }

    function drawAll() {
        requestAnimationFrame(() => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            wallCtx.clearRect(0,0, wallCanvas.width, wallCanvas.height);
            drawingCtx.clearRect(0,0, drawingCanvas.width, drawingCanvas.height);
            
            const viewBounds = {
                minX: -state.view.offsetX / state.view.zoom,
                minY: -state.view.offsetY / state.view.zoom,
                maxX: (canvas.width - state.view.offsetX) / state.view.zoom,
                maxY: (canvas.height - state.view.offsetY) / state.view.zoom,
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
                const asset = state.placedAssets[selectedPlacedAssetIndex];
                if(asset) {
                    if (!isGmViewActive && asset.gmOnly) return;
                    const {x, y} = (state.gridType === 'hex') ? hexToPixel(asset.q, asset.r) : squareToPixel(asset.q, asset.r);
                    const size = (state.gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.2 * (asset.size || 1) * (asset.scale || 1);
                    
                    drawingCtx.save();
                    drawingCtx.translate(state.view.offsetX, state.view.offsetY);
                    drawingCtx.scale(state.view.zoom, state.view.zoom);
                    
                    drawingCtx.translate(x, y);
                    drawingCtx.rotate(asset.rotation || 0);
                    
                    drawingCtx.strokeStyle = '#3b82f6';
                    drawingCtx.lineWidth = 2 / state.view.zoom;
                    drawingCtx.strokeRect(-size / 2, -size / 2, size, size);
                    
                    drawingCtx.restore();
                }
            }
             updateFogOfWar();
        });
    }

    function drawGrid(targetCtx, viewBounds) {
         targetCtx.save();
         targetCtx.translate(state.view.offsetX, state.view.offsetY);
         targetCtx.scale(state.view.zoom, state.view.zoom);

         for (const key in state.mapGrid) {
            const coords = key.split(',').map(Number);
            const { x, y } = (state.gridType === 'hex') ? hexToPixel(coords[0], coords[1]) : squareToPixel(coords[0], coords[1]);
            
            const size = state.gridType === 'hex' ? baseHexSize : baseSquareSize;
            if (x + size < viewBounds.minX || x - size > viewBounds.maxX || y + size < viewBounds.minY || y - size > viewBounds.maxY) {
                continue;
            }

            if (state.gridType === 'hex') {
                drawHexOutline(targetCtx, x, y, state.gridColor);
            } else {
                drawSquareOutline(targetCtx, x, y, state.gridColor);
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
            targetCtx.translate(state.view.offsetX, state.view.offsetY);
            targetCtx.scale(state.view.zoom, state.view.zoom);
        }

        state.layers.forEach(layer => {
            if (!layer.visible) return;

            if (layer.backgroundImage && layer.backgroundImage.complete) {
                const { mapPixelWidth, mapPixelHeight, minPxX, minPxY } = getMapPixelBounds();
                targetCtx.drawImage(layer.backgroundImage, minPxX, minPxY, mapPixelWidth, mapPixelHeight);
            }

            for (const key in layer.data) {
                const hexData = layer.data[key];
                if ((!isGmViewActive || isPlayerFacing) && hexData.gmOnly) continue;

                const coords = key.split(',').map(Number);
                const {x, y} = (state.gridType === 'hex') ? hexToPixel(coords[0], coords[1]) : squareToPixel(coords[0], coords[1]);

                if (viewBounds) {
                    const size = state.gridType === 'hex' ? baseHexSize : baseSquareSize;
                    if (x + size < viewBounds.minX || x - size > viewBounds.maxX || y + size < viewBounds.minY || y - size > viewBounds.maxY) {
                        continue;
                    }
                }

                if (hexData.terrain) {
                    if (state.gridType === 'hex') {
                        drawHex(targetCtx, x, y, state.terrains[hexData.terrain]);
                    } else {
                        drawSquare(targetCtx, x, y, state.terrains[hexData.terrain]);
                    }
                }
                if (hexData.text) {
                    drawText(targetCtx, x, y, hexData.text, hexData.textSize, hexData.textColor, hexData.gmOnly);
                }
            }
        });
        
        state.placedAssets.forEach(asset => {
            if ((!isGmViewActive || isPlayerFacing) && asset.gmOnly) return;
            const {x, y} = (state.gridType === 'hex') ? hexToPixel(asset.q, asset.r) : squareToPixel(asset.q, asset.r);

            if (viewBounds) {
                const size = (state.gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.5 * (asset.size || 1) * (asset.scale || 1);
                 if (x + size < viewBounds.minX || x - size > viewBounds.maxX || y + size < viewBounds.minY || y - size > viewBounds.maxY) {
                    return;
                }
            }

            drawObject(targetCtx, x, y, asset.assetId, asset.size, asset.gmOnly, asset.rotation, asset.scale);
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
        targetCtx.lineWidth = 1.5 / state.view.zoom; 
        targetCtx.stroke();
    }

    function drawSquareOutline(targetCtx, x, y, strokeStyle) {
        targetCtx.strokeStyle = strokeStyle;
        targetCtx.lineWidth = 1.5 / state.view.zoom;
        targetCtx.strokeRect(x - baseSquareSize / 2, y - baseSquareSize / 2, baseSquareSize, baseSquareSize);
    }

     function drawObject(targetCtx, x, y, assetId, size = 1, isGmOnly = false, rotation = 0, scale = 1) {
        const assetImage = assetCache[assetId];
        targetCtx.save();
        
        targetCtx.translate(x, y);
        targetCtx.rotate(rotation);
        
        if (isGmViewActive && isGmOnly) {
            targetCtx.globalAlpha = 0.6;
        }

        const objectSize = (state.gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.5 * size * scale;

        if (assetImage && assetImage.complete) {
            targetCtx.drawImage(assetImage, -objectSize / 2, -objectSize / 2, objectSize, objectSize);
        } else {
            targetCtx.font = `${objectSize}px Arial`;
            targetCtx.textAlign = 'center';
            targetCtx.textBaseline = 'middle';
            targetCtx.fillText('?', 0, 0);
        }

        if (isGmViewActive && isGmOnly) {
            targetCtx.globalAlpha = 1.0;
            targetCtx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // red-500
            targetCtx.lineWidth = 3 / state.view.zoom;
            targetCtx.strokeRect(-objectSize/2, -objectSize/2, objectSize, objectSize);
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
        targetCtx.translate(state.view.offsetX, state.view.offsetY);
        targetCtx.scale(state.view.zoom, state.view.zoom);
        
        const allPaths = [...freestyleTerrainPaths];
        if(isPainting && currentFreestyleTerrainPath) {
            allPaths.push(currentFreestyleTerrainPath);
        }

        allPaths.forEach(path => {
            if (path.points.length < 1) return;
            const terrain = state.terrains[path.terrain];
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
        targetCtx.translate(state.view.offsetX, state.view.offsetY);
        targetCtx.scale(state.view.zoom, state.view.zoom);
        
        const allPaths = [...state.pencilPaths];
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
        targetCtx.translate(state.view.offsetX, state.view.offsetY);
        targetCtx.scale(state.view.zoom, state.view.zoom);
        targetCtx.lineCap = 'round';

        wallLines.forEach(wall => {
            const inView = (wall.start.x < viewBounds.maxX && wall.end.x > viewBounds.minX) ||
                           (wall.end.x < viewBounds.maxX && wall.start.x > viewBounds.minX);
            if (!inView) return;
            
            targetCtx.strokeStyle = wall.blocksVision ? 'rgba(255, 255, 0, 0.8)' : 'rgba(255, 255, 0, 0.2)';
            targetCtx.lineWidth = wall.blocksVision ? 5 / state.view.zoom : 2 / state.view.zoom;

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
        
        if (Object.keys(state.mapGrid).length === 0) {
            return { minPxX: 0, maxPxX: 0, minPxY: 0, maxPxY: 0, mapPixelWidth: 0, mapPixelHeight: 0, mapCenterX: 0, mapCenterY: 0};
        }

        if (state.gridType === 'hex') {
            const hexVisualWidth = baseHexSize * Math.sqrt(3);
            const hexVisualHeight = baseHexSize * 2;
            for (const key in state.mapGrid) {
                const [q, r] = key.split(',').map(Number);
                const { x, y } = hexToPixel(q, r);
                minPxX = Math.min(minPxX, x - hexVisualWidth / 2);
                maxPxX = Math.max(maxPxX, x + hexVisualWidth / 2);
                minPxY = Math.min(minPxY, y - hexVisualHeight / 2);
                maxPxY = Math.max(maxPxY, y + hexVisualHeight / 2);
            }
        } else { // square
            for (const key in state.mapGrid) {
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
        const worldX = (x - state.view.offsetX) / state.view.zoom;
        const worldY = (y - state.view.offsetY) / state.view.zoom;

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
        const worldX = (px - state.view.offsetX) / state.view.zoom;
        const worldY = (py - state.view.offsetY) / state.view.zoom;
        return {
            x: Math.floor(worldX / baseSquareSize),
            y: Math.floor(worldY / baseSquareSize)
        };
    }

    window.pixelToGrid = function(px, py, isFreeform = false) {
        const worldX = (px - state.view.offsetX) / state.view.zoom;
        const worldY = (py - state.view.offsetY) / state.view.zoom;
        if(isFreeform) return { x: worldX, y: worldY };

        if (state.gridType === 'hex') {
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
        for (let i = 0; i < state.layers.length; i++) {
            const layer = state.layers[i];
            if (!layer.visible || layer.type === 'grid') continue;
            for (const key in layer.data) {
                if (layer.data[key].terrain) {
                    topTerrains[key] = layer.data[key].terrain;
                }
            }
        }
        return topTerrains;
    }

    window.saveState = function() {
        const serializableLayers = state.layers.map(layer => {
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
            pencilPaths: JSON.parse(JSON.stringify(state.pencilPaths)),
            freestyleTerrainPaths: JSON.parse(JSON.stringify(freestyleTerrainPaths)),
            placedAssets: JSON.parse(JSON.stringify(state.placedAssets)),
            wallLines: JSON.parse(JSON.stringify(wallLines)),
            tokens: JSON.parse(JSON.stringify(tokens)),
            fogDataUrl: fogCanvas.toDataURL()
        });
        redoStack = [];
        updateUndoRedoButtons();
    }

    function undo() {
        if (undoStack.length === 0) return;
        
        const serializableLayers = state.layers.map(layer => {
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
            pencilPaths: JSON.parse(JSON.stringify(state.pencilPaths)),
            freestyleTerrainPaths: JSON.parse(JSON.stringify(freestyleTerrainPaths)),
            placedAssets: JSON.parse(JSON.stringify(state.placedAssets)),
            wallLines: JSON.parse(JSON.stringify(wallLines)),
            tokens: JSON.parse(JSON.stringify(tokens)),
            fogDataUrl: fogCanvas.toDataURL()
        };
        redoStack.push(currentState);
        
        const previousState = undoStack.pop();
        
        state.setState({
            layers: previousState.layers.map(layerData => {
                if (layerData.backgroundImage && layerData.backgroundImage.src) {
                    const img = new Image();
                    img.src = layerData.backgroundImage.src;
                    layerData.backgroundImage = img;
                    img.onload = () => drawAll();
                }
                return layerData;
            }),
            pencilPaths: previousState.pencilPaths,
            placedAssets: previousState.placedAssets
        });

        freestyleTerrainPaths = previousState.freestyleTerrainPaths;
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
        
        const serializableLayers = state.layers.map(layer => {
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
            pencilPaths: JSON.parse(JSON.stringify(state.pencilPaths)),
            freestyleTerrainPaths: JSON.parse(JSON.stringify(freestyleTerrainPaths)),
            placedAssets: JSON.parse(JSON.stringify(state.placedAssets)),
            wallLines: JSON.parse(JSON.stringify(wallLines)),
            tokens: JSON.parse(JSON.stringify(tokens)),
            fogDataUrl: fogCanvas.toDataURL()
        };
        undoStack.push(currentState);

        const nextState = redoStack.pop();
        state.setState({
            layers: nextState.layers.map(layerData => {
                if (layerData.backgroundImage && layerData.backgroundImage.src) {
                    const img = new Image();
                    img.src = layerData.backgroundImage.src;
                    layerData.backgroundImage = img;
                    img.onload = () => drawAll();
                }
                return layerData;
            }),
            pencilPaths: nextState.pencilPaths,
            placedAssets: nextState.placedAssets
        });
        
        freestyleTerrainPaths = nextState.freestyleTerrainPaths;
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

    function applyTool(e, endHex) {
        if (!state.layers.length) return;

        const activeLayer = state.layers[state.activeLayerIndex];
        if (activeLayer.type === 'grid') {
            state.showModal("Cannot draw on the Grid layer. Please select another layer.");
            return;
        }
        const affectedHexes = getHexesForTool(e, endHex);

        affectedHexes.forEach(hex => {
            const key = `${hex.q},${hex.r}`;
            if (state.mapGrid[key]) {
                if (!activeLayer.data[key]) activeLayer.data[key] = {};
                
                if (state.currentTool === 'terrain') {
                   activeLayer.data[key] = { ...activeLayer.data[key], terrain: state.selectedTerrain };
                } else if (state.currentTool === 'placeObject') {
                    const assetData = state.assetManifest[state.selectedObjectKey];
                    if(assetData) {
                        const newAsset = { 
                            assetId: state.selectedObjectKey, 
                            q: hex.q, 
                            r: hex.r, 
                            size: state.brushSize,
                            gmOnly: objectGmOnlyCheckbox.checked,
                            rotation: 0,
                            scale: 1
                        };
                        state.placedAssets.push(newAsset);
                    }
                } else if (state.currentTool === 'placeText') {
                    activeLayer.data[key] = {
                        ...activeLayer.data[key],
                        text: textInput.value,
                        textSize: fontSizeInput.value,
                        textColor: fontColorInput.value,
                        gmOnly: textGmOnlyCheckbox.checked
                    };
                } else if (state.currentTool === 'eraser') {
                   if(activeLayer.data[key]) {
                       delete activeLayer.data[key];
                   }
                   state.setState({ placedAssets: state.placedAssets.filter(asset => !(asset.q === hex.q && asset.r === hex.r)) });
                }
            }
        });
        drawAll();
        updateMapKey();
    }
    
    function getHexesForTool(e, endHex) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerHex = endHex || pixelToGrid(mouseX, mouseY);
        const startHex = shapeStartPoint ? shapeStartPoint : centerHex;

        if (state.currentTool === 'terrain') {
            switch(state.terrainBrushMode) {
                case 'spray':
                {
                    const results = [];
                    const allHexesInBrush = getHexesInBrush(centerHex);
                    const density = Math.min(1, 0.1 + (state.brushSize / 10)); 
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
                case 'polygon': // Polygon is handled separately on finalization
                    return [];
            }
        } else if (state.currentTool === 'placeObject' || state.currentTool === 'placeText') {
             return [centerHex];
        } else if (state.currentTool === 'eraser') {
             return getHexesInBrush(centerHex);
        }
        return [];
    }
    
    function getHexesInBrush(centerHex) {
        const results = [];
        const range = state.brushSize - 1;
        for (let q = -range; q <= range; q++) {
            for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
                if (state.gridType === 'hex') {
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
        state.layers.forEach((layer, index) => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.classList.toggle('active', index === state.activeLayerIndex);
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
            
            item.onclick = () => { 
                state.setState({ activeLayerIndex: index });
                renderLayers(); 
            };
            
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
        const newName = name === 'New Layer' ? `${name} ${state.layers.length + 1}` : name;
        state.layers.push({ name: newName, visible: true, data: {}, backgroundImage: null });
        state.setState({ 
            layers: state.layers,
            activeLayerIndex: state.layers.length - 1
        });
        renderLayers();
    }

    function deleteActiveLayer() {
        const layer = state.layers[state.activeLayerIndex];
        if (layer.name === 'Ground' || layer.name === 'Objects') {
            state.showModal("The Ground and Objects layers cannot be deleted.");
            return;
        }
        if (state.layers.length <= 2) {
            state.showModal("You must keep at least the Ground and Objects layers.");
            return;
        }
        saveState();
        state.layers.splice(state.activeLayerIndex, 1);
        if (state.activeLayerIndex >= state.layers.length) {
            state.setState({ activeLayerIndex: state.layers.length - 1 });
        }
        renderLayers();
        drawAll();
        updateMapKey();
    }

    function moveLayer(index, direction) {
        if ((index === 0 && direction === -1) || (index === state.layers.length - 1 && direction === 1)) {
            return;
        }
        saveState();
        const newIndex = index + direction;
        [state.layers[index], state.layers[newIndex]] = [state.layers[newIndex], state.layers[index]];
        state.setState({ activeLayerIndex: newIndex });
        renderLayers();
        drawAll();
    }

    function toggleLayerVisibility(index) {
        saveState();
        state.layers[index].visible = !state.layers[index].visible;
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
            state.showModal("Cannot save an empty map.");
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
        link.download = `${getSafeFilename(state.mapName)}_GM.png`;
        link.href = dataUrl;
        link.click();
    }

    // NEW: Player-facing export function
    function saveAsPlayerPNGLogic() {
        const { mapPixelWidth, mapPixelHeight, minPxX, minPxY } = getMapPixelBounds();
        
        if (mapPixelWidth <= 0 || mapPixelHeight <= 0) {
            state.showModal("Cannot save an empty map.");
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
        link.download = `${getSafeFilename(state.mapName)}_Player.png`;
        link.href = dataUrl;
        link.click();
    }

    function saveAsJSONLogic() {
        const serializableLayers = state.layers.map(layer => {
            const newLayer = { ...layer };
            if (newLayer.backgroundImage && newLayer.backgroundImage.src) {
                newLayer.backgroundImage = { src: newLayer.backgroundImage.src };
            } else {
                newLayer.backgroundImage = null;
            }
            return newLayer;
        });

        const mapData = {
            name: state.mapName,
            grid: state.mapGrid,
            layers: serializableLayers,
            pencilPaths: state.pencilPaths,
            freestyleTerrainPaths: freestyleTerrainPaths,
            placedAssets: state.placedAssets,
            wallLines: wallLines,
            tokens: tokens,
            fogDataUrl: fogCanvas.toDataURL()
        };
        const jsonString = JSON.stringify(mapData, null, 2);
        const blob = new Blob([jsonString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${getSafeFilename(state.mapName)}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    function promptForMapNameAndSave(saveFunction) {
        if (state.mapName.trim() === '' || state.mapName.toLowerCase().includes('untitled')) {
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
            const terrain = state.terrains[path.terrain];
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
        state.pencilPaths.forEach(path => {
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
                    state.setState({
                        mapGrid: loadedData.grid,
                        pencilPaths: loadedData.pencilPaths || [],
                        placedAssets: loadedData.placedAssets || [],
                        mapName: loadedData.name || 'Untitled Loaded Map',
                        layers: loadedData.layers.map(layerData => {
                            if (layerData.backgroundImage && layerData.backgroundImage.src) {
                                const img = new Image();
                                img.src = layerData.backgroundImage.src;
                                layerData.backgroundImage = img;
                                img.onload = () => drawAll();
                            }
                            return layerData;
                        }),
                        activeLayerIndex: 0
                    });

                    freestyleTerrainPaths = loadedData.freestyleTerrainPaths || [];
                    wallLines = loadedData.wallLines || [];
                    tokens = loadedData.tokens || [];

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

                    mapNameInput.value = state.mapName;
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
                state.showModal("Error: Could not load map. File may be corrupt or in the wrong format.");
                console.error(err);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    async function initializePatterns(targetCtx) {
        const promises = Object.values(state.terrains).map(terrain => {
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
        Object.keys(state.terrains).forEach(key => {
            const terrain = state.terrains[key];
            if (terrain.tags.includes(state.currentGenre) && terrain.tags.includes(state.currentScale)) {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'item-container';
                itemContainer.dataset.terrain = key;
                itemContainer.addEventListener('click', () => {
                    state.setState({
                        currentTool: 'terrain',
                        selectedTerrain: key
                    });
                    updateActiveSwatches();
                });

                const swatch = document.createElement('div');
                swatch.className = 'texture-swatch';
                swatch.style.backgroundImage = `url(${getPatternDataUri(terrain.pattern)})`;

                const label = document.createElement('div');
                label.className = 'item-label';
                label.textContent = terrain.name;

                itemContainer.appendChild(swatch);
                itemContainer.appendChild(label);
                terrainSelector.appendChild(itemContainer);
            }
        });

        objectSelector.innerHTML = '';
        Object.keys(state.assetManifest).forEach(assetId => {
            const asset = state.assetManifest[assetId];
            if (asset.tags.includes(state.currentGenre) && asset.tags.includes(state.currentScale)) {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'item-container';
                itemContainer.dataset.objectKey = assetId;
                itemContainer.addEventListener('click', () => { 
                    state.setState({
                        currentTool: 'placeObject',
                        selectedObjectKey: assetId
                    });
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

        document.querySelector(`#genreSelector .control-btn[data-genre="${state.currentGenre}"]`)?.classList.add('active');
        document.querySelector(`#scaleSelector .control-btn[data-scale="${state.currentScale}"]`)?.classList.add('active');

        if (state.currentTool === 'terrain') {
            toolTerrainBtn.classList.add('active');
            terrainOptionsPanel.classList.remove('hidden');
            document.querySelector(`.item-container[data-terrain="${state.selectedTerrain}"]`)?.classList.add('active');
        } else if (state.currentTool === 'placeObject') {
            toolTerrainBtn.classList.add('active');
            document.querySelector(`.item-container[data-object-key="${state.selectedObjectKey}"]`)?.classList.add('active');
            terrainOptionsPanel.classList.remove('hidden');
        } else if (state.currentTool === 'placeText') {
            toolTerrainBtn.classList.add('active');
            textHeader.classList.add('active');
            terrainOptionsPanel.classList.remove('hidden');
        } else if (state.currentTool === 'pencil') {
            toolPencilBtn.classList.add('active');
            pencilOptionsPanel.classList.remove('hidden');
            canvas.classList.add('pencil');
        } else if (state.currentTool === 'select') {
            toolSelectBtn.classList.add('active');
            canvas.classList.add('selecting');
        } else if (state.currentTool === 'wall') {
            toolWallBtn.classList.add('active');
            canvas.classList.add('wall-drawing');
        } else if (state.currentTool === 'token') {
            toolTokenBtn.classList.add('active');
            tokenOptionsPanel.classList.remove('hidden');
            canvas.classList.add('token-placement');
        } else if (state.currentTool === 'interact') {
            toolInteractBtn.classList.add('active');
            canvas.classList.add('interact');
        } else if (state.currentTool === 'fogReveal' || state.currentTool === 'fogHide') {
            if(state.currentTool === 'fogReveal') toolFogRevealBtn.classList.add('active');
            if(state.currentTool === 'fogHide') toolFogHideBtn.classList.add('active');
            canvas.classList.add('fogging');
        } else if (state.currentTool === 'eraser') {
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
        state.showContentModal("User's Guide", guideHTML);
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
                state.setState({ mapName: newName });
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

    window.updateMapKey = function() {
        if (mapKeyWindow.classList.contains('hidden')) return;

        const usedTerrains = new Set();
        const usedObjects = new Set();

        state.layers.forEach(layer => {
            if (!layer.visible) return;
            for (const key in layer.data) {
                const hexData = layer.data[key];
                if (hexData.terrain) {
                    usedTerrains.add(hexData.terrain);
                }
            }
        });
        
        state.placedAssets.forEach(asset => {
            if (!asset.gmOnly) {
                usedObjects.add(asset.assetId);
            }
        });

        mapKeyContent.innerHTML = '';
        let contentHTML = '';

        if (usedTerrains.size > 0) {
            contentHTML += '<h5 class="key-section-title">Terrain</h5>';
            Array.from(usedTerrains).sort().forEach(terrainKey => {
                const terrain = state.terrains[terrainKey];
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
                const asset = state.assetManifest[assetId];
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
         state.layers.forEach(layer => {
            if (!layer.visible) return;
            for (const key in layer.data) {
                if (layer.data[key].terrain && !layer.data[key].gmOnly) usedTerrains.add(layer.data[key].terrain);
            }
        });
        
        state.placedAssets.forEach(asset => {
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
                    const terrain = state.terrains[itemKey];
                    if (terrain && terrain.canvasPattern) {
                        targetCtx.fillStyle = terrain.canvasPattern;
                        targetCtx.fillRect(itemX, itemY + (itemHeight - swatchSize) / 2, swatchSize, swatchSize);
                        targetCtx.strokeStyle = '#4b5563';
                        targetCtx.strokeRect(itemX, itemY + (itemHeight - swatchSize) / 2, swatchSize, swatchSize);
                        targetCtx.fillStyle = '#d1d5db';
                        targetCtx.fillText(terrain.name, itemX + swatchSize + 5, itemY + itemHeight / 2);
                    }
                } else { // Objects
                    const asset = state.assetManifest[itemKey];
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

    window.getHexesInSelection = function() {
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
                if (state.mapGrid[key]) {
                    results.push({ q, r });
                }
            }
        }
        return results;
    }

    function handleInteraction(mouseX, mouseY) {
        if (!isGmViewActive) return;
    
        const clickedHex = pixelToGrid(mouseX, mouseY);
        const key = `${clickedHex.q},${clickedHex.r}`;
    
        const objectsLayer = state.layers.find(l => l.name === 'Objects');
        if (objectsLayer && objectsLayer.data[key] && objectsLayer.data[key].text) {
            const note = state.gmNotes[key];
            if (note) {
                const title = objectsLayer.data[key].text;
                const content = `<p class="text-gray-300 whitespace-pre-wrap">${note}</p>`;
                state.showContentModal(title, content);
            }
        }
    }

    // --- VTT CORE LOOP (FIX 1) ---
    function updateFogOfWar() {
        // Step 1: Reset fog canvas
        fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
        fogCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);

        const lightSources = tokens.filter(t => t.lightRadius > 0);
        if (lightSources.length === 0) {
            return; // No light sources, so fog remains solid
        }

        // Step 2: Collect all unique wall vertices in world coordinates
        const uniquePoints = new Set();
        wallLines.forEach(wall => {
            uniquePoints.add(`${wall.start.x},${wall.start.y}`);
            uniquePoints.add(`${wall.end.x},${wall.end.y}`);
        });
        const points = Array.from(uniquePoints).map(p => {
            const [x, y] = p.split(',').map(Number);
            return { x, y };
        });

        // Step 3: For each light source, calculate its visibility polygon
        fogCtx.save();
        fogCtx.globalCompositeOperation = 'destination-out'; // This is the magic part that "cuts out" from the fog

        lightSources.forEach(token => {
            const lightPosition = { x: token.x, y: token.y };
            
            // Convert light radius from hexes to world pixels
            const lightRadiusPixels = token.lightRadius * (state.gridType === 'hex' ? baseHexSize * 1.5 : baseSquareSize);

            // Collect all rays to cast
            const rays = [];
            points.forEach(point => {
                const angle = Math.atan2(point.y - lightPosition.y, point.x - lightPosition.x);
                rays.push({ angle: angle - 0.0001, x: point.x, y: point.y }); // Ray slightly before the vertex
                rays.push({ angle: angle, x: point.x, y: point.y });          // Ray at the vertex
                rays.push({ angle: angle + 0.0001, x: point.x, y: point.y }); // Ray slightly after the vertex
            });

            // Find the intersection point for each ray
            const intersects = [];
            for (const ray of rays) {
                let closestIntersect = null;
                let closestDist = Infinity;

                for (const wall of wallLines) {
                    const intersect = getIntersection(lightPosition, ray, wall);
                    if (intersect) {
                        const dist = Math.hypot(intersect.x - lightPosition.x, intersect.y - lightPosition.y);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestIntersect = intersect;
                        }
                    }
                }
                // If no wall intersection, the ray goes to the edge of the light radius
                if (!closestIntersect || closestDist > lightRadiusPixels) {
                    closestIntersect = {
                        x: lightPosition.x + Math.cos(ray.angle) * lightRadiusPixels,
                        y: lightPosition.y + Math.sin(ray.angle) * lightRadiusPixels
                    };
                }
                closestIntersect.angle = ray.angle;
                intersects.push(closestIntersect);
            }

            // Sort intersects by angle to form the polygon
            intersects.sort((a, b) => a.angle - b.angle);

            // Step 4: Draw the combined visibility polygon onto the fog canvas
            // Transform world coordinates to screen coordinates for drawing
            fogCtx.beginPath();
            const firstPoint = worldToScreen(intersects[0].x, intersects[0].y);
            fogCtx.moveTo(firstPoint.x, firstPoint.y);
            for (let i = 1; i < intersects.length; i++) {
                const point = worldToScreen(intersects[i].x, intersects[i].y);
                fogCtx.lineTo(point.x, point.y);
            }
            fogCtx.closePath();
            fogCtx.fillStyle = 'white'; // Color doesn't matter with destination-out
            fogCtx.fill();
        });

        fogCtx.restore(); // Reset composite operation
    }

    // Helper function for raycasting: finds intersection of a ray and a line segment
    function getIntersection(rayOrigin, ray, segment) {
        const r_px = rayOrigin.x;
        const r_py = rayOrigin.y;
        const r_dx = Math.cos(ray.angle);
        const r_dy = Math.sin(ray.angle);

        const s_px = segment.start.x;
        const s_py = segment.start.y;
        const s_dx = segment.end.x - segment.start.x;
        const s_dy = segment.end.y - segment.start.y;

        const r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
        const s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);

        if (r_dx / r_mag == s_dx / s_mag && r_dy / r_mag == s_dy / s_mag) {
            return null; // Parallel lines
        }

        const T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
        const T1 = (s_px + s_dx * T2 - r_px) / r_dx;

        if (T1 < 0) return null;
        if (T2 < 0 || T2 > 1) return null;

        return {
            x: r_px + r_dx * T1,
            y: r_py + r_dy * T1,
        };
    }

    // Helper to convert world coordinates to screen coordinates for drawing on non-transformed canvases
    function worldToScreen(worldX, worldY) {
        return {
            x: worldX * state.view.zoom + state.view.offsetX,
            y: worldY * state.view.zoom + state.view.offsetY
        };
    }
    // --- END VTT CORE LOOP ---

    function addEventListeners() {
        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        const throttledMouseMove = throttle(e => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (isPanning) {
                state.view.offsetX += e.clientX - panStart.x;
                state.view.offsetY += e.clientY - panStart.y;
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
                previewCtx.translate(state.view.offsetX, state.view.offsetY);
                previewCtx.scale(state.view.zoom, state.view.zoom);
                previewCtx.beginPath();
                previewCtx.moveTo(shapeStartPoint.x, shapeStartPoint.y);
                previewCtx.lineTo(endPoint.x, endPoint.y);
                previewCtx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                previewCtx.lineWidth = 5 / state.view.zoom;
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
                fogCtx.globalCompositeOperation = state.currentTool === 'fogReveal' ? 'destination-out' : 'source-over';
                fogCtx.fill();
                return;
            }

            const worldMousePos = pixelToGrid(mouseX, mouseY);

            if(isDragging && selectedPlacedAssetIndex !== null) {
                const asset = state.placedAssets[selectedPlacedAssetIndex];
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
                const endPoint = pixelToGrid(mouseX, mouseY, state.currentTool === 'pencil');
                const startPoint = shapeStartPoint;
                
                previewCtx.save();
                previewCtx.translate(state.view.offsetX, state.view.offsetY);
                previewCtx.scale(state.view.zoom, state.view.zoom);
                
                if (state.currentTool === 'terrain') {
                    const shapeHexes = getHexesForTool(e, endPoint);
                    shapeHexes.forEach(hex => {
                        const {x, y} = (state.gridType === 'hex') ? hexToPixel(hex.q, hex.r) : squareToPixel(hex.q, hex.r);
                        if (state.gridType === 'hex') {
                            drawHex(previewCtx, x, y, 'rgba(100, 150, 255, 0.5)');
                        } else {
                            drawSquare(previewCtx, x, y, 'rgba(100, 150, 255, 0.5)');
                        }
                    });
                } else if (state.currentTool === 'pencil') {
                    previewCtx.beginPath();
                    previewCtx.strokeStyle = pencilColor;
                    previewCtx.lineWidth = pencilWidth;
                    const brushMode = state.pencilBrushMode;
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
                if (state.currentTool === 'terrain' && state.terrainBrushMode === 'spray' && currentFreestyleTerrainPath) {
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
            
            if (e.button === 2) { // Right-click for panning
                isPanning = true;
                panStart = { x: e.clientX, y: e.clientY };
                canvas.classList.add('panning');
                return;
            }

            if (e.button === 0) { // Left-click for tools
                if (state.currentTool === 'interact') {
                    handleInteraction(mouseX, mouseY);
                    return;
                }
                if (state.currentTool === 'token') {
                    const worldClick = pixelToGrid(mouseX, mouseY, true);
                    for (let i = tokens.length - 1; i >= 0; i--) {
                        const token = tokens[i];
                        const dist = Math.hypot(worldClick.x - token.x, worldClick.y - token.y);
                        const tokenRadius = (state.gridType === 'hex' ? baseHexSize : baseSquareSize) * 0.4;
                        if (dist < tokenRadius) {
                            selectedTokenIndex = i;
                            isDraggingToken = true;
                            updateTokenPanel();
                            return;
                        }
                    }
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

                if (state.currentTool === 'select') {
                    isSelecting = true;
                    selectionStartPoint = { x: mouseX, y: mouseY };
                    selectionEndPoint = { x: mouseX, y: mouseY };
                    return;
                }
                
                if (state.currentTool === 'wall') {
                    isDrawingWall = true;
                    shapeStartPoint = pixelToGrid(mouseX, mouseY, true);
                    return;
                }

                if (state.currentTool === 'fogReveal' || state.currentTool === 'fogHide') {
                    isFogging = true;
                    const fogBrushRadius = fogBrushSize * 5;
                    fogCtx.beginPath();
                    fogCtx.arc(mouseX, mouseY, fogBrushRadius, 0, 2 * Math.PI);
                    fogCtx.globalCompositeOperation = state.currentTool === 'fogReveal' ? 'destination-out' : 'source-over';
                    fogCtx.fill();
                    return;
                }

                if (state.currentTool === 'placeObject' || state.currentTool === 'placeText') {
                    saveState();
                    applyTool(e);
                    return;
                }

                let assetClicked = false;
                if (state.currentTool !== 'mask') {
                    const worldClick = pixelToGrid(mouseX, mouseY, true);
                    const worldMousePos = pixelToGrid(mouseX, mouseY);
                    for (let i = state.placedAssets.length - 1; i >= 0; i--) {
                        const asset = state.placedAssets[i];
                        if (!isGmViewActive && asset.gmOnly) continue;

                        const {x, y} = (state.gridType === 'hex') ? hexToPixel(asset.q, asset.r) : squareToPixel(asset.q, asset.r);
                        const size = (state.gridType === 'hex' ? baseHexSize : baseSquareSize) * 1.2 * asset.size;
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
                }

                const brushMode = state.currentTool === 'terrain' ? state.terrainBrushMode : state.pencilBrushMode;
                const isShapeMode = ['line', 'rectangle', 'ellipse'].includes(brushMode);

                if (isShapeMode) {
                    isDrawingShape = true;
                    shapeStartPoint = pixelToGrid(mouseX, mouseY, state.currentTool === 'pencil');
                    saveState();
                } else if (state.currentTool === 'terrain' && state.terrainBrushMode === 'spray') {
                    isPainting = true;
                    saveState();
                    currentFreestyleTerrainPath = { terrain: state.selectedTerrain, width: state.brushSize * 10, points: [pixelToGrid(mouseX, mouseY, true)] };
                } else if (state.currentTool === 'terrain' || state.currentTool === 'eraser') {
                     isPainting = true;
                     saveState();
                     applyTool(e);
                } else if (state.currentTool === 'pencil') {
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
                const brushMode = state.currentTool === 'terrain' ? state.terrainBrushMode : state.pencilBrushMode;
                const isShapeMode = ['line', 'rectangle', 'ellipse'].includes(brushMode);

                if (isDrawingShape && isShapeMode) {
                    const endPoint = pixelToGrid(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top, state.currentTool === 'pencil');
                    if (state.currentTool === 'terrain') {
                        applyTool(e, endPoint);
                    } else if (state.currentTool === 'pencil') {
                        state.pencilPaths.push({
                            type: state.pencilBrushMode,
                            start: shapeStartPoint,
                            end: endPoint,
                            color: pencilColor,
                            width: pencilWidth,
                            gmOnly: pencilGmOnlyCheckbox.checked
                        });
                    }
                }
                
                if (isPainting) {
                    if (state.currentTool === 'terrain' && state.terrainBrushMode === 'spray' && currentFreestyleTerrainPath) {
                        freestyleTerrainPaths.push(currentFreestyleTerrainPath);
                        currentFreestyleTerrainPath = null;
                    }
                    isPainting = false;
                }
                if (isPenciling) {
                    isPenciling = false;
                    state.pencilPaths.push(currentPencilPath);
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
                    state.pencilPaths.push(currentPencilPath);
                 }
                 isPenciling = false;
                 currentPencilPath = null;
             }
             if (isPainting) {
                if (state.currentTool === 'terrain' && state.terrainBrushMode === 'spray' && currentFreestyleTerrainPath) {
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
            
            const worldX = (mouseX - state.view.offsetX) / state.view.zoom;
            const worldY = (mouseY - state.view.offsetY) / state.view.zoom;

            const newZoom = Math.max(0.1, Math.min(5, state.view.zoom * zoom));
            
            state.view.offsetX = mouseX - worldX * newZoom;
            state.view.offsetY = mouseY - worldY * newZoom;
            state.view.zoom = newZoom;

            drawAll();
        });

        window.addEventListener('keydown', e => {
            if (selectedPlacedAssetIndex !== null) {
                const asset = state.placedAssets[selectedPlacedAssetIndex];
                if (e.key === 'r') {
                    asset.rotation = (asset.rotation || 0) + (15 * Math.PI / 180); // Rotate 15 degrees
                    drawAll();
                } else if (e.key === 'R') { // Shift+R
                    asset.rotation = (asset.rotation || 0) - (15 * Math.PI / 180); // Rotate -15 degrees
                    drawAll();
                } else if (e.key === '=' || e.key === '+') {
                    asset.scale = (asset.scale || 1) * 1.1; // Increase scale by 10%
                    drawAll();
                } else if (e.key === '-') {
                    asset.scale = (asset.scale || 1) * 0.9; // Decrease scale by 10%
                    drawAll();
                }
            }
        });

        mapNameInput.addEventListener('input', (e) => { state.setState({ mapName: e.target.value }); });
        brushSizeSlider.addEventListener('input', e => {
            state.setState({ brushSize: parseInt(e.target.value) });
            brushSizeValue.textContent = state.brushSize;
        });
        undoBtn.addEventListener('click', undo);
        redoBtn.addEventListener('click', redo);
        gridColorPicker.addEventListener('input', e => { 
            state.setState({ gridColor: e.target.value });
            drawAll(); 
        });
        gridVisibleCheckbox.addEventListener('change', e => { 
            drawAll();
        });
        toolTerrainBtn.addEventListener('click', () => { state.setState({ currentTool: 'terrain' }); updateActiveSwatches(); });
        toolPencilBtn.addEventListener('click', () => { state.setState({ currentTool: 'pencil' }); updateActiveSwatches(); });
        toolSelectBtn.addEventListener('click', () => { state.setState({ currentTool: 'select' }); updateActiveSwatches(); });
        toolWallBtn.addEventListener('click', () => { state.setState({ currentTool: 'wall' }); updateActiveSwatches(); });
        toolTokenBtn.addEventListener('click', () => { state.setState({ currentTool: 'token' }); updateActiveSwatches(); });
        toolInteractBtn.addEventListener('click', () => { state.setState({ currentTool: 'interact' }); updateActiveSwatches(); });
        toolFogRevealBtn.addEventListener('click', () => { state.setState({ currentTool: 'fogReveal' }); updateActiveSwatches(); });
        toolFogHideBtn.addEventListener('click', () => { state.setState({ currentTool: 'fogHide' }); updateActiveSwatches(); });
        resetFogBtn.addEventListener('click', () => {
            state.showModal("This will cover the entire map in fog again. Are you sure?", resetFog);
        });
        fogBrushSizeSlider.addEventListener('input', e => {
            fogBrushSize = parseInt(e.target.value);
            fogBrushSizeValue.textContent = fogBrushSize;
        });
        
        terrainBrushModeSelect.addEventListener('change', (e) => { state.setState({ terrainBrushMode: e.target.value }); });
        pencilBrushModeSelect.addEventListener('change', (e) => { state.setState({ pencilBrushMode: e.target.value }); });
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
        textHeader.addEventListener('click', () => { state.setState({ currentTool: 'placeText' }); updateActiveSwatches(); });
        generateBaseMapBtn.addEventListener('click', () => {
            state.showModal("Generate a new blank map? This will delete all layers and current work.", () => {
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
        eraserBtn.addEventListener('click', () => { state.setState({ currentTool: 'eraser' }); updateActiveSwatches(); });

        genreSelector.addEventListener('click', (e) => {
            if (e.target.matches('.control-btn')) {
                state.setState({ currentGenre: e.target.dataset.genre });
                populateSelectors();
            }
        });

        scaleSelector.addEventListener('click', (e) => {
            if (e.target.matches('.control-btn')) {
                state.setState({ currentScale: e.target.dataset.scale });
                populateSelectors();
            }
        });
        
        settingsBtn.addEventListener('click', () => {
            apiKeyInput.value = state.apiKey;
            apiKeyModal.classList.remove('hidden');
        });

        cancelApiKeyBtn.addEventListener('click', () => {
            apiKeyModal.classList.add('hidden');
        });

        saveApiKeyBtn.addEventListener('click', () => {
            state.setState({ apiKey: apiKeyInput.value });
            localStorage.setItem('mapMakerApiKey', state.apiKey);
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
            state.setState({ gridType: e.target.value });
            const hexBrushOption = terrainBrushModeSelect.querySelector('option[value="hex"]');
            if (hexBrushOption) {
                hexBrushOption.disabled = state.gridType === 'square';
                if (state.gridType === 'square' && state.terrainBrushMode === 'hex') {
                    terrainBrushModeSelect.value = 'spray';
                    state.setState({ terrainBrushMode: 'spray' });
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
    }

    async function initialize() {
        state.setState({ apiKey: localStorage.getItem('mapMakerApiKey') || '' });
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
        
        gridColorPicker.value = state.gridColor;
        gridVisibleCheckbox.checked = true;
        updateUndoRedoButtons();
        
        // Load external data first
        try {
            const [terrainsResponse, assetsResponse] = await Promise.all([
                fetch('./terrains.json'),
                fetch('./assets.json')
            ]);
            if (!terrainsResponse.ok || !assetsResponse.ok) {
                throw new Error(`HTTP error! status: ${terrainsResponse.status}, ${assetsResponse.status}`);
            }
            state.setState({
                terrains: await terrainsResponse.json(),
                assetManifest: await assetsResponse.json()
            });
            console.log("Game data loaded successfully.");
        } catch (error) {
            console.error("Could not load game data:", error);
            state.showModal("Fatal Error: Could not load essential game data. The application cannot start.");
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
