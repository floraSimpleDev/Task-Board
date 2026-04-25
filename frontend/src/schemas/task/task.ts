import { z } from 'zod'

const TASK_PRIORITIES = ['P0', 'P1', 'P2'] as const

const taskSchema = z.object({
  id: z.uuid(),
  boardColumnId: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.enum(TASK_PRIORITIES).nullable(),
  position: z.number(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable(),
})

export default taskSchema
