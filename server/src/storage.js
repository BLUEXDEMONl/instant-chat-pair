import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.resolve(__dirname, '../data')
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions')

async function ensureDirs() {
  await fs.mkdir(SESSIONS_DIR, { recursive: true })
}

export async function initStorage() {
  await ensureDirs()
}

export async function saveSession(session) {
  await ensureDirs()
  const file = path.join(SESSIONS_DIR, `${session.id}.json`)
  await fs.writeFile(file, JSON.stringify(session, null, 2), 'utf-8')
}

export async function updateSession(sessionId, updater) {
  await ensureDirs()
  const file = path.join(SESSIONS_DIR, `${sessionId}.json`)
  let session
  try {
    const raw = await fs.readFile(file, 'utf-8')
    session = JSON.parse(raw)
  } catch {
    session = { id: sessionId, startedAt: new Date().toISOString(), messages: [], status: 'active' }
  }
  const updated = updater(session) || session
  await fs.writeFile(file, JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}

export async function appendMessage(sessionId, message) {
  return updateSession(sessionId, (s) => {
    s.messages = s.messages || []
    s.messages.push({ ...message, at: new Date().toISOString() })
    return s
  })
}

export async function endSession(sessionId, reason = 'ended') {
  return updateSession(sessionId, (s) => {
    s.endedAt = new Date().toISOString()
    s.status = reason
    return s
  })
}

export async function getSession(sessionId) {
  const file = path.join(SESSIONS_DIR, `${sessionId}.json`)
  const raw = await fs.readFile(file, 'utf-8')
  return JSON.parse(raw)
}

export async function listSessions() {
  await ensureDirs()
  const files = await fs.readdir(SESSIONS_DIR)
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.basename(f, '.json'))
}
