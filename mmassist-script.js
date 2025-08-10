// Version 6.0 - Phase 2.1: Intelligent Biome Application
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

    // --- Helper Functions for Color Analysis ---

    /**
     * Converts a hex color string to an RGB object.
     * @param {string} hex The hex color string (e.g., "#RRGGBB").
     * @returns {{r: number, g: number, b: number}|null} An object with r, g, b properties or null.
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Calculates the squared Euclidean distance between two RGB colors.
     * It's faster than full color difference and good enough for this purpose.
     * @param {{r: number, g: number, b: number}} rgb1 The first color.
     * @param {{r: number, g: number, b: number}} rgb2 The second color.
     * @returns {number} The squared distance between the colors.
     */
    function colorDistance(rgb1, rgb2) {
        const rDiff = rgb1.r - rgb2.r;
        const gDiff = rgb1.g - rgb2.g;
        const bDiff = rgb1.b - rgb2.b;
        return rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
    }

    /**
     * Finds the terrain type that most closely matches a given RGB color.
     * @param {{r: number, g: number, b: number}} targetRgb The color to match.
     * @returns {string|null} The key of the closest matching terrain, or null.
     */
    function findClosestTerrain(targetRgb) {
        let minDistance = Infinity;
        let closestTerrain = null;

        for (const key in state.terrains) {
            const terrain = state.terrains[key];
            const terrainRgb = hexToRgb(terrain.color);
            if (terrainRgb) {
                const distance = colorDistance(targetRgb, terrainRgb);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestTerrain = key;
                }
            }
        }
        return closestTerrain;
    }

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
                // This is the new intelligent application logic
                await applyImageToMapTerrain(finalImageBase64);
                state.showToast("Biomes applied! Your map has been painted.", "info");
                landformImageBase64 = null; // Clear the landform after use
            }
        } catch (error) {
            console.error("Biome Application Error:", error);
            state.showModal(`An error occurred: ${error.message}`, 'error');
        } finally {
            setAILoadingState(applyBiomesBtn, false);
        }
    }

    /**
     * Analyzes a generated image and applies its colors as terrain to the current map.
     * @param {string} imageBase64 The base64 encoded image to analyze.
     */
    async function applyImageToMapTerrain(imageBase64) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        const img = new Image();
        const promise = new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = `data:image/png;base64,${imageBase64}`;
        });

        await promise;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, img.width, img.height);

        const targetLayer = activeMap.layers[0]; // Assuming ground layer
        if (!targetLayer) return;

        // Find the min/max coordinates of the grid to map image pixels correctly
        let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
        Object.keys(activeMap.grid).forEach(key => {
            const [q, r] = key.split(',').map(Number);
            if (q < minQ) minQ = q;
            if (q > maxQ) maxQ = q;
            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
        });

        const qRange = maxQ - minQ;
        const rRange = maxR - minR;

        for (const key in activeMap.grid) {
            const [q, r] = key.split(',').map(Number);
            
            // Normalize hex coordinates to a 0-1 range
            const normX = (q - minQ) / qRange;
            const normY = (r - minR) / rRange;

            // Map normalized coordinates to pixel coordinates in the image
            const pixelX = Math.floor(normX * img.width);
            const pixelY = Math.floor(normY * img.height);
            
            // Get color from the image data
            const i = (pixelY * imageData.width + pixelX) * 4;
            const color = { r: imageData.data[i], g: imageData.data[i+1], b: imageData.data[i+2] };

            const closestTerrain = findClosestTerrain(color);
            if (closestTerrain) {
                if (!targetLayer.data[key]) targetLayer.data[key] = {};
                targetLayer.data[key].terrain = closestTerrain;
            }
        }
        
        // Dispatch an event to tell the main script to redraw everything
        document.dispatchEvent(new CustomEvent('mapStateUpdated'));
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
