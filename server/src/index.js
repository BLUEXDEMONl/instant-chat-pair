/*
Minimal Node.js backend for anonymous 1:1 chat (Omegle-like)
- WebSocket matchmaking and relay
- JSON file storage for session transcripts

Run:
  cd server
  npm install
  npm run start

WS URL: ws://localhost:3001/ws
HTTP:   http://localhost:3001

*/

import http from 'http'
import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { Matchmaker } from './matchmaker.js'
import { initStorage, appendMessage, endSession, getSession, listSessions, saveSession } from './storage.js'

const PORT = process.env.PORT || 3001

const app = express()
app.use(cors())
app.use(express.json())

// Health & basic info
app.get('/health', (_req, res) => res.json({ ok: true }))

// Sessions API (read-only for transcripts)
app.get('/api/sessions', async (_req, res) => {
  try {
    const ids = await listSessions()
    res.json({ sessions: ids })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

app.get('/api/sessions/:id', async (req, res) => {
  try {
    const sess = await getSession(req.params.id)
    res.json(sess)
  } catch (e) {
    res.status(404).json({ error: 'Not found' })
  }
})

const server = http.createServer(app)

const wss = new WebSocketServer({ server, path: '/ws' })
const mm = new Matchmaker()

await initStorage()

wss.on('connection', (ws) => {
  const client = { id: Math.random().toString(36).slice(2), ws, peer: null, sessionId: null }

  const safeSend = (socket, data) => {
    if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(data))
  }

  ws.on('message', async (raw) => {
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    switch (msg.type) {
      case 'hello': {
        // Put the client into matchmaking queue
        mm.enqueue(client)
        break
      }
      case 'message': {
        if (!client.peer || !client.sessionId) return
        const payload = { type: 'message', text: String(msg.text || ''), from: 'stranger' }
        safeSend(client.peer.ws, payload)
        // Persist message (sender perspective is 'you')
        await appendMessage(client.sessionId, { from: client.id, text: payload.text })
        break
      }
      case 'typing': {
        if (!client.peer) return
        safeSend(client.peer.ws, { type: 'typing', value: !!msg.value })
        break
      }
      case 'next': {
        // End current session and requeue client
        if (client.sessionId) {
          await endSession(client.sessionId, 'next')
          const old = client.peer
          if (old?.ws) safeSend(old.ws, { type: 'peer_left' })
          if (old) {
            old.peer = null
            old.sessionId = null
            mm.enqueue(old)
          }
          mm.endSession(client.sessionId)
          client.peer = null
          client.sessionId = null
        }
        mm.enqueue(client)
        break
      }
      case 'disconnect': {
        ws.close()
        break
      }
      default:
        break
    }
  })

  ws.on('close', async () => {
    // Remove from queue if present
    mm.removeFromQueue(client)

    // If paired, notify peer and close session
    if (client.sessionId) {
      const peer = client.peer
      if (peer?.ws) safeSend(peer.ws, { type: 'peer_left' })
      await endSession(client.sessionId, 'disconnected')
      mm.endSession(client.sessionId)
      if (peer) {
        peer.peer = null
        peer.sessionId = null
        // keep peer in queue for rematch
        mm.enqueue(peer)
      }
    }
  })

  // When the client first connects, we create a session stub on match
  const originalTryMatch = mm.tryMatch.bind(mm)
  mm.tryMatch = function patchedTryMatch() {
    const before = this.waiting.length
    const res = originalTryMatch()
    const after = this.waiting.length
    if (after < before - 1) {
      // A pair was just created; find it and persist initial session
      for (const [sid, pair] of this.sessions.entries()) {
        if (pair.a.sessionId === sid && pair.b.sessionId === sid) {
          // Save initial session record
          saveSession({ id: sid, startedAt: new Date().toISOString(), status: 'active', messages: [] }).catch(() => {})
        }
      }
    }
    return res
  }
})

server.listen(PORT, () => {
  console.log(`InstantChat backend listening on http://localhost:${PORT}`)
})
