import mongoose, { Schema, Document } from 'mongoose'

export interface IPayment extends Document {
  appointmentId: mongoose.Types.ObjectId
  patientId: mongoose.Types.ObjectId
  doctorId: mongoose.Types.ObjectId
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  stripePaymentId?: string
  stripeCustomerId?: string
  paymentMethod: string
  transactionId: string
  receiptUrl?: string
  refundAmount?: number
  refundReason?: string
  createdAt: Date
  updatedAt: Date
}

const paymentSchema = new Schema<IPayment>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentId: String,
    stripeCustomerId: String,
    paymentMethod: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
    },
    receiptUrl: String,
    refundAmount: Number,
    refundReason: String,
  },
  { timestamps: true }
)

paymentSchema.index({ patientId: 1, createdAt: -1 })
paymentSchema.index({ appointmentId: 1 })

export default mongoose.model<IPayment>('Payment', paymentSchema)
