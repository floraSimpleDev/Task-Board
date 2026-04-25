import { Type } from '@sinclair/typebox'

import taskSchema from '@/types/tasks/taskSchema'

const columnWithTasksSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  boardId: Type.String({ format: 'uuid' }),
  title: Type.String(),
  position: Type.Integer(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  tasks: Type.Array(taskSchema),
})

export default columnWithTasksSchema
