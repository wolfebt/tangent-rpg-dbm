// Version 16.0 - Added removeCustomAsset and improved modal flexibility.
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
        console.log("API Key loaded.");
    } else {
        console.log("No API Key found in localStorage.");
    }
}

export function addNewAsset(assetData) {
    let customAssets = JSON.parse(localStorage.getItem('mapMakerCustomAssets')) || {};
    Object.assign(customAssets, assetData);
    localStorage.setItem('mapMakerCustomAssets', JSON.stringify(customAssets));
    Object.assign(assetManifest, assetData);
}

export function removeCustomAsset(assetId) {
    let customAssets = JSON.parse(localStorage.getItem('mapMakerCustomAssets')) || {};
    if (customAssets[assetId]) {
        delete customAssets[assetId];
        localStorage.setItem('mapMakerCustomAssets', JSON.stringify(customAssets));
    }
    if (assetManifest[assetId]) {
        delete assetManifest[assetId];
    }
    // Also check terrains
    let customTerrains = JSON.parse(localStorage.getItem('mapMakerCustomTerrains')) || {};
    if (customTerrains[assetId]) {
        delete customTerrains[assetId];
        localStorage.setItem('mapMakerCustomTerrains', JSON.stringify(customTerrains));
    }
     if (terrains[assetId]) {
        delete terrains[assetId];
    }
}


export function loadCustomAssets() {
    const customAssets = JSON.parse(localStorage.getItem('mapMakerCustomAssets')) || {};
    Object.assign(assetManifest, customAssets);
    const customTerrains = JSON.parse(localStorage.getItem('mapMakerCustomTerrains')) || {};
    Object.assign(terrains, customTerrains);
}


// --- Shared UI Utility Functions ---

export function showModal(title, message, onConfirm) {
    // Generates and displays a generic confirmation or info modal.
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.innerHTML = `
        <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-white">
            <h3 class="text-lg font-bold mb-4">${title}</h3>
            <p class="mb-6 text-center">${message}</p>
            <div class="flex justify-end gap-4">
                ${onConfirm ? `<button id="modalConfirm" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">Confirm</button>` : ''}
                <button id="modalCancel" class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">${onConfirm ? 'Cancel' : 'OK'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalBackdrop);
    const closeModal = () => document.body.removeChild(modalBackdrop);
    modalBackdrop.querySelector('#modalCancel').onclick = closeModal;
    if (onConfirm) {
        modalBackdrop.querySelector('#modalConfirm').onclick = () => {
            onConfirm();
            closeModal();
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
    if (!container) {
        console.error("Toast container not found!");
        return;
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

