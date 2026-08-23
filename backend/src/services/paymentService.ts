import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const createPaymentIntent = async (amount: number, patientEmail: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      receipt_email: patientEmail,
      metadata: {
        integration_check: 'accept_a_payment',
      },
    })
    return paymentIntent
  } catch (error) {
    throw error
  }
}

export const refundPayment = async (paymentIntentId: string, amount?: number) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    })
    return refund
  } catch (error) {
    throw error
  }
}

export const retrievePaymentIntent = async (paymentIntentId: string) => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    throw error
  }
}
