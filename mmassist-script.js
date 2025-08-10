// Version 5.1 - Added Undo Trigger for AI Actions
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const aiLandformPrompt = document.getElementById('aiLandformPrompt');
    const generateLandformBtn = document.getElementById('generateLandformBtn');
    const aiBiomePrompt = document.getElementById('aiBiomePrompt');
    const applyBiomesBtn = document.getElementById('applyBiomesBtn');
    const advancedOptionsHeader = document.getElementById('advanced-options-header');
    const advancedOptionsContent = document.getElementById('advanced-options-content');

    // --- Global variable to hold the landform image ---
    let landformImageBase64 = null;

    // --- AI and Helper Functions ---
    
    function setAILoadingState(button, isLoading) {
        if (!button) return;
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');
        
        if (isLoading) {
            button.disabled = true;
            if (btnText) btnText.style.opacity = '0.5';
            if (spinner) spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            if (btnText) btnText.style.opacity = '1';
            if (spinner) spinner.classList.add('hidden');
        }
    }

    async function callImageGenerationAI(prompt, imageBase64 = null) {
        if (!state.apiKey) {
            state.showModal("Please set your API key in the settings first.");
            return null;
        }

        const loadingModalMessage = imageBase64 ? "Applying biomes..." : "Generating landform...";
        state.showModal(loadingModalMessage, null);

        let apiUrl;
        let payload;
        const modelForTextToImage = "imagen-3.0-generate-002"; 
        const modelForImageEdit = "gemini-2.0-flash-preview-image-generation";

        if (!imageBase64) {
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelForTextToImage}:predict?key=${state.apiKey}`;
            payload = {
                instances: [{ prompt: prompt }],
                parameters: { "sampleCount": 1 }
            };
        } else {
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelForImageEdit}:generateContent?key=${state.apiKey}`;
            const parts = [
                { text: prompt },
                { inlineData: { mimeType: "image/png", data: imageBase64 } }
            ];
            payload = {
                contents: [{ role: "user", parts: parts }],
                generationConfig: { responseModalities: ['IMAGE'] },
            };
        }

        try {
            // NEW (Phase 1, Part 3): Dispatch event to save state BEFORE the API call
            document.dispatchEvent(new CustomEvent('requestStateSave'));

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`API request failed: ${error.error?.message || response.statusText}`);
            }

            const result = await response.json();
            let base64Data;

            if (!imageBase64) {
                base64Data = result.predictions?.[0]?.bytesBase64Encoded;
            } else {
                base64Data = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
            }

            if (!base64Data) throw new Error("No image data found in API response.");

            document.querySelector('.modal-backdrop')?.remove();
            return base64Data;

        } catch (error) {
            console.error("AI Generation Error:", error);
            state.showModal(`An error occurred during AI generation: ${error.message}`);
            return null;
        }
    }

    function buildAdvancedPrompt() {
        const artStyle = document.getElementById('artStyleSelect').value;
        const featureDensity = document.getElementById('featureDensity').value;
        const waterPresence = document.getElementById('waterPresence').value;
        const vegetation = document.getElementById('vegetationType').value.trim();
        const climate = document.getElementById('climateType').value.trim();
        const era = document.getElementById('eraType').value.trim();

        let parts = [`in a ${artStyle} art style`];
        if (featureDensity) parts.push(`with a ${featureDensity} density of features`);
        if (waterPresence) parts.push(waterPresence);
        if (vegetation) parts.push(`dominated by ${vegetation}`);
        if (climate) parts.push(`in a ${climate} climate`);
        if (era) parts.push(`reflecting a ${era} era`);
        
        return parts.join(', ');
    }
    
    async function handleGenerateLandform() {
        setAILoadingState(generateLandformBtn, true);
        try {
            const userPrompt = aiLandformPrompt.value;
            if (!userPrompt) {
                state.showModal("Please describe the basic landscape for the landform generation.");
                return;
            }
            
            const fullPrompt = `A grayscale heightmap of ${userPrompt}. White is the highest elevation, black is the lowest.`;
            
            const generatedImageBase64 = await callImageGenerationAI(fullPrompt);

            if (generatedImageBase64) {
                landformImageBase64 = generatedImageBase64;
                const event = new CustomEvent('aiImageGenerated', { detail: { imageBase64: landformImageBase64 } });
                document.dispatchEvent(event);
                state.showToast("Landform generated successfully. Now describe the biomes.", "info");
            }
        } catch (error) {
            console.error("Landform Generation Error:", error);
            state.showModal(`An error occurred: ${error.message}`, 'error');
        } finally {
            setAILoadingState(generateLandformBtn, false);
        }
    }

    async function handleApplyBiomes() {
        if (!landformImageBase64) {
            state.showModal("Please generate a landform first (Step 1).");
            return;
        }
        setAILoadingState(applyBiomesBtn, true);
        try {
            const userPrompt = aiBiomePrompt.value;
            if (!userPrompt) {
                state.showModal("Please describe the biomes and features to apply.");
                return;
            }

            const advancedSettings = buildAdvancedPrompt();
            const fullPrompt = `Using the provided heightmap as a guide for elevation, render a full-color map. The landscape should feature: ${userPrompt}. Additional details: ${advancedSettings}.`;

            const finalImageBase64 = await callImageGenerationAI(fullPrompt, landformImageBase64);

            if (finalImageBase64) {
                const event = new CustomEvent('aiImageGenerated', { detail: { imageBase64: finalImageBase64 } });
                document.dispatchEvent(event);
                state.showToast("Biomes applied! Your map is ready.", "info");
                landformImageBase64 = null;
            }
        } catch (error) {
            console.error("Biome Application Error:", error);
            state.showModal(`An error occurred: ${error.message}`, 'error');
        } finally {
            setAILoadingState(applyBiomesBtn, false);
        }
    }

    // --- Event Listeners ---
    if (generateLandformBtn) generateLandformBtn.addEventListener('click', handleGenerateLandform);
    if (applyBiomesBtn) applyBiomesBtn.addEventListener('click', handleApplyBiomes);
    
    if (advancedOptionsHeader) {
        advancedOptionsHeader.addEventListener('click', () => {
            const isCollapsed = advancedOptionsHeader.classList.toggle('collapsed');
            advancedOptionsContent.classList.toggle('hidden', isCollapsed);
        });
    }
});
