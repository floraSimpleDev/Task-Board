import { Type } from '@sinclair/typebox'

const updateTaskSchema = Type.Object({
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 500 })),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  priority: Type.Optional(
    Type.Union([Type.Literal('P0'), Type.Literal('P1'), Type.Literal('P2'), Type.Null()])
  ),
  position: Type.Optional(Type.Number()),
  boardColumnId: Type.Optional(Type.String({ format: 'uuid' })),
})

export default updateTaskSchema
