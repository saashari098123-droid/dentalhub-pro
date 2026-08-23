import express from 'express'
import Payment from '../models/Payment'
import { AuthRequest, protect, authorize } from '../middleware/auth'
import { createPaymentIntent, refundPayment } from '../services/paymentService'
import { AppError } from '../middleware/errorHandler'

const router = express.Router()

// Create Payment Intent
router.post('/create-intent', protect, async (req: AuthRequest, res, next) => {
  try {
    const { amount, appointmentId } = req.body
    const user = await require('../models/User').findById(req.user.id)

    const paymentIntent = await createPaymentIntent(amount, user.email)

    const payment = await Payment.create({
      appointmentId,
      patientId: req.user.id,
      amount,
      currency: 'USD',
      status: 'pending',
      stripePaymentId: paymentIntent.id,
      paymentMethod: 'card',
      transactionId: `TXN_${Date.now()}`,
    })

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      payment,
    })
  } catch (error) {
    next(error)
  }
})

// Get Payment History
router.get('/', protect, async (req: AuthRequest, res, next) => {
  try {
    const payments = await Payment.find({ patientId: req.user.id })
      .populate('appointmentId')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, data: payments })
  } catch (error) {
    next(error)
  }
})

// Refund Payment
router.post('/:id/refund', protect, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)

    if (!payment) {
      throw new AppError(404, 'Payment not found')
    }

    const refund = await refundPayment(payment.stripePaymentId!)

    payment.status = 'refunded'
    payment.refundAmount = payment.amount
    payment.refundReason = req.body.reason
    await payment.save()

    res.status(200).json({ success: true, data: payment, refund })
  } catch (error) {
    next(error)
  }
})

export default router
