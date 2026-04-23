import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import type { FastifyPluginAsync } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

const swagger: FastifyPluginAsync = async (fastify) => {
  const port = process.env.PORT
  const host = process.env.HOST

  if (!port) {
    throw new Error('Missing environment variable port')
  }

  if (!host) {
    throw new Error('Missing environment variable host')
  }

  const serverUrl = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Task Board API',
        description: 'REST API for the Task Board application',
        version: '0.0.0',
      },
      servers: [{ url: serverUrl }],
    },
  })

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  })
}

export default fastifyPlugin(swagger)
