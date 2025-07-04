
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { navigateTo, renderCategoryView } from './ui.js';
import { categoryConfig } from './config.js';

// --- Application State ---
export const appState = {
    userId: null,
    currentCollection: null,
    currentSubcollection: null,
    currentWikiEntryId: null,
    wikiEntries: [],
    entries: new Map(),
    hasUnsavedChanges: false,
    navigationContext: null
};

export function getActiveConfig() {
    if (appState.currentSubcollection) {
        return categoryConfig[appState.currentCollection]?.subcategories?.[appState.currentSubcollection];
    }
    return categoryConfig[appState.currentCollection];
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            appState.userId = user.uid;
            navigateTo(() => renderCategoryView('other'));
        } else {
            // Handle unauthenticated state
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="flex items-center justify-center min-h-screen">
                        <div class="text-center">
                            <h1 class="text-2xl font-bold mb-4">Please sign in to continue</h1>
                            <button id="sign-in-btn" class="btn btn-primary">Sign In</button>
                        </div>
                    </div>
                `;
            }
        }
    });
});
