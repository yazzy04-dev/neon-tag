# NEON TAG multiplayer starter

Includes the current browser game (`index.html`) and a Node.js WebSocket room server (`server.js`). The server provides room membership, player-state broadcast, disconnect cleanup, and a basic tag-event message.

## Important status
This is a starter kit, not a finished multiplayer game yet. The included `index.html` still has the old local-simulation room buttons and must be wired to the `/ws` WebSocket endpoint so remote player states are rendered and tagging is authoritative. Do not publish it as completed multiplayer until that client integration is implemented and tested.

## Run the server locally
1. Install Node.js 18 or newer from https://nodejs.org/.
2. In this folder, run `npm install`.
3. Run `npm start`.
4. Visit `http://localhost:10000/healthz` to see `ok`.

## Deploy server on Render
- Create a GitHub repository and upload these files.
- On Render, choose **New → Web Service** and connect the repository.
- Build command: `npm install`
- Start command: `npm start`
- Select Free while testing.
- After deploy, your server URL will resemble `https://YOUR-SERVICE.onrender.com`; WebSocket URL is `wss://YOUR-SERVICE.onrender.com/ws`.

Free Render services can sleep after inactivity and may take about a minute to wake up. See https://render.com/docs/free and https://render.com/docs/websocket.
