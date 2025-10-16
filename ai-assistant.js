// AI Assistant Module for Tangent SFF RPG Database Manager
// This file contains all functions related to generative AI,
// including text generation and data-aware suggestions.

// --- UTILITIES ---

/**
 * Displays a temporary status message at the bottom of the screen.
 * @param {string} message - The message to display.
 * @param {boolean} [isError=false] - If true, the message will be styled as an error.
 * @param {number} [duration=3000] - How long the message stays on screen in ms.
 */
function showAIStatus(message, isError = false, duration = 3000) {
    let statusEl = document.getElementById('ai-status-message');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'ai-status-message';
        statusEl.style.position = 'fixed';
        statusEl.style.bottom = '20px';
        statusEl.style.left = '50%';
        statusEl.style.transform = 'translateX(-50%)';
        statusEl.style.padding = '10px 20px';
        statusEl.style.borderRadius = '8px';
        statusEl.style.backgroundColor = isError ? '#b71c1c' : '#333333';
        statusEl.style.color = 'white';
        statusEl.style.zIndex = '1000';
        statusEl.style.transition = 'opacity 0.5s';
        statusEl.style.opacity = '0';
        document.body.appendChild(statusEl);
    }

    statusEl.textContent = message.toUpperCase();
    statusEl.style.backgroundColor = isError ? '#b71c1c' : '#333333';
    statusEl.style.opacity = '1';

    setTimeout(() => {
        statusEl.style.opacity = '0';
    }, duration);
}


// --- API CALLING FUNCTIONS ---

/**
 * Calls the Gemini API for text generation.
 * @param {string} prompt - The complete prompt to send to the model.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<string|null>} - The generated text or null on failure.
 */
async function callGeminiAPI(prompt, apiKey) {
    if (!apiKey) {
        showAIStatus("API Key is missing. Please add it in Settings.", true);
        return null;
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
            console.error("Gemini API Error:", errorMessage);
            showAIStatus(`Gemini Error: ${errorMessage}`, true, 5000);
            return null;
        }

        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        showAIStatus(`Network or fetch error: ${error.message}`, true, 5000);
        return null;
    }
}

// --- PROMPT & CONTEXT HELPERS ---

/**
 * Constructs a context string from the current form data.
 * @param {object} data - The form data object.
 * @param {string} categoryKey - The key of the current category.
 * @returns {string} - A formatted string of the entry's data.
 */
function getFormContext(data, categoryKey) {
    let context = `The user is currently working on an entry in the "${categoryKey}" category of their RPG database. Here is the data they have entered so far:\n`;
    for (const [key, value] of Object.entries(data)) {
        if (value && String(value).trim() !== '') {
            const formattedKey = key.replace(/_/g, ' ');
            context += `- ${formattedKey}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
        }
    }
    return context;
}

/**
 * Creates a knowledge base from the rules codex for the AI to reference.
 * @param {Array<object>} wikiEntries - The array of all rules_codex entries.
 * @returns {string} - A formatted string of all rules.
 */
function getRulesCodexContext(wikiEntries) {
    let context = "\n\n--- Rules Codex Reference ---\n";
    context += "The following is the game's official rules codex. Use it to inform your suggestions. When referencing an entry, use the [[Entry Name]] syntax.\n\n";
    wikiEntries.forEach(entry => {
        context += `**[[${entry.name}]]**\n`;
        if (entry.description) context += `Description: ${entry.description}\n`;
        if (entry.mechanic) context += `Mechanic: ${entry.mechanic}\n`;
        context += "\n";
    });
    context += "--- End Rules Codex ---\n\n";
    return context;
}


// --- CREATIVE ASSISTANT FUNCTIONS ---

/**
 * Brainstorms ideas for a specific field.
 * @param {object} data - The current form data.
 * @param {string} categoryKey - The key of the current category.
 * @param {string} fieldToBrainstorm - The specific field to generate ideas for (e.g., 'name').
 * @param {string} userGuidance - Additional guidance from the user.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<string|null>} - A list of brainstormed ideas or null.
 */
async function brainstormField(data, categoryKey, fieldToBrainstorm, userGuidance, apiKey, wikiEntries) {
    const context = getFormContext(data, categoryKey);
    const rulesContext = getRulesCodexContext(wikiEntries);
    const prompt = `
        ${context}
        ${rulesContext}
        The user wants to brainstorm some ideas for the "${fieldToBrainstorm}" field.
        User Guidance: "${userGuidance}"
        Based on the provided data and guidance, generate a list of 5-7 creative and fitting ideas for the "${fieldToBrainstorm}" field.
        Present them as a simple list.
    `;
    return callGeminiAPI(prompt, apiKey);
}

/**
 * Elaborates on a specific field, making it more detailed and descriptive.
 * @param {object} data - The current form data.
 * @param {string} categoryKey - The key of the current category.
 * @param {string} fieldToElaborate - The field to expand upon (e.g., 'description').
 * @param {string} userGuidance - Additional guidance from the user.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<string|null>} - The elaborated text or null.
 */
async function elaborateField(data, categoryKey, fieldToElaborate, userGuidance, apiKey, wikiEntries) {
    const context = getFormContext(data, categoryKey);
    const rulesContext = getRulesCodexContext(wikiEntries);
    const fieldValue = data[fieldToElaborate] || '';
    const prompt = `
        ${context}
        ${rulesContext}
        The user wants to elaborate on the "${fieldToElaborate}" field. The current text is: "${fieldValue}".
        User Guidance: "${userGuidance}"
        Rewrite and expand upon the provided text, making it more detailed, evocative, and engaging.
        Incorporate the user's guidance and ensure the new text is consistent with the other data.
        When relevant, create links to other potential database entries using the [[Entry Name]] syntax.
    `;
    return callGeminiAPI(prompt, apiKey);
}

/**
 * Summarizes the text in a specific field.
 * @param {object} data - The current form data.
 * @param {string} categoryKey - The key of the current category.
 * @param {string} fieldToSummarize - The field to summarize.
 * @param {string} userGuidance - Additional guidance from the user.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<string|null>} - The summarized text or null.
 */
async function summarizeField(data, categoryKey, fieldToSummarize, userGuidance, apiKey, wikiEntries) {
    const context = getFormContext(data, categoryKey);
    const rulesContext = getRulesCodexContext(wikiEntries);
    const fieldValue = data[fieldToSummarize] || '';
    const prompt = `
        ${context}
        ${rulesContext}
        The user wants to summarize the text in the "${fieldToSummarize}" field. The current text is: "${fieldValue}".
        User Guidance: "${userGuidance}"
        Summarize the provided text into a concise and clear version, keeping the core meaning.
        Incorporate the user's guidance.
    `;
    return callGeminiAPI(prompt, apiKey);
}

/**
 * Generates a detailed image prompt for an external AI image generator.
 * @param {object} data - The current form data.
 * @param {string} categoryKey - The key of the current category.
 * @param {string} userGuidance - Additional guidance from the user for the image style.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<string|null>} - A detailed text prompt for an image generator.
 */
async function suggestImagePrompt(data, categoryKey, userGuidance, apiKey) {
    showAIStatus("Generating image prompt...", false);
    const context = getFormContext(data, categoryKey);
    const prompt = `
        ${context}
        Based on the data above, create a detailed, evocative positive prompt for an AI image generator to create a visual representation of this entry.
        Focus on visual details. Do not include non-visual information like mechanics or goals. Describe a single, clear scene or portrait.
        User Guidance for style: "${userGuidance}"

        Output only the prompt itself.
    `;
    const imagePrompt = await callGeminiAPI(prompt, apiKey);

    if (!imagePrompt) {
        showAIStatus("Failed to generate image prompt.", true);
        return null;
    }
    return imagePrompt;
}


// --- DATABASE MANAGER FUNCTIONS ---

/**
 * Suggests relevant database entries to link.
 * @param {object} data - The current form data.
 * @param {string} categoryKey - The key of the current category.
 * @param {string} fieldToSuggestFor - The field needing suggestions (e.g., 'prerequisite').
 * @param {Array<object>} wikiEntries - All entries from the rules_codex.
 * @param {string} userGuidance - Additional guidance from the user.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<string|null>} - A list of suggested entry names.
 */
async function suggestLinks(data, categoryKey, fieldToSuggestFor, wikiEntries, userGuidance, apiKey) {
    const formContext = getFormContext(data, categoryKey);
    const rulesContext = getRulesCodexContext(wikiEntries);
    const prompt = `
        ${formContext}
        ${rulesContext}
        The user is looking for suggestions for the "${fieldToSuggestFor}" field.
        User Guidance: "${userGuidance}"

        Based on all the provided context, suggest 3-5 relevant entries from the Rules Codex that would be appropriate for the user to link in the "${fieldToSuggestFor}" field.
        Return only a comma-separated list of the exact entry names. Example: Entry One,Another Entry,Third Entry
    `;
    return callGeminiAPI(prompt, apiKey);
}


// --- PAIR-GAME MASTER FUNCTIONS ---

/**
 * Generates a full character persona based on selected database entries.
 * @param {Array<object>} selectedEntries - An array of entry objects from the database (e.g., species, faction).
 * @param {string} userGuidance - Additional guidance from the user.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<string|null>} - A detailed persona description.
 */
async function generatePersona(selectedEntries, userGuidance, apiKey) {
    let context = "The user has selected the following components from the database to create a character persona:\n";
    selectedEntries.forEach(entry => {
        context += `\n- **${entry.name}** (${entry.categoryLabel}):\n`;
        if(entry.description) context += `  - Description: ${entry.description}\n`;
        if(entry.trait) context += `  - Traits: ${Array.isArray(entry.trait) ? entry.trait.join(', ') : entry.trait}\n`;
    });

    const prompt = `
        ${context}
        User Guidance: "${userGuidance}"

        Synthesize all of this information into a cohesive and compelling character persona.
        Give the character a name, a detailed backstory that connects the selected components, a personality, and some potential goals or motivations.
        Format the output with clear headings. Use the [[Entry Name]] syntax when referencing a component.
    `;
    return callGeminiAPI(prompt, apiKey);
}

/**
 * Generates a world/location description based on a society entry.
 * @param {object} societyEntry - The society entry object from the database.
 * @param {string} userGuidance - Additional guidance from the user.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<string|null>} - A detailed world description.
 */
async function generateWorldDescription(societyEntry, userGuidance, apiKey) {
    const context = getFormContext(societyEntry, 'societies');
    const prompt = `
        ${context}
        The user wants to generate a detailed description of a location or world based on this society.
        User Guidance: "${userGuidance}"

        Describe what it would be like to visit a place dominated by this society.
        Describe the architecture, the people, the technology, the general atmosphere, and any unique customs or traditions.
        Make it evocative and useful for a Game Master.
    `;
    return callGeminiAPI(prompt, apiKey);
}

/**
 * Generates a story hook based on selected database entries.
 * @param {Array<object>} selectedEntries - An array of entry objects (e.g., faction, location, character).
 * @param {string} userGuidance - Additional guidance from the user.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<string|null>} - A formatted story hook.
 */
async function generateStoryHook(selectedEntries, userGuidance, apiKey) {
    let context = "A user wants to create a story hook using the following database entries as key elements:\n";
    selectedEntries.forEach(entry => {
        context += `\n- **[[${entry.name}]]** (${entry.categoryLabel}):\n`;
        if(entry.description) context += `  - Description: ${entry.description}\n`;
        if(entry.goals) context += `  - Goals: ${entry.goals}\n`;
    });

    const prompt = `
        ${context}
        User Guidance: "${userGuidance}"

        Weave these elements into a compelling story hook suitable for an RPG session.
        Provide a title, a brief setup, a central conflict or mystery, and a potential call to action for the players.
        Format the output with clear headings.
    `;
    return callGeminiAPI(prompt, apiKey);
}


export {
    showAIStatus,
    callGeminiAPI,
    getFormContext,
    getRulesCodexContext,
    brainstormField,
    elaborateField,
    summarizeField,
    suggestImagePrompt,
    suggestLinks,
    generatePersona,
    generateWorldDescription,
    generateStoryHook
};