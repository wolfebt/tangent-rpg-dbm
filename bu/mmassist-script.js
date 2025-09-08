// Version 6.4 - Fixed transfer-to-layer logic to create a renderable object.
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const aiBottomPanelHeader = document.getElementById('aiBottomPanelHeader');
    const initialPromptInput = document.getElementById('ai-prompt-initial');
    const refinePromptInput = document.getElementById('ai-prompt-refine');
    const drawingStyleSelect = document.getElementById('ai-drawing-style');
    const colorStyleSelect = document.getElementById('ai-color-style');
    const generateBtn = document.getElementById('ai-generate-btn');
    const updateBtn = document.getElementById('ai-update-btn');
    const transferBtn = document.getElementById('ai-transfer-btn');
    const renderArea = document.getElementById('ai-render-area');
    const imageOutput = document.getElementById('ai-image-output');
    const placeholderText = renderArea.querySelector('span');

    // --- State ---
    let currentAiImageBase64 = null;
    let isGenerating = false;

    // --- Core AI Functions ---

    function toggleButtonLoading(button, isLoading) {
        const buttonText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');
        isGenerating = isLoading;
        button.disabled = isLoading;
        
        if (buttonText) buttonText.classList.toggle('hidden', isLoading);
        if (spinner) spinner.classList.toggle('hidden', !isLoading);
    }

    function buildFullPrompt(userPrompt) {
        const drawingStyle = drawingStyleSelect.value;
        const colorStyle = colorStyleSelect.value;
        return `A ${colorStyle} ${drawingStyle} of the following scene, suitable for a tabletop RPG map: ${userPrompt}`;
    }

    async function handleInitialGeneration() {
        if (isGenerating) return;
        const userPrompt = initialPromptInput.value;
        if (!userPrompt) {
            state.showToast("Please enter a prompt for the initial generation.", "error");
            return;
        }
        if (!state.apiKey) {
            state.showToast("Please set your API Key in the settings menu first.", "error");
            return;
        }

        toggleButtonLoading(generateBtn, true);
        currentAiImageBase64 = null;

        const fullPrompt = buildFullPrompt(userPrompt);

        try {
            const payload = { instances: [{ prompt: fullPrompt }], parameters: { "sampleCount": 1 } };
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
                currentAiImageBase64 = result.predictions[0].bytesBase64Encoded;
                imageOutput.src = `data:image/png;base64,${currentAiImageBase64}`;
                placeholderText.classList.add('hidden');
                imageOutput.classList.remove('hidden');
                updateBtn.disabled = false;
                transferBtn.disabled = false;
                state.showToast("Image generated successfully!", "success");
            } else {
                throw new Error("No image data found in API response.");
            }
        } catch (error) {
            console.error("AI Initial Generation Error:", error);
            state.showToast(`An error occurred: ${error.message}`, "error");
            placeholderText.classList.remove('hidden');
            imageOutput.classList.add('hidden');
        } finally {
            toggleButtonLoading(generateBtn, false);
        }
    }
    
    async function handleIterativeUpdate() {
        if (isGenerating || !currentAiImageBase64) return;
        const userPrompt = refinePromptInput.value;
        if (!userPrompt) {
            state.showToast("Please enter a prompt to refine the image.", "error");
            return;
        }
        if (!state.apiKey) {
            state.showToast("Please set your API Key in the settings menu first.", "error");
            return;
        }

        toggleButtonLoading(updateBtn, true);
        const fullPrompt = buildFullPrompt(userPrompt); 
        
        try {
            const payload = {
                contents: [{
                    parts: [
                        { text: fullPrompt },
                        { inlineData: { mimeType: "image/png", data: currentAiImageBase64 } }
                    ]
                }],
                generationConfig: { responseModalities: ['IMAGE'] },
            };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${state.apiKey}`;

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
            const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
            
            if (base64Data) {
                currentAiImageBase64 = base64Data;
                imageOutput.src = `data:image/png;base64,${currentAiImageBase64}`;
                state.showToast("Image updated successfully!", "success");
                refinePromptInput.value = "";
            } else {
                throw new Error("No updated image data found in API response.");
            }
        } catch (error) {
            console.error("AI Iterative Update Error:", error);
            state.showToast(`An error occurred during update: ${error.message}`, "error");
        } finally {
            toggleButtonLoading(updateBtn, false);
        }
    }

    function handleTransferToLayer() {
        if (!currentAiImageBase64) {
            state.showToast("No image to transfer.", "error");
            return;
        }
        const activeMap = state.getActiveMap();
        if (!activeMap) {
            state.showToast("Please select or create a map first.", "error");
            return;
        }

        // Create a new asset in the manifest from the generated image
        const assetId = `ai_bg_${Date.now()}`;
        const assetData = {
            [assetId]: {
                name: `AI BG - ${new Date().toLocaleTimeString()}`,
                src: `data:image/png;base64,${currentAiImageBase64}`,
                tags: ['ai-generated']
            }
        };
        state.addNewAsset(assetData);
        
        // Create an image object to place on the new layer
        const mapWidthPixels = activeMap.width * 50;
        const mapHeightPixels = activeMap.height * 50;
        const newImageObject = {
             id: `obj_${Date.now()}`,
             assetId: assetId,
             x: mapWidthPixels / 2, // Center it
             y: mapHeightPixels / 2,
             rotation: 0,
             scale: 1, 
             isGmOnly: false
        };
        
        // Create a new layer and add the image object to it
        const layerName = `AI Layer - ${new Date().toLocaleTimeString()}`;
        const newLayer = {
            id: `layer_${Date.now()}`,
            name: layerName,
            visible: true,
            objects: [newImageObject],
            terrainPatches: []
        };

        // Add the new layer to the map and trigger updates
        activeMap.layers.unshift(newLayer); 
        document.dispatchEvent(new CustomEvent('assetLibraryUpdated')); // To load the new image into cache
        document.dispatchEvent(new CustomEvent('mapStateUpdated'));
        state.showToast(`Image transferred to new layer "${layerName}"`, "success");
    }

    // --- Event Listeners Setup ---
    function addAiEventListeners() {
        aiBottomPanelHeader.addEventListener('click', () => {
            document.getElementById('aiBottomPanel').classList.toggle('closed');
        });
        
        generateBtn.addEventListener('click', handleInitialGeneration);
        updateBtn.addEventListener('click', handleIterativeUpdate);
        transferBtn.addEventListener('click', handleTransferToLayer);
    }

    addAiEventListeners();
});
