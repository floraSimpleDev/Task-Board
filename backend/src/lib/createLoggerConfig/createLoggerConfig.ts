import type { LoggerOptions } from 'pino'

const createLoggerConfig = (): LoggerOptions => ({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      '*.password',
      '*.token',
    ],
    censor: '[Redacted]',
  },
  serializers: {
    req: (request: { method: string; url: string; remoteAddress?: string; id?: string }) => ({
      method: request.method,
      url: request.url,
      remoteAddress: request.remoteAddress,
      id: request.id,
    }),
    res: (reply: { statusCode: number }) => ({
      statusCode: reply.statusCode,
    }),
  },
})

export default createLoggerConfig
