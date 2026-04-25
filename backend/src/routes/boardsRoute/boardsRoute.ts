import { type Static } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

import createBoard from '@/repositories/boards/createBoard'
import deleteBoard from '@/repositories/boards/deleteBoard'
import getMyBoard from '@/repositories/boards/getMyBoard'
import getMyBoardWithColumns from '@/repositories/boards/getMyBoardWithColumns'
import listMyBoards from '@/repositories/boards/listMyBoards'
import updateBoard from '@/repositories/boards/updateBoard'
import reorderColumns from '@/repositories/columns/reorderColumns'
import boardIdParamsSchema from '@/types/boards/boardIdParamsSchema'
import boardListSchema from '@/types/boards/boardListSchema'
import boardSchema from '@/types/boards/boardSchema'
import boardWithColumnsSchema from '@/types/boards/boardWithColumnsSchema'
import createBoardSchema from '@/types/boards/createBoardSchema'
import reorderColumnsSchema from '@/types/boards/reorderColumnsSchema'
import updateBoardSchema from '@/types/boards/updateBoardSchema'

type BoardIdParams = Static<typeof boardIdParamsSchema>
type CreateBoardBody = Static<typeof createBoardSchema>
type ReorderColumnsBody = Static<typeof reorderColumnsSchema>
type UpdateBoardBody = Static<typeof updateBoardSchema>

const boardsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/boards',
    {
      preHandler: fastify.authenticate,
      schema: { response: { 200: boardListSchema } },
    },
    async (request) => listMyBoards(fastify.database, request.dbUser.id)
  )

  fastify.get<{ Params: BoardIdParams }>(
    '/boards/:id',
    {
      preHandler: fastify.authenticate,
      schema: { params: boardIdParamsSchema, response: { 200: boardWithColumnsSchema } },
    },
    async (request, reply) => {
      const board = await getMyBoardWithColumns(
        fastify.database,
        request.params.id,
        request.dbUser.id
      )
      if (!board) {
        void reply.code(404).send({ error: 'Not Found', message: 'Board not found' })
        return
      }
      return board
    }
  )

  fastify.post<{ Body: CreateBoardBody }>(
    '/boards',
    {
      preHandler: fastify.authenticate,
      schema: { body: createBoardSchema, response: { 201: boardSchema } },
    },
    async (request, reply) => {
      const board = await createBoard(fastify.database, {
        userId: request.dbUser.id,
        title: request.body.title,
      })
      void reply.code(201).send(board)
    }
  )

  fastify.patch<{ Params: BoardIdParams; Body: ReorderColumnsBody }>(
    '/boards/:id/columns/reorder',
    {
      preHandler: fastify.authenticate,
      schema: {
        params: boardIdParamsSchema,
        body: reorderColumnsSchema,
      },
    },
    async (request, reply) => {
      const board = await getMyBoard(fastify.database, request.params.id, request.dbUser.id)
      if (!board) {
        void reply.code(404).send({ error: 'Not Found', message: 'Board not found' })
        return
      }

      const reordered = await reorderColumns(fastify.database, board.id, request.body.columnIds)
      if (!reordered) {
        void reply
          .code(400)
          .send({ error: 'Bad Request', message: 'columnIds do not match this board' })
        return
      }
      void reply.code(204).send()
    }
  )

  fastify.patch<{ Params: BoardIdParams; Body: UpdateBoardBody }>(
    '/boards/:id',
    {
      preHandler: fastify.authenticate,
      schema: {
        params: boardIdParamsSchema,
        body: updateBoardSchema,
        response: { 200: boardSchema },
      },
    },
    async (request, reply) => {
      const board = await updateBoard(fastify.database, request.params.id, request.dbUser.id, {
        title: request.body.title,
      })
      if (!board) {
        void reply.code(404).send({ error: 'Not Found', message: 'Board not found' })
        return
      }
      return board
    }
  )

  fastify.delete<{ Params: BoardIdParams }>(
    '/boards/:id',
    {
      preHandler: fastify.authenticate,
      schema: { params: boardIdParamsSchema },
    },
    async (request, reply) => {
      const deleted = await deleteBoard(fastify.database, request.params.id, request.dbUser.id)
      if (!deleted) {
        void reply.code(404).send({ error: 'Not Found', message: 'Board not found' })
        return
      }
      void reply.code(204).send()
    }
  )
}

export default boardsRoute
