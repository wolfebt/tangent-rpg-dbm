// Version 8.0 - Enhanced error handling and UI feedback for AI functions.
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
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

    // --- UI Helpers ---
    function setButtonLoadingState(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');
        button.disabled = isLoading;
        if(btnText) btnText.classList.toggle('hidden', isLoading);
        if(spinner) spinner.classList.toggle('hidden', !isLoading);
    }

    // --- Core AI Functions ---
    function ensureApiKey() {
        if (!state.apiKey) {
            state.showModal("API Key Required", "Please set your generative AI API Key in the settings menu first.", () => {
                document.getElementById('settingsBtn').click();
            });
            return false;
        }
        return true;
    }

    function buildFullPrompt(userPrompt) {
        const drawingStyle = drawingStyleSelect.value;
        const colorStyle = colorStyleSelect.value;
        return `A ${colorStyle} ${drawingStyle} of the following scene for a tabletop RPG map: ${userPrompt}. The image should be from a top-down perspective, have a clean, transparent, or neutral background, and be focused on the main subject.`;
    }

    async function handleApiCall(apiUrl, payload, buttonElement) {
        if (isGenerating || !ensureApiKey()) return null;
        
        isGenerating = true;
        setButtonLoadingState(buttonElement, true);
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Response:", errorData);
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("AI API Call Error:", error);
            state.showToast(`An error occurred: ${error.message}`, "error");
            return null;
        } finally {
            isGenerating = false;
            setButtonLoadingState(buttonElement, false);
        }
    }

    async function handleInitialGeneration() {
        const userPrompt = initialPromptInput.value;
        if (!userPrompt) { state.showToast("Please enter a prompt for the initial generation.", "error"); return; }
        
        currentAiImageBase64 = null;
        const fullPrompt = buildFullPrompt(userPrompt);
        const payload = { instances: [{ prompt: fullPrompt }], parameters: { "sampleCount": 1 } };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${state.apiKey}`;

        const result = await handleApiCall(apiUrl, payload, generateBtn);

        if (result && result.predictions?.[0]?.bytesBase64Encoded) {
            currentAiImageBase64 = result.predictions[0].bytesBase64Encoded;
            imageOutput.src = `data:image/png;base64,${currentAiImageBase64}`;
            placeholderText.classList.add('hidden');
            imageOutput.classList.remove('hidden');
            updateBtn.disabled = false;
            transferBtn.disabled = false;
            state.showToast("Image generated successfully!", "success");
        } else {
            placeholderText.classList.remove('hidden');
            imageOutput.classList.add('hidden');
            if (result) state.showToast("API returned no image data.", "error");
        }
    }
    
    async function handleIterativeUpdate() {
        if (!currentAiImageBase64) { state.showToast("Please generate an initial image first.", "error"); return; }
        const userPrompt = refinePromptInput.value;
        if (!userPrompt) { state.showToast("Please enter a prompt to refine the image.", "error"); return; }

        const payload = {
            contents: [{ parts: [ { text: userPrompt }, { inlineData: { mimeType: "image/png", data: currentAiImageBase64 } } ] }],
            generationConfig: { responseModalities: ['IMAGE'] },
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${state.apiKey}`;
        
        const result = await handleApiCall(apiUrl, payload, updateBtn);

        const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
        if (base64Data) {
            currentAiImageBase64 = base64Data;
            imageOutput.src = `data:image/png;base64,${currentAiImageBase64}`;
            state.showToast("Image updated successfully!", "success");
            refinePromptInput.value = "";
        } else {
             if (result) state.showToast("API returned no updated image data.", "error");
        }
    }

    function handleTransferToLayer() {
        if (!currentAiImageBase64) { state.showToast("No image to transfer.", "error"); return; }
        const activeMap = state.getActiveMap();
        if (!activeMap) { state.showToast("Please select or create a map first.", "error"); return; }

        const layerName = `AI Layer - ${initialPromptInput.value.substring(0, 20) || 'Image'}`;
        const newLayer = {
            id: `layer_${Date.now()}`, name: layerName, visible: true,
            objects: [], terrainPatches: [], drawings: [], tokens: [], textLabels: [],
            backgroundImage: `data:image/png;base64,${currentAiImageBase64}`, dirty: true
        };

        activeMap.layers.unshift(newLayer); 
        document.dispatchEvent(new CustomEvent('mapStateUpdated', { detail: { newLayer: true } }));
        state.showToast(`Image transferred to new layer "${layerName}"`, "success");
    }

    // --- Event Listeners Setup ---
    generateBtn.addEventListener('click', handleInitialGeneration);
    updateBtn.addEventListener('click', handleIterativeUpdate);
    transferBtn.addEventListener('click', handleTransferToLayer);
});

