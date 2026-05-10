const { error } = require('../utils/response')

/**
 * @param {import('zod').ZodSchema} schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return error(res, 'Validation failed', 422, errors)
  }

  req.validatedQuery = result.data
  next()
}

module.exports = validateQuery
