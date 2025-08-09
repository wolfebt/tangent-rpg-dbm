// Version 4.23 - State Management Module

// --- State Variables ---
// This file acts as the single source of truth for the application's shared state.

export let terrains = {};
export let assetManifest = {};
export let gridType = 'hex';
export let mapGrid = {};
export let mapName = '';
export let layers = [];
export let activeLayerIndex = 0;
export let currentTool = 'terrain';
export let terrainBrushMode = 'hex';
export let pencilBrushMode = 'freestyle';
export let brushSize = 1;
export let selectedTerrain = 'grass';
export let selectedObjectKey = 'fantasy_world_tree';
export let view = { zoom: 1, offsetX: 0, offsetY: 0 };
export let gridColor = '#111827';
export let pencilPaths = [];
export let currentGenre = 'fantasy';
export let currentScale = 'world';
export let placedAssets = [];
export let apiKey = '';
export let gmNotes = {};

// --- State Update Functions ---
// These functions are used by other modules to modify the state in a controlled way.

export const setState = (newState) => {
    if (newState.terrains !== undefined) terrains = newState.terrains;
    if (newState.assetManifest !== undefined) assetManifest = newState.assetManifest;
    if (newState.gridType !== undefined) gridType = newState.gridType;
    if (newState.mapGrid !== undefined) mapGrid = newState.mapGrid;
    if (newState.mapName !== undefined) mapName = newState.mapName;
    if (newState.layers !== undefined) layers = newState.layers;
    if (newState.activeLayerIndex !== undefined) activeLayerIndex = newState.activeLayerIndex;
    if (newState.currentTool !== undefined) currentTool = newState.currentTool;
    if (newState.terrainBrushMode !== undefined) terrainBrushMode = newState.terrainBrushMode;
    if (newState.pencilBrushMode !== undefined) pencilBrushMode = newState.pencilBrushMode;
    if (newState.brushSize !== undefined) brushSize = newState.brushSize;
    if (newState.selectedTerrain !== undefined) selectedTerrain = newState.selectedTerrain;
    if (newState.selectedObjectKey !== undefined) selectedObjectKey = newState.selectedObjectKey;
    if (newState.view !== undefined) view = newState.view;
    if (newState.gridColor !== undefined) gridColor = newState.gridColor;
    if (newState.pencilPaths !== undefined) pencilPaths = newState.pencilPaths;
    if (newState.currentGenre !== undefined) currentGenre = newState.currentGenre;
    if (newState.currentScale !== undefined) currentScale = newState.currentScale;
    if (newState.placedAssets !== undefined) placedAssets = newState.placedAssets;
    if (newState.apiKey !== undefined) apiKey = newState.apiKey;
    if (newState.gmNotes !== undefined) gmNotes = newState.gmNotes;
};

// --- Shared Utility Functions ---

export function showModal(message, onConfirm) {
    const existingModal = document.querySelector('.modal-backdrop');
    if(existingModal) existingModal.remove();

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modalBackdrop.innerHTML = `
        <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-white">
            <p class="mb-6 text-center">${message}</p>
            <div class="flex justify-end gap-4">
                ${onConfirm ? `<button id="modalConfirm" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition">Confirm</button>` : ''}
                <button id="modalCancel" class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition">${onConfirm ? 'Cancel' : 'OK'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalBackdrop);
    modalBackdrop.querySelector('#modalCancel').onclick = () => document.body.removeChild(modalBackdrop);
    if (onConfirm) {
        modalBackdrop.querySelector('#modalConfirm').onclick = () => {
            onConfirm();
            document.body.removeChild(modalBackdrop);
        };
    }
}

export function showContentModal(title, content) {
    const existingModal = document.querySelector('.modal-backdrop');
    if(existingModal) existingModal.remove();

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    
    modalBackdrop.innerHTML = `
        <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl text-white flex flex-col" style="max-height: 90vh;">
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 class="text-xl font-bold">${title}</h3>
                <button id="modalClose" class="p-2 rounded-full hover:bg-gray-700">&times;</button>
            </div>
            <div class="p-6 overflow-y-auto">
                ${content}
            </div>
        </div>
    `;
    document.body.appendChild(modalBackdrop);
    modalBackdrop.querySelector('#modalClose').onclick = () => document.body.removeChild(modalBackdrop);
    modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) {
             document.body.removeChild(modalBackdrop);
        }
    }
}
