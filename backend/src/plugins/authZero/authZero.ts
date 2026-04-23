import type { FastifyPluginAsync } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import validateEnv from '@/lib/validateEnv'

const authZero: FastifyPluginAsync = async (fastify) => {
  const module = await import('@auth0/auth0-fastify-api')

  const domain = validateEnv('AUTH0_DOMAIN')
  const audience = validateEnv('AUTH0_AUDIENCE')

  await fastify.register(module.default, { domain, audience })
}

export default fastifyPlugin(authZero)
