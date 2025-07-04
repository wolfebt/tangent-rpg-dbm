// This is a Node.js script to seed your Firestore database.
// Run it once from your terminal using `node seed.js`.

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";

// IMPORTANT: Replace this with your actual Firebase config object
const firebaseConfig = { 
    apiKey: "YOUR_API_KEY", 
    authDomain: "YOUR_AUTH_DOMAIN", 
    projectId: "YOUR_PROJECT_ID",
    // ... add the rest of your config properties
};
const appId = 'default-tangent-rpg-app'; // Or your specific App ID

// This is the mock database from your original file.
const mockDatabase = {
    // ... PASTE THE ENTIRE mockDatabase OBJECT HERE ...
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
    console.log("Starting database seed...");

    for (const collectionName in mockDatabase) {
        if (collectionName === 'directory') continue; // Skip the directory object

        console.log(`Seeding collection: ${collectionName}...`);
        const items = mockDatabase[collectionName];
        const collectionPath = `artifacts/${appId}/public/data/${collectionName}`;
        
        for (const item of items) {
            try {
                // Use setDoc with a specific ID if it exists, otherwise let Firestore generate one.
                if (item.id) {
                    const docRef = doc(db, collectionPath, item.id);
                    await setDoc(docRef, item);
                } else {
                    await addDoc(collection(db, collectionPath), item);
                }
            } catch (error) {
                console.error(`Error adding document to ${collectionName}:`, item, error);
            }
        }
        console.log(`... finished seeding ${collectionName}.`);
    }

    console.log("Database seeding complete!");
}

seedDatabase().catch(console.error);
