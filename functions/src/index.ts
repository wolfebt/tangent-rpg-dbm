// =========================================================
// All Necessary Imports for Firebase Admin SDK, Genkit, and Cloud Functions
// =========================================================

// Specific imports for Firebase Functions v2 HTTPS callable functions.
// This includes `onCall` (the function definition itself) and `HttpsError` (for structured errors).
import { onCall, type CallableRequest, HttpsError } from 'firebase-functions/v2/https';

// Genkit core (using 'genkit' package).
// 'z' is for Zod schemas, used to define input/output structures for Genkit flows.
import { genkit, z } from 'genkit';

// Genkit plugin for Google AI models (using '@genkit-ai/googleai').
// 'gemini' is the model reference, and 'googleAI' is the plugin for Google's models.
import { gemini, googleAI } from '@genkit-ai/googleai';

// Firebase Admin SDK for interacting with Firestore.
import * as admin from 'firebase-admin';


// =========================================================
// Initialize Firebase Admin SDK
// This allows your functions to interact with Firebase services like Firestore.
// It's initialized once when the function container starts up (cold start).
// =========================================================
admin.initializeApp();
const db = admin.firestore(); // Get a reference to your Firestore database for data access.


// =========================================================
// Initialize Genkit
// This sets up the Genkit framework and configures it to use the Gemini Pro model.
// This also runs once per cold start.
// =========================================================
const ai = genkit({
    // Plugins define which AI models and services Genkit can interact with.
    plugins: [
        googleAI({
            // Securely access the API key from environment variables.
            // Firebase automatically converts `genkit.gemini_api_key` (from `firebase functions:config:set`)
            // into `process.env.GENKIT_GEMINI_API_KEY` for 2nd Gen Functions.
            apiKey: process.env.GENKIT_GEMINI_API_KEY,
        }),
    ],
    // Set a default model for Genkit to use in generate calls if not specified.
    // 'gemini-pro' is a versatile model for text generation.
    model: gemini('gemini-pro'),
    // Note: 'logLevel' is now typically set globally for Genkit, not in this object.
});


// =========================================================
// Genkit Flow Definition: rpgAssistantFlow
// This is the core logic of your AI assistant. It defines the steps for processing
// a user's prompt, integrating game data from Firestore, and generating a response.
// =========================================================
export const rpgAssistantFlow = ai.defineFlow(
    {
        // Unique name for this flow.
        name: 'rpgAssistant',
        // Define the expected input structure using Zod schemas for type safety.
        inputSchema: z.object({
            userPrompt: z.string().describe('The user\'s request or question for the AI assistant.'),
            // Added conversationHistory to match the data sent from the frontend
            conversationHistory: z.array(z.object({
                role: z.enum(['user', 'model']),
                parts: z.array(z.object({ text: z.string() })),
            })).optional(),
        }),
        // Define the expected output structure.
        outputSchema: z.string().describe('The AI-generated response or research result.'),
    },
    // The asynchronous function that contains the flow's logic.
    async (input: { userPrompt: string, conversationHistory?: any[] }) => {
        const { userPrompt, conversationHistory } = input;

        // Initialize context data that will be sent to the AI.
        let contextData = '';
        // Placeholder for your application ID within Firestore paths.
        const appId = 'yourAppId'; // <--- !!! CUSTOMIZE THIS WITH YOUR ACTUAL APP ID !!!

        // --- Data Retrieval / "Research" from Firestore ---
        // This is a basic example. You would expand this logic significantly
        // to dynamically query your Firestore based on the user's prompt.
        if (userPrompt.toLowerCase().includes('goblin')) {
            // Construct the path to a specific document in Firestore based on your rules.
            const docRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('bestiary').doc('goblin');
            const docSnap = await docRef.get(); // Fetch the document.

            if (docSnap.exists) {
                // If the document exists, add its data to the context.
                contextData += `Here's some lore about goblins from your bestiary: ${JSON.stringify(docSnap.data())}\n\n`;
                console.log("Fetched goblin lore:", docSnap.data()); // For debugging logs.
            } else {
                contextData += "No specific lore found for 'goblin' in the bestiary.\n";
                console.log("No goblin lore found."); // For debugging logs.
            }
        }
        // End of example data retrieval. Add more sophisticated logic here!

        // --- Prompt Engineering with History ---
        // Convert the conversation history from the client into a format the AI understands.
        let historyPrompt = "";
        if (conversationHistory && conversationHistory.length > 1) { // Ignore the initial system prompt
            historyPrompt = conversationHistory.slice(1).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.parts[0].text}`).join('\n') + '\n';
        }

        // --- Prompt Engineering ---
        // Craft a detailed prompt that guides the AI's behavior and injects relevant context.
        const fullPrompt = `You are Bastion, a helpful, creative, and knowledgeable assistant for the Tangent SFF RPG.
        Your goal is to assist a game master or player by providing research, generating content, or answering questions based on the game's world.

        ${historyPrompt}
        ${contextData ? `Here is some relevant game lore or data to consider:\n${contextData}\n` : ''}

        The user's current request is: "${userPrompt}"

        Please provide a concise, relevant, and creative response. If you are generating content, make it fit the tone of a fantasy RPG. If you are researching, directly answer the question based on the provided lore or general RPG knowledge.`;

        console.log("Full prompt sent to AI:", fullPrompt); // For debugging logs.

        // --- AI Generation ---
        // Use Genkit's `generate` method to send the crafted prompt to the AI model.
        const response = await ai.generate({
            prompt: fullPrompt,
            config: {
                temperature: 0.7, // Adjust for creativity (0.0 is deterministic, 1.0 is very creative).
                maxOutputTokens: 500, // Limit the length of the AI's response.
            },
        });

        // Return the generated text content from the AI's response.
        return response.text;
    }
);


// =========================================================
// Cloud Function: callRpgAssistant
// This is the HTTPS Callable Cloud Function that your frontend web app will call.
// It acts as a secure API endpoint to trigger your AI assistant's logic.
// =========================================================
export const callRpgAssistant = onCall(
    {
        // Configure resources and behavior for this Cloud Function.
        timeoutSeconds: 300, // Max time function can run (5 minutes). Essential for AI operations.
        memory: "512MiB",     // Memory allocated to the function. Increased for Genkit/AI needs.

        // =================================================================
        // !!! MORE PERMISSIVE CORS POLICY FOR DEBUGGING !!!
        // This uses a regular expression to allow any origin.
        // While not ideal for final production, it will definitively tell us if
        // the CORS configuration is the root of the problem.
        // =================================================================
        cors: /.*/,

    },
    // The asynchronous handler for the callable function.
    // `request` contains details from the client, including authentication (`request.auth`).
    async (request: CallableRequest<{ userPrompt: string, conversationHistory: any[] }>) => {

        // 1. Authentication Check
        // Ensure the request comes from an authenticated Firebase user.
        if (!request.auth) {
            // Throw a Firebase HttpsError for client-side handling.
            throw new HttpsError(
                'unauthenticated', // Standard error code.
                'The AI assistant requires authentication. Please log in to use this feature.'
            );
        }

        // 2. Input Validation
        // Ensure the `userPrompt` is present and is a string.
        const userPrompt = request.data.userPrompt;
        const conversationHistory = request.data.conversationHistory || [];

        if (!userPrompt || typeof userPrompt !== 'string') {
            throw new HttpsError(
                'invalid-argument',
                'The function expects a valid "userPrompt" string as input. Please provide a clear question or request.'
            );
        }

        // Log the incoming prompt for debugging/monitoring.
        console.log(`Received prompt from user ${request.auth.uid}: "${userPrompt}"`);

        // 3. Execute the Genkit Flow
        try {
            // Call your defined Genkit flow (`rpgAssistantFlow`) with the user's prompt and history.
            const aiResponse = await rpgAssistantFlow.run({ userPrompt, conversationHistory });

            // 4. Return the AI's Response to the client.
            // The object structure '{ response: aiResponse }' is what your frontend expects.
            return { response: aiResponse };

        } catch (error) {
            // 5. Error Handling
            // Log the detailed error server-side for debugging.
            console.error("Error executing RPG Assistant Flow:", error);
            // Throw a generic 'internal' error to the client, hiding sensitive details.
            throw new HttpsError(
                'internal',
                'An internal error occurred while processing your request. Please try again later.',
            );
        }
    }
);
