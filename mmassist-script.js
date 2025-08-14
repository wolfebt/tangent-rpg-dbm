// Version 4.34 - Enhanced AI Asset Tagging
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
                preamble += `You are generating a new map layout. The grid type is '${activeMap.gridType}'. `;
                break;
            case 'dressing':
                preamble += `You are dressing an existing area with objects. The user has selected a specific region on the map. You must only place objects within the provided coordinates. `;
                const availableAssets = Object.keys(state.assetManifest)
                    .filter(id => state.assetManifest[id].tags.includes(activeMap.scale))
                    .map(id => ({ id, name: state.assetManifest[id].name, tags: state.assetManifest[id].tags }));
                preamble += `Available assets for this scale are: ${JSON.stringify(availableAssets)}. `;
                preamble += `The selected coordinates are: ${JSON.stringify(additionalContext.selectedHexes)}. `;
                break;
            case 'dataEdit':
                 preamble += `You are editing the terrain data of a selected area. You must only affect the provided coordinates. `;
                 preamble += `Available terrain types are: ${JSON.stringify(Object.keys(state.terrains))}. `;
                 preamble += `The selected coordinates are: ${JSON.stringify(additionalContext.selectedHexes)}. `;
                break;
            case 'hexcrawl':
                const mapWidth = Object.keys(activeMap.mapGrid).length > 0 ? Math.max(...Object.keys(activeMap.mapGrid).map(k => parseInt(k.split(',')[0]))) : 50;
                const mapHeight = Object.keys(activeMap.mapGrid).length > 0 ? Math.max(...Object.keys(activeMap.mapGrid).map(k => parseInt(k.split(',')[1]))) : 50;
                preamble += `You are generating content for a hexcrawl-style regional map. The user has requested details for ${additionalContext.hexCount} hexes. Generate a list of points of interest, brief descriptions, and suggest an appropriate terrain type for each. The map grid is ${mapWidth}x${mapHeight}. Choose random, valid coordinates within these bounds.`;
                break;
            case 'pointcrawl':
                const p_mapWidth = Object.keys(activeMap.mapGrid).length > 0 ? Math.max(...Object.keys(activeMap.mapGrid).map(k => parseInt(k.split(',')[0]))) : 50;
                const p_mapHeight = Object.keys(activeMap.mapGrid).length > 0 ? Math.max(...Object.keys(activeMap.mapGrid).map(k => parseInt(k.split(',')[1]))) : 50;
                preamble += `You are generating content for a pointcrawl-style map (like a city or region). Create a series of named locations (nodes) and the connections (edges) between them. Provide a brief description for each node and suggest logical coordinates on a ${p_mapWidth}x${p_mapHeight} grid.`;
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
    
    function analyzeMapForRooms() {
        const activeMap = state.getActiveMap();
        if (!activeMap) return [];

        const groundLayer = activeMap.layers.find(l => l.name === 'Ground');
        if (!groundLayer) return [];

        const doorHexes = new Set();
        activeMap.placedAssets.forEach(asset => {
            if (asset.assetId.includes('door')) {
                doorHexes.add(`${asset.q},${asset.r}`);
            }
        });

        const rooms = [];
        const visited = new Set();
        let roomCounter = 1;

        const hexDirections = [
            { q: +1, r: 0 }, { q: +1, r: -1 }, { q: 0, r: -1 },
            { q: -1, r: 0 }, { q: -1, r: +1 }, { q: 0, r: +1 }
        ];

        const squareDirections = [
            { q: 0, r: 1 }, { q: 0, r: -1 }, { q: 1, r: 0 }, { q: -1, r: 0 }
        ];

        const directions = activeMap.gridType === 'hex' ? hexDirections : squareDirections;

        for (const key in activeMap.mapGrid) {
            if (visited.has(key)) continue;

            const groundData = groundLayer.data[key];
            const terrainType = groundData ? groundData.terrain : null;

            if (terrainType) {
                const currentRoom = {
                    id: roomCounter++,
                    terrain: terrainType,
                    coordinates: []
                };
                
                const queue = [key];
                visited.add(key);

                while (queue.length > 0) {
                    const currentKey = queue.shift();
                    const [q, r] = currentKey.split(',').map(Number);
                    currentRoom.coordinates.push({ q, r });

                    for (const dir of directions) {
                        const neighborQ = q + dir.q;
                        const neighborR = r + dir.r;
                        const neighborKey = `${neighborQ},${neighborR}`;

                        if (activeMap.mapGrid[neighborKey] && !visited.has(neighborKey) && !doorHexes.has(neighborKey)) {
                            const neighborTerrain = groundLayer.data[neighborKey] ? groundLayer.data[neighborKey].terrain : null;
                            if (neighborTerrain === terrainType) {
                                visited.add(neighborKey);
                                queue.push(neighborKey);
                            }
                        }
                    }
                }
                if (currentRoom.coordinates.length > 0) {
                    rooms.push(currentRoom);
                }
            }
        }
        return rooms;
    }

    // ... (rest of the file remains the same)
    
    function addAiEventListeners() {
        aiBottomPanelHeader.addEventListener('click', () => {
            document.getElementById('aiBottomPanel').classList.toggle('closed');
        });
        
        generateLayoutBtn.addEventListener('click', handleLayoutGeneration);
        dressAreaBtn.addEventListener('click', handleAiDressing);
        applyAiDataEditBtn.addEventListener('click', handleAiDataEdit);
        generateHexcrawlBtn.addEventListener('click', handleHexcrawlGeneration);
        generatePointcrawlBtn.addEventListener('click', handlePointcrawlGeneration);
        generateKeyBtn.addEventListener('click', handleKeyGeneration);

        keyModalCloseBtn.addEventListener('click', () => dungeonKeyModal.classList.add('hidden'));
        dungeonKeyModal.addEventListener('click', (e) => {
            if (e.target === dungeonKeyModal) {
                dungeonKeyModal.classList.add('hidden');
            }
        });
    }

    addAiEventListeners();
});
