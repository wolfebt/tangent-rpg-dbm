// =========================================================
// All Necessary Imports for Firebase Admin SDK, Genkit, and Cloud Functions
// =========================================================

// Specific imports for Firebase Functions v2 HTTPS callable functions.
import { onCall, type CallableRequest, HttpsError } from 'firebase-functions/v2/https';

// Genkit core (using 'genkit' package).
import { genkit, z } from 'genkit';

// Genkit plugin for Google AI models (using '@genkit-ai/googleai').
import { gemini, googleAI } from '@genkit-ai/googleai';

// Firebase Admin SDK for interacting with Firestore.
import * as admin from 'firebase-admin';


// =========================================================
// Initialize Firebase Admin SDK
// =========================================================
admin.initializeApp();
const db = admin.firestore();


// =========================================================
// Initialize Genkit
// =========================================================
const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GENKIT_GEMINI_API_KEY,
        }),
    ],
    model: gemini('gemini-pro'),
});


// =========================================================
// Genkit Flow Definition: rpgAssistantFlow
// =========================================================
export const rpgAssistantFlow = ai.defineFlow(
    {
        name: 'rpgAssistant',
        inputSchema: z.object({
            userPrompt: z.string().describe('The user\'s request or question for the AI assistant.'),
            conversationHistory: z.array(z.object({
                role: z.enum(['user', 'model']),
                parts: z.array(z.object({ text: z.string() })),
            })).optional(),
        }),
        outputSchema: z.string().describe('The AI-generated response.'),
    },
    async (input: { userPrompt: string, conversationHistory?: any[] }) => {
        const { userPrompt, conversationHistory } = input;
        let contextData = '';
        const appId = 'yourAppId'; // <--- !!! CUSTOMIZE THIS WITH YOUR ACTUAL APP ID !!!

        if (userPrompt.toLowerCase().includes('goblin')) {
            const docRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('bestiary').doc('goblin');
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                contextData += `Here's some lore about goblins: ${JSON.stringify(docSnap.data())}\n\n`;
            }
        }

        let historyPrompt = "";
        if (conversationHistory && conversationHistory.length > 1) {
            historyPrompt = conversationHistory.slice(1).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.parts[0].text}`).join('\n') + '\n';
        }

        const fullPrompt = `You are Bastion, a helpful, creative, and knowledgeable assistant for the Tangent SFF RPG.
        ${historyPrompt}
        ${contextData ? `Relevant game lore:\n${contextData}\n` : ''}
        The user's current request is: "${userPrompt}"
        Please provide a concise, relevant, and creative response.`;

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
// Cloud Function: callRpgAssistantV2 (RENAMED)
// =========================================================
export const callRpgAssistantV2 = onCall(
    {
        timeoutSeconds: 300,
        memory: "512MiB",
        cors: /.*/, // Using the permissive policy that we know works
    },
    async (request: CallableRequest<{ userPrompt: string, conversationHistory: any[] }>) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'The AI assistant requires authentication.');
        }
        const { userPrompt, conversationHistory } = request.data;
        if (!userPrompt || typeof userPrompt !== 'string') {
            throw new HttpsError('invalid-argument', 'The function expects a valid "userPrompt" string.');
        }
        console.log(`Received prompt from user ${request.auth.uid}: "${userPrompt}"`);
        try {
            const aiResponse = await rpgAssistantFlow.run({ userPrompt, conversationHistory });
            return { response: aiResponse };
        } catch (error) {
            console.error("Error executing RPG Assistant Flow:", error);
            throw new HttpsError('internal', 'An internal error occurred while processing your request.');
        }
    }
);
