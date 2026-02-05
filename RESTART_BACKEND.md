# ⚠️ RESTART REQUIRED

The backend server is still using the old `localhost` value for `PYTHON_AGENT_URL`.

**Please restart the backend to pick up the new IPv4 configuration:**

1. In the backend terminal, press `Ctrl+C` to stop it
2. Run `npm run dev` again

The backend will then use `127.0.0.1:8001` instead of `localhost:8001`, which will fix the IPv6 connection issue.

**After restarting, the voice agent will work!**
