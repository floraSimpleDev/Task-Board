import { STATUS_CODES } from 'node:http'

import type { FastifyError, FastifyPluginAsync } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import resolveErrorStatus from '@/lib/resolveErrorStatus'

const errorHandler: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler<FastifyError>((error, request, reply) => {
    const { statusCode, trustMessage } = resolveErrorStatus(error)
    const isClientError = statusCode >= 400 && statusCode < 500
    const statusName = STATUS_CODES[statusCode] ?? 'Error'

    if (isClientError) {
      request.log.warn({ err: error }, 'Client error')
    } else {
      request.log.error({ err: error }, 'Unhandled server error')
    }

    void reply.code(statusCode).send({
      error: statusName,
      message: !isClientError ? 'Internal server error' : trustMessage ? error.message : statusName,
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
