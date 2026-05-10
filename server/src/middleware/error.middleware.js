const logger = require('../config/logger')
const { AppError } = require('../errors/AppError')

const prismaCodeToHttp = (code) => {
  switch (code) {
    case 'P2002':
      return { status: 409, message: 'Duplicate record' }
    case 'P2025':
      return { status: 404, message: 'Record not found' }
    case 'P2003':
      return { status: 400, message: 'Invalid relation' }
    default:
      return { status: 500, message: 'Database error' }
  }
}

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
    })
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const mapped = prismaCodeToHttp(err.code)
    logger.warn({ prismaCode: err.code, meta: err.meta }, 'prisma.client_error')
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
      code: err.code,
    })
  }

  if (err.name === 'PrismaClientValidationError') {
    logger.warn({ err: err.message }, 'prisma.validation_error')
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      code: 'PRISMA_VALIDATION',
    })
  }

  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal Server Error'

  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      req: {
        method: req.method,
        url: req.url,
      },
    },
    'unhandled_error'
  )

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = errorMiddleware
