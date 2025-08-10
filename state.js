// Version 4.28 - Hierarchical Map Project Structure
// --- State Variables ---
export let terrains = {};
export let assetManifest = {};
export let apiKey = '';

// The main project object. It will hold all maps and project-level metadata.
export let project = {
    projectName: 'Untitled Campaign',
    maps: {}, // Maps will be stored here, indexed by a unique ID
};

export let activeMapId = null; // ID of the currently active/visible map

// --- Helper function to get the active map object ---
export const getActiveMap = () => {
    return project.maps && activeMapId ? project.maps[activeMapId] : null;
};

// --- State Update Functions ---
export const setState = (newState) => {
    if (newState.terrains !== undefined) terrains = newState.terrains;
    if (newState.assetManifest !== undefined) assetManifest = newState.assetManifest;
    if (newState.apiKey !== undefined) apiKey = newState.apiKey;
    if (newState.project !== undefined) project = newState.project;
    if (newState.activeMapId !== undefined) activeMapId = newState.activeMapId;
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
