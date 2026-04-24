import { type Static } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

import createTask from '@/repositories/createTask'
import deleteTask from '@/repositories/deleteTask'
import getMyColumn from '@/repositories/getMyColumn'
import getMyTask from '@/repositories/getMyTask'
import updateTask from '@/repositories/updateTask'
import columnIdParamsSchema from '@/types/columnIdParamsSchema'
import createTaskSchema from '@/types/createTaskSchema'
import taskIdParamsSchema from '@/types/taskIdParamsSchema'
import taskSchema from '@/types/taskSchema'
import updateTaskSchema from '@/types/updateTaskSchema'

type ColumnIdParams = Static<typeof columnIdParamsSchema>
type TaskIdParams = Static<typeof taskIdParamsSchema>
type CreateTaskBody = Static<typeof createTaskSchema>
type UpdateTaskBody = Static<typeof updateTaskSchema>

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
        void reply.code(404).send({ error: 'Not Found', message: 'Column not found' })
        return
      }

      const task = await createTask(fastify.database, {
        boardColumnId: column.id,
        title: request.body.title,
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
    async (request, reply) => {
      const owned = await getMyTask(fastify.database, request.params.id, request.dbUser.id)
      if (!owned) {
        void reply.code(404).send({ error: 'Not Found', message: 'Task not found' })
        return
      }

      if (request.body.boardColumnId) {
        const targetColumn = await getMyColumn(
          fastify.database,
          request.body.boardColumnId,
          request.dbUser.id
        )
        if (!targetColumn) {
          void reply.code(404).send({ error: 'Not Found', message: 'Target column not found' })
          return
        }
      }

      const task = await updateTask(fastify.database, request.params.id, request.body)
      if (!task) {
        void reply.code(404).send({ error: 'Not Found', message: 'Task not found' })
        return
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
        void reply.code(404).send({ error: 'Not Found', message: 'Task not found' })
        return
      }

      await deleteTask(fastify.database, request.params.id)
      void reply.code(204).send()
    }
  )
}

export default tasksRoute
