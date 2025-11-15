// Version 22.8 - Final Accordion Implementation
import * as state from '../js/state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selection ---
    const canvas = document.getElementById('mapCanvas');
    const uiCanvas = document.getElementById('uiCanvas');
    if (!canvas || !uiCanvas) { console.error("FATAL: Canvas not found."); return; }
    const uiCtx = uiCanvas.getContext('2d');
    
    const elements = {
        ctx: canvas.getContext('2d'),
        resizer: document.getElementById('resizer'),
        panelWrapper: document.getElementById('panelWrapper'),
        projectNameInput: document.getElementById('projectNameInput'),
        brushSizeSlider: document.getElementById('brushSize'),
        brushSizeValue: document.getElementById('brushSizeValue'),
        terrainSelector: document.getElementById('terrainSelector'),
        objectSelector: document.getElementById('objectSelector'),
        resetViewBtn: document.getElementById('resetViewBtn'),
        undoBtn: document.getElementById('undoBtn'),
        redoBtn: document.getElementById('redoBtn'),
        gridColorPicker: document.getElementById('gridColorPicker'),
        gridVisibleCheckbox: document.getElementById('gridVisibleCheckbox'),
        layerList: document.getElementById('layerList'),
        addLayerBtn: document.getElementById('addLayerBtn'),
        deleteLayerBtn: document.getElementById('deleteLayerBtn'),
        fileMenuBtn: document.getElementById('fileMenuBtn'),
        fileDropdownMenu: document.getElementById('fileDropdownMenu'),
        saveProjectBtn: document.getElementById('saveProjectBtn'),
        loadProjectBtn: document.getElementById('loadProjectBtn'),
        loadJsonInput: document.getElementById('loadJsonInput'),
        savePngBtn: document.getElementById('savePngBtn'),
        eraserToolBtn: document.getElementById('eraserToolBtn'),
        eraserDropdownMenu: document.getElementById('eraserDropdownMenu'),
        eraseTerrainBtn: document.getElementById('eraseTerrainBtn'),
        eraseObjectsBtn: document.getElementById('eraseObjectsBtn'),
        userGuideBtn: document.getElementById('userGuideBtn'),
        settingsBtn: document.getElementById('settingsBtn'),
        apiKeyModal: document.getElementById('apiKeyModal'),
        saveApiKeyBtn: document.getElementById('saveApiKey'),
        cancelApiKeyBtn: document.getElementById('cancelApiKey'),
        apiKeyInput: document.getElementById('apiKeyInput'),
        mapKeyBtn: document.getElementById('mapKeyBtn'),
        mapKeyWindow: document.getElementById('mapKeyWindow'),
        mapKeyContent: document.getElementById('mapKeyContent'),
        mapKeyHeader: document.getElementById('mapKeyHeader'),
        mapKeyCloseBtn: document.getElementById('mapKeyCloseBtn'),
        gmViewToggleBtn: document.getElementById('gmViewToggleBtn'),
        gmViewIconOn: document.getElementById('gmViewIconOn'),
        gmViewIconOff: document.getElementById('gmViewIconOff'),
        assetEditorBtn: document.getElementById('assetEditorBtn'),
        assetEditorOverlay: document.getElementById('asset-editor-overlay'),
        addNewMapBtn: document.getElementById('addNewMapBtn'),
        newMapModal: document.getElementById('newMapModal'),
        newMapNameInput: document.getElementById('newMapNameInput'),
        newMapWidthInput: document.getElementById('newMapWidthInput'),
        newMapHeightInput: document.getElementById('newMapHeightInput'),
        confirmNewMapBtn: document.getElementById('confirmNewMapBtn'),
        cancelNewMapBtn: document.getElementById('cancelNewMapBtn'),
        assetContextMenu: document.getElementById('asset-context-menu'),
        deleteAssetBtn: document.getElementById('asset-delete-btn'),
        rotateLeftBtn: document.getElementById('asset-rotate-left-btn'),
        rotateRightBtn: document.getElementById('asset-rotate-right-btn'),
        scaleUpBtn: document.getElementById('asset-scale-up-btn'),
        scaleDownBtn: document.getElementById('asset-scale-down-btn'),
        pencilColorPicker: document.getElementById('pencilColorPicker'),
        pencilWidth: document.getElementById('pencilWidth'),
        pencilWidthValue: document.getElementById('pencilWidthValue'),
        pencilGmOnlyCheckbox: document.getElementById('pencilGmOnlyCheckbox'),
        toolPanels: {
            terrain: document.getElementById('terrainContentPanel'),
            object: document.getElementById('objectOptionsPanel'),
            pencil: document.getElementById('pencilOptionsPanel'),
            token: document.getElementById('tokenOptionsPanel'),
            text: document.getElementById('textToolPanel'),
            fog: document.getElementById('fogPanel'),
            select: document.getElementById('selectedObjectPanel'),
        }
    };

    // --- Local Application State ---
    let view = { zoom: 1, offsetX: 0, offsetY: 0 };
    let isPanning = false, isDrawing = false, isResizing = false;
    let panStart = { x: 0, y: 0 };
    let assetCache = {};
    let terrainPatterns = {};
    let layerCache = {};
    let isGmViewActive = true;
    let currentTool = 'terrain';
    let selectedTerrain = 'grass';
    let selectedObjectAsset = null;
    let activeLayerId = null;
    let undoStack = [], redoStack = [];
    const squareSize = 50;
    let renderRequested = false;
    let eraserMode = 'terrain'; 
    let selectedObjectId = null;
    let mouseWorldPos = {x: 0, y: 0};
    let lastPaintPos = null; 
    let currentDrawingId = null;

    // --- Function Declarations ---

    function requestRender() { if (!renderRequested) { renderRequested = true; } }
    
    function markLayerAsDirty(layerId) {
        const layer = state.getActiveMap()?.layers.find(l => l.id === layerId);
        if (layer) { layer.dirty = true; requestRender(); }
    }
    
    function markAllLayersAsDirty() {
        const activeMap = state.getActiveMap();
        if (activeMap && activeMap.layers) {
            activeMap.layers.forEach(l => l.dirty = true);
        }
        requestRender();
    }

    async function loadAssets() {
        assetCache = {};
        const assetPromises = [];

        function discoverAssets(manifestNode, path) {
            for (const key in manifestNode) {
                const currentPath = path ? `${path}.${key}` : key;
                const node = manifestNode[key];
                if (node.src && node.name) { // It's an asset
                    const promise = new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => { assetCache[currentPath] = img; resolve(); };
                        img.onerror = () => { console.error(`Failed to load asset: ${node.name}`); resolve(); };
                        img.src = node.src;
                    });
                    assetPromises.push(promise);
                } else { // It's a category, recurse deeper
                    discoverAssets(node, currentPath);
                }
            }
        }

        discoverAssets(state.assetManifest, '');

        if (state.project && state.project.maps) {
            Object.values(state.project.maps).forEach(map => {
                map.layers.forEach(layer => {
                    if (layer.backgroundImage) {
                        assetPromises.push(new Promise(resolve => {
                            const img = new Image();
                            img.onload = () => { assetCache[layer.backgroundImage] = img; resolve(); };
                            img.onerror = () => { console.error('Failed to load BG image'); resolve(); };
                            img.src = layer.backgroundImage;
                        }));
                    }
                });
            });
        }
        await Promise.all(assetPromises);
    }
    
    async function createTerrainPatterns() {
        const tempCtx = document.createElement('canvas').getContext('2d');
        const patternPromises = Object.entries(state.terrains).map(([id, terrain]) => {
            return new Promise(resolve => {
                const patternEl = document.getElementById(terrain.pattern);
                if (patternEl) {
                    const size = parseInt(patternEl.getAttribute('width'));
                    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${terrain.color}"/>${patternEl.innerHTML}</svg>`;
                    const img = new Image();
                    img.onload = () => {
                        const patternCanvas = document.createElement('canvas');
                        patternCanvas.width = size;
                        patternCanvas.height = size;
                        const patternCtx = patternCanvas.getContext('2d');
                        patternCtx.drawImage(img, 0, 0);
                        terrainPatterns[id] = tempCtx.createPattern(patternCanvas, 'repeat');
                        resolve();
                    };
                    img.onerror = () => { console.error(`Failed to load SVG pattern for ${terrain.name}`); terrainPatterns[id] = terrain.color; resolve(); };
                    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
                } else {
                    terrainPatterns[id] = terrain.color;
                    resolve();
                }
            });
        });
        await Promise.all(patternPromises);
    }

    async function reloadAssetsAndPatterns() {
        await loadAssets();
        await createTerrainPatterns();
    }
    
    function drawDrawings(layer, targetCtx) {
        if (!layer.drawings) return;
        layer.drawings.forEach(drawing => {
            if (!isGmViewActive && drawing.isGmOnly) return;
            if (drawing.path.length < 2) return;
            targetCtx.strokeStyle = drawing.color;
            targetCtx.lineWidth = drawing.width;
            targetCtx.lineCap = 'round';
            targetCtx.lineJoin = 'round';
            if (drawing.isGmOnly) targetCtx.globalAlpha = 0.5;
            targetCtx.beginPath();
            targetCtx.moveTo(drawing.path[0].x, drawing.path[0].y);
            for (let i = 1; i < drawing.path.length; i++) {
                targetCtx.lineTo(drawing.path[i].x, drawing.path[i].y);
            }
            targetCtx.stroke();
            targetCtx.globalAlpha = 1.0;
        });
    }

    function renderLayerToCache(layer) {
        const activeMap = state.getActiveMap();
        if(!activeMap) return;
        if (!layerCache[layer.id]) { layerCache[layer.id] = document.createElement('canvas'); }
        const cacheCanvas = layerCache[layer.id];
        if (cacheCanvas.width !== activeMap.width * squareSize || cacheCanvas.height !== activeMap.height * squareSize) {
            cacheCanvas.width = activeMap.width * squareSize;
            cacheCanvas.height = activeMap.height * squareSize;
        }
        const cacheCtx = cacheCanvas.getContext('2d');
        cacheCtx.clearRect(0, 0, cacheCanvas.width, cacheCanvas.height);
        if (layer.backgroundImage && assetCache[layer.backgroundImage]) { cacheCtx.drawImage(assetCache[layer.backgroundImage], 0, 0, cacheCanvas.width, cacheCanvas.height); }
        drawPlacedObjects(layer, cacheCtx);
        drawDrawings(layer, cacheCtx);
    }
    
    function drawPlacedObjects(layer, targetCtx) {
        if (!layer.objects) return;
        layer.objects.forEach(obj => {
            if (obj.isGmOnly && !isGmViewActive) return;
            const [category, subCategory, assetId] = obj.assetId.split('.');
            const assetData = state.assetManifest[category]?.[subCategory]?.[assetId];
            if (assetData) {
                const img = new Image();
                img.src = assetData.src;
                targetCtx.save();
                targetCtx.translate(obj.x, obj.y);
                targetCtx.rotate(obj.rotation * Math.PI / 180);
                targetCtx.scale(obj.scale, obj.scale);
                if (obj.isGmOnly) targetCtx.globalAlpha = 0.5;
                targetCtx.drawImage(asset, -asset.width / 2, -asset.height / 2);
                targetCtx.restore();
            }
        });
    }

    function drawGrid(targetCtx) {
        const map = state.getActiveMap();
        if (!map) return;
        targetCtx.strokeStyle = elements.gridColorPicker.value;
        targetCtx.lineWidth = 1 / view.zoom;
        targetCtx.beginPath();
        for (let x = 0; x <= map.width * squareSize; x += squareSize) {
            targetCtx.moveTo(x, 0);
            targetCtx.lineTo(x, map.height * squareSize);
        }
        for (let y = 0; y <= map.height * squareSize; y += squareSize) {
            targetCtx.moveTo(0, y);
            targetCtx.lineTo(map.width * squareSize, y);
        }
        targetCtx.stroke();
    }
    
    function getSelectedObject() {
        if (!selectedObjectId) return null;
        const activeMap = state.getActiveMap();
        for (const layer of activeMap.layers) {
            const object = layer.objects.find(o => o.id === selectedObjectId);
            if (object) return { object, layer };
        }
        return null;
    }

    function renderUI() {
        uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
        uiCtx.save();
        uiCtx.translate(view.offsetX, view.offsetY);
        uiCtx.scale(view.zoom, view.zoom);

        if (selectedObjectId) {
            const selection = getSelectedObject();
            if (selection) {
                const { object } = selection;
                const [category, subCategory, assetId] = object.assetId.split('.');
                const assetData = state.assetManifest[category]?.[subCategory]?.[assetId];
                if (assetData) {
                    const img = new Image();
                    img.src = assetData.src;
                    const w = (img.width * object.scale) + 10;
                    const h = (img.height * object.scale) + 10;
                    uiCtx.save();
                    uiCtx.translate(object.x, object.y);
                    uiCtx.rotate(object.rotation * Math.PI / 180);
                    uiCtx.strokeStyle = '#3b82f6';
                    uiCtx.lineWidth = 2 / view.zoom;
                    uiCtx.strokeRect(-w / 2, -h / 2, w, h);
                    uiCtx.restore();
                }
            }
        }

        if (isDrawing) {
            switch (currentTool) {
                case 'terrain':
                case 'eraser':
                    if (currentTool === 'eraser' && eraserMode !== 'terrain') break;
                    const brushSize = currentTool === 'terrain' ? elements.brushSizeSlider.value : 2;
                    uiCtx.fillStyle = currentTool === 'eraser' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.3)';
                    uiCtx.beginPath();
                    uiCtx.arc(mouseWorldPos.x, mouseWorldPos.y, (brushSize * squareSize) / 2, 0, 2 * Math.PI);
                    uiCtx.fill();
                    break;
            }
        }
        
        if (currentTool === 'object' && selectedObjectAsset) {
            const [category, subCategory, assetId] = selectedObjectAsset.split('.');
            const assetData = state.assetManifest[category]?.[subCategory]?.[assetId];
            if (assetData) {
                const img = new Image();
                img.src = assetData.src;
                uiCtx.globalAlpha = 0.6;
                const maxDim = Math.max(img.width, img.height);
                const previewScale = (squareSize / maxDim) * 0.9;
                uiCtx.drawImage(img, mouseWorldPos.x - (img.width * previewScale) / 2, mouseWorldPos.y - (img.height * previewScale) / 2, img.width * previewScale, img.height * previewScale);
                uiCtx.globalAlpha = 1.0;
            }
        }

        uiCtx.restore();
    }
    
    function renderLoop() {
        if (renderRequested) {
            const activeMap = state.getActiveMap();
            if (activeMap) {
                activeMap.layers.forEach(layer => {
                    if (layer.dirty) {
                        renderLayerToCache(layer);
                        layer.dirty = false;
                    }
                });
                
                elements.ctx.clearRect(0, 0, canvas.width, canvas.height);
                elements.ctx.save();
                elements.ctx.translate(view.offsetX, view.offsetY);
                elements.ctx.scale(view.zoom, view.zoom);

                [...activeMap.layers].reverse().forEach(layer => {
                    if (layer.visible && layerCache[layer.id]) {
                        elements.ctx.drawImage(layerCache[layer.id], 0, 0);
                    }
                });

                if (elements.gridVisibleCheckbox.checked) {
                    drawGrid(elements.ctx);
                }

                elements.ctx.restore();
            }
            renderRequested = false;
        }
        renderUI();
        requestAnimationFrame(renderLoop);
    }
    
    function updateUndoRedoButtons() { elements.undoBtn.disabled = undoStack.length <= 1; elements.redoBtn.disabled = redoStack.length === 0; }

    function updateLayerList() {
        const activeMap = state.getActiveMap();
        if (!activeMap || !elements.layerList) return;
        elements.layerList.innerHTML = '';
        activeMap.layers.forEach(layer => {
            const item = document.createElement('div');
            item.className = `layer-item ${layer.id === activeLayerId ? 'active' : ''}`;
            item.innerHTML = `<span class="layer-label">${layer.name}</span> <button>${layer.visible ? 'V' : 'H'}</button>`;
            item.onclick = () => setActiveLayer(layer.id);
            elements.layerList.appendChild(item);
        });
    }

    function applyState(stateObject, isUndoRedo = false) {
        if (stateObject.type === 'paint') {
            const layer = state.getActiveMap()?.layers.find(l => l.id === stateObject.layerId);
            if (layer && layerCache[layer.id]) {
                const cacheCtx = layerCache[layer.id].getContext('2d');
                cacheCtx.putImageData(stateObject.imageData, 0, 0);
                requestRender();
            }
        } else {
            state.project.maps[state.activeMapId] = JSON.parse(JSON.stringify(stateObject.mapState));
            if(isUndoRedo) markAllLayersAsDirty();
            updateLayerList();
        }
    }

    function saveStateForUndo(actionName, type = 'data') {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;
        let stateObject;
        if (type === 'paint') {
            const layer = activeMap.layers.find(l => l.id === activeLayerId);
            if (layer && layerCache[layer.id]) {
                const cacheCanvas = layerCache[layer.id];
                stateObject = {
                    type: 'paint',
                    actionName,
                    layerId: activeLayerId,
                    imageData: cacheCanvas.getContext('2d').getImageData(0, 0, cacheCanvas.width, cacheCanvas.height)
                };
            }
        } else {
            stateObject = {
                type: 'data',
                actionName,
                mapState: JSON.parse(JSON.stringify(activeMap))
            };
        }
        if (stateObject) {
            undoStack.push(stateObject);
            redoStack = [];
            updateUndoRedoButtons();
        }
    }
    
    function undo() {
        if (undoStack.length > 1) {
            const currentState = undoStack.pop();
            redoStack.push(currentState);
            const previousState = undoStack[undoStack.length - 1];
            applyState(previousState, true);
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            const nextState = redoStack.pop();
            undoStack.push(nextState);
            applyState(nextState, true);
        }
    }
    
    function clearSelection() { selectedObjectId = null; elements.assetContextMenu.classList.add('hidden'); }
    
    function handleToolSwitch(newTool) {
        console.log(`Switching to tool: ${newTool}`);
        currentTool = newTool;
        Object.entries(elements.toolPanels).forEach(([key, panel]) => {
            if (panel) {
                if (key === newTool) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            }
        });
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`tool${newTool.charAt(0).toUpperCase() + newTool.slice(1)}Btn`);
        if (btn) btn.classList.add('active');
    }
    
    function saveProject() {
        const dataStr = JSON.stringify(state.project, null, 2);
        const blob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.project.projectName.replace(/ /g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    function loadProject(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const newProject = JSON.parse(e.target.result);
                state.setState({ project: newProject });
                state.setActiveMapId(Object.keys(newProject.maps)[0] || null);
                if (state.activeMapId) {
                    activeLayerId = state.getActiveMap().layers[0]?.id || null;
                }
                elements.projectNameInput.value = newProject.projectName;
                layerCache = {}; // Clear old caches
                await reloadAssetsAndPatterns();
                markAllLayersAsDirty();
                updateLayerList();
            } catch (err) {
                console.error("Error loading project:", err);
                state.showToast("Failed to load project file.", "error");
            }
        };
        reader.readAsText(file);
    }
    
    function saveMapAsPng() {
        const activeMap = state.getActiveMap();
        if(!activeMap) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = activeMap.width * squareSize;
        tempCanvas.height = activeMap.height * squareSize;
        const tempCtx = tempCanvas.getContext('2d');
        [...activeMap.layers].reverse().forEach(layer => {
            if (layer.visible && layerCache[layer.id]) {
                tempCtx.drawImage(layerCache[layer.id], 0, 0);
            }
        });
        if(elements.gridVisibleCheckbox.checked) drawGrid(tempCtx);
        const a = document.createElement('a');
        a.href = tempCanvas.toDataURL('image/png');
        a.download = `${activeMap.name.replace(/ /g, '_')}.png`;
        a.click();
    }

    function resizeCanvas() {
        const container = document.getElementById('canvas-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        uiCanvas.width = canvas.width;
        uiCanvas.height = canvas.height;
        requestRender();
    }

    function handleResize(e) { if(isResizing) elements.panelWrapper.style.width = `${e.clientX}px`; }
    function stopResize() { isResizing = false; document.removeEventListener('mousemove', handleResize); document.removeEventListener('mouseup', stopResize); resizeCanvas(); }
    
    function showUserGuide() { state.showContentModal("User Guide", "<h3>Welcome!</h3><p>Here's a quick guide...</p>"); }

    function toggleMapKey() { elements.mapKeyWindow.classList.toggle('hidden'); if (!elements.mapKeyWindow.classList.contains('hidden')) populateMapKey(); }
    
    function populateMapKey() {
        const activeMap = state.getActiveMap();
        if(!activeMap) return;
        elements.mapKeyContent.innerHTML = '<h4>Assets Used</h4>';
        const usedAssets = new Set();
        activeMap.layers.forEach(l => l.objects.forEach(o => usedAssets.add(o.assetId)));
        usedAssets.forEach(id => {
            elements.mapKeyContent.innerHTML += `<p>${state.assetManifest[id]?.name || 'Unknown Asset'}</p>`;
        });
    }

    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        handle.onmousedown = (e) => {
            e.preventDefault();
            pos3 = e.clientX; pos4 = e.clientY;
            document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = (e) => {
                e.preventDefault();
                pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
                pos3 = e.clientX; pos4 = e.clientY;
                element.style.top = `${element.offsetTop - pos2}px`;
                element.style.left = `${element.offsetLeft - pos1}px`;
            };
        };
    }

    function saveApiKey() {
        const key = elements.apiKeyInput.value;
        if(key) {
            localStorage.setItem('mapMakerApiKey', key);
            state.setState({ apiKey: key });
            elements.apiKeyModal.classList.add('hidden');
            state.showToast("API Key saved!", "success");
        }
    }

    function toggleGmView() { isGmViewActive = !isGmViewActive; elements.gmViewIconOn.classList.toggle('hidden'); elements.gmViewIconOff.classList.toggle('hidden'); elements.gmViewToggleBtn.classList.toggle('gm-active'); markAllLayersAsDirty(); }
    
    function createInitialMap() {
        const mapId = `map_${Date.now()}`;
        const layerId = `layer_${Date.now()}`;
        state.project.maps[mapId] = { id: mapId, name: 'New World', width: 50, height: 50, layers: [{ id: layerId, name: 'Base Layer', visible: true, objects: [], drawings: [], dirty: true }] };
        state.setActiveMapId(mapId);
        activeLayerId = layerId;
    }

    function confirmNewMap() {
        const name = elements.newMapNameInput.value || 'Untitled Map';
        const width = parseInt(elements.newMapWidthInput.value);
        const height = parseInt(elements.newMapHeightInput.value);
        if (isNaN(width) || isNaN(height) || width < 1 || height < 1) {
            state.showToast("Invalid map dimensions.", "error"); return;
        }
        const mapId = `map_${Date.now()}`;
        const layerId = `layer_${Date.now()}`;
        state.project.maps[mapId] = { id: mapId, name, width, height, layers: [{ id: layerId, name: 'Base Layer', visible: true, objects: [], drawings: [], dirty: true }] };
        state.setActiveMapId(mapId);
        activeLayerId = layerId;
        updateLayerList();
        markAllLayersAsDirty();
        elements.newMapModal.classList.add('hidden');
        saveStateForUndo("Create New Map");
    }
    
    function addLayer() {
        const activeMap = state.getActiveMap(); if (!activeMap) return;
        const newLayer = { id: `layer_${Date.now()}`, name: `Layer ${activeMap.layers.length + 1}`, visible: true, objects: [], drawings: [], dirty: true };
        activeMap.layers.unshift(newLayer); activeLayerId = newLayer.id;
        updateLayerList(); saveStateForUndo("Add Layer");
    }

    function deleteActiveLayer() {
        const activeMap = state.getActiveMap();
        if (!activeMap || !activeLayerId || activeMap.layers.length <= 1) return;
        activeMap.layers = activeMap.layers.filter(l => l.id !== activeLayerId);
        activeLayerId = activeMap.layers[0].id;
        updateLayerList(); saveStateForUndo("Delete Layer");
    }
    
    function setActiveLayer(layerId) { activeLayerId = layerId; updateLayerList(); }
    
    function populateTerrainSelector() {
        elements.terrainSelector.innerHTML = '';
        Object.entries(state.terrains).forEach(([id, terrain]) => {
            const item = document.createElement('div');
            item.className = 'item-container';
            item.innerHTML = `<div class="texture-swatch" style="background-color:${terrain.color};"></div><span class="item-label">${terrain.name}</span>`;
            item.onclick = () => { selectedTerrain = id; document.querySelectorAll('#terrainSelector .item-container').forEach(i => i.classList.remove('active')); item.classList.add('active'); };
            elements.terrainSelector.appendChild(item);
        });
    }

    function populateObjectSelector() {
        elements.objectSelector.innerHTML = '';
        const manifest = state.assetManifest;

        for (const category in manifest) {
            const categoryHeader = document.createElement('h4');
            categoryHeader.textContent = category;
            categoryHeader.className = 'collapsible-header';
            elements.objectSelector.appendChild(categoryHeader);

            const categoryContent = document.createElement('div');
            categoryContent.className = 'collapsible-content';
            elements.objectSelector.appendChild(categoryContent);

            for (const subCategory in manifest[category]) {
                const subCategoryHeader = document.createElement('h5');
                subCategoryHeader.textContent = subCategory;
                subCategoryHeader.className = 'collapsible-header';
                categoryContent.appendChild(subCategoryHeader);

                const subCategoryContent = document.createElement('div');
                subCategoryContent.className = 'collapsible-content';
                categoryContent.appendChild(subCategoryContent);

                for (const assetId in manifest[category][subCategory]) {
                    const asset = manifest[category][subCategory][assetId];
                    const fullId = `${category}.${subCategory}.${assetId}`;
                    const item = document.createElement('div');
                    item.className = 'item-container';
                    item.innerHTML = `<div class="object-swatch"><img src="${asset.src}"></div><span class="item-label">${asset.name}</span>`;
                    item.onclick = () => {
                        selectedObjectAsset = fullId;
                        document.querySelectorAll('#objectSelector .item-container').forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        handleToolSwitch('object');
                    };
                    subCategoryContent.appendChild(item);
                }
                 subCategoryHeader.addEventListener('click', () => {
                    subCategoryContent.classList.toggle('hidden');
                });
            }

            categoryHeader.addEventListener('click', () => {
                categoryContent.classList.toggle('hidden');
            });
        }
    }
    
    function handleMouseDown(e) {
        if (e.button !== 0) return;
        panStart = { x: e.clientX, y: e.clientY };
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        mouseWorldPos = { x: (mouseX - view.offsetX) / view.zoom, y: (mouseY - view.offsetY) / view.zoom };

        if (e.ctrlKey || e.metaKey || e.button === 1) {
            isPanning = true;
        } else {
            isDrawing = true;
            if (currentTool === 'terrain' || (currentTool === 'eraser' && eraserMode === 'terrain')) {
                saveStateForUndo('Paint Stroke', 'paint');
            }
            lastPaintPos = { ...mouseWorldPos };
            applyTool(e, 'start');
        }
    }

    function handleMouseUp(e) {
        if(isDrawing) { 
            if (currentTool === 'pencil' || currentTool === 'object' || (currentTool === 'eraser' && eraserMode !== 'terrain')) {
                 saveStateForUndo(currentTool, 'data');
            }
        }
        isPanning = false; 
        isDrawing = false;
        lastPaintPos = null;
        currentDrawingId = null;
    }
    
    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        mouseWorldPos = { x: (mouseX - view.offsetX) / view.zoom, y: (mouseY - view.offsetY) / view.zoom };

        if (isPanning) {
            view.offsetX += e.clientX - panStart.x;
            view.offsetY += e.clientY - panStart.y;
            panStart = { x: e.clientX, y: e.clientY };
            requestRender();
        } else if (isDrawing) {
            applyTool(e, 'draw');
        }
    }
    
    function handleWheel(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoom = view.zoom * zoomFactor;
        view.offsetX = mouseX - (mouseX - view.offsetX) * zoomFactor;
        view.offsetY = mouseY - (mouseY - view.offsetY) * zoomFactor;
        view.zoom = newZoom;
        requestRender();
    }
    
    function handleKeyDown(e) {
        const selection = getSelectedObject();
        if (!selection) return;
        switch(e.key) {
            case 'Delete':
            case 'Backspace':
                deleteSelectedObject(); break;
            case 'r': rotateSelectedObject(-15); break;
            case 'R': rotateSelectedObject(15); break;
            case '+':
            case '=':
                scaleSelectedObject(1.1); break;
            case '-': scaleSelectedObject(0.9); break;
        }
    }

    function applyTool(e, eventType) {
        const activeMap = state.getActiveMap();
        const activeLayer = activeMap?.layers.find(l => l.id === activeLayerId);
        if (!activeLayer) return;

        switch(currentTool) {
            case 'terrain':
            case 'eraser':
                if (currentTool === 'eraser' && eraserMode !== 'terrain') return;
                
                const cacheCanvas = layerCache[activeLayer.id];
                if (!cacheCanvas) return;
                const cacheCtx = cacheCanvas.getContext('2d');
                const brushWidth = (currentTool === 'terrain' ? elements.brushSizeSlider.value : 2) * 10;

                cacheCtx.lineWidth = brushWidth;
                cacheCtx.lineCap = 'round';
                cacheCtx.lineJoin = 'round';
                
                if (currentTool === 'terrain') {
                    cacheCtx.strokeStyle = terrainPatterns[selectedTerrain];
                    cacheCtx.globalCompositeOperation = 'source-over';
                } else { 
                    cacheCtx.globalCompositeOperation = 'destination-out';
                }

                cacheCtx.beginPath();
                cacheCtx.moveTo(lastPaintPos.x, lastPaintPos.y);
                cacheCtx.lineTo(mouseWorldPos.x, mouseWorldPos.y);
                cacheCtx.stroke();
                
                lastPaintPos = { ...mouseWorldPos };
                requestRender();
                break;
            
            case 'pencil':
                if (!activeLayer.drawings) activeLayer.drawings = [];
                if (eventType === 'start') {
                    currentDrawingId = `draw_${Date.now()}`;
                    activeLayer.drawings.push({
                        id: currentDrawingId,
                        path: [ { ...mouseWorldPos } ],
                        color: elements.pencilColorPicker.value,
                        width: elements.pencilWidth.value,
                        isGmOnly: elements.pencilGmOnlyCheckbox.checked,
                    });
                } else if (eventType === 'draw' && currentDrawingId) {
                    const currentDrawing = activeLayer.drawings.find(d => d.id === currentDrawingId);
                    if (currentDrawing) currentDrawing.path.push({ ...mouseWorldPos });
                }
                markLayerAsDirty(activeLayerId);
                break;

            case 'object': 
                if (eventType === 'start' && selectedObjectAsset) {
                    const [category, subCategory, assetId] = selectedObjectAsset.split('.');
                    const assetData = state.assetManifest[category]?.[subCategory]?.[assetId];
                    if (!assetData) return;

                    const img = new Image();
                    img.src = assetData.src;
                    img.onload = () => {
                        const maxDim = Math.max(img.width, img.height);
                        const initialScale = (squareSize / maxDim) * 0.9;
                        activeLayer.objects.push({
                            id: `obj_${Date.now()}`,
                            assetId: selectedObjectAsset,
                            x: mouseWorldPos.x, y: mouseWorldPos.y,
                            rotation: 0, scale: initialScale,
                            isGmOnly: false
                        });
                        markLayerAsDirty(activeLayerId);
                    };
                }
                break;
            case 'select': 
                if(eventType === 'start') selectObjectAt(mouseWorldPos.x, mouseWorldPos.y, e.shiftKey); 
                break;
        }
    }
    
    function selectObjectAt(worldX, worldY) {
        const activeMap = state.getActiveMap();
        let foundObject = null;
        for (const layer of [...activeMap.layers].reverse()) {
            for (const obj of [...layer.objects].reverse()) {
                const [category, subCategory, assetId] = obj.assetId.split('.');
                const assetData = state.assetManifest[category]?.[subCategory]?.[assetId];
                if (assetData) {
                    const img = new Image();
                    img.src = assetData.src;
                    const dx = worldX - obj.x;
                    const dy = worldY - obj.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < (Math.max(asset.width, asset.height) * obj.scale) / 2) {
                        foundObject = obj;
                        break;
                    }
                }
            }
            if(foundObject) break;
        }

        if (foundObject) {
            selectedObjectId = foundObject.id;
            const menu = elements.assetContextMenu;
            menu.classList.remove('hidden');
            const rect = canvas.getBoundingClientRect();
            menu.style.left = `${((foundObject.x * view.zoom) + view.offsetX) + rect.left}px`;
            menu.style.top = `${((foundObject.y * view.zoom) + view.offsetY) + rect.top}px`;
        } else {
            clearSelection();
        }
    }

    function deleteSelectedObject() {
        const selection = getSelectedObject();
        if (!selection) return;
        selection.layer.objects = selection.layer.objects.filter(o => o.id !== selection.object.id);
        markLayerAsDirty(selection.layer.id);
        clearSelection();
        saveStateForUndo("Delete Object");
    }

    function rotateSelectedObject(degrees) {
        const selection = getSelectedObject();
        if (!selection) return;
        selection.object.rotation += degrees;
        markLayerAsDirty(selection.layer.id);
        saveStateForUndo("Rotate Object");
    }

    function scaleSelectedObject(factor) {
        const selection = getSelectedObject();
        if (!selection) return;
        selection.object.scale *= factor;
        markLayerAsDirty(selection.layer.id);
        saveStateForUndo("Scale Object");
    }

    function generateLandmass() {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        const noise = new Noise(Math.random());
        const scale = 0.1; // Adjust for more or less detail
        const waterThreshold = 0.3; // Adjust for more or less water

        const baseLayer = activeMap.layers[activeMap.layers.length - 1]; // Target the bottom layer
        if (!baseLayer) return;

        saveStateForUndo("Generate Landmass", "paint");

        const cacheCanvas = layerCache[baseLayer.id];
        if (!cacheCanvas) return;
        const cacheCtx = cacheCanvas.getContext('2d');

        for (let y = 0; y < activeMap.height; y++) {
            for (let x = 0; x < activeMap.width; x++) {
                const value = noise.perlin2(x * scale, y * scale);
                const terrainId = (value > waterThreshold) ? 'grass' : 'water';
                const pattern = terrainPatterns[terrainId];
                if (pattern) {
                    cacheCtx.fillStyle = pattern;
                    cacheCtx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
                }
            }
        }
        requestRender();
    }

    function setupAccordionListeners() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('active');
                const content = header.nextElementSibling;
                if (content && content.classList.contains('accordion-content')) {
                    if (content.style.display === 'block') {
                        content.style.display = 'none';
                    } else {
                        content.style.display = 'block';
                    }
                }
            });
        });
    }

    function setupAllEventListeners() {
        const safeListen = (el, evt, fn, name) => {
            if (el) { el.addEventListener(evt, fn); } 
            else { console.warn(`Element not found for listener: ${name}`); }
        };
        
        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', () => uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height));
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('keydown', handleKeyDown);

        document.querySelectorAll('.tool-btn').forEach(btn => {
            safeListen(btn, 'click', () => {
                const toolName = btn.id.replace('tool', '').replace('Btn', '').toLowerCase();
                handleToolSwitch(toolName);
            }, btn.id);
        });
        
        document.addEventListener('mapStateUpdated', (e) => {
             updateLayerList();
             if (e.detail?.newLayer) setActiveLayer(state.getActiveMap().layers[0].id);
             markAllLayersAsDirty();
        });
        document.addEventListener('assetLibraryUpdated', async () => {
            await reloadAssetsAndPatterns();
            populateObjectSelector();
            populateTerrainSelector();
        });
        
        safeListen(elements.resizer, 'mousedown', () => { isResizing = true; document.addEventListener('mousemove', handleResize); document.addEventListener('mouseup', stopResize); }, 'resizer');
        safeListen(elements.settingsBtn, 'click', () => elements.apiKeyModal.classList.remove('hidden'), 'settingsBtn');
        safeListen(elements.mapKeyBtn, 'click', toggleMapKey, 'mapKeyBtn');
        safeListen(elements.gmViewToggleBtn, 'click', toggleGmView, 'gmViewToggleBtn');
        safeListen(elements.assetEditorBtn, 'click', () => elements.assetEditorOverlay.classList.remove('hidden'), 'assetEditorBtn');
        safeListen(elements.userGuideBtn, 'click', showUserGuide, 'userGuideBtn');
        safeListen(elements.fileMenuBtn, 'click', () => elements.fileDropdownMenu.classList.toggle('hidden'), 'fileMenuBtn');
        safeListen(elements.saveProjectBtn, 'click', saveProject, 'saveProjectBtn');
        safeListen(elements.loadProjectBtn, 'click', () => elements.loadJsonInput.click(), 'loadProjectBtn');
        safeListen(elements.loadJsonInput, 'change', loadProject, 'loadJsonInput');
        safeListen(elements.savePngBtn, 'click', saveMapAsPng, 'savePngBtn');
        safeListen(elements.eraserToolBtn, 'click', () => {
            handleToolSwitch('eraser');
            elements.eraserDropdownMenu.classList.toggle('hidden');
        }, 'eraserToolBtn');
        safeListen(elements.eraseTerrainBtn, 'click', () => { eraserMode = 'terrain'; elements.eraserDropdownMenu.classList.add('hidden'); }, 'eraseTerrainBtn');
        safeListen(elements.eraseObjectsBtn, 'click', () => { eraserMode = 'objects'; elements.eraserDropdownMenu.classList.add('hidden'); }, 'eraseObjectsBtn');
        safeListen(elements.saveApiKeyBtn, 'click', saveApiKey, 'saveApiKeyBtn');
        safeListen(elements.cancelApiKeyBtn, 'click', () => elements.apiKeyModal.classList.add('hidden'), 'cancelApiKeyBtn');
        safeListen(elements.mapKeyCloseBtn, 'click', toggleMapKey, 'mapKeyCloseBtn');
        safeListen(elements.addNewMapBtn, 'click', () => elements.newMapModal.classList.remove('hidden'), 'addNewMapBtn');
        safeListen(elements.confirmNewMapBtn, 'click', confirmNewMap, 'confirmNewMapBtn');
        safeListen(elements.cancelNewMapBtn, 'click', () => elements.newMapModal.classList.add('hidden'), 'cancelNewMapBtn');
        safeListen(elements.resetViewBtn, 'click', () => { view = { zoom: 1, offsetX: 0, offsetY: 0 }; requestRender(); }, 'resetViewBtn');
        safeListen(elements.undoBtn, 'click', undo, 'undoBtn');
        safeListen(elements.redoBtn, 'click', redo, 'redoBtn');
        safeListen(elements.addLayerBtn, 'click', addLayer, 'addLayerBtn');
        safeListen(elements.deleteLayerBtn, 'click', deleteActiveLayer, 'deleteLayerBtn');
        safeListen(elements.brushSizeSlider, 'input', e => elements.brushSizeValue.textContent = e.target.value, 'brushSizeSlider');
        safeListen(elements.gridVisibleCheckbox, 'change', requestRender, 'gridVisibleCheckbox');
        safeListen(elements.gridColorPicker, 'input', requestRender, 'gridColorPicker');
        safeListen(elements.pencilWidth, 'input', (e) => elements.pencilWidthValue.textContent = e.target.value, 'pencilWidth');
        safeListen(elements.deleteAssetBtn, 'click', deleteSelectedObject, 'deleteAssetBtn');
        safeListen(elements.rotateLeftBtn, 'click', () => rotateSelectedObject(-15), 'rotateLeftBtn');
        safeListen(elements.rotateRightBtn, 'click', () => rotateSelectedObject(15), 'rotateRightBtn');
        safeListen(elements.scaleUpBtn, 'click', () => scaleSelectedObject(1.1), 'scaleUpBtn');
        safeListen(elements.scaleDownBtn, 'click', () => scaleSelectedObject(0.9), 'scaleDownBtn');

        const proceduralGenBtn = document.getElementById('proceduralGenBtn');
        safeListen(proceduralGenBtn, 'click', generateLandmass, 'proceduralGenBtn');

        makeDraggable(elements.mapKeyWindow, elements.mapKeyHeader);
    }
    
    // --- Initialization ---
    async function initialize() {
        console.log("Initializing Map Maker...");
        try {
            state.loadApiKey();
            if (state.apiKey) console.log("API Key loaded.");
            
            const [terrainsRes, assetsRes] = await Promise.all([ fetch('../assets/data/terrains.json'), fetch('../assets/data/assets.json') ]);
            if (!terrainsRes.ok || !assetsRes.ok) throw new Error("Network response was not ok.");
            
            state.setState({ terrains: await terrainsRes.json(), assetManifest: await assetsRes.json() });
            state.loadCustomAssets();
            await reloadAssetsAndPatterns();
            
            if (Object.keys(state.project.maps).length === 0) {
                createInitialMap();
            } else {
                state.setActiveMapId(Object.keys(state.project.maps)[0]);
            }
            if(state.getActiveMap() && state.getActiveMap().layers.length > 0){
                activeLayerId = state.getActiveMap().layers[0].id;
            } else {
                 createInitialMap(); // Fallback
            }
            
            setupAccordionListeners();
            setupAllEventListeners();
            handleToolSwitch('terrain');
            populateTerrainSelector();
            populateObjectSelector();
            updateLayerList();
            resizeCanvas();
            markAllLayersAsDirty();
            saveStateForUndo("Initial State");
            renderLoop();

            // Ensure all accordions are closed by default after initialization
            document.querySelectorAll('.accordion-content').forEach(content => {
                content.style.display = 'none';
            });
            document.querySelectorAll('.accordion-header').forEach(header => {
                header.classList.remove('active');
            });


        } catch (error) {
            console.error("Initialization Failed:", error);
            state.showModal("A critical error occurred while loading. Please refresh.");
        }
    }

    initialize();
});
