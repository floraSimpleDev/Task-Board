import { type Static } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

import createColumn from '@/repositories/createColumn'
import deleteColumn from '@/repositories/deleteColumn'
import getMyBoard from '@/repositories/getMyBoard'
import getMyColumn from '@/repositories/getMyColumn'
import updateColumn from '@/repositories/updateColumn'
import boardIdParamsSchema from '@/types/boardIdParamsSchema'
import columnIdParamsSchema from '@/types/columnIdParamsSchema'
import columnSchema from '@/types/columnSchema'
import createColumnSchema from '@/types/createColumnSchema'
import updateColumnSchema from '@/types/updateColumnSchema'

type BoardIdParams = Static<typeof boardIdParamsSchema>
type ColumnIdParams = Static<typeof columnIdParamsSchema>
type CreateColumnBody = Static<typeof createColumnSchema>
type UpdateColumnBody = Static<typeof updateColumnSchema>

const columnsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Params: BoardIdParams; Body: CreateColumnBody }>(
    '/boards/:id/columns',
    {
      preHandler: fastify.authenticate,
      schema: {
        params: boardIdParamsSchema,
        body: createColumnSchema,
        response: { 201: columnSchema },
      },
    },
    async (request, reply) => {
      const board = await getMyBoard(fastify.database, request.params.id, request.dbUser.id)
      if (!board) {
        void reply.code(404).send({ error: 'Not Found', message: 'Board not found' })
        return
      }

      const column = await createColumn(fastify.database, {
        boardId: board.id,
        title: request.body.title,
      })
      void reply.code(201).send(column)
    }
  )

  fastify.patch<{ Params: ColumnIdParams; Body: UpdateColumnBody }>(
    '/columns/:id',
    {
      preHandler: fastify.authenticate,
      schema: {
        params: columnIdParamsSchema,
        body: updateColumnSchema,
        response: { 200: columnSchema },
      },
    },
    async (request, reply) => {
      const owned = await getMyColumn(fastify.database, request.params.id, request.dbUser.id)
      if (!owned) {
        void reply.code(404).send({ error: 'Not Found', message: 'Column not found' })
        return
      }

      const column = await updateColumn(fastify.database, request.params.id, request.body)
      if (!column) {
        void reply.code(404).send({ error: 'Not Found', message: 'Column not found' })
        return
      }
      return column
    }
  )

  fastify.delete<{ Params: ColumnIdParams }>(
    '/columns/:id',
    {
      preHandler: fastify.authenticate,
      schema: { params: columnIdParamsSchema },
    },
    async (request, reply) => {
      const owned = await getMyColumn(fastify.database, request.params.id, request.dbUser.id)
      if (!owned) {
        void reply.code(404).send({ error: 'Not Found', message: 'Column not found' })
        return
      }

      await deleteColumn(fastify.database, request.params.id)
      void reply.code(204).send()
    }
  )
}

export default columnsRoute
