// Version 4.45 - Implemented Phase 3, Part 2: Auto-Save & Recovery
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    // ... (all UI element declarations)

    // --- Local State ---
    // ... (all local state variables)
    let autoSaveInterval = null;


    // --- Auto-Save & Recovery Functions (NEW & REFACTORED) ---

    /**
     * Periodically saves the entire project state to localStorage.
     */
    function autoSaveProject() {
        if (!state.project || !state.activeMapId) return; // Don't save an empty project

        try {
            // Create a serializable version of the project
            const serializableProject = JSON.parse(JSON.stringify(state.project));
            for (const mapId in serializableProject.maps) {
                serializableProject.maps[mapId].layers.forEach((layer, index) => {
                    const originalLayer = state.project.maps[mapId].layers[index];
                    if (originalLayer.backgroundImage) {
                        layer.backgroundImageSrc = originalLayer.backgroundImage.src;
                        delete layer.backgroundImage; // Remove non-serializable object
                    }
                });
            }

            localStorage.setItem('mapMakerAutoSave', JSON.stringify(serializableProject));
            state.showToast("Project auto-saved.", "info", 2000); // Shorter duration for auto-save
        } catch (error) {
            console.error("Auto-save failed:", error);
            state.showToast("Auto-save failed. Check console for details.", "error");
        }
    }

    /**
     * Checks for an auto-saved session on startup and prompts the user to restore it.
     */
    function checkForRecovery() {
        const savedSession = localStorage.getItem('mapMakerAutoSave');
        if (!savedSession) return;

        try {
            const recoveredProject = JSON.parse(savedSession);

            const onRestore = () => {
                // Re-hydrate image backgrounds
                for (const mapId in recoveredProject.maps) {
                    recoveredProject.maps[mapId].layers.forEach(layer => {
                        if (layer.backgroundImageSrc) {
                            const img = new Image();
                            img.src = layer.backgroundImageSrc;
                            layer.backgroundImage = img;
                            // Redraw will be handled by the final state update
                        }
                    });
                }

                // Set the recovered project as the current state
                state.setState({ 
                    project: recoveredProject,
                    activeMapId: Object.keys(recoveredProject.maps)[0] || null 
                });
                
                // Redraw everything with the new state
                drawAll();
                // renderLayers(); // This should be called to update the UI
                state.showToast("Session restored successfully.", "info");
                localStorage.removeItem('mapMakerAutoSave');
            };

            const onDiscard = () => {
                localStorage.removeItem('mapMakerAutoSave');
                state.showToast("Previous session discarded.", "info");
            };

            state.showRecoveryModal(onRestore, onDiscard);

        } catch (error) {
            console.error("Failed to recover session:", error);
            localStorage.removeItem('mapMakerAutoSave'); // Clear corrupted data
        }
    }


    // --- Initialization ---
    async function initialize() {
        // ... (other initialization logic)
        
        // This now happens before creating a new blank map
        checkForRecovery(); 
        
        if (autoSaveInterval) clearInterval(autoSaveInterval);
        autoSaveInterval = setInterval(autoSaveProject, 60000); // 60 seconds
    }
    
    // ... (rest of the file)
    
    initialize();
});
