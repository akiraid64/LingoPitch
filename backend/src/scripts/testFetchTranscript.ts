
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from the backend root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, '../..');
dotenv.config({ path: path.join(backendRoot, '.env') });

async function testFetchTranscript() {
    const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY;

    console.log('--- Cartesia Transcript Fetch Test ---');
    console.log(`API Key present: ${!!CARTESIA_API_KEY}`);

    if (!CARTESIA_API_KEY) {
        console.error('❌ Error: CARTESIA_API_KEY not found in .env');
        process.exit(1);
    }

    // Use command line arg or fallback to the one from logs
    const agentId = process.argv[2] || 'agent_hVL2nqC4ojsVmKzu1NA2MF';

    // According to OpenAPI: GET /agents/calls requires agent_id
    // We also want to include expand=transcript
    const listUrl = `https://api.cartesia.ai/agents/calls?agent_id=${agentId}&expand=transcript&limit=5`;

    console.log(`\nStep 1: Listing calls for Agent: ${agentId}`);
    console.log(`URL: ${listUrl}`);

    try {
        const listResponse = await fetch(listUrl, {
            headers: {
                'X-API-Key': CARTESIA_API_KEY,
                'Cartesia-Version': '2025-04-16'
            }
        });

        console.log(`List Response Status: ${listResponse.status}`);

        if (!listResponse.ok) {
            const text = await listResponse.text();
            console.error('❌ List API Error:', text);
            return;
        }

        const listData = (await listResponse.json()) as any;
        const calls = listData.data || [];
        console.log(`✅ Found ${calls.length} calls for this agent.`);

        if (calls.length === 0) {
            console.log('No calls found for this agent ID.');
            return;
        }

        // Process the first call
        const firstCall = calls[0];
        console.log(`\n--- Most Recent Call: ${firstCall.id} ---`);
        console.log(`Status: ${firstCall.status}`);

        if (firstCall.transcript && firstCall.transcript.length > 0) {
            console.log(`Transcript (${firstCall.transcript.length} turns):`);
            firstCall.transcript.forEach((turn: any, i: number) => {
                const role = turn.role === 'assistant' ? 'AGENT' : turn.role.toUpperCase();
                console.log(`[${i}] ${role}: ${turn.text || '(no text)'}`);
            });
        } else {
            console.log('⚠️ No transcript found in the call data. (Did you wait for the session to end?)');
        }

    } catch (error) {
        console.error('❌ Network/Fetch Error:', error);
    }
}

testFetchTranscript();
