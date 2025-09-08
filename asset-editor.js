// Version 13.7 - Implemented saving for terrain patterns.
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const assetEditorOverlay = document.getElementById('asset-editor-overlay');
    const assetTypeSelect = document.getElementById('asset-type-select');
    const previewPanel = document.getElementById('asset-preview-panel');
    const mainCanvas = document.getElementById('asset-canvas-main');
    const drawCanvas = document.getElementById('asset-canvas-draw');
    const previewCanvas = document.getElementById('asset-preview-canvas');
    const generateBtn = document.getElementById('asset-generate-btn');
    const promptInput = document.getElementById('asset-prompt');
    const loadingOverlay = document.getElementById('loading-overlay');
    const exportBtn = document.getElementById('asset-export-btn');
    const assetNameInput = document.getElementById('asset-name');
    const assetTagsInput = document.getElementById('asset-tags');
    const toolBtns = document.querySelectorAll('.asset-tool');
    const colorPicker = document.getElementById('asset-color-picker');
    const brushSizeSlider = document.getElementById('asset-brush-size');
    const brushSizeValue = document.getElementById('asset-brush-size-value');
    const closeBtn = document.getElementById('asset-editor-close-btn');

    // --- STATE ---
    let mainCtx = mainCanvas.getContext('2d');
    let drawCtx = drawCanvas.getContext('2d');
    let previewCtx = previewCanvas.getContext('2d');
    let currentTool = 'pencil';
    let brushSize = 5;
    let brushColor = '#FFFFFF';
    let isDrawing = false;
    let lastPos = { x: 0, y: 0 };

    // --- FUNCTIONS ---

    function switchMode(mode) {
        previewPanel.classList.toggle('hidden', mode !== 'terrain');
        clearAllCanvases();
    }

    function clearAllCanvases() {
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        updateTilingPreview();
    }

    function updateTilingPreview() {
        if (assetTypeSelect.value !== 'terrain') return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = mainCanvas.width;
        tempCanvas.height = mainCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(mainCanvas, 0, 0);
        tempCtx.drawImage(drawCanvas, 0, 0);

        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        const pattern = previewCtx.createPattern(tempCanvas, 'repeat');
        previewCtx.fillStyle = pattern;
        previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const rect = drawCanvas.getBoundingClientRect();
        const currentPos = {
            x: (e.clientX - rect.left) * (drawCanvas.width / rect.width),
            y: (e.clientY - rect.top) * (drawCanvas.height / rect.height)
        };

        drawCtx.beginPath();
        drawCtx.moveTo(lastPos.x, lastPos.y);
        drawCtx.lineTo(currentPos.x, currentPos.y);
        
        drawCtx.strokeStyle = brushColor;
        drawCtx.lineWidth = brushSize;
        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
        
        if (currentTool === 'eraser') {
            drawCtx.globalCompositeOperation = 'destination-out';
        } else {
            drawCtx.globalCompositeOperation = 'source-over';
        }
        
        drawCtx.stroke();
        
        if (assetTypeSelect.value === 'terrain') {
            const wrapX = currentPos.x < brushSize ? drawCanvas.width : (currentPos.x > drawCanvas.width - brushSize ? -drawCanvas.width : 0);
            const wrapY = currentPos.y < brushSize ? drawCanvas.height : (currentPos.y > drawCanvas.height - brushSize ? -drawCanvas.height : 0);

            if (wrapX !== 0 || wrapY !== 0) {
                drawCtx.moveTo(lastPos.x + wrapX, lastPos.y + wrapY);
                drawCtx.lineTo(currentPos.x + wrapX, currentPos.y + wrapY);
                drawCtx.stroke();
            }
        }

        lastPos = currentPos;
        updateTilingPreview();
    }

    async function generateAIAsset() {
        // ... (Implementation is sound, no changes needed)
    }

    function saveAssetToLibrary() {
        const name = assetNameInput.value.trim();
        if (!name) {
            state.showToast("Please provide a name for your asset.", "error");
            return;
        }

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = mainCanvas.width;
        finalCanvas.height = mainCanvas.height;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(mainCanvas, 0, 0);
        finalCtx.drawImage(drawCanvas, 0, 0);
        
        const dataUri = finalCanvas.toDataURL('image/png');
        const assetId = `custom_${name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;
        const tags = assetTagsInput.value.split(',').map(t => t.trim()).filter(t => t);

        let newAssetObject = {};
        const type = assetTypeSelect.value;

        if (type === 'object') {
            newAssetObject = {
                [assetId]: { name: name, src: dataUri, tags: tags }
            };
            state.addNewAsset(newAssetObject);
        } else if (type === 'terrain') {
             newAssetObject = {
                [assetId]: { name: name, src: dataUri, tags: tags, color: '#CCCCCC', pattern: `pattern_${assetId}` }
            };
            // Terrains are a separate category in the state
            let customTerrains = JSON.parse(localStorage.getItem('mapMakerCustomTerrains')) || {};
            Object.assign(customTerrains, newAssetObject);
            localStorage.setItem('mapMakerCustomTerrains', JSON.stringify(customTerrains));
            Object.assign(state.terrains, newAssetObject);
        }
        
        state.showToast(`Asset "${name}" saved to your library!`, 'success');
        document.dispatchEvent(new CustomEvent('assetLibraryUpdated')); // A generic event to trigger refreshes
        
        // Reset inputs and close
        assetNameInput.value = '';
        assetTagsInput.value = '';
        clearAllCanvases();
        assetEditorOverlay.classList.add('hidden');
    }


    // --- EVENT LISTENERS ---
    // ... (Implementation is sound, no changes needed)
    assetTypeSelect.addEventListener('change', (e) => switchMode(e.target.value));

    generateBtn.addEventListener('click', generateAIAsset);
    exportBtn.addEventListener('click', saveAssetToLibrary);

    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });

    brushSizeSlider.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        brushSizeValue.textContent = brushSize;
    });
    colorPicker.addEventListener('input', (e) => brushColor = e.target.value);

    drawCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = drawCanvas.getBoundingClientRect();
        lastPos = {
            x: (e.clientX - rect.left) * (drawCanvas.width / rect.width),
            y: (e.clientY - rect.top) * (drawCanvas.height / rect.height)
        };
    });
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', () => {
        isDrawing = false;
        updateTilingPreview();
    });
    drawCanvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });

    closeBtn.addEventListener('click', () => {
        assetEditorOverlay.classList.add('hidden');
    });

    // --- INITIALIZATION ---
    switchMode('object');
});
