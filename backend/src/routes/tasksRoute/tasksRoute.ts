import { type Static } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

import { NotFoundError } from '@/lib/httpErrors'
import getMyColumn from '@/repositories/columns/getMyColumn'
import createTaskActivity from '@/repositories/taskActivities/createTaskActivity'
import listTaskActivities from '@/repositories/taskActivities/listTaskActivities'
import createTask from '@/repositories/tasks/createTask'
import deleteTask from '@/repositories/tasks/deleteTask'
import getMyTask from '@/repositories/tasks/getMyTask'
import updateTask from '@/repositories/tasks/updateTask'
import columnIdParamsSchema from '@/types/columns/columnIdParamsSchema'
import createTaskSchema from '@/types/tasks/createTaskSchema'
import taskActivityListSchema from '@/types/tasks/taskActivityListSchema'
import taskIdParamsSchema from '@/types/tasks/taskIdParamsSchema'
import taskSchema from '@/types/tasks/taskSchema'
import updateTaskSchema from '@/types/tasks/updateTaskSchema'

type ColumnIdParams = Static<typeof columnIdParamsSchema>
type TaskIdParams = Static<typeof taskIdParamsSchema>
type CreateTaskBody = Static<typeof createTaskSchema>
type UpdateTaskBody = Static<typeof updateTaskSchema>

interface TaskSnapshot {
  title: string
  description: string | null
  priority: 'P0' | 'P1' | 'P2' | null
  boardColumnId: string
}

interface FieldChange<TValue> {
  from: TValue
  to: TValue
}

interface UpdatedChanges {
  title?: FieldChange<string>
  description?: FieldChange<string | null>
  priority?: FieldChange<'P0' | 'P1' | 'P2' | null>
}

const diffTaskFields = (before: TaskSnapshot, after: TaskSnapshot): UpdatedChanges => {
  const changes: UpdatedChanges = {}
  if (before.title !== after.title) {
    changes.title = { from: before.title, to: after.title }
  }
  if (before.description !== after.description) {
    changes.description = { from: before.description, to: after.description }
  }
  if (before.priority !== after.priority) {
    changes.priority = { from: before.priority, to: after.priority }
  }
  return changes
}

const tasksRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Params: ColumnIdParams; Body: CreateTaskBody }>(
    '/columns/:id/tasks',
    {
      preHandler: fastify.authenticate,
      schema: {
        params: columnIdParamsSchema,
        body: createTaskSchema,
        response: { 201: taskSchema },
      },
    },
    async (request, reply) => {
      const column = await getMyColumn(fastify.database, request.params.id, request.dbUser.id)
      if (!column) {
        throw new NotFoundError('Column not found')
      }

      const task = await fastify.database.transaction(async (transaction) => {
        const created = await createTask(transaction, {
          boardColumnId: column.id,
          title: request.body.title,
        })
        await createTaskActivity(transaction, {
          taskId: created.id,
          actorId: request.dbUser.id,
          action: 'created',
          changes: { title: created.title, boardColumnId: created.boardColumnId },
        })
        return created
      })

      void reply.code(201).send(task)
    }
  )

  fastify.patch<{ Params: TaskIdParams; Body: UpdateTaskBody }>(
    '/tasks/:id',
    {
      preHandler: fastify.authenticate,
      schema: {
        params: taskIdParamsSchema,
        body: updateTaskSchema,
        response: { 200: taskSchema },
      },
    },
    async (request) => {
      const owned = await getMyTask(fastify.database, request.params.id, request.dbUser.id)
      if (!owned) {
        throw new NotFoundError('Task not found')
      }

      if (request.body.boardColumnId) {
        const targetColumn = await getMyColumn(
          fastify.database,
          request.body.boardColumnId,
          request.dbUser.id
        )
        if (!targetColumn) {
          throw new NotFoundError('Target column not found')
        }
      }

      const task = await fastify.database.transaction(async (transaction) => {
        const updated = await updateTask(transaction, request.params.id, request.body)
        if (!updated) {
          return null
        }

        const movedColumn = updated.boardColumnId !== owned.boardColumnId
        if (movedColumn) {
          await createTaskActivity(transaction, {
            taskId: updated.id,
            actorId: request.dbUser.id,
            action: 'moved',
            changes: {
              fromBoardColumnId: owned.boardColumnId,
              toBoardColumnId: updated.boardColumnId,
            },
          })
        } else {
          const fieldChanges = diffTaskFields(owned, updated)
          if (Object.keys(fieldChanges).length > 0) {
            await createTaskActivity(transaction, {
              taskId: updated.id,
              actorId: request.dbUser.id,
              action: 'updated',
              changes: fieldChanges,
            })
          }
        }

        return updated
      })

      if (!task) {
        throw new NotFoundError('Task not found')
      }
      return task
    }
  )

  fastify.delete<{ Params: TaskIdParams }>(
    '/tasks/:id',
    {
      preHandler: fastify.authenticate,
      schema: { params: taskIdParamsSchema },
    },
    async (request, reply) => {
      const owned = await getMyTask(fastify.database, request.params.id, request.dbUser.id)
      if (!owned) {
        throw new NotFoundError('Task not found')
      }

      await deleteTask(fastify.database, request.params.id)
      void reply.code(204).send()
    }
  )

  fastify.get<{ Params: TaskIdParams }>(
    '/tasks/:id/activities',
    {
      preHandler: fastify.authenticate,
      schema: {
        params: taskIdParamsSchema,
        response: { 200: taskActivityListSchema },
      },
    },
    async (request) => {
      const owned = await getMyTask(fastify.database, request.params.id, request.dbUser.id)
      if (!owned) {
        throw new NotFoundError('Task not found')
      }

      const activities = await listTaskActivities(fastify.database, request.params.id)
      return activities
    }
  )
}

export default tasksRoute
