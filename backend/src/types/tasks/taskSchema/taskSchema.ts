import { Type } from '@sinclair/typebox'

const taskSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  boardColumnId: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  priority: Type.Union([Type.Literal('P0'), Type.Literal('P1'), Type.Literal('P2'), Type.Null()]),
  position: Type.Number(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
})

export default taskSchema
