import { type Static } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

import { decodeCursor, encodeCursor } from '@/lib/cursorPagination'
import { BadRequestError } from '@/lib/httpErrors'
import requirePermission from '@/middlewares/requirePermission'
import countBoards from '@/repositories/boards/countBoards'
import listAllBoardsWithOwner from '@/repositories/boards/listAllBoardsWithOwner'
import countTaskActivities from '@/repositories/taskActivities/countTaskActivities'
import listAllActivitiesWithContext from '@/repositories/taskActivities/listAllActivitiesWithContext'
import countTasks from '@/repositories/tasks/countTasks'
import listAllTasksWithContext from '@/repositories/tasks/listAllTasksWithContext'
import countUsers from '@/repositories/users/countUsers'
import listAllUsers from '@/repositories/users/listAllUsers'
import adminActivityListSchema from '@/types/admin/adminActivityListSchema'
import adminBoardListSchema from '@/types/admin/adminBoardListSchema'
import adminCursorQuerySchema from '@/types/admin/adminCursorQuerySchema'
import adminTaskListSchema from '@/types/admin/adminTaskListSchema'
import adminUserListSchema from '@/types/admin/adminUserListSchema'
import adminStatsSchema from '@/types/adminStatsSchema'

type AdminCursorQuery = Static<typeof adminCursorQuerySchema>

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

  fastify.get<{ Querystring: AdminCursorQuery }>(
    '/admin/tasks',
    {
      preHandler: [...fastify.authenticate, requirePermission(REQUIRE_ADMIN)],
      schema: { querystring: adminCursorQuerySchema, response: { 200: adminTaskListSchema } },
    },
    async (request) => {
      const { cursor: rawCursor, limit = 25 } = request.query
      const decodedCursor = rawCursor ? decodeCursor(rawCursor) : undefined
      if (rawCursor && !decodedCursor) {
        throw new BadRequestError('Invalid cursor')
      }

      const rows = await listAllTasksWithContext(fastify.database, {
        cursor: decodedCursor ?? undefined,
        limit: limit + 1,
      })

      const hasMore = rows.length > limit
      const items = hasMore ? rows.slice(0, limit) : rows
      const lastItem = items.at(-1)
      const nextCursor =
        hasMore && lastItem
          ? encodeCursor({ createdAt: lastItem.createdAt, id: lastItem.id })
          : null

      return {
        items: items.map(({ createdAt, ...rest }) => ({
          ...rest,
          createdAt: createdAt.toISOString(),
        })),
        nextCursor,
      }
    }
  )

  fastify.get<{ Querystring: AdminCursorQuery }>(
    '/admin/activities',
    {
      preHandler: [...fastify.authenticate, requirePermission(REQUIRE_ADMIN)],
      schema: { querystring: adminCursorQuerySchema, response: { 200: adminActivityListSchema } },
    },
    async (request) => {
      const { cursor: rawCursor, limit = 25 } = request.query
      const decodedCursor = rawCursor ? decodeCursor(rawCursor) : undefined
      if (rawCursor && !decodedCursor) {
        throw new BadRequestError('Invalid cursor')
      }

      const rows = await listAllActivitiesWithContext(fastify.database, {
        cursor: decodedCursor ?? undefined,
        limit: limit + 1,
      })

      const hasMore = rows.length > limit
      const items = hasMore ? rows.slice(0, limit) : rows
      const lastItem = items.at(-1)
      const nextCursor =
        hasMore && lastItem
          ? encodeCursor({ createdAt: lastItem.createdAt, id: lastItem.id })
          : null

      return {
        items: items.map(({ createdAt, ...rest }) => ({
          ...rest,
          createdAt: createdAt.toISOString(),
        })),
        nextCursor,
      }
    }
  )
}

export default adminRoute
