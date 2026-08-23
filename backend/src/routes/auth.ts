import express, { Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest, protect } from '../middleware/auth'
import { sendEmail } from '../services/emailService'

const router = express.Router()

const generateTokens = (userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d',
  })
  return { token, refreshToken }
}

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body

    if (!firstName || !lastName || !email || !password) {
      throw new AppError(400, 'Please provide all required fields')
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
      throw new AppError(400, 'Email already registered')
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || 'patient',
    })

    const { token, refreshToken } = generateTokens(user._id.toString(), user.role)

    await sendEmail(
      user.email,
      'Welcome to DentalHub Pro',
      `<h2>Welcome ${user.firstName}!</h2><p>Your account has been created successfully.</p>`
    )

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new AppError(400, 'Please provide email and password')
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw new AppError(401, 'Invalid credentials')
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      throw new AppError(401, 'Invalid credentials')
    }

    const { token, refreshToken } = generateTokens(user._id.toString(), user.role)

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    })
  } catch (error) {
    next(error)
  }
})

// Get Profile
router.get('/profile', protect, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
})

// Update Profile
router.put('/profile', protect, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    })
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
})

export default router
