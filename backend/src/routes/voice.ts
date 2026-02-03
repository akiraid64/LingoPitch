import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';

const router = Router();

// Generate LiveKit token for voice session
router.post('/token', async (req, res) => {
    try {
        const { roomName, participantName } = req.body;

        if (!roomName || !participantName) {
            return res.status(400).json({
                success: false,
                error: { message: 'roomName and participantName  are required' }
            });
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!apiKey || !apiSecret) {
            return res.status(500).json({
                success: false,
                error: { message: 'LiveKit credentials not configured' }
            });
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: participantName,
        });

        at.addGrant({ roomJoin: true, room: roomName });

        const token = await at.toJwt();

        res.json({
            success: true,
            token,
            url: process.env.LIVEKIT_URL || ''
        });
    } catch (error) {
        console.error('Error generating LiveKit token:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to generate voice token' }
        });
    }
});

export default router;
