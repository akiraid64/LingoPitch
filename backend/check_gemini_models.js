
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log('Fetching available models...');
        // Accessing the model listing is slightly different depending on SDK version, 
        // but typically done via direct API call or specific manager if available.
        // The SDK doesn't always expose a direct listModels method on the top level class easily in all versions.
        // Let's try a simple generation test with a few likely candidates if listing is hard.

        // Actually, let's just try to generate with a fallback to see if 'gemini-1.5-flash-latest' works, 
        // or check the error more closely.

        // But to be sure, let's try to infer from a direct REST call if SDK is obscure
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log('\n✅ Available Models:');
            data.models.forEach(m => {
                if (m.name.includes('gemini') || m.name.includes('flash')) {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } else {
            console.error('Could not list models via REST:', data);
        }

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
