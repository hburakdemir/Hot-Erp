const authService = require('./auth.service')
const { setAuthCookies, clearAuthCookies } = require('../../utils/cookie')
const { success } = require('../../utils/response')

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body, req)
    return success(res, user, 'Registration successful', 201)
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, rememberMe, user } = await authService.login(req.body, req)
    setAuthCookies(res, accessToken, refreshToken, rememberMe)
    return success(res, { user }, 'Login successful')
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken
    await authService.logout(refreshToken, req)
    clearAuthCookies(res)
    return success(res, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

const logoutAll = async (req, res, next) => {
  try {
    await authService.revokeAllSessions(req.user.userId, req)
    clearAuthCookies(res)
    return success(res, null, 'All sessions terminated')
  } catch (err) {
    next(err)
  }
}

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken
    const { accessToken, refreshToken: newRefresh, rememberMe } = await authService.refresh(
      refreshToken,
      req
    )
    setAuthCookies(res, accessToken, newRefresh, rememberMe)
    return success(res, null, 'Token refreshed successfully')
  } catch (err) {
    next(err)
  }
}

const me = async (req, res, next) => {
  try {
    const profile = await authService.me(req.user.userId)
    return success(res, profile, 'Profile loaded')
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, logout, logoutAll, refresh, me }
