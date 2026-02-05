# ⚠️ IMPORTANT: agent.py is NO LONGER NEEDED!

We've switched from running a local Cartesia Line SDK server to using **Cartesia's hosted infrastructure**.

## What Changed

- **Before**: Tried to run local `agent.py` server (which kept crashing)
- **Now**: Using Cartesia's hosted API at `wss://api.cartesia.ai/agents/stream/{agent_id}`

## What You Need

1. **Start server.py** (HTTP bridge for access token generation)
2. **No agent.py needed** - Cartesia hosts the voice agent
3. **Create an agent in Cartesia Playground** to get a real agent_id

## Next Steps

1. Go to https://play.cartesia.ai
2. Create a voice agent
3. Copy the agent ID
4. Update `server.py` line with your agent_id (currently set to "default")

The local Line SDK approach was causing port binding errors. The hosted API is the correct approach!
