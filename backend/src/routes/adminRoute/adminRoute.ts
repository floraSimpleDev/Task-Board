import type { FastifyPluginAsync } from 'fastify'

import requirePermission from '@/middlewares/requirePermission'
import countBoards from '@/repositories/boards/countBoards'
import adminStatsSchema from '@/types/adminStatsSchema'

const adminRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/admin/stats',
    {
      preHandler: [...fastify.authenticate, requirePermission('read:admin-stats')],
      schema: { response: { 200: adminStatsSchema } },
    },
    async () => {
      const totalBoards = await countBoards(fastify.database)
      return { totalBoards }
    }
  )
}

export default adminRoute
