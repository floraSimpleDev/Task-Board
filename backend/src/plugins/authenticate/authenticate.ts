import type { FastifyPluginAsync, FastifyRequest, preHandlerHookHandler } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { users } from '@/db/schema/users'
import fetchUserInfo from '@/lib/fetchUserInfo'
import validateEnv from '@/lib/validateEnv'
import provisionAuthedUser from '@/services/provisionAuthedUser'

type LocalUser = typeof users.$inferSelect

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: preHandlerHookHandler[]
  }
  interface FastifyRequest {
    dbUser: LocalUser
  }
}

const authenticate: FastifyPluginAsync = async (fastify) => {
  const auth0Domain = validateEnv('AUTH0_DOMAIN')

  const attachAuthedUser = async (request: FastifyRequest): Promise<void> => {
    request.dbUser = await provisionAuthedUser({
      database: fastify.database,
      claims: request.user,
      fetchUserInfo: () => fetchUserInfo(auth0Domain, request.getToken() ?? ''),
    })
  }

  fastify.decorate('authenticate', [fastify.requireAuth(), attachAuthedUser])
}

export default fastifyPlugin(authenticate)
