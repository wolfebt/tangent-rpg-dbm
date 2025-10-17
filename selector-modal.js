let allItemsCache = new Map();
let currentConfig = null;
let currentModalState = {};
let currentTargetFieldKey = null;

let db; // Firestore instance
let getCollectionOptions; // Function from dbm.html

const modalElement = document.getElementById('selector-modal');
const modalTitle = document.getElementById('selector-modal-title');
const availableList = document.getElementById('selector-available-list');
const searchInput = document.getElementById('selector-search-input');
const selectionListsContainer = document.getElementById('selector-lists-container');
const saveBtn = document.getElementById('selector-save-btn');
const cancelBtn = document.getElementById('selector-cancel-btn');

export function initializeModal(firestoreInstance, getCollectionOptionsFunc) {
    db = firestoreInstance;
    getCollectionOptions = getCollectionOptionsFunc;

    cancelBtn.addEventListener('click', () => modalElement.classList.add('hidden'));
    saveBtn.addEventListener('click', saveModalState);
    searchInput.addEventListener('input', renderLists);
}

export async function openSelectorModal(config, targetFieldKey, currentDataString) {
    currentConfig = config;
    currentTargetFieldKey = targetFieldKey;

    try {
        currentModalState = JSON.parse(currentDataString || '{}');
    } catch (e) {
        console.error("Error parsing selector data, resetting.", e);
        currentModalState = {};
    }

    modalTitle.textContent = config.title;

    if (!allItemsCache.has(config.source)) {
        availableList.innerHTML = '<div class="loader"></div>';
        const items = await getCollectionOptions(config.source);
        allItemsCache.set(config.source, items);
    }

    searchInput.value = '';
    renderLists();
    modalElement.classList.remove('hidden');
}

function renderLists() {
    const sourceItems = allItemsCache.get(currentConfig.source) || [];
    const searchTerm = searchInput.value.toLowerCase();

    // Clear previous lists
    availableList.innerHTML = '';
    selectionListsContainer.innerHTML = '';

    const allSelectedIds = new Set();

    // Create and render selection lists (e.g., Granted, Recommended)
    currentConfig.selectionTypes.forEach(type => {
        if (!currentModalState[type.id]) {
            currentModalState[type.id] = [];
        }

        const listContainer = document.createElement('div');
        listContainer.className = 'bg-gray-800 p-4 rounded-lg flex flex-col';

        let headerHTML = `<h3 class="text-lg font-bold mb-2">${type.label}</h3>`;
        if (type.hasPoolPoints) {
             headerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-bold">${type.label}</h3>
                    <div class="flex items-center gap-2">
                        <label class="text-sm">Points:</label>
                        <input type="number" id="${type.id}-pool-points" class="global-form-input !w-20" value="${currentModalState[type.id + 'PoolPoints'] || 0}">
                    </div>
                </div>`;
        }
        listContainer.innerHTML = headerHTML;

        const listEl = document.createElement('div');
        listEl.className = 'flex-grow overflow-y-auto min-h-[200px]';
        listEl.id = `${type.id}-list`;

        currentModalState[type.id].forEach(item => {
            allSelectedIds.add(item.id);
            listEl.appendChild(createItemElement(item, 'selected', type));
        });

        listContainer.appendChild(listEl);
        selectionListsContainer.appendChild(listContainer);
    });

    // Render available list
    sourceItems
        .filter(item => !allSelectedIds.has(item.id))
        .filter(item => item.name.toLowerCase().includes(searchTerm))
        .forEach(item => {
            availableList.appendChild(createItemElement(item, 'available'));
        });
}

function createItemElement(item, state, selectionType = null) {
    const itemEl = document.createElement('div');
    itemEl.className = 'p-2 rounded-md bg-gray-700 mb-2 flex flex-col text-sm';

    const header = document.createElement('div');
    header.className = 'flex justify-between items-center';

    let nameContent = item.name;
    if (selectionType && selectionType.showCost) {
        const cp = item.cp ? Number(item.cp) : 0;
        const recommendedCp = Math.max(1, cp - 1);
        const cpText = `(Cost: <s class="text-red-400">${cp}</s> ${recommendedCp} CP)`;
        nameContent += ` <span class="text-xs text-gray-400">${cpText}</span>`;
    }
    header.innerHTML = `<span>${nameContent}</span>`;

    const buttons = document.createElement('div');
    buttons.className = 'flex gap-1';

    if (state === 'available') {
        currentConfig.selectionTypes.forEach(type => {
            const addBtn = document.createElement('button');
            addBtn.textContent = type.addBtnLabel;
            addBtn.className = 'btn !py-0 !px-1 !text-xs btn-primary';
            addBtn.onclick = () => moveItem(item, type.id, 'available');
            buttons.appendChild(addBtn);
        });
    } else { // 'selected'
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'btn !py-0 !px-1 !text-xs btn-danger';
        removeBtn.onclick = () => moveItem(item, 'available', selectionType.id);
        buttons.appendChild(removeBtn);
    }

    header.appendChild(buttons);
    itemEl.appendChild(header);

    if (state === 'selected' && selectionType.hasModifier) {
        const modifierInput = document.createElement('input');
        modifierInput.type = 'number';
        modifierInput.className = 'global-form-input !text-xs !py-1 mt-2';
        modifierInput.placeholder = 'Modifier (e.g., +2)';
        modifierInput.value = item.modifier || '';
        modifierInput.onchange = (e) => {
            const itemIndex = currentModalState[selectionType.id].findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
                currentModalState[selectionType.id][itemIndex].modifier = e.target.value;
            }
        };
        itemEl.appendChild(modifierInput);
    }
     if (state === 'selected' && selectionType.hasBonus) {
        const bonusInput = document.createElement('input');
        bonusInput.type = 'number';
        bonusInput.className = 'global-form-input !text-xs !py-1 mt-2';
        bonusInput.placeholder = 'Bonus (e.g., +1)';
        bonusInput.value = item.bonus || '';
        bonusInput.onchange = (e) => {
            const itemIndex = currentModalState[selectionType.id].findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
                currentModalState[selectionType.id][itemIndex].bonus = e.target.value;
            }
        };
        itemEl.appendChild(bonusInput);
    }

    return itemEl;
}

function moveItem(item, toListId, fromListId) {
    // Remove from all lists first to prevent duplicates
    currentConfig.selectionTypes.forEach(type => {
        currentModalState[type.id] = (currentModalState[type.id] || []).filter(i => i.id !== item.id);
    });

    // Add to the target list if it's not 'available'
    if (toListId !== 'available') {
        if (!currentModalState[toListId]) {
            currentModalState[toListId] = [];
        }
        currentModalState[toListId].push(item);
    }

    renderLists();
}

function saveModalState() {
    if (currentTargetFieldKey) {
        const textarea = document.getElementById(currentTargetFieldKey);
        const displayInput = textarea.parentElement.querySelector('input');

        // Handle pool points
        currentConfig.selectionTypes.forEach(type => {
            if (type.hasPoolPoints) {
                const poolInput = document.getElementById(`${type.id}-pool-points`);
                currentModalState[type.id + 'PoolPoints'] = Number(poolInput.value) || 0;
            }
        });

        textarea.value = JSON.stringify(currentModalState);

        if(displayInput) {
            displayInput.value = currentConfig.summary(currentModalState);
        }
    }
    modalElement.classList.add('hidden');
}