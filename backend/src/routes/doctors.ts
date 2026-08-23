import express from 'express'
import User from '../models/User'
import { protect, authorize } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = express.Router()

// Get All Doctors
router.get('/', async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password')
    res.status(200).json({ success: true, data: doctors })
  } catch (error) {
    next(error)
  }
})

// Get Doctor by ID
router.get('/:id', async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.id).select('-password')
    
    if (!doctor || doctor.role !== 'doctor') {
      throw new AppError(404, 'Doctor not found')
    }

    res.status(200).json({ success: true, data: doctor })
  } catch (error) {
    next(error)
  }
})

// Create Doctor (Admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const doctor = await User.create({
      ...req.body,
      role: 'doctor',
    })

    res.status(201).json({ success: true, data: doctor })
  } catch (error) {
    next(error)
  }
})

// Update Doctor (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const doctor = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({ success: true, data: doctor })
  } catch (error) {
    next(error)
  }
})

// Delete Doctor (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: 'Doctor deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
