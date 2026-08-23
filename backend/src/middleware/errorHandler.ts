import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  console.error(`[ERROR] ${statusCode}: ${message}`)

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' })
  }

  res.status(statusCode).json({ message })
}
