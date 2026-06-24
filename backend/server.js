import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'

// Routes
import authRoutes from './routes/auth.js'
import entriesRoutes from './routes/entries.js'
import mediaRoutes from './routes/media.js'
import lettersRoutes from './routes/letters.js'
import messagesRoutes from './routes/messages.js'
import connectionsRoutes from './routes/connections.js'
import profileRoutes from './routes/profile.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

app.set('io', io)

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/entries', entriesRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/letters', lettersRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/connections', connectionsRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🌿 Botanical Diary API is blooming' })
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🌱 Client connected:', socket.id)

  // Join a connection room for real-time messaging
  socket.on('joinConnection', (connectionId) => {
    socket.join(`connection:${connectionId}`)
    console.log(`Socket ${socket.id} joined connection:${connectionId}`)
  })

  socket.on('leaveConnection', (connectionId) => {
    socket.leave(`connection:${connectionId}`)
  })

  socket.on('disconnect', () => {
    console.log('🍂 Client disconnected:', socket.id)
  })
})

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`\n🌿 Botanical Diary API running on port ${PORT}`)
    console.log(`   Health: http://localhost:${PORT}/api/health\n`)
  })
})
