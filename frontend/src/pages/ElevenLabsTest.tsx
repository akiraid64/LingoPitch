import { useConversation } from '@elevenlabs/react';
import { useState } from 'react';

const AGENT_ID = 'agent_6601kgpwedktfsx9qk1vqgdfe1k3';

export function ElevenLabsTest() {
    const [logs, setLogs] = useState<string[]>([]);
    const [testPrompt, setTestPrompt] = useState('You are a friendly sales customer.');

    const conversation = useConversation({
        agentId: AGENT_ID,
    });

    const { startSession, endSession, status } = conversation;

    const log = (message: string) => {
        console.log(message);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testBasicConnection = async () => {
        log('🧪 TEST 1: Basic connection (no overrides)');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            log('✅ Microphone permission granted');
            stream.getTracks().forEach(track => track.stop());

            log('🔗 Starting session without overrides...');
            await startSession({} as any);
            log('✅ Basic session started!');
        } catch (err) {
            log(`❌ Basic connection failed: ${err}`);
        }
    };

    const testWithPromptOverride = async () => {
        log('🧪 TEST 2: Connection with prompt override');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            log('✅ Microphone permission granted');
            stream.getTracks().forEach(track => track.stop());

            log(`🔗 Starting session with custom prompt (${testPrompt.length} chars)...`);
            await startSession({
                overrides: {
                    agent: {
                        prompt: {
                            prompt: testPrompt,
                        },
                    },
                },
            } as any);
            log('✅ Session with override started!');
        } catch (err) {
            log(`❌ Override connection failed: ${err}`);
        }
    };

    const handleEnd = () => {
        log('🛑 Ending session');
        endSession();
    };

    return (
        <div className="min-h-screen bg-dark-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">ElevenLabs Connection Test</h1>
                <p className="text-gray-400 mb-8">
                    Agent ID: <code className="bg-dark-800 px-2 py-1 rounded">{AGENT_ID}</code>
                </p>

                {/* Status */}
                <div className="bg-dark-800 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-bold mb-2">Connection Status</h2>
                    <p className="text-2xl font-mono">
                        {status === 'connected' && <span className="text-green-500">🟢 CONNECTED</span>}
                        {status === 'connecting' && <span className="text-yellow-500">🟡 CONNECTING</span>}
                        {status === 'disconnected' && <span className="text-red-500">🔴 DISCONNECTED</span>}
                        {!status && <span className="text-gray-500">⚪ IDLE</span>}
                    </p>
                </div>

                {/* Test Buttons */}
                <div className="space-y-4 mb-8">
                    <button
                        onClick={testBasicConnection}
                        disabled={status === 'connected' || status === 'connecting'}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg"
                    >
                        Test 1: Basic Connection (No Override)
                    </button>

                    <div>
                        <textarea
                            value={testPrompt}
                            onChange={(e) => setTestPrompt(e.target.value)}
                            className="w-full bg-dark-800 text-white p-3 rounded mb-2 font-mono text-sm"
                            rows={3}
                            placeholder="Custom prompt to test..."
                        />
                        <button
                            onClick={testWithPromptOverride}
                            disabled={status === 'connected' || status === 'connecting'}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg"
                        >
                            Test 2: Connection with Prompt Override
                        </button>
                    </div>

                    {(status === 'connected' || status === 'connecting') && (
                        <button
                            onClick={handleEnd}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg"
                        >
                            End Session
                        </button>
                    )}
                </div>

                {/* Logs */}
                <div className="bg-dark-900 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Debug Logs</h2>
                        <button
                            onClick={() => setLogs([])}
                            className="text-sm bg-dark-700 hover:bg-dark-600 px-3 py-1 rounded"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">No logs yet. Run a test to see results.</p>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="text-sm font-mono text-gray-300">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-500 mb-2">🔍 Debugging Steps:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>First try <strong>Test 1</strong> (basic connection without override)</li>
                        <li>If Test 1 works → agent is configured correctly</li>
                        <li>If Test 1 fails → check ElevenLabs dashboard agent settings</li>
                        <li>Then try <strong>Test 2</strong> with a simple custom prompt</li>
                        <li>Watch the Debug Logs for detailed error messages</li>
                        <li>Check browser console (F12) for WebSocket errors</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
