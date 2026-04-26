import { z } from 'zod'

const adminActivityListSchema = z.object({
  items: z.array(
    z.object({
      id: z.uuid(),
      taskId: z.uuid(),
      action: z.enum(['created', 'updated', 'moved']),
      changes: z.unknown(),
      createdAt: z.iso.datetime(),
      actorId: z.uuid().nullable(),
      actorName: z.string().nullable(),
      taskTitle: z.string(),
      boardId: z.uuid(),
      boardTitle: z.string(),
    })
  ),
  nextCursor: z.union([z.string(), z.null()]),
})

export default adminActivityListSchema
