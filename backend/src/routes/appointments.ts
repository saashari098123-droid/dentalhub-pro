import express from 'express'
import Appointment from '../models/Appointment'
import User from '../models/User'
import { AuthRequest, protect, authorize } from '../middleware/auth'
import { sendEmail, appointmentConfirmationEmail } from '../services/emailService'
import { AppError } from '../middleware/errorHandler'

const router = express.Router()

// Book Appointment
router.post('/', protect, async (req: AuthRequest, res, next) => {
  try {
    const { doctorId, serviceId, appointmentDate, timeSlot, notes } = req.body

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      serviceId,
      appointmentDate,
      timeSlot,
      notes,
      status: 'confirmed',
    })

    await appointment.populate(['patientId', 'doctorId'])

    const patient = await User.findById(req.user.id)
    const doctor = await User.findById(doctorId)

    if (patient && doctor) {
      const emailHtml = appointmentConfirmationEmail(
        patient.firstName,
        doctor.firstName,
        new Date(appointmentDate).toLocaleDateString(),
        timeSlot
      )
      await sendEmail(patient.email, 'Appointment Confirmed', emailHtml)
    }

    res.status(201).json({ success: true, data: appointment })
  } catch (error) {
    next(error)
  }
})

// Get All Appointments
router.get('/', protect, async (req: AuthRequest, res, next) => {
  try {
    const query = req.user.role === 'patient' ? { patientId: req.user.id } : {}
    const appointments = await Appointment.find(query)
      .populate('patientId')
      .populate('doctorId')
      .sort({ appointmentDate: -1 })

    res.status(200).json({ success: true, data: appointments })
  } catch (error) {
    next(error)
  }
})

// Get Appointment by ID
router.get('/:id', protect, async (req: AuthRequest, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId')

    if (!appointment) {
      throw new AppError(404, 'Appointment not found')
    }

    res.status(200).json({ success: true, data: appointment })
  } catch (error) {
    next(error)
  }
})

// Update Appointment
router.put('/:id', protect, async (req: AuthRequest, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(['patientId', 'doctorId'])

    res.status(200).json({ success: true, data: appointment })
  } catch (error) {
    next(error)
  }
})

// Cancel Appointment
router.delete('/:id', protect, async (req: AuthRequest, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    )

    res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment })
  } catch (error) {
    next(error)
  }
})

export default router
