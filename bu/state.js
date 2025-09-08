// Version 15.1 - No changes needed. Code is sound.
// This module acts as the single source of truth for the application's data.

// --- State Variables ---
export let terrains = {};
export let assetManifest = {};
export let apiKey = '';

export let project = {
    projectName: 'Untitled Campaign',
    maps: {}, 
};

export let activeMapId = null; 

// --- Helper function to get the active map object ---
export const getActiveMap = () => {
    return project.maps && activeMapId ? project.maps[activeMapId] : null;
};

// --- State Update Functions ---
export const setActiveMapId = (mapId) => {
    activeMapId = mapId;
};

export const setState = (newState) => {
    if (newState.terrains !== undefined) terrains = newState.terrains;
    if (newState.assetManifest !== undefined) assetManifest = newState.assetManifest;
    if (newState.apiKey !== undefined) apiKey = newState.apiKey;
    if (newState.project !== undefined) project = newState.project;
    if (newState.activeMapId !== undefined) activeMapId = newState.activeMapId;
};

// This function loads the API key from browser storage.
export function loadApiKey() {
    const savedKey = localStorage.getItem('mapMakerApiKey');
    if (savedKey) {
        apiKey = savedKey;
    }
}

export function addNewAsset(assetData) {
    let customAssets = JSON.parse(localStorage.getItem('mapMakerCustomAssets')) || {};
    Object.assign(customAssets, assetData);
    localStorage.setItem('mapMakerCustomAssets', JSON.stringify(customAssets));
    Object.assign(assetManifest, assetData);
}

export function loadCustomAssets() {
    const customAssets = JSON.parse(localStorage.getItem('mapMakerCustomAssets')) || {};
    Object.assign(assetManifest, customAssets);
}


// --- Shared UI Utility Functions ---

export function showModal(message, onConfirm) {
    // Generates and displays a generic confirmation or info modal.
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.innerHTML = `
        <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-white">
            <p class="mb-6 text-center">${message}</p>
            <div class="flex justify-end gap-4">
                ${onConfirm ? `<button id="modalConfirm" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">Confirm</button>` : ''}
                <button id="modalCancel" class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">${onConfirm ? 'Cancel' : 'OK'}</button>
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
    // Displays a larger modal for rich content like the user guide.
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.innerHTML = `
        <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl text-white flex flex-col" style="max-height: 90vh;">
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 class="text-xl font-bold">${title}</h3>
                <button id="modalClose" class="text-2xl leading-none p-2 rounded-full hover:bg-gray-700">&times;</button>
            </div>
            <div class="p-6 overflow-y-auto">
                ${content}
            </div>
        </div>
    `;
    document.body.appendChild(modalBackdrop);
    modalBackdrop.querySelector('#modalClose').onclick = () => document.body.removeChild(modalBackdrop);
}

export function showToast(message, type = 'info', duration = 3000) {
    // Displays a small, temporary notification at the bottom-right of the screen.
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}
