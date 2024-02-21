import express from 'express'
import loger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'

const port = process.env.PORT ?? 1999

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(loger('dev'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
