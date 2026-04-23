import type { FastifyPluginAsync } from 'fastify'

import requirePermission from '@/middlewares/requirePermission'
import countBoards from '@/repositories/countBoards'
import adminStatsSchema from '@/types/adminStatsSchema'

const adminRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/admin/stats',
    {
      preHandler: [...fastify.authenticate, requirePermission('read:admin-stats')],
      schema: { response: { 200: adminStatsSchema } },
    },
    async () => {
      const aalBoards = await countBoards(fastify.database)
      return { aalBoards }
    }
  )
}

export default adminRoute
