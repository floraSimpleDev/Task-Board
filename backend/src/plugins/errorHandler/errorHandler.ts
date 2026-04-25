import { STATUS_CODES } from 'node:http'

import type { FastifyError, FastifyPluginAsync } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

const errorHandler: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler<FastifyError>((error, request, reply) => {
    const statusCode = error.statusCode ?? 500
    const isClientError = statusCode >= 400 && statusCode < 500

    if (isClientError) {
      request.log.warn({ err: error }, 'Client error')
    } else {
      request.log.error({ err: error }, 'Unhandled server error')
    }

    void reply.code(statusCode).send({
      error: STATUS_CODES[statusCode] ?? 'Error',
      message: isClientError ? error.message : 'Internal server error',
    })
  })

  fastify.setNotFoundHandler((request, reply) => {
    void reply.code(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
    })
  })
}

export default fastifyPlugin(errorHandler)
