// Version 14.0 - Improved AI prompt engineering and saving logic.
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
    let isGeneratingAsset = false;

    // --- FUNCTIONS ---

    function switchMode(mode) {
        previewPanel.classList.toggle('hidden', mode !== 'terrain');
        clearAllCanvases();
        assetNameInput.value = '';
        assetTagsInput.value = '';
        promptInput.value = '';
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
        if (pattern) {
            previewCtx.fillStyle = pattern;
            previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        }
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const rect = drawCanvas.getBoundingClientRect();
        const currentPos = {
            x: (e.clientX - rect.left) * (drawCanvas.width / rect.width),
            y: (e.clientY - rect.top) * (drawCanvas.height / rect.height)
        };

        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
        drawCtx.lineWidth = brushSize;
        
        drawCtx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
        if (currentTool !== 'eraser') {
            drawCtx.strokeStyle = brushColor;
        }
        
        drawCtx.beginPath();
        drawCtx.moveTo(lastPos.x, lastPos.y);
        drawCtx.lineTo(currentPos.x, currentPos.y);
        drawCtx.stroke();
        
        lastPos = currentPos;
    }
    
    function onDrawEnd() {
        if (!isDrawing) return;
        isDrawing = false;
        
        if (assetTypeSelect.value === 'terrain') {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = drawCanvas.width; tempCanvas.height = drawCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    tempCtx.drawImage(drawCanvas, x * drawCanvas.width, y * drawCanvas.height);
                }
            }
            drawCtx.globalCompositeOperation = 'source-over'; // Ensure we're drawing normally
            drawCtx.clearRect(0,0,drawCanvas.width, drawCanvas.height);
            drawCtx.drawImage(tempCanvas, 0, 0);
        }

        updateTilingPreview();
    }


    async function generateAIAsset() {
        if (isGeneratingAsset) return;
        if (!state.apiKey) {
            state.showModal("API Key Required", "Please set your generative AI API Key in the settings menu first.", () => document.getElementById('settingsBtn').click());
            return;
        }
        const userPrompt = promptInput.value;
        if (!userPrompt) { state.showToast("Please enter a prompt.", "error"); return; }

        isGeneratingAsset = true;
        loadingOverlay.classList.remove('hidden');
        clearAllCanvases();

        const type = assetTypeSelect.value;
        const styleGuidance = type === 'terrain'
            ? "seamless tileable texture, top-down perspective, 4k detail"
            : "isolated on a transparent background, clean vector icon style, suitable for a fantasy map";

        const fullPrompt = `${userPrompt}, ${styleGuidance}`;

        try {
            const payload = { instances: [{ prompt: fullPrompt }], parameters: { "sampleCount": 1 } };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${state.apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

            const result = await response.json();
            if (result.predictions && result.predictions[0].bytesBase64Encoded) {
                const img = new Image();
                img.onload = () => {
                    mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
                    updateTilingPreview();
                    state.showToast("Asset generated!", "success");
                };
                img.src = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
            } else { throw new Error("No image data in API response."); }
        } catch (error) {
            console.error("Asset Generation Error:", error);
            state.showToast(`Error: ${error.message}`, "error");
        } finally {
            isGeneratingAsset = false;
            loadingOverlay.classList.add('hidden');
        }
    }

    function saveAssetToLibrary() {
        const name = assetNameInput.value.trim();
        if (!name) { state.showToast("Please provide a name for your asset.", "error"); assetNameInput.focus(); return; }

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = mainCanvas.width; finalCanvas.height = mainCanvas.height;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(mainCanvas, 0, 0);
        finalCtx.drawImage(drawCanvas, 0, 0);
        
        const dataUri = finalCanvas.toDataURL('image/png');
        const assetId = `custom_${name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;
        const tags = assetTagsInput.value.split(',').map(t => t.trim()).filter(t => t);
        const type = assetTypeSelect.value;

        if (type === 'object') {
            const newAsset = { [assetId]: { name, src: dataUri, tags } };
            state.addNewAsset(newAsset);
        } else if (type === 'terrain') {
            const newTerrain = { [assetId]: { name, src: dataUri, tags, color: '#CCCCCC' }};
            let customTerrains = JSON.parse(localStorage.getItem('mapMakerCustomTerrains')) || {};
            Object.assign(customTerrains, newTerrain);
            localStorage.setItem('mapMakerCustomTerrains', JSON.stringify(customTerrains));
            Object.assign(state.terrains, newTerrain);
        }
        
        state.showToast(`Asset "${name}" saved to your library!`, 'success');
        document.dispatchEvent(new CustomEvent('assetLibraryUpdated'));
        
        assetEditorOverlay.classList.add('hidden');
        switchMode('object');
    }

    // --- EVENT LISTENERS ---
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
    brushSizeSlider.addEventListener('input', (e) => { brushSize = parseInt(e.target.value); brushSizeValue.textContent = brushSize; });
    colorPicker.addEventListener('input', (e) => brushColor = e.target.value);
    drawCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = drawCanvas.getBoundingClientRect();
        lastPos = { x: (e.clientX - rect.left) * (drawCanvas.width / rect.width), y: (e.clientY - rect.top) * (drawCanvas.height / rect.height) };
    });
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', onDrawEnd);
    drawCanvas.addEventListener('mouseleave', onDrawEnd);
    closeBtn.addEventListener('click', () => { assetEditorOverlay.classList.add('hidden'); });
    
    switchMode('object'); // Initial state
});

