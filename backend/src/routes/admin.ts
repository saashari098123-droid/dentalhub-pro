import express from 'express'
import User from '../models/User'
import Appointment from '../models/Appointment'
import Payment from '../models/Payment'
import { protect, authorize } from '../middleware/auth'

const router = express.Router()

// Dashboard Stats
router.get('/stats', protect, authorize('admin'), async (req, res, next) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' })
    const totalDoctors = await User.countDocuments({ role: 'doctor' })
    const totalAppointments = await Appointment.countDocuments()
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' })
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Get All Users
router.get('/users', protect, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password')
    res.status(200).json({ success: true, data: users })
  } catch (error) {
    next(error)
  }
})

// Get All Appointments
router.get('/appointments', protect, authorize('admin'), async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId')
      .populate('doctorId')
      .sort({ appointmentDate: -1 })

    res.status(200).json({ success: true, data: appointments })
  } catch (error) {
    next(error)
  }
})

// Get Revenue Report
router.get('/revenue', protect, authorize('admin'), async (req, res, next) => {
  try {
    const revenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.status(200).json({ success: true, data: revenue })
  } catch (error) {
    next(error)
  }
})

export default router
