// Version 4.29 - Hierarchical Map AI Logic
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
    
    // ... (rest of the file is refactored to use state.getActiveMap() where needed)
});
