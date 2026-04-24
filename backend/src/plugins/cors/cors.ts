import fastifyCors from '@fastify/cors'
import type { FastifyPluginAsync } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import validateEnv from '@/lib/validateEnv'

const cors: FastifyPluginAsync = async (fastify) => {
  const origin = validateEnv('CORS_ORIGIN')
    .split(',')
    .map((entry) => entry.trim())

  await fastify.register(fastifyCors, {
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}

export default fastifyPlugin(cors)
