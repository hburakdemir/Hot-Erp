const { error } = require('../utils/response')

/**
 * Validate request body using a Zod schema
 * @param {import('zod').ZodSchema} schema
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return error(res, 'Validation failed', 422, errors)
  }

  req.body = result.data
  next()
}

module.exports = validate
