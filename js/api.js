// js/api.js
import { db } from './firebase.js';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { appState } from './main_dbm.js';

export async function getCollectionOptions(collectionName) {
    try {
        const collectionRef = collection(db, `artifacts/default-tangent-rpg-app/public/data/${collectionName}`);
        const snapshot = await getDocs(collectionRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting collection options:', error);
        return [];
    }
}

export function listenForData(subcollection) {
    const collectionPath = `artifacts/default-tangent-rpg-app/public/data/${appState.currentCollection}/${subcollection}`;

    return onSnapshot(collection(db, collectionPath), (snapshot) => {
        const entries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Update app state
        appState.entries.set(subcollection, entries);

        // Update UI
        renderDataTable(subcollection, entries);
    }, (error) => {
        console.error('Error listening for data:', error);
    });
}

function renderDataTable(subcollection, entries) {
    const tableBody = document.getElementById(`table-body-${subcollection}`);
    if (tableBody) {
        tableBody.innerHTML = entries.map(entry => `
            <tr onclick="openEntryModal('${entry.id}', '${subcollection}')">
                <td class="px-6 py-4">${entry.name || 'Unnamed'}</td>
                <td class="px-6 py-4">${entry.description || ''}</td>
            </tr>
        `).join('');
    }
}