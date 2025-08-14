// Version 4.35 - Module Import Fix

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
const exportOutput = document.getElementById('asset-export-output');
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
    
    // Composite the main and drawing layers
    tempCtx.drawImage(mainCanvas, 0, 0);
    tempCtx.drawImage(drawCanvas, 0, 0);

    // Clear preview and draw tiled pattern
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
    
    // Edge wrapping for terrain mode
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
    const userPrompt = promptInput.value;
    if (!userPrompt) {
        alert("Please enter a prompt.");
        return;
    }
    
    loadingOverlay.classList.remove('hidden');
    generateBtn.disabled = true;

    try {
        const payload = { instances: [{ prompt: userPrompt }], parameters: { "sampleCount": 1} };
        const apiKey = ""; // API key will be provided by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`API Error: ${error.error?.message || response.statusText}`);
        }

        const result = await response.json();
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            const base64Data = result.predictions[0].bytesBase64Encoded;
            const imageUrl = `data:image/png;base64,${base64Data}`;
            
            const img = new Image();
            img.onload = () => {
                clearAllCanvases();
                mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
                updateTilingPreview();
            };
            img.src = imageUrl;
        } else {
            throw new Error("No image data found in API response.");
        }

    } catch (error) {
        console.error("AI Generation Error:", error);
        alert(`An error occurred: ${error.message}`);
    } finally {
        loadingOverlay.classList.add('hidden');
        generateBtn.disabled = false;
    }
}

function generateExportCode() {
    const name = assetNameInput.value.trim();
    if (!name) {
        alert("Please provide a name for your asset.");
        return;
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = mainCanvas.width;
    finalCanvas.height = mainCanvas.height;
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(mainCanvas, 0, 0);
    finalCtx.drawImage(drawCanvas, 0, 0);
    
    const dataUri = finalCanvas.toDataURL('image/png');
    const assetId = name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const tags = assetTagsInput.value.split(',').map(t => `"${t.trim()}"`).join(', ');

    let jsonSnippet = '';

    if (assetTypeSelect.value === 'object') {
        jsonSnippet = `"${assetId}": {\n  "name": "${name}",\n  "src": "${dataUri}",\n  "tags": [${tags}]\n}`;
    } else { // Terrain
        const patternId = `pattern-${assetId}`;
        jsonSnippet = `"${assetId}": {\n  "name": "${name}",\n  "color": "#ffffff",\n  "pattern": "${patternId}",\n  "tags": [${tags}]\n}`;
        
        const svgPattern = `<pattern id="${patternId}" width="${mainCanvas.width}" height="${mainCanvas.height}" patternUnits="userSpaceOnUse">\n  <image href="${dataUri}" width="${mainCanvas.width}" height="${mainCanvas.height}"/>\n</pattern>`;
        
        jsonSnippet += `\n\n<!-- Add this to map-maker.html's <defs> section -->\n${svgPattern}`;
    }
    
    exportOutput.value = jsonSnippet;
    navigator.clipboard.writeText(jsonSnippet).then(() => {
        alert("Export code copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert("Could not copy to clipboard. Please copy manually from the text box.");
    });
}

// --- EVENT LISTENERS ---
assetTypeSelect.addEventListener('change', (e) => switchMode(e.target.value));

generateBtn.addEventListener('click', generateAIAsset);
exportBtn.addEventListener('click', generateExportCode);

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
switchMode('object'); // Default to object mode
