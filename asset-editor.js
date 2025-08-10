// Version 6.1 - Phase 2.2: Asset Editor Activation
import * as state from './state.js';

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

    // --- Event Listeners ---

    assetTypeSelect.addEventListener('change', updatePreview);

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
        updatePreview();
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

});
