import { Type } from '@sinclair/typebox'

const adminTaskListSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      title: Type.String(),
      priority: Type.Union([
        Type.Literal('P0'),
        Type.Literal('P1'),
        Type.Literal('P2'),
        Type.Null(),
      ]),
      createdAt: Type.String({ format: 'date-time' }),
      boardId: Type.String({ format: 'uuid' }),
      boardTitle: Type.String(),
      ownerUserName: Type.String(),
      ownerEmail: Type.String(),
    })
  ),
  nextCursor: Type.Union([Type.String(), Type.Null()]),
})

export default adminTaskListSchema
