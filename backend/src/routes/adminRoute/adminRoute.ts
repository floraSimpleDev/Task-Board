import type { FastifyPluginAsync } from 'fastify'

import requirePermission from '@/middlewares/requirePermission'
import countBoards from '@/repositories/boards/countBoards'
import listAllBoardsWithOwner from '@/repositories/boards/listAllBoardsWithOwner'
import countTaskActivities from '@/repositories/taskActivities/countTaskActivities'
import countTasks from '@/repositories/tasks/countTasks'
import countUsers from '@/repositories/users/countUsers'
import listAllUsers from '@/repositories/users/listAllUsers'
import adminBoardListSchema from '@/types/admin/adminBoardListSchema'
import adminUserListSchema from '@/types/admin/adminUserListSchema'
import adminStatsSchema from '@/types/adminStatsSchema'

const REQUIRE_ADMIN = 'read:admin-stats'

const adminRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/admin/stats',
    {
      preHandler: [...fastify.authenticate, requirePermission(REQUIRE_ADMIN)],
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

  fastify.get(
    '/admin/users',
    {
      preHandler: [...fastify.authenticate, requirePermission(REQUIRE_ADMIN)],
      schema: { response: { 200: adminUserListSchema } },
    },
    async () => {
      const records = await listAllUsers(fastify.database)
      return records.map(({ id, email, userName, createdAt }) => ({
        id,
        email,
        userName,
        createdAt,
      }))
    }
  )

  fastify.get(
    '/admin/boards',
    {
      preHandler: [...fastify.authenticate, requirePermission(REQUIRE_ADMIN)],
      schema: { response: { 200: adminBoardListSchema } },
    },
    async () => listAllBoardsWithOwner(fastify.database)
  )
}

export default adminRoute
