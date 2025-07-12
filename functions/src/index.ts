// =========================================================
// All Necessary Imports for Firebase Admin SDK, Genkit, and Cloud Functions
// =========================================================

// Specific imports for Firebase Functions v2 HTTPS callable functions, including HttpsError.
import { onCall, type CallableRequest, HttpsError } from 'firebase-functions/v2/https';

// Genkit core (using 'genkit' package)
import { genkit, z } from 'genkit';

// Genkit plugin for Google AI models (using '@genkit-ai/googleai')
import { gemini, googleAI } from '@genkit-ai/googleai';

// Firebase Admin SDK for interacting with Firestore.
import * as admin from 'firebase-admin';


// =========================================================
// Initialize Firebase Admin SDK
// This allows your functions to interact with Firebase services like Firestore.
// =========================================================
admin.initializeApp();
const db = admin.firestore(); // Get a reference to your Firestore database


// =========================================================
// Initialize Genkit
// This sets up Genkit with the Gemini model and securely retrieves your API key.
// =========================================================
const ai = genkit({
    plugins: [
        googleAI({
            // FIX: Access API key directly from process.env for Cloud Functions v2.
            // 'genkit.gemini_api_key' becomes 'GENKIT_GEMINI_API_KEY' as an environment variable.
            apiKey: process.env.GENKIT_GEMINI_API_KEY,
        }),
    ],
    model: gemini('gemini-pro'), // Using 'gemini-pro' as the default model
});


// =========================================================
// Genkit Flow Definition: rpgAssistantFlow
// This flow orchestrates the AI assistant's logic, including Firestore research.
// =========================================================
export const rpgAssistantFlow = ai.defineFlow(
    {
        name: 'rpgAssistant',
        inputSchema: z.object({
            userPrompt: z.string().describe('The user\'s request or question for the AI assistant.'),
        }),
        outputSchema: z.string().describe('The AI-generated response or research result.'),
    },
    async (input: { userPrompt: string }) => {
        const { userPrompt } = input;

        let contextData = '';
        const appId = 'yourAppId'; // <--- !!! CUSTOMIZE THIS IF NEEDED !!!

        if (userPrompt.toLowerCase().includes('goblin')) {
            const docRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('bestiary').doc('goblin');
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                contextData += `Here's some lore about goblins from your bestiary: ${JSON.stringify(docSnap.data())}\n\n`;
                console.log("Fetched goblin lore:", docSnap.data());
            } else {
                contextData += "No specific lore found for 'goblin' in the bestiary.\n";
                console.log("No goblin lore found.");
            }
        }

        const fullPrompt = `You are a helpful, creative, and knowledgeable assistant for a roleplaying game.
    Your goal is to assist a game master or player by providing research, generating content, or answering questions based on the game's world.

    ${contextData ? `Here is some relevant game lore or data to consider:\n${contextData}\n` : ''}

    The user's request is: "${userPrompt}"

    Please provide a concise, relevant, and creative response. If you are generating content, make it fit the tone of a fantasy RPG. If you are researching, directly answer the question based on the provided lore or general RPG knowledge.`;

        console.log("Full prompt sent to AI:", fullPrompt);

        const response = await ai.generate({
            prompt: fullPrompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 500,
            },
        });

        return response.text;
    }
);


// =========================================================
// Cloud Function: callRpgAssistant
// This is an HTTPS Callable Cloud Function (v2), providing a secure API endpoint for your web app.
// =========================================================
export const callRpgAssistant = onCall(
    {
        timeoutSeconds: 300, // Keeping it at 5 minutes
        memory: "512MiB",     // Increasing memory to 512MB
    },
    async (request: CallableRequest<{ userPrompt: string }>) => {

        if (!request.auth) {
            // FIX: Use HttpsError imported directly
            throw new HttpsError(
                'unauthenticated',
                'The AI assistant requires authentication. Please log in to use this feature.'
            );
        }

        const userPrompt = request.data.userPrompt;
        if (!userPrompt || typeof userPrompt !== 'string') {
            // FIX: Use HttpsError imported directly
            throw new HttpsError(
                'invalid-argument',
                'The function expects a valid "userPrompt" string as input. Please provide a clear question or request.'
            );
        }

        console.log(`Received prompt from user ${request.auth.uid}: "${userPrompt}"`);

        try {
            const aiResponse = await rpgAssistantFlow.run({ userPrompt });
            return { response: aiResponse };

        } catch (error) {
            console.error("Error executing RPG Assistant Flow:", error);
            // FIX: Use HttpsError imported directly
            throw new HttpsError(
                'internal',
                'An internal error occurred while processing your request. Please try again later.',
            );
        }
    }
);
