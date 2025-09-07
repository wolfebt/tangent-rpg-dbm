// Version 13.0 - Full implementation review and final fixes
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const aiLayoutPrompt = document.getElementById('aiLayoutPrompt');
    const generateLayoutBtn = document.getElementById('generateLayoutBtn');
    const aiDressingPrompt = document.getElementById('aiDressingPrompt');
    const dressAreaBtn = document.getElementById('dressAreaBtn');
    const aiDataEditPrompt = document.getElementById('aiDataEditPrompt');
    const applyAiDataEditBtn = document.getElementById('applyAiDataEditBtn');
    const aiHexcrawlPrompt = document.getElementById('aiHexcrawlPrompt');
    const hexcrawlHexCount = document.getElementById('hexcrawlHexCount');
    const generateHexcrawlBtn = document.getElementById('generateHexcrawlBtn');
    const aiPointcrawlPrompt = document.getElementById('aiPointcrawlPrompt');
    const generatePointcrawlBtn = document.getElementById('generatePointcrawlBtn');
    const generateKeyBtn = document.getElementById('generateKeyBtn');
    const dungeonKeyModal = document.getElementById('dungeonKeyModal');
    const keyModalCloseBtn = document.getElementById('keyModalCloseBtn');
    const dungeonKeyContent = document.getElementById('dungeonKeyContent');
    const aiBottomPanelHeader = document.getElementById('aiBottomPanelHeader');

    // --- AI and Helper Functions ---

    function buildContextualPrompt(userPrompt, actionType, additionalContext = {}) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return "";

        let preamble = `You are an expert TTRPG map designer and game master. Your task is to interpret a user's request and provide a structured JSON response. `;
        preamble += `The current map scale is '${activeMap.scale}'. `;

        switch (actionType) {
            case 'layout':
                preamble += `You are generating a new map layout. The grid type is square. `;
                break;
            case 'dressing':
                preamble += `You are dressing an existing area with objects. The user has selected a specific region on the map. You must only place objects within the provided coordinates. `;
                const availableAssets = Object.keys(state.assetManifest)
                    .filter(id => state.assetManifest[id].tags.includes(activeMap.scale))
                    .map(id => ({ id, name: state.assetManifest[id].name, tags: state.assetManifest[id].tags }));
                preamble += `Available assets for this scale are: ${JSON.stringify(availableAssets)}. `;
                preamble += `The selected coordinates are: ${JSON.stringify(additionalContext.selectedSquares)}. `;
                break;
            case 'dataEdit':
                 preamble += `You are editing the terrain data of a selected area. You must only affect the provided coordinates. `;
                 preamble += `Available terrain types are: ${JSON.stringify(Object.keys(state.terrains))}. `;
                 preamble += `The selected coordinates are: ${JSON.stringify(additionalContext.selectedSquares)}. `;
                break;
            case 'keyGeneration':
                preamble += `You are an adventure writer creating a descriptive key for a dungeon map. Based on the provided room data (which includes room numbers, terrain types, and a list of objects in each room), write an evocative, sensory-rich description for each room. The descriptions should be suitable for a GM to read aloud.`;
                preamble += `Here is the map data: ${JSON.stringify(additionalContext.roomData)}`;
                break;
        }

        return `${preamble} The user's specific request is: "${userPrompt}". Please generate the appropriate JSON response.`;
    }

    async function callGenerativeAIForJSON(prompt, schema) {
        if (!state.apiKey) {
            state.showModal("Please set your API key in the settings first.");
            return null;
        }
        state.showModal("AI is generating... Please wait.", null);
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${state.apiKey}`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("AI API Error:", error);
                throw new Error(`API request failed with status ${response.status}: ${error.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();
            const jsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!jsonString) {
                console.error("Unexpected API response structure:", result);
                throw new Error("Could not find JSON data in the API response.");
            }
            
            document.querySelector('.modal-backdrop')?.remove();
            return JSON.parse(jsonString);

        } catch (error) {
            console.error("AI JSON Generation Error:", error);
            state.showModal(`An error occurred during AI generation: ${error.message}`);
            const loadingModal = document.querySelector('.modal-backdrop');
            if (loadingModal && loadingModal.textContent.includes("AI is generating")) {
                loadingModal.remove();
            }
            return null;
        }
    }
    
    // --- Event Handler Implementations ---

    async function handleLayoutGeneration() {
        const userPrompt = aiLayoutPrompt.value;
        if (!userPrompt) {
            state.showModal("Please describe the layout you want to generate.");
            return;
        }

        const schema = {
            type: "OBJECT",
            properties: {
                terrainChanges: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                           coordinates: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        x: { type: "NUMBER" },
                                        y: { type: "NUMBER" }
                                    },
                                    required: ["x", "y"]
                                }
                            },
                            terrainType: { type: "STRING" }
                        },
                        required: ["coordinates", "terrainType"]
                    }
                },
                objectPlacements: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                           x: { type: "NUMBER" },
                           y: { type: "NUMBER" },
                           assetId: { type: "STRING" }
                        },
                        required: ["x", "y", "assetId"]
                    }
                }
            },
            required: ["terrainChanges"]
        };
        
        const fullPrompt = buildContextualPrompt(userPrompt, 'layout');
        const layoutData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (layoutData) {
            // Ingest generated layout - This part needs to be implemented
            state.showModal("Layout data received from AI. Ingestion logic needs to be implemented.");
            console.log(layoutData);
        }
    }

    async function handleAiDressing() {
        state.showModal("This AI feature is not yet implemented.");
    }
    async function handleAiDataEdit() {
        state.showModal("This AI feature is not yet implemented.");
    }
    async function handleHexcrawlGeneration() {
        state.showModal("This AI feature is not yet implemented.");
    }
    async function handlePointcrawlGeneration() {
        state.showModal("This AI feature is not yet implemented.");
    }
    async function handleKeyGeneration() {
        state.showModal("This AI feature is not yet implemented.");
    }


    function addAiEventListeners() {
        if (!aiBottomPanelHeader) return;
        aiBottomPanelHeader.addEventListener('click', () => {
            document.getElementById('aiBottomPanel').classList.toggle('closed');
        });
        
        generateLayoutBtn.addEventListener('click', handleLayoutGeneration);
        if (dressAreaBtn) dressAreaBtn.addEventListener('click', handleAiDressing);
        if (applyAiDataEditBtn) applyAiDataEditBtn.addEventListener('click', handleAiDataEdit);
        if (generateHexcrawlBtn) generateHexcrawlBtn.addEventListener('click', handleHexcrawlGeneration);
        if (generatePointcrawlBtn) generatePointcrawlBtn.addEventListener('click', handlePointcrawlGeneration);
        if (generateKeyBtn) generateKeyBtn.addEventListener('click', handleKeyGeneration);

        if (keyModalCloseBtn) keyModalCloseBtn.addEventListener('click', () => dungeonKeyModal.classList.add('hidden'));
        if (dungeonKeyModal) dungeonKeyModal.addEventListener('click', (e) => {
            if (e.target === dungeonKeyModal) {
                dungeonKeyModal.classList.add('hidden');
            }
        });
    }

    addAiEventListeners();
});

