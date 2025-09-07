// Version 5.1 - Final review and implementation for robust, non-destructive AI layout generation
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const aiLayoutPrompt = document.getElementById('aiLayoutPrompt');
    const generateLayoutBtn = document.getElementById('generateLayoutBtn');
    const aiBottomPanelHeader = document.getElementById('aiBottomPanelHeader');

    // --- Core AI Functions ---

    function buildContextualPrompt(userPrompt, actionType) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return "";

        let preamble = `You are an expert TTRPG dungeon designer. Your task is to interpret a user's request and provide a structured JSON response to generate a map layout. The grid is a simple square grid.`;

        if (actionType === 'layout') {
            preamble += ` You are generating a new dungeon layout within a ${activeMap.width}x${activeMap.height} square area. The origin (0,0) is the top-left. Generate a series of rooms and corridors. For each room, provide a list of all the integer coordinates (x, y) that make up its floor space. Also, generate a list of coordinates for doors. Doors should be single coordinates placed on the edge of a room, logically connecting them or leading out.`;
        }

        return `${preamble} The user's specific request is: "${userPrompt}". Please generate the appropriate JSON response. Do not place elements outside the map boundaries of ${activeMap.width}x${activeMap.height}.`;
    }

    async function callGenerativeAIForJSON(prompt, schema) {
        if (!state.apiKey) {
            state.showModal("Please set your AI API key in the Settings menu (gear icon) first.");
            return null;
        }
        
        const buttonSpinner = generateLayoutBtn.querySelector('.spinner');
        const buttonText = generateLayoutBtn.querySelector('.btn-text');

        try {
            buttonText.textContent = "Generating...";
            buttonSpinner.classList.remove('hidden');
            generateLayoutBtn.disabled = true;

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${state.apiKey}`;
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("AI API Error:", error);
                throw new Error(`API request failed: ${error.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();
            const jsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!jsonString) {
                throw new Error("Could not find valid JSON data in the AI response.");
            }
            
            return JSON.parse(jsonString);

        } catch (error) {
            console.error("AI JSON Generation Error:", error);
            state.showModal(`An error occurred during AI generation: ${error.message}`);
            return null;
        } finally {
            buttonText.textContent = "Generate Layout";
            buttonSpinner.classList.add('hidden');
            generateLayoutBtn.disabled = false;
        }
    }

    function ingestGeneratedLayout(layoutData) {
        const activeMap = state.getActiveMap();
        if (!activeMap) return; // Should be caught by the handler, but as a safeguard.

        const squareSize = 50; 
        
        // --- Non-destructive approach: Create a new layer for the AI content ---
        const newLayerName = `AI Layout - ${new Date().toLocaleTimeString()}`;
        const newLayer = { 
            id: `layer_${Date.now()}`, 
            name: newLayerName, 
            visible: true, 
            objects: [], 
            terrainPatches: [] 
        };
        
        // Ingest Rooms as terrain patches on the new layer
        if (layoutData.rooms) {
            layoutData.rooms.forEach(room => {
                if (room.coordinates) {
                    room.coordinates.forEach(coord => {
                        const { px, py } = { px: coord.x * squareSize, py: coord.y * squareSize };
                        // Create a dense spray of small patches to form a solid floor
                        for (let i = 0; i < 5; i++) { // Add more density
                             newLayer.terrainPatches.push({
                                x: px + (Math.random() * squareSize),
                                y: py + (Math.random() * squareSize),
                                radius: squareSize * 0.4, 
                                terrain: 'dungeon_floor' 
                            });
                        }
                    });
                }
            });
        }
    
        // Ingest Doors as objects on the new layer
        if (layoutData.doors) {
             layoutData.doors.forEach(door => {
                 if (door.coordinates) {
                    const { px, py } = { px: door.coordinates.x * squareSize, py: door.coordinates.y * squareSize };
                    newLayer.objects.push({
                        id: `obj_door_${Date.now()}_${Math.random()}`,
                        assetId: 'fantasy_location_door',
                        x: px + squareSize / 2,
                        y: py + squareSize / 2,
                        rotation: 0,
                        scale: 1,
                        isGmOnly: false
                    });
                 }
             });
        }
        
        // Add the new layer to the top of the layer stack
        activeMap.layers.unshift(newLayer);
        // Dispatch an event to tell the UI to update
        document.dispatchEvent(new CustomEvent('mapStateUpdated')); 

        state.showToast("AI layout generated on new layer!", "success");
        window.drawAll(); 
    }

    // --- Event Handler Implementations ---

    async function handleLayoutGeneration() {
        if (!state.getActiveMap()) {
            state.showModal("Please add or select a map before generating a layout.");
            return;
        }

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
                                    properties: { x: { type: "NUMBER" }, y: { type: "NUMBER" } },
                                    required: ["x", "y"]
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
                                properties: { x: { type: "NUMBER" }, y: { type: "NUMBER" } },
                                required: ["x", "y"]
                            }
                        },
                        required: ["coordinates"]
                    }
                }
            },
            required: ["rooms", "doors"]
        };
        
        const fullPrompt = buildContextualPrompt(userPrompt, 'layout');
        if (!fullPrompt) return;

        const layoutData = await callGenerativeAIForJSON(fullPrompt, schema);

        if (layoutData) {
            state.saveStateForUndo(); 
            ingestGeneratedLayout(layoutData);
        }
    }

    // --- Event Listeners Setup ---

    function addAiEventListeners() {
        aiBottomPanelHeader.addEventListener('click', () => {
            document.getElementById('aiBottomPanel').classList.toggle('closed');
        });
        
        generateLayoutBtn.addEventListener('click', handleLayoutGeneration);
    }

    addAiEventListeners();
});

