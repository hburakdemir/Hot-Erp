const pino = require('pino')
const env = require('./env')

const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: {
    env: env.NODE_ENV,
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password'],
    censor: '[REDACTED]',
  },
})

module.exports = logger
