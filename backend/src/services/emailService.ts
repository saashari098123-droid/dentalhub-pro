import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    })
    console.log(`✅ Email sent to ${to}`)
  } catch (error) {
    console.error('❌ Email sending failed:', error)
  }
}

export const appointmentConfirmationEmail = (patientName: string, doctorName: string, date: string, time: string) => {
  return `
    <h2>Appointment Confirmed</h2>
    <p>Dear ${patientName},</p>
    <p>Your appointment has been confirmed with Dr. ${doctorName}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
    <p>Please arrive 10 minutes early. Thank you!</p>
  `
}

export const appointmentReminderEmail = (patientName: string, doctorName: string, date: string, time: string) => {
  return `
    <h2>Appointment Reminder</h2>
    <p>Dear ${patientName},</p>
    <p>This is a reminder about your upcoming appointment.</p>
    <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
  `
}
