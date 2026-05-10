const env = require('../config/env')
const { parseDurationToMs } = require('./jwt')

const cookieOptions = (maxAgeDuration) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: parseDurationToMs(maxAgeDuration),
  path: '/',
})

const setAuthCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  res.cookie('accessToken', accessToken, cookieOptions(env.ACCESS_TOKEN_EXPIRES_IN))

  const refreshExpiry = rememberMe
    ? env.REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN
    : env.REFRESH_TOKEN_EXPIRES_IN

  res.cookie('refreshToken', refreshToken, cookieOptions(refreshExpiry))
}

const clearAuthCookies = (res) => {
  const clearOptions = { httpOnly: true, path: '/' }
  res.clearCookie('accessToken', clearOptions)
  res.clearCookie('refreshToken', clearOptions)
}

module.exports = { setAuthCookies, clearAuthCookies }
