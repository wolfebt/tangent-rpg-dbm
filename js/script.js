import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signOut, 
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    GoogleAuthProvider, signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, collection, addDoc, deleteDoc, updateDoc, getDocs, getDoc, setDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// --- Firebase Configuration ---
// IMPORTANT: Replace this with your actual Firebase config object
const firebaseConfig = { 
    apiKey: "YOUR_API_KEY", 
    authDomain: "YOUR_AUTH_DOMAIN", 
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
const appId = 'default-tangent-rpg-app'; // Or your specific App ID

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Application State ---
// (The appState object and RPG System Configuration remain the same as in the original file)
const appState = {
    userId: null,
    userEmail: null,
    isAnonymous: true,
    currentCollection: null,
    currentSubcollection: null,
    editingDocId: null,
    confirmCallback: null,
    initialFormState: null,
    pendingNavigation: null,
    navigationContext: null,
    currentFolioData: null,
    activeFormForLoad: null,
    activeEquipmentTab: 'armoring',
    navigationHistory: [],
    currentView: null,
    searchTerm: '',
    sortBy: 'name',
    sortDirection: 'asc',
    wikiEntries: [],
    currentWikiEntryId: null,
};

// --- RPG System Configuration (categoryConfig, masterFieldOrder) ---
// (This large configuration object is unchanged and should be copied here from the original file)
const categoryConfig = {
    // ... PASTE THE ENTIRE categoryConfig OBJECT HERE ...
};
const masterFieldOrder = [
    // ... PASTE THE ENTIRE masterFieldOrder ARRAY HERE ...
];


// --- UI Elements (unchanged) ---
// (All getElementById variables remain the same)


// --- Authentication & Navigation ---
let currentRenderFn = null;

// (navigateTo, goBack, requestNavigation functions are unchanged)

onAuthStateChanged(auth, (user) => {
    if (user) {
        appState.userId = user.uid;
        appState.userEmail = user.email;
        appState.isAnonymous = user.isAnonymous;
        
        updateAuthUI(user);
        
        if (!currentRenderFn) {
            navigateTo(() => renderCategoryView('other'));
        }
    } else {
        appState.userId = null;
        appState.userEmail = null;
        appState.isAnonymous = true;
        updateAuthUI(null);
        renderLoginView(); // Show login view if not authenticated
    }
});

function updateAuthUI(user) {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    if (user && !user.isAnonymous) {
        authContainer.innerHTML = `
            <div class="text-right">
                <p class="text-sm text-gray-300">${user.email}</p>
                <button id="logout-btn" class="text-xs text-red-400 hover:underline">Logout</button>
            </div>
        `;
        document.getElementById('logout-btn').onclick = () => signOut(auth);
    } else {
        authContainer.innerHTML = `
            <button id="login-btn" class="btn btn-primary">Login</button>
        `;
        document.getElementById('login-btn').onclick = showLoginModal;
    }
}

function renderLoginView() {
    mainContentContainer.innerHTML = '';
     mainContentContainer.innerHTML = `
        <div class="h-screen w-screen flex flex-col justify-center items-center p-8">
            <h1 class="text-4xl font-bold text-gray-100">Tangent SFF RPG</h1>
            <p class="text-lg text-gray-400 uppercase mb-8">Database Manager</p>
            <div class="flex gap-4">
                 <button id="login-view-login-btn" class="btn btn-primary">Login / Register</button>
            </div>
        </div>
    `;
    document.getElementById('login-view-login-btn').onclick = showLoginModal;
}

function showLoginModal() {
    const modal = document.getElementById('custom-modal');
    document.getElementById('modal-text').textContent = 'AUTHENTICATION';
    
    // Show auth form and hide other elements
    document.getElementById('modal-auth-form').style.display = 'flex';
    document.getElementById('modal-choices').style.display = 'none';
    document.getElementById('modal-input').style.display = 'none';
    document.getElementById('modal-ok-btn').style.display = 'none';

    // Show auth buttons
    document.getElementById('modal-google-btn').style.display = 'inline-block';
    document.getElementById('modal-register-btn').style.display = 'inline-block';
    document.getElementById('modal-login-btn').style.display = 'inline-block';
    document.getElementById('modal-cancel-btn').style.display = 'inline-block';

    // Wire up buttons
    document.getElementById('modal-google-btn').onclick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            modal.classList.add('hidden');
        } catch (error) {
            document.getElementById('modal-error-text').textContent = error.message;
        }
    };
    document.getElementById('modal-login-btn').onclick = async () => {
        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            modal.classList.add('hidden');
        } catch (error) {
            document.getElementById('modal-error-text').textContent = error.message;
        }
    };
    document.getElementById('modal-register-btn').onclick = async () => {
        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            modal.classList.add('hidden');
        } catch (error) {
            document.getElementById('modal-error-text').textContent = error.message;
        }
    };
    document.getElementById('modal-cancel-btn').onclick = () => modal.classList.add('hidden');

    modal.classList.remove('hidden');
}


// --- Data Fetching Logic ---
// IMPORTANT: This function now fetches from Firestore instead of the mock database.
async function getCollectionOptions(collectionName) {
    // Keep special cases
    if (collectionName === 'all_equipment') {
        const equipmentTypes = ['armoring', 'weaponry', 'mecha', 'gear'];
        let allOptions = [];
        for (const type of equipmentTypes) {
            const options = await getCollectionOptions(type);
            allOptions.push({ label: type.toUpperCase(), options });
        }
        return allOptions;
    }
    if (collectionName === 'skills_meta') {
        const allSkills = await getCollectionOptions('skills');
        const metaSkills = allSkills.filter(skill => skill.type === 'meta');
        return [{ name: 'Special Ability'}, ...metaSkills];
    }
    if (collectionName === 'rules_codex') {
        const filteredEntries = appState.wikiEntries.filter(entry => entry.id !== appState.editingDocId);
        return filteredEntries.map(entry => ({ name: entry.name, id: entry.id }));
    }

    // Main Firestore fetch logic
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

// (The rest of the JavaScript logic from dbm.html should be pasted here)
// ...
// ... All other functions (renderCategoryView, openModal, handleFormSubmit, etc.)
// ...

// --- Initial Load ---
window.onload = function() {
    // The onAuthStateChanged listener will handle the initial render
};
