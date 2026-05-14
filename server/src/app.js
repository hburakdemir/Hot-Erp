require('dotenv').config()

const express    = require('express')
const cookieParser = require('cookie-parser')
const pinoHttp   = require('pino-http')

const env             = require('./config/env')
const logger          = require('./config/logger')
const errorMiddleware = require('./middleware/error.middleware')

// Modul route'lari
const authRoutes       = require('./modules/auth/auth.routes')
const userRoutes       = require('./modules/user/user.routes')
const roleRoutes       = require('./modules/role/role.routes')
const permissionRoutes = require('./modules/permission/permission.routes')
const memberRoutes     = require('./modules/member/member.routes')
const auditRoutes      = require('./modules/audit/audit.routes')
const dashboardRoutes  = require('./modules/dashboard/dashboard.routes')
const announcementRoutes = require('./modules/announcement/announcement.routes')
const eventRoutes      = require('./modules/event/event.routes')
const meetingRoutes    = require('./modules/meeting/meeting.routes')
const clubRoutes       = require('./modules/club/club.routes')

const app = express()

// HTTP isteklerini pino ile logla
app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error'
      if (res.statusCode >= 400) return 'warn'
      return 'info'
    },
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} -> ${res.statusCode}`,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(env.COOKIE_SECRET))

// CORS - sadece izin verilen origin'den gelen istekleri kabul et
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', env.CLIENT_URL)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

// Saglik kontrolu - load balancer veya uptime aracları icin
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV })
})

// API route'lari
app.use('/auth',        authRoutes)
app.use('/users',       userRoutes)
app.use('/roles',       roleRoutes)
app.use('/permissions', permissionRoutes)
app.use('/members',     memberRoutes)
app.use('/audit-logs',  auditRoutes)
app.use('/dashboard',  dashboardRoutes)
app.use('/announcements', announcementRoutes)
app.use('/events',      eventRoutes)
app.use('/meetings',    meetingRoutes)
app.use('/clubs',       clubRoutes)

// Tanimlanmamis route'lar icin 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route bulunamadi: ${req.method} ${req.url}`,
  })
})

// Global hata yakalayici - tum next(err) cagrilarini burada yakala
app.use(errorMiddleware)

const PORT = parseInt(env.PORT)
app.listen(PORT, () => {
  logger.info(`Sunucu port ${PORT} uzerinde calisiyor [${env.NODE_ENV}]`)
})

module.exports = app
