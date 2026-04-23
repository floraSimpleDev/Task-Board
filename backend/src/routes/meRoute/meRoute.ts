import type { FastifyPluginAsync } from 'fastify'

import meSchema from '@/types/meSchema'

const meRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/me',
    {
      preHandler: fastify.authenticate,
      schema: { response: { 200: meSchema } },
    },
    async (request) => request.dbUser
  )
}

export default meRoute
