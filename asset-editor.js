// Version 6.2 - Phase 3.2: Asset Editor Completion
import * as state from './state.js';
import { callImageGenerationAI } from './mmassist-script.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const assetEditorOverlay = document.getElementById('asset-editor-overlay');
    if (!assetEditorOverlay) return; // Stop if the editor isn't on this page

    const assetCanvasMain = document.getElementById('asset-canvas-main');
    const assetCanvasDraw = document.getElementById('asset-canvas-draw');
    const assetCtxMain = assetCanvasMain.getContext('2d');
    const assetCtxDraw = assetCanvasDraw.getContext('2d');
    const assetTypeSelect = document.getElementById('asset-type-select');
    const assetPreviewPanel = document.getElementById('asset-preview-panel');
    const assetPreviewCanvas = document.getElementById('asset-preview-canvas');
    const assetPreviewCtx = assetPreviewCanvas.getContext('2d');
    const toolPalette = document.querySelector('.asset-tool-palette');
    const colorPicker = document.getElementById('asset-color-picker');
    const brushSizeSlider = document.getElementById('asset-brush-size');
    const brushSizeValue = document.getElementById('asset-brush-size-value');
    const assetCopyCodeBtn = document.getElementById('asset-copy-code-btn');
    const assetPromptInput = document.getElementById('asset-prompt');
    const assetLoadingOverlay = document.getElementById('loading-overlay');
    const assetGenerateBtn = document.getElementById('asset-generate-btn');
    const assetExportBtn = document.getElementById('asset-export-btn');
    const assetNameInput = document.getElementById('asset-name');
    const assetTagsInput = document.getElementById('asset-tags');
    const assetEditorCloseBtn = document.getElementById('asset-editor-close-btn');

    // --- Editor State ---
    let isDrawing = false;
    let currentTool = 'pencil'; // 'pencil' or 'eraser'
    let lastPos = { x: 0, y: 0 };

    // --- Functions ---

    /**
     * Updates the tiling preview canvas.
     */
    function updatePreview() {
        if (assetTypeSelect.value !== 'terrain') {
            assetPreviewPanel.classList.add('hidden');
            return;
        }
        assetPreviewPanel.classList.remove('hidden');

        // Create a temporary canvas with the combined main and drawing layers
        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = assetCanvasMain.width;
        combinedCanvas.height = assetCanvasMain.height;
        const combinedCtx = combinedCanvas.getContext('2d');
        combinedCtx.drawImage(assetCanvasMain, 0, 0);
        combinedCtx.drawImage(assetCanvasDraw, 0, 0);

        // Create a pattern and fill the preview canvas
        const pattern = assetPreviewCtx.createPattern(combinedCanvas, 'repeat');
        assetPreviewCtx.fillStyle = pattern;
        assetPreviewCtx.fillRect(0, 0, assetPreviewCanvas.width, assetPreviewCanvas.height);
    }

    /**
     * Gets the mouse position on the asset canvas.
     * @param {MouseEvent} e The mouse event.
     * @returns {{x: number, y: number}} The coordinates on the canvas.
     */
    function getMousePos(e) {
        const rect = assetCanvasDraw.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Draws a line on the drawing canvas.
     * @param {number} x1 Start X.
     * @param {number} y1 Start Y.
     * @param {number} x2 End X.
     * @param {number} y2 End Y.
     */
    function drawLine(x1, y1, x2, y2) {
        assetCtxDraw.beginPath();
        assetCtxDraw.strokeStyle = colorPicker.value;
        assetCtxDraw.lineWidth = brushSizeSlider.value;
        assetCtxDraw.lineCap = 'round';
        assetCtxDraw.lineJoin = 'round';

        if (currentTool === 'eraser') {
            assetCtxDraw.globalCompositeOperation = 'destination-out';
        } else {
            assetCtxDraw.globalCompositeOperation = 'source-over';
        }

        assetCtxDraw.moveTo(x1, y1);
        assetCtxDraw.lineTo(x2, y2);
        assetCtxDraw.stroke();
        assetCtxDraw.closePath();
    }

    async function handleAssetAIGeneration() {
        const prompt = assetPromptInput.value;
        if (!prompt) {
            state.showModal("Please enter a prompt for the asset.");
            return;
        }
        
        // Refined prompt for better icon/asset generation
        const fullPrompt = `An icon of ${prompt}, simple, 2d game asset, clean lines, vector style, on a transparent background`;
        
        assetLoadingOverlay.classList.remove('hidden');
        const generatedImageBase64 = await callImageGenerationAI(fullPrompt); 
        assetLoadingOverlay.classList.add('hidden');

        if (generatedImageBase64) {
            const img = new Image();
            img.onload = () => {
                assetCtxMain.clearRect(0, 0, 512, 512);
                assetCtxMain.drawImage(img, 0, 0, 512, 512);
                updatePreview();
            };
            img.src = `data:image/png;base64,${generatedImageBase64}`;
        }
    }
    
    function closeEditor() {
        assetEditorOverlay.classList.add('hidden');
        // Clear canvases and inputs for next time
        assetCtxMain.clearRect(0, 0, assetCanvasMain.width, assetCanvasMain.height);
        assetCtxDraw.clearRect(0, 0, assetCanvasDraw.width, assetCanvasDraw.height);
        assetPromptInput.value = '';
        assetNameInput.value = '';
        assetTagsInput.value = '';
    }

    // --- Event Listeners ---

    assetTypeSelect.addEventListener('change', updatePreview);
    assetGenerateBtn.addEventListener('click', handleAssetAIGeneration);
    assetEditorCloseBtn.addEventListener('click', closeEditor);

    assetExportBtn.addEventListener('click', () => {
        const name = assetNameInput.value.trim();
        if (!name) {
            state.showModal("Please provide a name for the asset.");
            return;
        }

        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = assetCanvasMain.width;
        combinedCanvas.height = assetCanvasMain.height;
        const combinedCtx = combinedCanvas.getContext('2d');
        combinedCtx.drawImage(assetCanvasMain, 0, 0);
        combinedCtx.drawImage(assetCanvasDraw, 0, 0);
        const src = combinedCanvas.toDataURL('image/png');

        const assetId = `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        const tags = assetTagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean);
        
        const newAsset = {
            [assetId]: {
                name: name,
                src: src,
                tags: tags,
                type: assetTypeSelect.value
            }
        };

        state.addNewAsset(newAsset);
        
        document.dispatchEvent(new CustomEvent('assetCreated', { detail: { assetId } }));
        
        state.showToast(`Asset "${name}" saved to your library!`, 'info');
        closeEditor();
    });

    toolPalette.addEventListener('click', (e) => {
        const button = e.target.closest('.asset-tool');
        if (button && button.dataset.tool) {
            currentTool = button.dataset.tool;
            document.querySelectorAll('.asset-tool-palette .asset-tool').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        }
    });

    brushSizeSlider.addEventListener('input', () => {
        brushSizeValue.textContent = brushSizeSlider.value;
    });

    assetCanvasDraw.addEventListener('mousedown', (e) => {
        isDrawing = true;
        lastPos = getMousePos(e);
    });

    assetCanvasDraw.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const currentPos = getMousePos(e);
        drawLine(lastPos.x, lastPos.y, currentPos.x, currentPos.y);
        lastPos = currentPos;
    });

    assetCanvasDraw.addEventListener('mouseup', () => {
        if (!isDrawing) return;
        isDrawing = false;
        // Merge the drawing layer onto the main layer
        assetCtxMain.drawImage(assetCanvasDraw, 0, 0);
        assetCtxDraw.clearRect(0, 0, assetCanvasDraw.width, assetCanvasDraw.height);
        updatePreview();
    });

    assetCanvasDraw.addEventListener('mouseleave', () => {
        if (!isDrawing) return;
        isDrawing = false;
        assetCtxMain.drawImage(assetCanvasDraw, 0, 0);
        assetCtxDraw.clearRect(0, 0, assetCanvasDraw.width, assetCanvasDraw.height);
        updatePreview();
    });

    assetCopyCodeBtn.addEventListener('click', () => {
        const output = document.getElementById('asset-export-output');
        if (output.value) {
            output.select();
            document.execCommand('copy');
            state.showToast("Export code copied to clipboard!", "info");
        } else {
            state.showToast("Generate export code first.", "warning");
        }
    });

});
