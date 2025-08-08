# InstantChat Backend (Node.js + WebSocket + JSON storage)

This is a minimal Node.js backend that provides anonymous 1:1 matchmaking over WebSockets and stores chat transcripts in JSON files.

- WebSocket: ws://localhost:3001/ws
- REST API:
  - GET /health
  - GET /api/sessions — list session IDs
  - GET /api/sessions/:id — fetch transcript JSON

## Run locally

1) cd server
2) npm install
3) npm run start

Open a WebSocket client and send a hello message to enter the queue:

- Connect to ws://localhost:3001/ws
- Send: {"type":"hello"}

When matched, both clients receive: {"type":"matched","sessionId":"..."}

Send a chat message:
- {"type":"message","text":"Hi"}

Optional events:
- {"type":"typing","value":true}
- {"type":"next"}        // leave current session and rematch
- {"type":"disconnect"}  // close connection

## Data storage

JSON files are saved under server/data/sessions/<sessionId>.json

Each transcript example:
{
  "id": "abc123",
  "startedAt": "2025-08-08T00:00:00.000Z",
  "status": "active|next|disconnected|ended",
  "messages": [
    { "from": "clientId", "text": "Hello", "at": "2025-08-08T00:00:01.000Z" }
  ]
}

Notes:
- This backend is standalone and does not modify the existing React app.
- You can integrate your frontend by connecting to the WS URL and consuming these events.
