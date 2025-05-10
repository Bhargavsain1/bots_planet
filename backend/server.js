import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/authRoutes.js'
import { verifyToken } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 5000


app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// routes
app.use('/api/auth', authRoutes)

app.listen(PORT, (err) => {
    if (err) {
        console.error(`Error starting the server...\n>>${err}`)
    } else {
        console.log(`Server running at http://localhost:${PORT}`)
    }
})