import type { FastifyPluginAsync } from 'fastify'

import requirePermission from '@/middlewares/requirePermission'
import countBoards from '@/repositories/boards/countBoards'
import countTaskActivities from '@/repositories/taskActivities/countTaskActivities'
import countTasks from '@/repositories/tasks/countTasks'
import countUsers from '@/repositories/users/countUsers'
import adminStatsSchema from '@/types/adminStatsSchema'

const adminRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/admin/stats',
    {
      preHandler: [...fastify.authenticate, requirePermission('read:admin-stats')],
      schema: { response: { 200: adminStatsSchema } },
    },
    async () => {
      const [totalUsers, totalBoards, totalTasks, totalActivities] = await Promise.all([
        countUsers(fastify.database),
        countBoards(fastify.database),
        countTasks(fastify.database),
        countTaskActivities(fastify.database),
      ])
      return { totalUsers, totalBoards, totalTasks, totalActivities }
    }
  )
}

export default adminRoute
