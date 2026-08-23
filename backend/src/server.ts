import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/database'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth'
import appointmentRoutes from './routes/appointments'
import doctorRoutes from './routes/doctors'
import paymentRoutes from './routes/payments'
import adminRoutes from './routes/admin'

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Server is running' })
})

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error Handler
app.use(errorHandler)

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`)
})

export default app
