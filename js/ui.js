
import { categoryConfig, masterFieldOrder } from './config.js';
import { getCollectionOptions, listenForData } from './api.js';
import { appState, getActiveConfig } from './main_dbm.js';

export function navigateTo(renderFunction) { 
    if (typeof renderFunction === 'function') {
        renderFunction();
    }
}

export async function openModal(docId, data, isEditMode = false) {
    const modal = document.getElementById('entry-modal');
    const modalTitle = document.getElementById('modal-title');
    const formFields = document.getElementById('form-fields');
    
    if (modal && modalTitle && formFields) {
        modalTitle.textContent = isEditMode ? 'Edit Entry' : 'View Entry';
        
        // Clear existing form fields
        formFields.innerHTML = '';
        
        // Get current config
        const config = getActiveConfig();
        if (config && config.fields) {
            Object.entries(config.fields).forEach(([fieldKey, fieldConfig]) => {
                const fieldValue = data?.[fieldKey] || '';
                const fieldHTML = createFormField(fieldKey, fieldConfig, fieldValue, isEditMode);
                formFields.innerHTML += fieldHTML;
            });
        }
        
        modal.classList.remove('hidden');
    }
}

export function showError(message) {
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    if (errorModal && errorMessage) {
        errorMessage.textContent = message;
        errorModal.classList.remove('hidden');
    } else {
        alert(message);
    }
}

export function closeModal() {
    const modals = document.querySelectorAll('.modal-backdrop');
    modals.forEach(modal => modal.classList.add('hidden'));
}

export function createTextField(fieldKey, savedValue = '', isRequired = false) {
    return `<input type="text" id="${fieldKey}" name="${fieldKey}" value="${savedValue}" class="global-form-input" ${isRequired ? 'required' : ''}>`;
}

export function createFormField(fieldKey, fieldConfig, savedValue = '', isEditMode = true) {
    const label = fieldConfig.label || fieldKey;
    const isRequired = fieldConfig.required || false;
    
    let fieldHTML = '';
    
    switch (fieldConfig.type) {
        case 'text':
            fieldHTML = createTextField(fieldKey, savedValue, isRequired);
            break;
        case 'textarea':
            fieldHTML = `<textarea id="${fieldKey}" name="${fieldKey}" class="global-form-input" rows="4" ${isRequired ? 'required' : ''}>${savedValue}</textarea>`;
            break;
        case 'number':
            fieldHTML = `<input type="number" id="${fieldKey}" name="${fieldKey}" value="${savedValue}" class="global-form-input" ${isRequired ? 'required' : ''}>`;
            break;
        case 'select':
            const options = fieldConfig.options || [];
            fieldHTML = `<select id="${fieldKey}" name="${fieldKey}" class="global-form-input form-select-arrow" ${isRequired ? 'required' : ''}>
                <option value="">Select ${label}</option>
                ${options.map(option => `<option value="${option}" ${savedValue === option ? 'selected' : ''}>${option}</option>`).join('')}
            </select>`;
            break;
        default:
            fieldHTML = createTextField(fieldKey, savedValue, isRequired);
    }
    
    return `
        <div class="space-y-2">
            <label class="global-form-label" for="${fieldKey}">${label.toUpperCase()}</label>
            ${fieldHTML}
        </div>
    `;
}

export function renderCategoryView(category) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const config = categoryConfig[category];
    if (!config) {
        showError(`Category '${category}' not found`);
        return;
    }
    
    appState.currentCollection = category;
    
    mainContent.innerHTML = `
        <header class="app-header flex justify-between items-center gap-4">
            <div class="flex-1">
                <button id="back-btn" class="btn btn-secondary">Back</button>
            </div>
            <div class="text-center px-4">
                <h1 class="text-xl font-bold text-gray-100 whitespace-nowrap">TANGENT SFF RPG</h1>
                <p class="text-xs text-gray-400 uppercase">${config.label}</p>
            </div>
            <div class="flex-1"></div>
        </header>
        <main class="w-full pt-16">
            <div id="content-area" class="p-4 md:p-8">
                <div class="max-w-4xl mx-auto">
                    <h2 class="text-3xl font-bold mb-6">${config.label}</h2>
                    <div id="category-content">
                        Loading...
                    </div>
                </div>
            </div>
        </main>
    `;
    
    // Add event listeners
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = 'index.html';
        };
    }
}
