// Version 22.2 - Fixed SVG pattern loading and added robust checks for event listeners to prevent crashes.
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selection ---
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) { console.error("FATAL: mapCanvas not found."); return; }
    const uiCanvas = document.getElementById('uiCanvas');
    if (!uiCanvas) { console.error("FATAL: uiCanvas not found."); return; }
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
        eraserBrushSize: document.getElementById('eraserBrushSize'),
        eraserBrushSizeValue: document.getElementById('eraserBrushSizeValue'),
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
    let isPanning = false, isPainting = false, isResizing = false;
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
    let eraserBrushSize = 2;
    let selectedObjectId = null;
    let mouseWorldPos = {x: 0, y: 0};

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
        const assetPromises = Object.entries(state.assetManifest).map(([id, asset]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => { assetCache[id] = img; resolve(); };
                img.onerror = () => { console.error(`Failed to load asset: ${asset.name} with src ${asset.src}`); resolve(); };
                img.src = asset.src;
            });
        });
        if (state.project && state.project.maps) {
            Object.values(state.project.maps).forEach(map => {
                map.layers.forEach(layer => {
                    if (layer.backgroundImage && !assetCache[layer.backgroundImage]) {
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
        terrainPatterns = {};
        const tempCtx = document.createElement('canvas').getContext('2d');
        const patternPromises = Object.entries(state.terrains).map(([id, terrain]) => {
            return new Promise(resolve => {
                if (terrain.src) {
                    const img = new Image();
                    img.onload = () => { terrainPatterns[id] = tempCtx.createPattern(img, 'repeat'); resolve(); };
                    img.onerror = () => { console.error(`Failed to load custom terrain image for ${terrain.name}`); terrainPatterns[id] = terrain.color; resolve(); };
                    img.src = terrain.src;
                } else {
                    const patternEl = document.getElementById(terrain.pattern);
                    if (patternEl) {
                        const sizeAttr = patternEl.getAttribute('width');
                        if (!sizeAttr) { console.error(`Pattern ${terrain.pattern} is missing width attribute.`); terrainPatterns[id] = terrain.color; resolve(); return; }
                        const size = parseInt(sizeAttr);
                        
                        // FIX: Create a full, valid SVG document to be loaded as an image
                        const patternHTML = new XMLSerializer().serializeToString(patternEl);
                        const fullSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs>${patternHTML}</defs><rect width="100%" height="100%" fill="url(#${patternEl.id})"/></svg>`;
                        const svgBlob = new Blob([fullSvg], {type: 'image/svg+xml;charset=utf-8'});
                        const url = URL.createObjectURL(svgBlob);
                        
                        const img = new Image();
                        img.onload = () => {
                            const pC = document.createElement('canvas'); pC.width = size; pC.height = size;
                            pC.getContext('2d').drawImage(img, 0, 0, size, size);
                            terrainPatterns[id] = tempCtx.createPattern(pC, 'repeat');
                            URL.revokeObjectURL(url); resolve();
                        };
                        img.onerror = () => { console.error(`Failed to load SVG pattern for ${terrain.name}`); terrainPatterns[id] = terrain.color; URL.revokeObjectURL(url); resolve(); };
                        img.src = url;
                    } else { terrainPatterns[id] = terrain.color; resolve(); }
                }
            });
        });
        await Promise.all(patternPromises);
    }

    async function reloadAssetsAndPatterns() {
        assetCache = {};
        await loadAssets();
        await createTerrainPatterns();
        markAllLayersAsDirty();
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
        drawLayerTerrain(layer, cacheCtx);
        drawPlacedObjects(layer, cacheCtx);
    }
    
    function drawLayerTerrain(layer, targetCtx) {
        if (!layer.terrainPatches) return;
        layer.terrainPatches.forEach(patch => {
            const pattern = terrainPatterns[patch.terrain] || state.terrains[patch.terrain]?.color;
            if (pattern) { targetCtx.fillStyle = pattern; targetCtx.fillRect(patch.x * squareSize, patch.y * squareSize, squareSize, squareSize); }
        });
    }
    
    function drawPlacedObjects(layer, targetCtx) {
        if (!layer.objects) return;
        layer.objects.forEach(obj => {
            if (!isGmViewActive && obj.isGmOnly) return;
            const asset = assetCache[obj.assetId];
            if (asset) {
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
        for (let x = 0; x <= map.width * squareSize; x += squareSize) { targetCtx.moveTo(x, 0); targetCtx.lineTo(x, map.height * squareSize); }
        for (let y = 0; y <= map.height * squareSize; y += squareSize) { targetCtx.moveTo(0, y); targetCtx.lineTo(map.width * squareSize, y); }
        targetCtx.stroke();
    }
    
    function getSelectedObject() {
        if (!selectedObjectId) return null;
        const activeMap = state.getActiveMap();
        if (!activeMap) return null;
        for (const layer of activeMap.layers) {
            const object = layer.objects.find(obj => obj.id === selectedObjectId);
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
                const { object, layer } = selection;
                 if (layer.visible || isGmViewActive) {
                    const asset = assetCache[object.assetId];
                    if (asset) {
                        const w = (asset.width * object.scale) + (10 / view.zoom);
                        const h = (asset.height * object.scale) + (10 / view.zoom);
                        uiCtx.strokeStyle = '#3b82f6';
                        uiCtx.lineWidth = 2 / view.zoom;
                        uiCtx.strokeRect(object.x - w / 2, object.y - h / 2, w, h);
                    }
                }
            }
        }
        switch (currentTool) {
            case 'terrain': const brushSize = parseInt(elements.brushSizeSlider.value); uiCtx.fillStyle = 'rgba(255, 255, 255, 0.3)'; uiCtx.beginPath(); uiCtx.arc(mouseWorldPos.x, mouseWorldPos.y, (brushSize * squareSize) / 2, 0, 2 * Math.PI); uiCtx.fill(); break;
            case 'eraser': uiCtx.fillStyle = 'rgba(239, 68, 68, 0.4)'; uiCtx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; uiCtx.lineWidth = 1 / view.zoom; uiCtx.beginPath(); uiCtx.arc(mouseWorldPos.x, mouseWorldPos.y, (eraserBrushSize * squareSize) / 2, 0, 2 * Math.PI); uiCtx.fill(); uiCtx.stroke(); break;
            case 'object': if (selectedObjectAsset && assetCache[selectedObjectAsset]) { const img = assetCache[selectedObjectAsset]; uiCtx.globalAlpha = 0.6; uiCtx.drawImage(img, mouseWorldPos.x - img.width / 2, mouseWorldPos.y - img.height / 2); uiCtx.globalAlpha = 1.0; } break;
        }
        uiCtx.restore();
    }
    
    function renderLoop() {
        if (renderRequested) {
            const activeMap = state.getActiveMap();
            if (activeMap) {
                activeMap.layers.forEach(layer => { if (layer.dirty) { renderLayerToCache(layer); layer.dirty = false; } });
                elements.ctx.clearRect(0, 0, canvas.width, canvas.height);
                elements.ctx.save();
                elements.ctx.translate(view.offsetX, view.offsetY);
                elements.ctx.scale(view.zoom, view.zoom);
                [...activeMap.layers].reverse().forEach(layer => {
                    if ((layer.visible || isGmViewActive) && layerCache[layer.id]) {
                        elements.ctx.globalAlpha = (!layer.visible && isGmViewActive) ? 0.5 : 1.0;
                        elements.ctx.drawImage(layerCache[layer.id], 0, 0);
                    }
                });
                elements.ctx.globalAlpha = 1.0;
                if (elements.gridVisibleCheckbox.checked) { drawGrid(elements.ctx); }
                elements.ctx.restore();
            }
            renderRequested = false;
        }
        renderUI();
        requestAnimationFrame(renderLoop);
    }
    
    function updateUndoRedoButtons() { elements.undoBtn.disabled = undoStack.length <= 1; elements.redoBtn.disabled = redoStack.length === 0; }

    function updateLayerList() {
        const activeMap = state.getActiveMap(); elements.layerList.innerHTML = '';
        if (!activeMap) return;
        activeMap.layers.forEach(layer => {
            const item = document.createElement('div');
            item.className = `layer-item ${layer.id === activeLayerId ? 'active' : ''}`;
            item.dataset.layerId = layer.id;
            item.innerHTML = `<span class="layer-label">${layer.name}</span><div class="layer-controls ml-auto"><button class="toggle-visibility">${layer.visible ? '👁️' : '🙈'}</button></div>`;
            item.querySelector('.toggle-visibility').addEventListener('click', (e) => { e.stopPropagation(); layer.visible = !layer.visible; markAllLayersAsDirty(); updateLayerList(); });
            item.addEventListener('click', () => setActiveLayer(layer.id));
            elements.layerList.appendChild(item);
        });
    }

    function applyState(mapState, actionName) {
        state.project.maps[state.activeMapId] = JSON.parse(JSON.stringify(mapState));
        markAllLayersAsDirty(); updateLayerList(); requestRender(); updateUndoRedoButtons();
        state.showToast(actionName, 'info', 1500);
    }

    function saveStateForUndo(actionName) {
        const activeMap = state.getActiveMap(); if (!activeMap) return;
        const stateCopy = JSON.parse(JSON.stringify(activeMap));
        undoStack.push({ actionName, mapState: stateCopy });
        if (undoStack.length > 30) undoStack.shift();
        redoStack = []; updateUndoRedoButtons();
    }

    function undo() { if (undoStack.length > 1) { const c = undoStack.pop(); redoStack.push(c); const p = undoStack[undoStack.length - 1]; applyState(p.mapState, `Undo: ${c.actionName}`); } }
    function redo() { if (redoStack.length > 0) { const n = redoStack.pop(); undoStack.push(n); applyState(n.mapState, `Redo: ${n.actionName}`); } }
    
    function clearSelection() { selectedObjectId = null; }
    
    function handleToolSwitch(newTool) {
        currentTool = newTool;
        Object.values(elements.toolPanels).forEach(panel => panel.classList.add('hidden'));
        if (elements.toolPanels[newTool]) { elements.toolPanels[newTool].classList.remove('hidden'); }
        document.querySelectorAll('.tool-btn, #eraserToolBtn').forEach(btn => {
            const tool = btn.id.replace('tool', '').replace('Btn', '').toLowerCase();
            btn.classList.toggle('active', tool === newTool || (newTool === 'eraser' && btn.id === 'eraserToolBtn'));
        });
        clearSelection();
    }
    
    function saveProject() {
        const projectData = JSON.stringify(state.project, null, 2);
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const projectName = state.project.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'untitled_project';
        a.download = `${projectName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        state.showToast('Project Saved!', 'success');
    }
    
    function loadProject(event) {
        const file = event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const projectData = JSON.parse(e.target.result);
                if (!projectData.projectName || !projectData.maps) throw new Error("Invalid project file format.");
                state.setState({ project: projectData, activeMapId: Object.keys(projectData.maps)[0] });
                await reloadAssetsAndPatterns();
                elements.projectNameInput.value = state.project.projectName;
                updateLayerList(); markAllLayersAsDirty(); requestRender();
                state.showToast('Project Loaded!', 'success');
            } catch (error) {
                console.error("Failed to load project:", error);
                state.showModal("Load Error", `Failed to load project file. It may be corrupt or in the wrong format.\nError: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
    
    function saveMapAsPng() {
        const activeMap = state.getActiveMap(); if (!activeMap) return;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = activeMap.width * squareSize; exportCanvas.height = activeMap.height * squareSize;
        const exportCtx = exportCanvas.getContext('2d');
        [...activeMap.layers].reverse().forEach(layer => { if (layer.visible && layerCache[layer.id]) { exportCtx.drawImage(layerCache[layer.id], 0, 0); } });
        if (elements.gridVisibleCheckbox.checked) { drawGrid(exportCtx); }
        const url = exportCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url; a.download = `${activeMap.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        a.click(); state.showToast('Map saved as PNG!', 'success');
    }

    function resizeCanvas() {
        const container = document.getElementById('canvas-container');
        canvas.width = container.clientWidth; canvas.height = container.clientHeight;
        uiCanvas.width = canvas.width; uiCanvas.height = canvas.height;
        requestRender();
    }

    function handleResize(e) { if(isResizing) elements.panelWrapper.style.width = `${e.clientX}px`; }
    function stopResize() { isResizing = false; document.removeEventListener('mousemove', handleResize); document.removeEventListener('mouseup', stopResize); resizeCanvas(); }
    
    function showUserGuide() {
        const content = `<div class="prose prose-invert max-w-none"><h2>Welcome to Map Maker!</h2><p>Here's a quick guide to get you started:</p><ul><li><strong>Panning:</strong> Hold the <strong>Middle Mouse Button</strong> or the <strong>Spacebar</strong> and drag to move the map.</li><li><strong>Zooming:</strong> Use the <strong>Mouse Wheel</strong> to zoom in and out.</li><li><strong>Tools:</strong> Select tools from the left panel. Each tool has its own set of options.</li><li><strong>Layers:</strong> Add, remove, reorder, and rename layers in the "Graphics Options" section. All edits apply to the currently active layer.</li><li><strong>Saving:</strong> Use the File Menu (top right) to save your entire project or export the current map as a PNG.</li></ul><h3>Keyboard Shortcuts</h3><ul><li><strong>Ctrl + Z:</strong> Undo</li><li><strong>Ctrl + Y:</strong> Redo</li><li><strong>R / Shift + R:</strong> Rotate selected object.</li><li><strong>+ / -:</strong> Scale selected object.</li><li><strong>Delete:</strong> Delete selected object.</li></ul></div>`;
        state.showContentModal("User Guide", content);
    }

    function toggleMapKey() { elements.mapKeyWindow.classList.toggle('hidden'); if (!elements.mapKeyWindow.classList.contains('hidden')) populateMapKey(); }
    
    function populateMapKey() {
        const activeMap = state.getActiveMap(); if (!activeMap) return;
        let usedTerrains = new Set();
        activeMap.layers.forEach(l => l.terrainPatches.forEach(p => usedTerrains.add(p.terrain)));
        elements.mapKeyContent.innerHTML = '';
        usedTerrains.forEach(terrainId => {
            const terrain = state.terrains[terrainId];
            if (terrain) {
                const keyItem = document.createElement('div');
                keyItem.className = 'flex items-center p-2';
                keyItem.innerHTML = `<div class="w-8 h-8 mr-4 border border-gray-500 rounded" style="background-color: ${terrain.color};"></div><span>${terrain.name}</span>`;
                elements.mapKeyContent.appendChild(keyItem);
            }
        });
    }

    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        handle.onmousedown = (e) => {
            e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY;
            document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = (e) => {
                e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
                pos3 = e.clientX; pos4 = e.clientY;
                element.style.top = `${element.offsetTop - pos2}px`; element.style.left = `${element.offsetLeft - pos1}px`;
            };
        };
    }

    function saveApiKey() {
        const key = elements.apiKeyInput.value.trim();
        if (key) {
            state.setState({ apiKey: key }); localStorage.setItem('mapMakerApiKey', key);
            state.showToast("API Key Saved!", "success"); elements.apiKeyModal.classList.add('hidden');
        } else { state.showToast("API Key cannot be empty.", "error"); }
    }

    function toggleGmView() { isGmViewActive = !isGmViewActive; elements.gmViewIconOn.classList.toggle('hidden'); elements.gmViewIconOff.classList.toggle('hidden'); elements.gmViewToggleBtn.classList.toggle('gm-active'); markAllLayersAsDirty(); }
    
    function createInitialMap() {
        const mapId = `map_${Date.now()}`;
        state.project.maps[mapId] = { id: mapId, name: "New World", width: 50, height: 50, layers: [{ id: `layer_${Date.now()}`, name: "Base Layer", visible: true, objects: [], terrainPatches: [], dirty: true }], parentId: null };
        state.setActiveMapId(mapId); activeLayerId = state.getActiveMap().layers[0].id;
    }

    function confirmNewMap() {
        const name = elements.newMapNameInput.value || "Untitled Map";
        const width = parseInt(elements.newMapWidthInput.value);
        const height = parseInt(elements.newMapHeightInput.value);
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) { state.showToast("Invalid map dimensions.", "error"); return; }
        const newMapId = `map_${Date.now()}`;
        state.project.maps[newMapId] = { id: newMapId, name, width, height, layers: [{ id: `layer_${Date.now()}`, name: "Base Layer", visible: true, objects: [], terrainPatches: [], dirty: true }], parentId: document.getElementById('newMapAsChildCheckbox').checked ? state.activeMapId : null };
        state.setActiveMapId(newMapId); activeLayerId = state.getActiveMap().layers[0].id;
        updateLayerList(); markAllLayersAsDirty();
        elements.newMapModal.classList.add('hidden');
        state.showToast(`Map "${name}" created!`, 'success');
    }
    
    function addLayer() {
        const activeMap = state.getActiveMap(); if (!activeMap) return;
        const newLayer = { id: `layer_${Date.now()}`, name: `Layer ${activeMap.layers.length + 1}`, visible: true, objects: [], terrainPatches: [], dirty: true };
        activeMap.layers.unshift(newLayer); activeLayerId = newLayer.id;
        updateLayerList(); saveStateForUndo("Add Layer");
    }

    function deleteActiveLayer() {
        const activeMap = state.getActiveMap(); if (!activeMap || !activeLayerId) return;
        if (activeMap.layers.length <= 1) { state.showToast("Cannot delete the last layer.", "error"); return; }
        state.showModal("Delete Layer?", `Are you sure you want to delete the layer "${activeMap.layers.find(l=>l.id===activeLayerId)?.name}"?`, () => {
            activeMap.layers = activeMap.layers.filter(l => l.id !== activeLayerId);
            activeLayerId = activeMap.layers[0].id;
            updateLayerList(); markAllLayersAsDirty();
        });
    }
    
    function setActiveLayer(layerId) { activeLayerId = layerId; updateLayerList(); }
    
    function populateTerrainSelector() {
        elements.terrainSelector.innerHTML = '';
        Object.entries(state.terrains).forEach(([id, terrain]) => {
            const item = document.createElement('div');
            item.className = `item-container ${id === selectedTerrain ? 'active' : ''}`;
            item.dataset.terrainId = id;
            item.innerHTML = `<div class="texture-swatch" style="background-color:${terrain.color}"></div><span class="item-label">${terrain.name}</span>`;
            item.addEventListener('click', () => { selectedTerrain = id; populateTerrainSelector(); });
            elements.terrainSelector.appendChild(item);
        });
    }

    function populateObjectSelector() {
        elements.objectSelector.innerHTML = '';
        Object.entries(state.assetManifest).forEach(([id, asset]) => {
            const item = document.createElement('div');
            item.className = `item-container ${id === selectedObjectAsset ? 'active' : ''}`;
            item.dataset.assetId = id;
            item.innerHTML = `<div class="object-swatch"><img src="${asset.src}" alt="${asset.name}"></div><span class="item-label">${asset.name}</span>`;
            item.addEventListener('click', () => { selectedObjectAsset = id; populateObjectSelector(); });
            elements.objectSelector.appendChild(item);
        });
    }
    
    function handleMouseDown(e) {
        if (e.button === 1 || (e.button === 0 && e.altKey)) { isPanning = true; panStart = { x: e.clientX - view.offsetX, y: e.clientY - view.offsetY }; return; }
        if (e.button !== 0) return;
        isPainting = true; applyTool(e);
    }

    function handleMouseUp(e) { if(isPainting) { saveStateForUndo(currentTool); } isPanning = false; isPainting = false; }
    
    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mouseWorldPos = { x: (e.clientX - rect.left - view.offsetX) / view.zoom, y: (e.clientY - rect.top - view.offsetY) / view.zoom };
        if (isPanning) { view.offsetX = e.clientX - panStart.x; view.offsetY = e.clientY - panStart.y; requestRender(); return; }
        if (isPainting) applyTool(e);
    }
    
    function handleWheel(e) {
        e.preventDefault(); const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top;
        const zoomFactor = 1.1; const newZoom = e.deltaY < 0 ? view.zoom * zoomFactor : view.zoom / zoomFactor;
        view.offsetX = mouseX - (mouseX - view.offsetX) * (newZoom / view.zoom);
        view.offsetY = mouseY - (mouseY - view.offsetY) * (newZoom / view.zoom);
        view.zoom = newZoom; requestRender();
    }
    
    function handleKeyDown(e) {
        if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); return; }
        if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); return; }
        if (!selectedObjectId) return;
        switch(e.key) {
            case 'Delete': deleteSelectedObject(); break;
            case 'r': rotateSelectedObject(-15); break;
            case 'R': rotateSelectedObject(15); break;
            case '+': case '=': scaleSelectedObject(1.1); break;
            case '-': scaleSelectedObject(0.9); break;
        }
    }

    function applyTool(e) {
        const activeMap = state.getActiveMap();
        const activeLayer = activeMap?.layers.find(l => l.id === activeLayerId);
        if (!activeLayer) return;
        const gridX = Math.floor(mouseWorldPos.x / squareSize);
        const gridY = Math.floor(mouseWorldPos.y / squareSize);
        switch(currentTool) {
            case 'terrain':
                const brushSize = parseInt(elements.brushSizeSlider.value);
                const radius = Math.floor(brushSize / 2);
                for(let x = -radius; x <= radius; x++) {
                    for(let y = -radius; y <= radius; y++) {
                        if (x*x + y*y <= radius*radius) {
                            const pX = gridX + x; const pY = gridY + y;
                            const existing = activeLayer.terrainPatches.find(p => p.x === pX && p.y === pY);
                            if (existing) existing.terrain = selectedTerrain;
                            else activeLayer.terrainPatches.push({ x: pX, y: pY, terrain: selectedTerrain });
                        }
                    }
                }
                break;
            case 'object': if (selectedObjectAsset) { activeLayer.objects.push({ id: `obj_${Date.now()}`, assetId: selectedObjectAsset, x: mouseWorldPos.x, y: mouseWorldPos.y, rotation: 0, scale: 1, isGmOnly: false }); } break;
            case 'select': selectObjectAt(mouseWorldPos.x, mouseWorldPos.y); break;
        }
        markLayerAsDirty(activeLayerId);
    }
    
    function selectObjectAt(worldX, worldY) {
        const activeMap = state.getActiveMap(); if (!activeMap) return;
        let foundObject = null;
        for (const layer of [...activeMap.layers].reverse()) {
             if (!layer.visible && !isGmViewActive) continue;
             for (const obj of [...layer.objects].reverse()) {
                const asset = assetCache[obj.assetId];
                if (asset) {
                    const dx = worldX - obj.x; const dy = worldY - obj.y;
                    const halfW = (asset.width * obj.scale) / 2; const halfH = (asset.height * obj.scale) / 2;
                    if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) { foundObject = obj; break; }
                }
             }
             if (foundObject) break;
        }
        if (foundObject) { selectedObjectId = foundObject.id; } else { clearSelection(); }
    }

    function deleteSelectedObject() {
        const selection = getSelectedObject(); if (!selection) return;
        selection.layer.objects = selection.layer.objects.filter(obj => obj.id !== selectedObjectId);
        markLayerAsDirty(selection.layer.id); clearSelection(); saveStateForUndo("Delete Object");
    }

    function rotateSelectedObject(degrees) {
        const selection = getSelectedObject(); if (!selection) return;
        selection.object.rotation = (selection.object.rotation + degrees) % 360;
        markLayerAsDirty(selection.layer.id);
        // No undo for this rapid action, user can rotate back.
    }

    function scaleSelectedObject(factor) {
        const selection = getSelectedObject(); if (!selection) return;
        selection.object.scale *= factor;
        markLayerAsDirty(selection.layer.id);
        // No undo for this rapid action, user can scale back.
    }

    function setupAllEventListeners() {
        // FIX: Add defensive checks for all elements to prevent crashes if an element is missing.
        const safeListen = (element, event, handler, elementName) => {
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.error(`Initialization Error: Element "${elementName}" not found. Cannot attach event listener.`);
            }
        };

        window.addEventListener('resize', resizeCanvas);
        safeListen(canvas, 'mousedown', handleMouseDown, 'canvas');
        safeListen(canvas, 'mousemove', handleMouseMove, 'canvas');
        window.addEventListener('mouseup', handleMouseUp);
        safeListen(canvas, 'mouseleave', () => uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height), 'canvas');
        safeListen(canvas, 'wheel', handleWheel, { passive: false }, 'canvas');
        document.addEventListener('keydown', handleKeyDown);

        document.addEventListener('mapStateUpdated', (e) => {
             updateLayerList();
             if (e.detail?.newLayer) { const newLayerId = state.getActiveMap().layers[0].id; setActiveLayer(newLayerId); }
             markAllLayersAsDirty(); requestRender();
        });
        document.addEventListener('assetLibraryUpdated', async () => { await reloadAssetsAndPatterns(); populateObjectSelector(); populateTerrainSelector(); });
        
        safeListen(elements.settingsBtn, 'click', () => elements.apiKeyModal.classList.remove('hidden'), 'settingsBtn');
        safeListen(elements.mapKeyBtn, 'click', toggleMapKey, 'mapKeyBtn');
        safeListen(elements.gmViewToggleBtn, 'click', toggleGmView, 'gmViewToggleBtn');
        safeListen(elements.assetEditorBtn, 'click', () => elements.assetEditorOverlay.classList.remove('hidden'), 'assetEditorBtn');
        safeListen(elements.userGuideBtn, 'click', showUserGuide, 'userGuideBtn');
        
        document.addEventListener('click', (e) => {
            if (elements.fileMenuBtn && !elements.fileMenuBtn.contains(e.target)) elements.fileDropdownMenu.classList.add('hidden');
            if (elements.eraserToolBtn && !elements.eraserToolBtn.contains(e.target)) elements.eraserDropdownMenu.classList.add('hidden');
        });

        safeListen(elements.fileMenuBtn, 'click', () => elements.fileDropdownMenu.classList.toggle('hidden'), 'fileMenuBtn');
        safeListen(elements.saveProjectBtn, 'click', saveProject, 'saveProjectBtn');
        safeListen(elements.loadProjectBtn, 'click', () => elements.loadJsonInput.click(), 'loadProjectBtn');
        safeListen(elements.loadJsonInput, 'change', loadProject, 'loadJsonInput');
        safeListen(elements.savePngBtn, 'click', saveMapAsPng, 'savePngBtn');
        safeListen(elements.eraserToolBtn, 'click', () => { handleToolSwitch('eraser'); elements.eraserDropdownMenu.classList.toggle('hidden'); }, 'eraserToolBtn');
        safeListen(elements.eraseTerrainBtn, 'click', () => { eraserMode = 'terrain'; elements.eraserDropdownMenu.classList.add('hidden'); }, 'eraseTerrainBtn');
        safeListen(elements.eraseObjectsBtn, 'click', () => { eraserMode = 'objects'; elements.eraserDropdownMenu.classList.add('hidden'); }, 'eraseObjectsBtn');
        safeListen(elements.eraserBrushSize, 'input', e => { eraserBrushSize = parseInt(e.target.value); elements.eraserBrushSizeValue.textContent = eraserBrushSize; }, 'eraserBrushSize');
        safeListen(elements.saveApiKeyBtn, 'click', saveApiKey, 'saveApiKeyBtn');
        safeListen(elements.cancelApiKeyBtn, 'click', () => elements.apiKeyModal.classList.add('hidden'), 'cancelApiKeyBtn');
        safeListen(elements.mapKeyCloseBtn, 'click', toggleMapKey, 'mapKeyCloseBtn');
        safeListen(elements.addNewMapBtn, 'click', () => elements.newMapModal.classList.remove('hidden'), 'addNewMapBtn');
        safeListen(elements.confirmNewMapBtn, 'click', confirmNewMap, 'confirmNewMapBtn');
        safeListen(elements.cancelNewMapBtn, 'click', () => elements.newMapModal.classList.add('hidden'), 'cancelNewMapBtn');
        safeListen(elements.resizer, 'mousedown', () => { isResizing = true; document.addEventListener('mousemove', handleResize); document.addEventListener('mouseup', stopResize); }, 'resizer');
        safeListen(elements.resetViewBtn, 'click', () => { view = { zoom: 1, offsetX: 0, offsetY: 0 }; requestRender(); }, 'resetViewBtn');
        safeListen(elements.undoBtn, 'click', undo, 'undoBtn');
        safeListen(elements.redoBtn, 'click', redo, 'redoBtn');
        safeListen(elements.addLayerBtn, 'click', addLayer, 'addLayerBtn');
        safeListen(elements.deleteLayerBtn, 'click', deleteActiveLayer, 'deleteLayerBtn');
        safeListen(elements.brushSizeSlider, 'input', e => elements.brushSizeValue.textContent = e.target.value, 'brushSizeSlider');
        safeListen(elements.gridVisibleCheckbox, 'change', requestRender, 'gridVisibleCheckbox');
        safeListen(elements.gridColorPicker, 'input', requestRender, 'gridColorPicker');
        
        if (elements.mapKeyWindow && elements.mapKeyHeader) makeDraggable(elements.mapKeyWindow, elements.mapKeyHeader);

        document.querySelectorAll('.tool-btn').forEach(btn => { safeListen(btn, 'click', (e) => { const toolName = e.currentTarget.id.replace('tool', '').replace('Btn', '').toLowerCase(); handleToolSwitch(toolName); }, `tool-btn-${btn.id}`); });
        
        safeListen(elements.deleteAssetBtn, 'click', deleteSelectedObject, 'deleteAssetBtn');
        safeListen(elements.rotateLeftBtn, 'click', () => rotateSelectedObject(-15), 'rotateLeftBtn');
        safeListen(elements.rotateRightBtn, 'click', () => rotateSelectedObject(15), 'rotateRightBtn');
        safeListen(elements.scaleUpBtn, 'click', () => scaleSelectedObject(1.1), 'scaleUpBtn');
        safeListen(elements.scaleDownBtn, 'click', () => scaleSelectedObject(0.9), 'scaleDownBtn');
        document.addEventListener('mousedown', (e) => { if (elements.assetContextMenu && !elements.assetContextMenu.contains(e.target) && !canvas.contains(e.target)) { elements.assetContextMenu.classList.add('hidden'); } });
    }
    
    // --- Initialization ---
    async function initialize() {
        try {
            console.log("Initializing Map Maker...");
            state.loadApiKey();
            const [terrainsRes, assetsRes] = await Promise.all([ fetch('terrains.json'), fetch('assets.json') ]);
            if (!terrainsRes.ok || !assetsRes.ok) throw new Error("Network response was not ok.");
            
            const baseTerrains = await terrainsRes.json();
            const baseAssets = await assetsRes.json();
            
            state.loadCustomAssets(); 
            state.setState({ 
                terrains: { ...baseTerrains, ...state.terrains }, 
                assetManifest: { ...baseAssets, ...state.assetManifest }
            });

            await reloadAssetsAndPatterns();
            
            if (Object.keys(state.project.maps).length === 0) {
                createInitialMap();
            } else {
                state.setActiveMapId(Object.keys(state.project.maps)[0]);
            }

            const activeMap = state.getActiveMap();
            if (!activeMap || activeMap.layers.length === 0) {
                 if (!activeMap) console.warn("No active map found after loading project, creating initial map.");
                 else console.warn("Active map has no layers, creating initial layer.");
                 createInitialMap(); 
            } else {
                 activeLayerId = activeMap.layers[0].id;
            }
            
            setupAllEventListeners();
            populateTerrainSelector();
            populateObjectSelector();
            updateLayerList();
            resizeCanvas();
            saveStateForUndo("Initial State");
            markAllLayersAsDirty();
            requestRender();
            handleToolSwitch('terrain');
            renderLoop();
            console.log("Initialization Complete.");
        } catch (error) {
            console.error("Initialization Failed:", error);
            state.showModal("Initialization Error", `A critical error occurred while loading the application. Please refresh the page.\nError: ${error.message}`);
        }
    }

    initialize();
});

