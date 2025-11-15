/*
 * Filename: auth.js
 * Description: Shared module for Firebase Initialization and Authentication.
 * This module centralizes the Firebase configuration and user session management
 * so that any page can easily include consistent login/logout functionality.
 */

// Import necessary functions from the Firebase SDKs.
// Using the modular SDK allows for smaller bundle sizes by only importing what's needed.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Your web app's Firebase configuration.
// This is copied from your dbm.html file to be used across the entire application.
const firebaseConfig = {
  apiKey: "AIzaSyBA1CC4SXXtWM9UpU1XkAiBFr0RIgrPwGk",
  authDomain: "tangent-rpg-dbm.firebaseapp.com",
  projectId: "tangent-rpg-dbm",
  storageBucket: "tangent-rpg-dbm.appspot.com",
  messagingSenderId: "559983787369",
  appId: "1:559983787369:web:d6f3b87daaa82b23d211f8",
  measurementId: "G-G6NC09PXPC"
};

// Initialize Firebase and get the Auth service instance.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Initiates the Google Sign-In popup flow.
 * This is an async function as it involves a network request and user interaction.
 */
async function handleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // After a successful sign-in, the onAuthStateChanged listener will automatically
        // detect the change and update the UI. No manual UI update is needed here.
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        alert("Could not sign in with Google. Please check the console for details.");
    }
}

/**
 * Signs the current user out of the application.
 */
async function handleLogout() {
    try {
        await signOut(auth);
        // onAuthStateChanged will handle the UI update after logout.
    } catch (error)        {
        console.error("Error signing out:", error);
        alert("An error occurred while signing out.");
    }
}

/**
 * Renders the authentication status (login/logout button and user info) into a specified container element.
 * This function is designed to be reusable across different pages.
 * @param {HTMLElement} containerElement The DOM element to render the auth status into.
 * @param {string} buttonClass A CSS class to apply to the buttons for page-specific styling.
 */
function renderAuthStatus(containerElement, buttonClass = 'auth-button') {
    if (!containerElement) {
        console.error("Auth status container not found.");
        return;
    }

    // onAuthStateChanged is the core listener for Firebase Auth.
    // It triggers whenever the user's sign-in state changes.
    onAuthStateChanged(auth, (user) => {
        containerElement.innerHTML = ''; // Clear previous content to prevent duplicates.

        if (user && !user.isAnonymous) {
            // If a user is signed in (and not an anonymous user), display their email and a logout button.
            const userInfo = document.createElement('div');
            userInfo.className = 'flex items-center gap-2 sm:gap-4';
            userInfo.innerHTML = `
                <span class="text-xs sm:text-sm text-gray-300 truncate" title="${user.email}">${user.email}</span>
                <button id="logout-button" class="${buttonClass}">Logout</button>
            `;
            containerElement.appendChild(userInfo);
            // Attach the event listener to the newly created logout button.
            document.getElementById('logout-button').addEventListener('click', handleLogout);
        } else {
            // If the user is not signed in, display a login button.
            const loginButton = document.createElement('button');
            loginButton.id = 'login-button';
            loginButton.className = buttonClass;
            loginButton.textContent = 'Login';
            containerElement.appendChild(loginButton);
            // Attach the event listener to the newly created login button.
            document.getElementById('login-button').addEventListener('click', handleLogin);
        }
    });

    // This second listener ensures that there's always a user session.
    // If no user is logged in, it creates an anonymous session. This is crucial
    // for Firebase security rules that may require some form of authentication
    // (e.g., allow read: if request.auth != null;).
    onAuthStateChanged(auth, user => {
        if (!user) {
            signInAnonymously(auth).catch(err => {
                console.error("Anonymous sign-in failed:", err);
            });
        }
    });
}

// Export the render function to make it accessible to other modules via `import`.
export { renderAuthStatus };
