import express from 'express'
import loger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { createClient } from '@libsql/client'

import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT ?? 1999

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {}
})

const db = createClient({
  url: 'libsql://working-huntress-purple-code-sh.turso.io',
  authToken: process.env.DB_TOKEN
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    userName TEXT
  )
`)

io.on('connection', async (socket) => {
  console.log('An user has connected')

  socket.on('disconnect', () => {
    console.log('An user has disconnected')
  })

  socket.on('chat message', async (msg) => {
    const userName = socket.handshake.auth.userName ?? 'anonymus'
    let result
    try {
      result = await db.execute({
        sql: 'INSERT INTO messages (content, userName) VALUES (:msg, :userName)',
        args: { msg, userName }
      })
    } catch (error) {
      console.error(error)
      return
    }
    io.emit('chat message', msg, result.lastInsertRowid.toString(), userName)
  })

  if (!socket.recovered) {
    try {
      const result = await db.execute({
        sql: 'SELECT id, content, userName FROM messages WHERE id > ?',
        args: [socket.handshake.auth.serverOffset ?? 0]
      })

      result.rows.forEach(row => {
        socket.emit('chat message', row.content, row.id.toString(), row.userName)
      })
    } catch (error) {
      console.error(error)
    }
  }
})

app.use(loger('dev'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
