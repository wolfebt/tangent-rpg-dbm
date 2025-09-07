// Version 6.3 - Added style controls and fixed transfer-to-layer bug
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

    // Toggles the loading state for a button
    function toggleButtonLoading(button, isLoading) {
        const buttonText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');
        isGenerating = isLoading;
        button.disabled = isLoading;
        if (spinner) spinner.classList.toggle('hidden', !isLoading);
        if (button.id === 'ai-generate-btn') buttonText.textContent = isLoading ? 'Generating...' : 'Generate';
        if (button.id === 'ai-update-btn') buttonText.textContent = isLoading ? 'Updating...' : 'Update Image';
    }

    // Constructs the full prompt including style options
    function buildFullPrompt(userPrompt) {
        const drawingStyle = drawingStyleSelect.value;
        const colorStyle = colorStyleSelect.value;
        // Combine styles and user prompt for a more descriptive request
        return `A ${colorStyle} ${drawingStyle} of the following scene: ${userPrompt}`;
    }

    // Handles the initial image generation
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
        currentAiImageBase64 = null; // Clear previous image

        const fullPrompt = buildFullPrompt(userPrompt);
        console.log("Generating with prompt:", fullPrompt);

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
    
    // Handles iterative image updates
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
        const fullPrompt = buildFullPrompt(userPrompt); // Also apply styles to refinement
        console.log("Updating with prompt:", fullPrompt);
        
        try {
            const payload = {
                contents: [{
                    parts: [
                        { text: fullPrompt },
                        { inlineData: { mimeType: "image/png", data: currentAiImageBase64 } }
                    ]
                }],
                generationConfig: {
                    responseModalities: ['IMAGE']
                },
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
                refinePromptInput.value = ""; // Clear prompt after use
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

    // Handles transferring the image to a new map layer
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

        console.log("Transferring image to new layer...");
        state.saveStateForUndo();
        const layerName = `AI Layer - ${new Date().toLocaleTimeString()}`;
        const newLayer = {
            id: `layer_${Date.now()}`,
            name: layerName,
            visible: true,
            objects: [],
            terrainPatches: [],
            backgroundImage: `data:image/png;base64,${currentAiImageBase64}`,
            backgroundImageCacheKey: `ai_bg_${Date.now()}`
        };

        activeMap.layers.unshift(newLayer); 
        
        // Dispatch event to notify other modules to update their state/UI
        document.dispatchEvent(new CustomEvent('mapStateUpdated'));
        state.showToast(`Image transferred to new layer "${layerName}"`, "success");

        // BUG FIX: Force an immediate redraw. Sometimes the event listener can be slow or miss the update.
        // This ensures the canvas reflects the new layer instantly.
        if (window.drawAll) {
            window.drawAll();
        }
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

