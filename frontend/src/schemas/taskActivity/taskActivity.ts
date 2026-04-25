import { z } from 'zod'

const TASK_ACTIVITY_ACTIONS = ['created', 'updated', 'moved'] as const

const taskActivitySchema = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  action: z.enum(TASK_ACTIVITY_ACTIONS),
  changes: z.unknown(),
  createdAt: z.iso.datetime(),
  actorId: z.uuid().nullable(),
  actorName: z.string().nullable(),
})

export default taskActivitySchema
