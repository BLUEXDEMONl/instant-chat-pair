import { nanoid } from 'nanoid'

export class Matchmaker {
  constructor() {
    this.waiting = [] // array of clients
    this.sessions = new Map() // sessionId -> { a, b }
  }

  enqueue(client) {
    // Avoid duplicates
    if (!this.waiting.includes(client)) {
      this.waiting.push(client)
    }
    this.tryMatch()
  }

  removeFromQueue(client) {
    this.waiting = this.waiting.filter((c) => c !== client)
  }

  tryMatch() {
    while (this.waiting.length >= 2) {
      const a = this.waiting.shift()
      const b = this.waiting.shift()
      if (!a?.ws?.readyState === 1) continue
      if (!b?.ws?.readyState === 1) {
        // put back a if b invalid
        this.waiting.unshift(a)
        break
      }
      const sessionId = nanoid(12)
      this.sessions.set(sessionId, { a, b })
      a.peer = b
      b.peer = a
      a.sessionId = sessionId
      b.sessionId = sessionId
      a.ws.send(JSON.stringify({ type: 'matched', sessionId }))
      b.ws.send(JSON.stringify({ type: 'matched', sessionId }))
    }
  }

  getPeers(sessionId) {
    return this.sessions.get(sessionId)
  }

  endSession(sessionId) {
    const pair = this.sessions.get(sessionId)
    if (!pair) return
    pair.a && (pair.a.peer = null)
    pair.b && (pair.b.peer = null)
    this.sessions.delete(sessionId)
  }
}
