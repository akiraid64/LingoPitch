/**
 * Cartesia Voice Client
 * WebSocket client for Cartesia voice agent communication
 * Handles audio capture, encoding, streaming, and playback
 */

export interface VoiceSessionMetadata {
    language_code: string;
    user_id: string;
    system_prompt: string;
    playbook?: string;
}

export interface SessionResponse {
    agent_id: string;
    websocket_url: string;
    system_prompt: string;
    metadata: VoiceSessionMetadata;
}

export class CartesiaVoiceClient {
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private streamId: string = '';
    private isStreaming: boolean = false;
    private audioQueue: AudioBufferSourceNode[] = [];

    constructor(
        private onConnected?: () => void,
        private onDisconnected?: () => void,
        private onError?: (error: string) => void
    ) { }

    /**
     * Connect to Cartesia voice agent WebSocket
     */
    async connect(websocketUrl: string, metadata: any, accessToken: string) {
        console.log('[CARTESIA] Connecting to:', websocketUrl);
        console.log('[CARTESIA] Using access token for auth');

        // Note: WebSocket in browser doesn't support custom headers directly
        // We authenticating via query parameter in the URL
        const authenticatedUrl = `${websocketUrl}?access_token=${accessToken}&cartesia_version=2025-04-16`;
        this.ws = new WebSocket(authenticatedUrl);
        this.streamId = `stream_${Date.now()}`;
        this.audioContext = new AudioContext({ sampleRate: 44100 });

        this.ws.onopen = () => {
            console.log('[CARTESIA] ✅ WebSocket connected successfully');

            // Send start event with configuration
            const startMessage = {
                event: 'start',
                stream_id: this.streamId,
                config: { input_format: 'pcm_44100' },
                agent: {
                    system_prompt: metadata.system_prompt,
                    introduction: ''  // Wait for user to speak first
                },
                metadata: metadata
            };

            // Send clean start message (auth already handled in URL)
            console.log('[CARTESIA] 📤 Sending start event');
            this.ws?.send(JSON.stringify(startMessage));

            console.log('[CARTESIA] Sent start event');
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.event) {
                case 'ack':
                    // Stream configuration acknowledged
                    this.streamId = data.stream_id;
                    console.log('[CARTESIA] Stream acknowledged:', this.streamId);
                    this.onConnected?.();
                    break;

                case 'media_output':
                    // Agent is speaking - play audio
                    console.log('[CARTESIA] Received audio chunk');
                    this.playAudio(data.media.payload);
                    break;

                case 'clear':
                    // Agent wants to interrupt/clear current audio
                    console.log('[CARTESIA] Clear signal received');
                    this.clearAudio();
                    break;

                case 'dtmf':
                    console.log('[CARTESIA] DTMF tone:', data.dtmf);
                    break;

                case 'custom':
                    console.log('[CARTESIA] Custom event:', data.metadata);
                    break;

                default:
                    console.log('[CARTESIA] Unknown event:', data.event);
            }
        };

        this.ws.onerror = (error) => {
            console.error('[CARTESIA] ❌ WebSocket error:', error);
            console.error('[CARTESIA] Error details:', {
                type: error.type,
                target: error.target,
                currentTarget: error.currentTarget
            });
            this.onError?.('WebSocket connection failed');
        };

        this.ws.onclose = (event) => {
            console.log('[CARTESIA] WebSocket closed:', {
                code: event.code,
                reason: event.reason || '(no reason provided)',
                wasClean: event.wasClean
            });

            // Common close codes:
            // 1000 = Normal closure
            // 1006 = Abnormal closure (no close frame, connection lost)
            // 1008 = Policy violation
            // 1011 = Server error

            if (event.code === 1006) {
                console.error('[CARTESIA] ⚠️ Abnormal closure - server may not be reachable or rejected connection');
            }

            this.onDisconnected?.();
            this.cleanup();
        };
    }

    /**
     * Start capturing and streaming microphone audio
     */
    async startMicrophone(): Promise<void> {
        if (!this.audioContext || !this.ws || !this.streamId) {
            throw new Error('Not connected to voice agent');
        }

        try {
            console.log('[CARTESIA] Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });

            console.log('[CARTESIA] ✅ Microphone access granted');

            const source = this.audioContext.createMediaStreamSource(stream);

            // Use ScriptProcessorNode for audio processing (deprecated but widely supported)
            // TODO: Consider migrating to AudioWorklet for better performance
            const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
                if (!this.isStreaming) return;

                const audioData = e.inputBuffer.getChannelData(0);
                const pcm = this.float32ToPCM(audioData);

                // Convert Int16Array to Uint8Array (bytes) for base64 encoding
                const pcmBytes = new Uint8Array(pcm.buffer);

                // Use a more robust way to convert binary to string for btoa
                // Large arrays can overflow stack with spread operator, so process in chunks
                let binary = '';
                const chunkSize = 8192;
                for (let i = 0; i < pcmBytes.length; i += chunkSize) {
                    const chunk = pcmBytes.subarray(i, Math.min(i + chunkSize, pcmBytes.length));
                    binary += String.fromCharCode.apply(null, Array.from(chunk));
                }

                const base64Audio = btoa(binary);

                // Send audio to agent only if connected
                if (this.ws?.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({
                        event: 'media_input',
                        stream_id: this.streamId,
                        media: { payload: base64Audio }
                    }));
                }
            };

            source.connect(processor);
            processor.connect(this.audioContext.destination);
            this.isStreaming = true;

            console.log('[CARTESIA] 🎤 Microphone streaming started');

        } catch (error) {
            console.error('[CARTESIA] Failed to access microphone:', error);
            this.onError?.('Microphone access denied');
            throw error;
        }
    }

    /**
     * Stop microphone streaming
     */
    stopMicrophone(): void {
        this.isStreaming = false;
        console.log('[CARTESIA] 🎤 Microphone streaming stopped');
    }

    /**
     * Convert Float32 audio to PCM16
     */
    private float32ToPCM(float32Array: Float32Array): Int16Array {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    }

    /**
     * Play received audio from agent
     */
    private async playAudio(base64Audio: string): Promise<void> {
        if (!this.audioContext) return;

        try {
            // Decode base64 to binary string
            const binary = atob(base64Audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            // Convert raw PCM16 bytes to Float32
            // The audio is 16-bit little-endian PCM
            const int16Array = new Int16Array(bytes.buffer);
            const float32Array = new Float32Array(int16Array.length);

            for (let i = 0; i < int16Array.length; i++) {
                // Normalize to [-1.0, 1.0]
                const s = int16Array[i];
                float32Array[i] = s < 0 ? s / 0x8000 : s / 0x7FFF;
            }

            // Create AudioBuffer
            const audioBuffer = this.audioContext.createBuffer(
                1, // channels
                float32Array.length,
                44100 // sample rate
            );

            // Fill the buffer with data
            audioBuffer.getChannelData(0).set(float32Array);

            // Create and play audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();

            // Track for cleanup
            this.audioQueue.push(source);

            // Remove from queue when finished
            source.onended = () => {
                const index = this.audioQueue.indexOf(source);
                if (index > -1) {
                    this.audioQueue.splice(index, 1);
                }
            };

        } catch (error) {
            console.error('[CARTESIA] Failed to play audio:', error);
        }
    }

    /**
     * Clear/interrupt current audio playback
     */
    private clearAudio(): void {
        this.audioQueue.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.audioQueue = [];
    }

    /**
     * Disconnect and cleanup resources
     */
    disconnect(): void {
        console.log('[CARTESIA] Disconnecting...');

        this.stopMicrophone();
        this.clearAudio();

        if (this.ws) {
            this.ws.close(1000, 'User ended session');
            this.ws = null;
        }

        this.cleanup();
    }

    /**
     * Cleanup audio resources
     */
    private cleanup(): void {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.streamId = '';
        this.isStreaming = false;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.streamId !== '';
    }
}
