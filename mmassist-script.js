// Version 4.31 - Added AI Processing Feedback
import * as state from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const aiLayoutPrompt = document.getElementById('aiLayoutPrompt');
    const generateLayoutBtn = document.getElementById('generateLayoutBtn');
    const aiDressingPrompt = document.getElementById('aiDressingPrompt');
    const dressAreaBtn = document.getElementById('dressAreaBtn');
    const aiDataEditPrompt = document.getElementById('aiDataEditPrompt');
    const applyAiDataEditBtn = document.getElementById('applyAiDataEditBtn');
    const aiHexcrawlPrompt = document.getElementById('aiHexcrawlPrompt');
    const hexcrawlHexCount = document.getElementById('hexcrawlHexCount');
    const generateHexcrawlBtn = document.getElementById('generateHexcrawlBtn');
    const aiPointcrawlPrompt = document.getElementById('aiPointcrawlPrompt');
    const generatePointcrawlBtn = document.getElementById('generatePointcrawlBtn');
    const generateKeyBtn = document.getElementById('generateKeyBtn');
    const dungeonKeyModal = document.getElementById('dungeonKeyModal');
    const keyModalCloseBtn = document.getElementById('keyModalCloseBtn');
    const dungeonKeyContent = document.getElementById('dungeonKeyContent');

    // --- AI and Helper Functions ---
    
    // NEW: Helper to manage loading state of AI buttons
    function setAILoadingState(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');
        
        if (isLoading) {
            button.disabled = true;
            btnText.style.opacity = '0.5';
            spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            btnText.style.opacity = '1';
            spinner.classList.add('hidden');
        }
    }

    async function handleGenerateLayout() {
        // ... (existing logic)
        setAILoadingState(generateLayoutBtn, true);
        try {
            // ... (existing API call logic)
        } catch (error) {
            // ... (existing error handling)
        } finally {
            setAILoadingState(generateLayoutBtn, false);
        }
    }
    
    // ... (All other handle... functions for AI buttons should be wrapped similarly) ...

    function buildContextualPrompt(userPrompt, actionType, additionalContext = {}) {
        // ... (this function is unchanged)
    }
    
    // ... (ingest functions and analyzeMapForRooms are unchanged)

    // Add event listeners
    generateLayoutBtn.addEventListener('click', handleGenerateLayout);
    // ... (add listeners for all other AI buttons, pointing to their respective handle... functions)
});
