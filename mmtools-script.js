// Version 13.7 - Integrated asset editor to resolve circular dependency
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const canvas = document.getElementById('mapCanvas');
// ... existing code ... -->
    const assetEditorOverlay = document.getElementById('asset-editor-overlay');
    const assetContextMenu = document.getElementById('asset-context-menu');

    // --- Asset Editor Elements ---
    const assetTypeSelect = document.getElementById('asset-type-select');
    const previewPanel = document.getElementById('asset-preview-panel');
    const mainAssetCanvas = document.getElementById('asset-canvas-main');
    const drawAssetCanvas = document.getElementById('asset-canvas-draw');
    const previewAssetCanvas = document.getElementById('asset-preview-canvas');
    const generateAssetBtn = document.getElementById('asset-generate-btn');
    const promptAssetInput = document.getElementById('asset-prompt');
    const loadingAssetOverlay = document.getElementById('loading-overlay');
    const exportAssetBtn = document.getElementById('asset-export-btn');
    const assetNameInput = document.getElementById('asset-name');
    const assetTagsInput = document.getElementById('asset-tags');
    const toolAssetBtns = document.querySelectorAll('.asset-tool');
    const colorAssetPicker = document.getElementById('asset-color-picker');
    const brushSizeAssetSlider = document.getElementById('asset-brush-size');
    const brushSizeAssetValue = document.getElementById('asset-brush-size-value');
    const closeAssetBtn = document.getElementById('asset-editor-close-btn');


    // --- Local State ---
    let view = { zoom: 1, offsetX: 0, offsetY: 0 };
    let isPanning = false;
// ... existing code ... -->
    let redoStack = [];
    let visibilityPolygons = [];
    const squareSize = 50; 

    // --- Asset Editor State ---
    let mainAssetCtx = mainAssetCanvas.getContext('2d');
    let drawAssetCtx = drawAssetCanvas.getContext('2d');
    let previewAssetCtx = previewAssetCanvas.getContext('2d');
    let currentAssetTool = 'pencil';
    let brushAssetSize = 5;
    let brushAssetColor = '#FFFFFF';
    let isDrawingAsset = false;
    let lastAssetPos = { x: 0, y: 0 };

    // --- Core Drawing & Rendering ---

    function resizeCanvas() {
// ... existing code ... -->
        drawAll();
        updateUndoRedoButtons();
    }

    function applyTool(coords) {
        const activeMap = state.getActiveMap();
// ... existing code ... -->
                notes: ""
            };
            activeMap.labels.push(newLabel);
        }
        drawAll();
    }
    
    // --- Asset Editor Functions ---
    function switchAssetMode(mode) {
        previewPanel.classList.toggle('hidden', mode !== 'terrain');
        clearAllAssetCanvases();
    }

    function clearAllAssetCanvases() {
        mainAssetCtx.clearRect(0, 0, mainAssetCanvas.width, mainAssetCanvas.height);
        drawAssetCtx.clearRect(0, 0, drawAssetCanvas.width, drawAssetCanvas.height);
        updateAssetTilingPreview();
    }

    function updateAssetTilingPreview() {
        if (assetTypeSelect.value !== 'terrain') return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = mainAssetCanvas.width;
        tempCanvas.height = mainAssetCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(mainAssetCanvas, 0, 0);
        tempCtx.drawImage(drawAssetCanvas, 0, 0);

        previewAssetCtx.clearRect(0, 0, previewAssetCanvas.width, previewAssetCanvas.height);
        const pattern = previewAssetCtx.createPattern(tempCanvas, 'repeat');
        previewAssetCtx.fillStyle = pattern;
        previewAssetCtx.fillRect(0, 0, previewAssetCanvas.width, previewAssetCanvas.height);
    }

    function drawAsset(e) {
        if (!isDrawingAsset) return;
        
        const rect = drawAssetCanvas.getBoundingClientRect();
        const currentPos = {
            x: (e.clientX - rect.left) * (drawAssetCanvas.width / rect.width),
            y: (e.clientY - rect.top) * (drawAssetCanvas.height / rect.height)
        };

        drawAssetCtx.beginPath();
        drawAssetCtx.moveTo(lastAssetPos.x, lastAssetPos.y);
        drawAssetCtx.lineTo(currentPos.x, currentPos.y);
        
        drawAssetCtx.strokeStyle = brushAssetColor;
        drawAssetCtx.lineWidth = brushAssetSize;
        drawAssetCtx.lineCap = 'round';
        drawAssetCtx.lineJoin = 'round';
        
        if (currentAssetTool === 'eraser') {
            drawAssetCtx.globalCompositeOperation = 'destination-out';
        } else {
            drawAssetCtx.globalCompositeOperation = 'source-over';
        }
        
        drawAssetCtx.stroke();
        
        if (assetTypeSelect.value === 'terrain') {
            const wrapX = currentPos.x < brushAssetSize ? drawAssetCanvas.width : (currentPos.x > drawAssetCanvas.width - brushAssetSize ? -drawAssetCanvas.width : 0);
            const wrapY = currentPos.y < brushAssetSize ? drawAssetCanvas.height : (currentPos.y > drawAssetCanvas.height - brushAssetSize ? -drawAssetCanvas.height : 0);

            if (wrapX !== 0 || wrapY !== 0) {
                drawAssetCtx.moveTo(lastAssetPos.x + wrapX, lastAssetPos.y + wrapY);
                drawAssetCtx.lineTo(currentPos.x + wrapX, currentPos.y + wrapY);
                drawAssetCtx.stroke();
            }
        }

        lastAssetPos = currentPos;
        updateAssetTilingPreview();
    }

    async function generateAIAsset() {
        const userPrompt = promptAssetInput.value;
        if (!userPrompt) {
            state.showToast("Please enter a prompt.", "error");
            return;
        }
        if (!state.apiKey) {
            state.showToast("Please set your API Key in the settings menu first.", "error");
            return;
        }
        
        loadingAssetOverlay.classList.remove('hidden');
        generateAssetBtn.disabled = true;

        try {
            const payload = { instances: [{ prompt: userPrompt }], parameters: { "sampleCount": 1} };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${state.apiKey}`;
            
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
                    clearAllAssetCanvases();
                    mainAssetCtx.drawImage(img, 0, 0, mainAssetCanvas.width, mainAssetCanvas.height);
                    updateAssetTilingPreview();
                };
                img.src = imageUrl;
            } else {
                throw new Error("No image data found in API response.");
            }

        } catch (error) {
            console.error("AI Generation Error:", error);
            state.showToast(`An error occurred: ${error.message}`, "error");
        } finally {
            loadingAssetOverlay.classList.add('hidden');
            generateAssetBtn.disabled = false;
        }
    }

    function saveAssetToLibrary() {
        const name = assetNameInput.value.trim();
        if (!name) {
            state.showToast("Please provide a name for your asset.", "error");
            return;
        }

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = mainAssetCanvas.width;
        finalCanvas.height = mainAssetCanvas.height;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(mainAssetCanvas, 0, 0);
        finalCtx.drawImage(drawAssetCanvas, 0, 0);
        
        const dataUri = finalCanvas.toDataURL('image/png');
        const assetId = `custom_${name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;
        const tags = assetTagsInput.value.split(',').map(t => t.trim()).filter(t => t);

        let newAssetObject = {};

        if (assetTypeSelect.value === 'object') {
            newAssetObject = {
                [assetId]: {
                    name: name,
                    src: dataUri,
                    tags: tags
                }
            };
        } else { 
            const patternId = `pattern-${assetId}`;
            newAssetObject = {
                [assetId]: {
                    name: name,
                    color: "#ffffff",
                    pattern: patternId,
                    tags: tags,
                    isCustom: true,
                    src: dataUri
                }
            };
        }
        
        state.addNewAsset(newAssetObject);
        state.showToast(`Asset "${name}" saved to your library!`, 'success');
        document.dispatchEvent(new CustomEvent('assetLibraryUpdated'));
        assetEditorOverlay.classList.add('hidden');
    }

    async function initialize() {
        try {
            // FIX: Load key and data assets first
// ... existing code ... -->
            });
        });
    }
    
    function populateSelectors() {
// ... existing code ... -->
        toolSelectBtn.addEventListener('click', () => switchTool('select'));
        toolTokenBtn.addEventListener('click', () => switchTool('token'));
        toolTextBtn.addEventListener('click', () => switchTool('text'));
        toolFogBtn.addEventListener('click', () => switchTool('fog'));

        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                content.classList.toggle('hidden');
                header.classList.toggle('collapsed');
            });
        });

        // Asset Editor Listeners
        assetTypeSelect.addEventListener('change', (e) => switchAssetMode(e.target.value));
        generateAssetBtn.addEventListener('click', generateAIAsset);
        exportAssetBtn.addEventListener('click', saveAssetToLibrary);
        toolAssetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolAssetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentAssetTool = btn.dataset.tool;
            });
        });
        brushSizeAssetSlider.addEventListener('input', (e) => {
            brushAssetSize = parseInt(e.target.value);
            brushSizeAssetValue.textContent = brushAssetSize;
        });
        colorAssetPicker.addEventListener('input', (e) => brushAssetColor = e.target.value);
        drawAssetCanvas.addEventListener('mousedown', (e) => {
            isDrawingAsset = true;
            const rect = drawAssetCanvas.getBoundingClientRect();
            lastAssetPos = {
                x: (e.clientX - rect.left) * (drawAssetCanvas.width / rect.width),
                y: (e.clientY - rect.top) * (drawAssetCanvas.height / rect.height)
            };
        });
        drawAssetCanvas.addEventListener('mousemove', drawAsset);
        drawAssetCanvas.addEventListener('mouseup', () => { isDrawingAsset = false; updateAssetTilingPreview(); });
        drawAssetCanvas.addEventListener('mouseleave', () => { isDrawingAsset = false; });
        closeAssetBtn.addEventListener('click', () => {
            assetEditorOverlay.classList.add('hidden');
        });
        switchAssetMode('object');
    }
    
    function populateSelectors() {
        if(terrainSelector) {
// ... existing code ... -->

