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
  })
}

export default fastifyPlugin(cors)
