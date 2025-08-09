// Version 4.23 - AI Assistant Logic (Refactored)
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const aiBottomPanel = document.getElementById('aiBottomPanel');
    const aiBottomPanelHeader = document.getElementById('aiBottomPanelHeader');
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

    // --- AI and Helper Functions ---

    function buildContextualPrompt(userPrompt, actionType, additionalContext = {}) {
        let preamble = `You are an expert TTRPG map designer and game master. Your task is to interpret a user's request and provide a structured JSON response. `;
        preamble += `The current map genre is '${state.currentGenre}' and the scale is '${state.currentScale}'. `;

        switch (actionType) {
            case 'layout':
                preamble += `You are generating a new map layout. The grid type is '${state.gridType}'. `;
                break;
            case 'dressing':
                preamble += `You are dressing an existing area with objects. The user has selected a specific region on the map. You must only place objects within the provided coordinates. `;
                preamble += `Available assets for this genre/scale are: ${JSON.stringify(additionalContext.availableAssets)}. `;
                preamble += `The selected coordinates are: ${JSON.stringify(additionalContext.selectedHexes)}. `;
                break;
            case 'dataEdit':
                 preamble += `You are editing the terrain data of a selected area. You must only affect the provided coordinates. `;
                 preamble += `Available terrain types are: ${JSON.stringify(Object.keys(state.terrains))}. `;
                 preamble += `The selected coordinates are: ${JSON.stringify(additionalContext.selectedHexes)}. `;
                break;
            case 'hexcrawl':
                preamble += `You are generating content for a hexcrawl-style regional map. The user has requested details for ${additionalContext.hexCount} hexes. Generate a list of points of interest, brief descriptions, and suggest an appropriate terrain type for each. The map grid is ${document.getElementById('mapWidth').value}x${document.getElementById('mapHeight').value}. Choose random, valid coordinates within these bounds.`;
                break;
            case 'pointcrawl':
                preamble += `You are generating content for a pointcrawl-style map (like a city or region). Create a series of named locations (nodes) and the connections (edges) between them. Provide a brief description for each node and suggest logical coordinates on a ${document.getElementById('mapWidth').value}x${document.getElementById('mapHeight').value} grid.`;
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

    /**
     * Analyzes the map to identify contiguous areas of the same terrain, treating them as "rooms".
     * @returns {Array<Object>} An array of room objects, each containing coordinates and terrain type.
     */
    function analyzeMapForRooms() {
        const groundLayer = state.layers.find(l => l.name === 'Ground');
        if (!groundLayer) return [];

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

        const directions = state.gridType === 'hex' ? hexDirections : squareDirections;

        for (const key in state.mapGrid) {
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

                        if (state.mapGrid[neighborKey] && !visited.has(neighborKey)) {
                            const neighborTerrain = groundLayer.data[neighborKey] ? groundLayer.data[neighborKey].terrain : null;
                            if (neighborTerrain === terrainType) {
                                visited.add(neighborKey);
                                queue.push(neighborKey);
                            }
                        }
                    }
                }
                rooms.push(currentRoom);
            }
        }
        return rooms;
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
                rooms: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "NUMBER" },
                            description: { type: "STRING" },
                            coordinates: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        q: { type: "NUMBER" },
                                        r: { type: "NUMBER" }
                                    },
                                    required: ["q", "r"]
                                }
                            }
                        },
                        required: ["id", "description", "coordinates"]
                    }
                },
                doors: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            coordinates: {
                                type: "OBJECT",
                                properties: {
                                    q: { type: "NUMBER" },
                                    r: { type: "NUMBER" }
                                },
                                required: ["q", "r"]
                            }
                        },
                        required: ["coordinates"]
                    }
                }
            },
            required: ["rooms", "doors"]
        };
        
        const fullPrompt = buildContextualPrompt(userPrompt, 'layout');
        const layoutData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (layoutData) {
            ingestGeneratedLayout(layoutData);
        }
    }

    function ingestGeneratedLayout(data) {
        window.saveState();
        
        const groundLayer = state.layers.find(l => l.name === 'Ground');
        if (!groundLayer) return;

        data.rooms.forEach(room => {
            room.coordinates.forEach(coord => {
                const key = `${coord.q},${coord.r}`;
                groundLayer.data[key] = { terrain: 'dirt' };
            });
        });

        data.doors.forEach(door => {
            const newAsset = {
                assetId: 'fantasy_location_door',
                q: door.coordinates.q,
                r: door.coordinates.r,
                size: 1,
                gmOnly: false
            };
            state.placedAssets.push(newAsset);
        });

        window.updateMapKey();
        window.drawAll();
    }

    async function handleAiDressing() {
        const userPrompt = aiDressingPrompt.value;
        if (!userPrompt) {
            state.showModal("Please describe how to dress the selected area.");
            return;
        }
        const selectedHexes = window.getHexesInSelection();
        if (selectedHexes.length === 0) {
            state.showModal("Please use the 'Select' tool to choose an area first.");
            return;
        }

        const availableAssets = Object.keys(state.assetManifest)
            .filter(id => state.assetManifest[id].tags.includes(state.currentGenre) && state.assetManifest[id].tags.includes(state.currentScale))
            .map(id => ({ id, name: state.assetManifest[id].name, tags: state.assetManifest[id].tags }));

        const schema = {
            type: "OBJECT",
            properties: {
                placements: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            assetId: { type: "STRING" },
                            coordinates: {
                                type: "OBJECT",
                                properties: {
                                    q: { type: "NUMBER" },
                                    r: { type: "NUMBER" }
                                },
                                required: ["q", "r"]
                            }
                        },
                        required: ["assetId", "coordinates"]
                    }
                }
            },
            required: ["placements"]
        };

        const additionalContext = { availableAssets, selectedHexes };
        const fullPrompt = buildContextualPrompt(userPrompt, 'dressing', additionalContext);
        const dressingData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (dressingData) {
            ingestGeneratedDressing(dressingData);
        }
    }

    function ingestGeneratedDressing(data) {
        window.saveState();
        if (data.placements && Array.isArray(data.placements)) {
            data.placements.forEach(placement => {
                if (state.assetManifest[placement.assetId]) {
                    const newAsset = {
                        assetId: placement.assetId,
                        q: placement.coordinates.q,
                        r: placement.coordinates.r,
                        size: 1,
                        gmOnly: false
                    };
                    state.placedAssets.push(newAsset);
                }
            });
        }
        window.drawAll();
        window.updateMapKey();
    }

    async function handleAiDataEdit() {
        const userPrompt = aiDataEditPrompt.value;
        if (!userPrompt) {
            state.showModal("Please provide an edit instruction.");
            return;
        }
        const selectedHexes = window.getHexesInSelection();
        if (selectedHexes.length === 0) {
            state.showModal("Please use the 'Select' tool to define an area for the edit.");
            return;
        }

        const schema = {
            type: "OBJECT",
            properties: {
                tool: {
                    type: "STRING",
                    enum: ["paintTerrain"]
                },
                parameters: {
                    type: "OBJECT",
                    properties: {
                        terrainType: { type: "STRING" },
                        coordinates: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    q: { type: "NUMBER" },
                                    r: { type: "NUMBER" }
                                },
                                required: ["q", "r"]
                            }
                        }
                    },
                    required: ["terrainType", "coordinates"]
                }
            },
            required: ["tool", "parameters"]
        };

        const additionalContext = { selectedHexes };
        const fullPrompt = buildContextualPrompt(userPrompt, 'dataEdit', additionalContext);
        const command = await callGenerativeAIForJSON(fullPrompt, schema);

        if (command) {
            ingestAiCommand(command);
        }
    }

    function ingestAiCommand(command) {
        window.saveState();
        if (!command || !command.tool) {
            console.error("Invalid command from AI:", command);
            return;
        }

        switch (command.tool) {
            case 'paintTerrain':
                const groundLayer = state.layers.find(l => l.name === 'Ground');
                if (groundLayer && command.parameters && command.parameters.coordinates && command.parameters.terrainType) {
                    if (state.terrains[command.parameters.terrainType]) {
                        command.parameters.coordinates.forEach(coord => {
                            const key = `${coord.q},${coord.r}`;
                            groundLayer.data[key] = { terrain: command.parameters.terrainType };
                        });
                    } else {
                        console.warn(`AI requested invalid terrain type: ${command.parameters.terrainType}`);
                    }
                }
                break;
            default:
                console.warn(`Unknown AI command tool: ${command.tool}`);
        }

        window.drawAll();
        window.updateMapKey();
    }

    async function handleHexcrawlGeneration() {
        const userPrompt = aiHexcrawlPrompt.value;
        if (!userPrompt) {
            state.showModal("Please describe the region for the hexcrawl.");
            return;
        }
        const hexCount = parseInt(hexcrawlHexCount.value);

        const schema = {
            type: "OBJECT",
            properties: {
                hexes: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            coordinates: {
                                type: "OBJECT",
                                properties: { q: { type: "NUMBER" }, r: { type: "NUMBER" } },
                                required: ["q", "r"]
                            },
                            poi: { type: "STRING", description: "A short, evocative name for the point of interest." },
                            description: { type: "STRING", description: "A one-sentence description of the location." },
                            terrain: { type: "STRING", description: "The suggested terrain type from the available list." }
                        },
                        required: ["coordinates", "poi", "description", "terrain"]
                    }
                }
            },
            required: ["hexes"]
        };

        const fullPrompt = buildContextualPrompt(userPrompt, 'hexcrawl', { hexCount });
        const hexcrawlData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (hexcrawlData) {
            ingestGeneratedHexcrawl(hexcrawlData);
        }
    }

    function ingestGeneratedHexcrawl(data) {
        window.saveState();
        const groundLayer = state.layers.find(l => l.name === 'Ground');
        const objectsLayer = state.layers.find(l => l.name === 'Objects');
        if (!groundLayer || !objectsLayer) return;

        data.hexes.forEach(hex => {
            const key = `${hex.coordinates.q},${hex.coordinates.r}`;
            if (state.mapGrid[key]) {
                if (state.terrains[hex.terrain]) {
                    groundLayer.data[key] = { terrain: hex.terrain };
                }
                objectsLayer.data[key] = {
                    ...objectsLayer.data[key],
                    text: hex.poi,
                    textSize: 16,
                    textColor: '#FFFFFF',
                    gmOnly: true
                };
                state.gmNotes[key] = hex.description;
            }
        });

        window.drawAll();
        window.updateMapKey();
    }

    async function handlePointcrawlGeneration() {
        const userPrompt = aiPointcrawlPrompt.value;
        if (!userPrompt) {
            state.showModal("Please describe the area for the pointcrawl.");
            return;
        }

        const schema = {
            type: "OBJECT",
            properties: {
                nodes: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "STRING" },
                            name: { type: "STRING" },
                            description: { type: "STRING" },
                            coordinates: {
                                type: "OBJECT",
                                properties: { q: { type: "NUMBER" }, r: { type: "NUMBER" } },
                                required: ["q", "r"]
                            }
                        },
                        required: ["id", "name", "description", "coordinates"]
                    }
                },
                edges: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            from: { type: "STRING" },
                            to: { type: "STRING" }
                        },
                        required: ["from", "to"]
                    }
                }
            },
            required: ["nodes", "edges"]
        };

        const fullPrompt = buildContextualPrompt(userPrompt, 'pointcrawl');
        const pointcrawlData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (pointcrawlData) {
            ingestGeneratedPointcrawl(pointcrawlData);
        }
    }

    function ingestGeneratedPointcrawl(data) {
        window.saveState();
        const objectsLayer = state.layers.find(l => l.name === 'Objects');
        if (!objectsLayer) return;

        const nodePositions = {};

        data.nodes.forEach(node => {
            const key = `${node.coordinates.q},${node.coordinates.r}`;
            if (state.mapGrid[key]) {
                objectsLayer.data[key] = {
                    ...objectsLayer.data[key],
                    text: `[${node.id}] ${node.name}`,
                    textSize: 20,
                    textColor: '#fde047',
                    gmOnly: false
                };
                state.gmNotes[key] = node.description;
                const pixelPos = state.gridType === 'hex' ? hexToPixel(node.coordinates.q, node.coordinates.r) : squareToPixel(node.coordinates.q, node.coordinates.r);
                nodePositions[node.id] = pixelPos;
            }
        });

        data.edges.forEach(edge => {
            const startNode = nodePositions[edge.from];
            const endNode = nodePositions[edge.to];

            if (startNode && endNode) {
                state.pencilPaths.push({
                    type: 'line',
                    start: startNode,
                    end: endNode,
                    color: 'rgba(255, 255, 255, 0.5)',
                    width: 3,
                    gmOnly: false
                });
            }
        });

        window.drawAll();
        window.updateMapKey();
    }
    
    async function handleKeyGeneration() {
        const rooms = analyzeMapForRooms();
        if (rooms.length === 0) {
            state.showModal("No distinct rooms found on the map. Please paint some areas on the 'Ground' layer first.");
            return;
        }
        
        const roomDataForAI = rooms.map(room => {
            const coordSet = new Set(room.coordinates.map(c => `${c.q},${c.r}`));
            const objectsInRoom = state.placedAssets
                .filter(asset => coordSet.has(`${asset.q},${asset.r}`))
                .map(asset => state.assetManifest[asset.assetId]?.name || 'Unknown Object');

            return {
                roomNumber: room.id,
                terrain: room.terrain,
                objects: objectsInRoom
            };
        });

        const schema = {
            type: "OBJECT",
            properties: {
                dungeonKey: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            roomNumber: { type: "NUMBER" },
                            description: { type: "STRING" }
                        },
                        required: ["roomNumber", "description"]
                    }
                }
            },
            required: ["dungeonKey"]
        };

        const fullPrompt = buildContextualPrompt("Generate the dungeon key.", 'keyGeneration', { roomData: roomDataForAI });
        const keyData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (keyData && keyData.dungeonKey) {
            dungeonKeyContent.innerHTML = ''; // Clear previous content
            keyData.dungeonKey.forEach(entry => {
                const roomTitle = document.createElement('h5');
                roomTitle.textContent = `Room ${entry.roomNumber}`;
                const roomDescription = document.createElement('p');
                roomDescription.textContent = entry.description;
                dungeonKeyContent.appendChild(roomTitle);
                dungeonKeyContent.appendChild(roomDescription);
            });
            dungeonKeyModal.classList.remove('hidden');
        }
    }

    function addAiEventListeners() {
        aiBottomPanelHeader.addEventListener('click', () => {
            aiBottomPanel.classList.toggle('closed');
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
