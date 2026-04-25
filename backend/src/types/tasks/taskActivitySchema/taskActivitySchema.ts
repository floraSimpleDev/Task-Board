import { Type } from '@sinclair/typebox'

const taskActivitySchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  taskId: Type.String({ format: 'uuid' }),
  action: Type.Union([Type.Literal('created'), Type.Literal('updated'), Type.Literal('moved')]),
  changes: Type.Unknown(),
  createdAt: Type.String({ format: 'date-time' }),
  actorId: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
  actorName: Type.Union([Type.String(), Type.Null()]),
})

export default taskActivitySchema
