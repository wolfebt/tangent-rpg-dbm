// Version 7.1 - Added event dispatch for map updates
import * as state from './state.js';

async function callTextGenerationAI(prompt) {
    if (!state.apiKey) {
        state.showModal("Please set your API key in the settings first.");
        return null;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${state.apiKey}`;
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    try {
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
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) throw new Error("No text data found in API response.");
        
        return text;

    } catch (error) {
        console.error("AI Text Generation Error:", error);
        state.showModal(`An error occurred during AI generation: ${error.message}`);
        return null;
    }
}


export async function callImageGenerationAI(prompt, imageBase64 = null) {
    if (!state.apiKey) {
        state.showModal("Please set your API key in the settings first.");
        return null;
    }
    // This is a placeholder for the actual image generation call
    console.log("callImageGenerationAI called with prompt:", prompt);
    // In a real implementation, you would make a fetch call to an image generation API
    // and return the base64 encoded image data.
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // 1x1 transparent pixel
}


document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const aiLandformPrompt = document.getElementById('aiLandformPrompt');
    const generateLandformBtn = document.getElementById('generateLandformBtn');
    const aiBiomePrompt = document.getElementById('aiBiomePrompt');
    const applyBiomesBtn = document.getElementById('applyBiomesBtn');
    const generateColorVariantBtn = document.getElementById('generateColorVariantBtn');
    const aiLayoutPrompt = document.getElementById('aiLayoutPrompt');
    const generateLayoutBtn = document.getElementById('generateLayoutBtn');

    let landformImageBase64 = null;

    function setAILoadingState(button, isLoading) {
        if (!button) return;
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');
        if (isLoading) {
            if(btnText) btnText.classList.add('hidden');
            if(spinner) spinner.classList.remove('hidden');
            button.disabled = true;
        } else {
            if(btnText) btnText.classList.remove('hidden');
            if(spinner) spinner.classList.add('hidden');
            button.disabled = false;
        }
    }

    async function handleGenerateLandform() {
        setAILoadingState(generateLandformBtn, true);
        console.log("Generating landform...");
        // Placeholder implementation
        setTimeout(() => {
            console.log("Landform generation complete (placeholder).");
            setAILoadingState(generateLandformBtn, false);
            if(applyBiomesBtn) applyBiomesBtn.disabled = false;
            if(generateColorVariantBtn) generateColorVariantBtn.disabled = false;
        }, 2000);
    }
    
    async function handleApplyBiomes(isVariant) {
        const btn = isVariant ? generateColorVariantBtn : applyBiomesBtn;
        setAILoadingState(btn, true);
        console.log(`Applying biomes (isVariant: ${isVariant})...`);
        // Placeholder implementation
        setTimeout(() => {
            console.log("Biome application complete (placeholder).");
            setAILoadingState(btn, false);
        }, 2000);
    }

    async function handleGenerateLayout() {
        setAILoadingState(generateLayoutBtn, true);
        try {
            const userPrompt = aiLayoutPrompt.value;
            if (!userPrompt) {
                state.showModal("Please describe the dungeon layout.");
                return;
            }

            const fullPrompt = `
                Act as a dungeon level designer for a tabletop role-playing game.
                Generate a simple, 2D map layout based on the user's description.
                CRITICAL INSTRUCTIONS:
                1.  You MUST return the layout as a text-based grid inside a single markdown code block.
                2.  Use the '#' character to represent walls.
                3.  Use the '.' character to represent floor space.
                4.  Do not include any other characters, explanations, or text outside of the code block.
                
                User Description: "${userPrompt}"
            `;

            const responseText = await callTextGenerationAI(fullPrompt);
            if (responseText) {
                const gridMatch = responseText.match(/```([\s\S]*?)```/);
                if (gridMatch && gridMatch[1]) {
                    const grid = gridMatch[1].trim();
                    await renderLayoutFromGrid(grid);
                    state.showToast("Dungeon layout generated and applied!", "info");
                } else {
                    throw new Error("AI did not return a valid layout grid.");
                }
            }
        } catch (error) {
            console.error("Layout Generation Error:", error);
            state.showModal(`An error occurred: ${error.message}`, 'error');
        } finally {
            setAILoadingState(generateLayoutBtn, false);
        }
    }

    async function renderLayoutFromGrid(grid) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return;

        state.showModal("Applying new layout...");

        // Clear existing terrain and walls
        activeMap.walls = [];
        const groundLayer = activeMap.layers.find(l => l.name === 'Ground') || activeMap.layers[0];
        if(groundLayer) {
            groundLayer.data = {};
        }
        
        const rows = grid.split('\n').map(row => row.trim());
        const gridHeight = rows.length;
        const gridWidth = rows.reduce((max, row) => Math.max(max, row.length), 0);

        const startQ = -Math.floor(gridWidth / 2);
        const startR = -Math.floor(gridHeight / 2);

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < rows[y].length; x++) {
                const char = rows[y][x];
                const q = startQ + x;
                const r = startR + y;
                const key = `${q},${r}`;

                if (activeMap.grid[key]) {
                    if (char === '#') {
                        groundLayer.data[key] = { terrain: 'dungeon_wall' };
                    } else if (char === '.') {
                        groundLayer.data[key] = { terrain: 'dungeon_floor' };
                    }
                }
            }
        }
        
        document.dispatchEvent(new CustomEvent('mapStateUpdated'));
        const modal = document.querySelector('.modal-backdrop');
        if (modal && modal.textContent.includes("Applying new layout...")) {
             setTimeout(() => {
                if(document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }, 500);
        }
    }
    
    // --- Event Listeners ---
    if (generateLandformBtn) generateLandformBtn.addEventListener('click', handleGenerateLandform);
    if (applyBiomesBtn) applyBiomesBtn.addEventListener('click', () => handleApplyBiomes(false));
    if (generateColorVariantBtn) generateColorVariantBtn.addEventListener('click', () => handleApplyBiomes(true));
    if (generateLayoutBtn) generateLayoutBtn.addEventListener('click', handleGenerateLayout);
});
