import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// --- Firebase Configuration ---
// NOTE: This assumes firebaseConfig and appId are available globally or are replaced during a build step.
// For a real-world scenario, you might use environment variables.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { apiKey: "YOUR_API_KEY", authDomain: "...", projectId: "..." };
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-tangent-rpg-app';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- State Management ---
const folioState = {
    docId: null,
    initialData: null,
    isDirty: false
};

// --- Main Initialization ---
window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    folioState.docId = urlParams.get('id');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (folioState.docId) {
                const docRef = doc(db, `artifacts/${appId}/public/data/persona_folio`, folioState.docId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    renderPersonaFolioView(document.getElementById('folio-container'), docSnap.data());
                } else {
                    showError("Persona Folio not found.");
                    renderPersonaFolioView(document.getElementById('folio-container'), {});
                }
            } else {
                // New character
                renderPersonaFolioView(document.getElementById('folio-container'), {});
            }
        } else {
            // Sign in anonymously if no user
            await signInAnonymously(auth);
        }
    });
};

// --- DOM Rendering and Logic (All your folio functions go here) ---

function renderPersonaFolioView(container, folioData = {}) {
    // This is the main function that builds the character sheet's HTML
    container.innerHTML = `
        <div class="persona-folio-container">
            <form id="persona-folio-form" onsubmit="return false;">
                 <header class="sheet-header">
                    <div class="actor-display">
                        <div id="actor-display-header">PERSONA FOLIO</div>
                    </div>
                    <h1>Tangent SFF RPG</h1>
                    <div class="file-menu">
                        <button type="button" class="file-menu-button">DATA</button>
                        <div class="file-menu-dropdown">
                            <button type="button" id="save-to-db-btn">Save to Database</button>
                            <button type="button" id="local-save-btn">Save to File</button>
                            <button type="button" id="local-load-btn">Load from File</button>
                            <button type="button" id="back-to-manager-btn">Back to Manager</button>
                        </div>
                    </div>
                </header>
                
                 <section class="main-section" id="bio-section">
                    <fieldset><legend>Bio</legend>
                        <div class="space-y-4">
                            <div class="input-group"><label for="char-name">Name</label><input type="text" id="char-name" name="char-name"></div>
                            <div class="input-group"><label for="char-concept">Concept</label><input type="text" id="char-concept" name="char-concept"></div>
                            <div class="input-group"><label for="char-species">Species</label><input type="text" id="char-species" name="char-species" data-collection="species" readonly class="cursor-pointer" placeholder="-- SELECT --"></div>
                            <div class="input-group"><label for="char-occu">Occupation</label><input type="text" id="char-occu" name="char-occu" data-collection="occupations" readonly class="cursor-pointer" placeholder="-- SELECT --"></div>
                            <div class="input-group"><label for="char-origin">Origin</label><input type="text" id="char-origin" name="char-origin" data-collection="origins" readonly class="cursor-pointer" placeholder="-- SELECT --"></div>
                            <div class="input-group"><label for="char-faction">Faction</label><input type="text" id="char-faction" name="char-faction" data-collection="factions" readonly class="cursor-pointer" placeholder="-- SELECT --"></div>
                        </div>
                    </fieldset>
                    <fieldset><legend>Facade</legend>
                        <div class="space-y-4">
                            <div class="input-group"><label for="char-age">Age</label><input type="text" id="char-age" name="char-age"></div>
                            <div class="input-group"><label for="char-gender">Gender</label><input type="text" id="char-gender" name="char-gender"></div>
                            <div class="input-group"><label for="char-height">Height</label><input type="text" id="char-height" name="char-height"></div>
                            <div class="input-group"><label for="char-weight">Weight</label><input type="text" id="char-weight" name="char-weight"></div>
                            <div class="input-group"><label for="char-style">Description / Style</label><textarea id="char-style" name="char-style" rows="2"></textarea></div>
                            <div class="input-group"><label for="char-motive">Personality / Motive</label><textarea id="char-motive" name="char-motive" rows="2"></textarea></div>
                        </div>
                    </fieldset>
                </section>
                
                </form>
        </div>
    `;

    // Attach event listeners...
    attachFolioEventListeners();

    // Populate form with data
    initializePersonaFolio(folioData);
}

function attachFolioEventListeners() {
    // ... all your event listener setup code ...
}

function initializePersonaFolio(folioData) {
    // ... your logic to populate the form and calculate values ...
}

// ... All other helper functions from your standalone file (calculate*, render*, show*Modal, etc.) ...
// Make sure to adapt any data fetching to use the main getCollectionOptions function below.

async function getCollectionOptions(collectionName) {
    const collectionPath = `artifacts/${appId}/public/data/${collectionName}`;
    try {
        const querySnapshot = await getDocs(collection(db, collectionPath));
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a,b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
        console.error(`Error getting options from ${collectionName}:`, error);
        showError(`Could not load options for ${collectionName}.`);
        return [];
    }
}

// Global UI functions adapted for this page
function showError(message) { 
    const el = document.getElementById('error-message');
    if (el) el.textContent = message.toUpperCase();
    document.getElementById('error-modal')?.classList.remove('hidden'); 
}
// etc.
