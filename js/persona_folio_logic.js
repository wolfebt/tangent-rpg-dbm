
// js/persona_folio_logic.js

// Import the tools we need from our modules
import { openModal, showError, closeModal } from './ui.js';
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { db } from './firebase.js';
import { appState } from './main_dbm.js';

// Character data - in a real app, this would be loaded from Firestore
const characterData = {
    name: "Jax Kaelen",
    species: { id: "docIdForHuman", name: "Human" },
    origin: { id: "docIdForColonist", name: "Colonist" },
    // Add more character data as needed
    attributes: {
        strength: 12,
        agility: 14,
        intellect: 16,
        perception: 13,
        willpower: 15,
        fellowship: 11
    },
    skills: [],
    features: [],
    equipment: []
};

// Function to render the main folio content
function renderFolio() {
    const container = document.getElementById('folio-container');
    if (!container) {
        console.error('Folio container not found');
        return;
    }

    container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Character Header -->
            <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h1 class="text-4xl font-bold mb-4">${characterData.name}</h1>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center justify-between">
                        <span class="text-lg"><strong>Species:</strong> ${characterData.species.name}</span>
                        <button id="edit-species-btn" class="btn btn-secondary !py-1 !text-xs">Manage</button>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-lg"><strong>Origin:</strong> ${characterData.origin.name}</span>
                        <button id="edit-origin-btn" class="btn btn-secondary !py-1 !text-xs">Manage</button>
                    </div>
                </div>
            </div>

            <!-- Attributes Section -->
            <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h2 class="text-2xl font-bold mb-4">Attributes</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    ${Object.entries(characterData.attributes).map(([attr, value]) => `
                        <div class="text-center p-2 bg-gray-700 rounded">
                            <div class="text-sm uppercase text-gray-400">${attr}</div>
                            <div class="text-xl font-bold">${value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h2 class="text-2xl font-bold mb-4">Quick Actions</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button id="manage-skills-btn" class="btn btn-primary">Manage Skills</button>
                    <button id="manage-features-btn" class="btn btn-primary">Manage Features</button>
                    <button id="manage-equipment-btn" class="btn btn-primary">Manage Equipment</button>
                    <button id="view-rules-btn" class="btn btn-primary">View Rules</button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners for database interactions
    setupEventListeners();
}

function setupEventListeners() {
    // Species management
    const speciesBtn = document.getElementById('edit-species-btn');
    if (speciesBtn) {
        speciesBtn.onclick = async () => {
            await openDatabaseEntry('species', characterData.species.id);
        };
    }

    // Origin management
    const originBtn = document.getElementById('edit-origin-btn');
    if (originBtn) {
        originBtn.onclick = async () => {
            await openDatabaseEntry('origins', characterData.origin.id);
        };
    }

    // Skills management
    const skillsBtn = document.getElementById('manage-skills-btn');
    if (skillsBtn) {
        skillsBtn.onclick = () => {
            navigateToManager('skills');
        };
    }

    // Features management
    const featuresBtn = document.getElementById('manage-features-btn');
    if (featuresBtn) {
        featuresBtn.onclick = () => {
            navigateToManager('features');
        };
    }

    // Equipment management
    const equipmentBtn = document.getElementById('manage-equipment-btn');
    if (equipmentBtn) {
        equipmentBtn.onclick = () => {
            navigateToManager('equipment');
        };
    }

    // Rules viewer
    const rulesBtn = document.getElementById('view-rules-btn');
    if (rulesBtn) {
        rulesBtn.onclick = () => {
            navigateToManager('rules_codex');
        };
    }
}

// Function to open a specific database entry for editing
async function openDatabaseEntry(collection, docId) {
    try {
        const docRef = doc(db, `artifacts/default-tangent-rpg-app/public/data/${collection}`, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Set the context for the modal
            appState.currentCollection = collection;
            appState.currentSubcollection = null;
            
            // Open the modal with the data
            await openModal(docId, docSnap.data(), true);
        } else {
            showError(`${collection} data not found!`);
        }
    } catch (error) {
        console.error('Error loading database entry:', error);
        showError('Failed to load database entry. Please try again.');
    }
}

// Function to navigate to the database manager for a specific category
function navigateToManager(category) {
    // Store current context
    sessionStorage.setItem('folio_return', 'true');
    sessionStorage.setItem('folio_character', JSON.stringify(characterData));
    
    // Navigate to the database manager
    window.location.href = `index.html?category=${category}`;
}

// Function to load character data (placeholder for future database integration)
async function loadCharacterData(characterId) {
    // This would load from Firestore in a real implementation
    // For now, we use the hardcoded data
    return characterData;
}

// Function to save character data (placeholder for future database integration)
async function saveCharacterData(data) {
    // This would save to Firestore in a real implementation
    try {
        // Placeholder for save logic
        console.log('Saving character data:', data);
        return true;
    } catch (error) {
        console.error('Error saving character data:', error);
        return false;
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load character data if needed
        const urlParams = new URLSearchParams(window.location.search);
        const characterId = urlParams.get('character');
        
        if (characterId) {
            // Load specific character
            await loadCharacterData(characterId);
        }

        // Render the folio
        renderFolio();

        // Check if returning from database manager
        if (sessionStorage.getItem('folio_return') === 'true') {
            sessionStorage.removeItem('folio_return');
            // Optionally reload character data here
        }
    } catch (error) {
        console.error('Error initializing persona folio:', error);
        showError('Failed to initialize persona folio. Please refresh the page.');
    }
});

// Vertex AI integration helper
async function callVertexAI(prompt) {
    try {
        // In a production environment, this would be handled by a backend service
        // For now, this is a placeholder for AI-powered features
        console.log('Vertex AI call:', prompt);
        return 'AI response placeholder';
    } catch (error) {
        console.error('Vertex AI error:', error);
        throw error;
    }
}

// Export functions for use by other modules if needed
export { renderFolio, loadCharacterData, saveCharacterData, callVertexAI };
