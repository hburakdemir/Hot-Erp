const jwt = require('jsonwebtoken')
const env = require('../config/env')

/**
 * Generate access token (15m)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  })
}

/**
 * Generate refresh token
 * @param {string} userId
 * @param {boolean} rememberMe - 30d if true, 1d otherwise
 */
const generateRefreshToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe
    ? env.REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN
    : env.REFRESH_TOKEN_EXPIRES_IN

  return jwt.sign({ userId }, env.REFRESH_TOKEN_SECRET, { expiresIn })
}

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET)
}

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET)
}

/**
 * Parse "15m", "1d", "30d" strings to milliseconds for cookie maxAge
 */
const parseDurationToMs = (duration) => {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  const match = duration.match(/^(\d+)([smhd])$/)
  if (!match) throw new Error(`Invalid duration format: ${duration}`)
  return parseInt(match[1]) * units[match[2]]
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  parseDurationToMs,
}
