import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import type { FastifyPluginAsync } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

const swagger: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Task Board API',
        description: 'REST API for the Task Board application',
        version: '0.0.0',
      },
      servers: [{ url: 'http://localhost:3000' }],
    },
  })

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  })
}

export default fastifyPlugin(swagger)
