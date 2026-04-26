import { z } from 'zod'

const adminTaskListSchema = z.object({
  items: z.array(
    z.object({
      id: z.uuid(),
      title: z.string(),
      priority: z.union([z.literal('P0'), z.literal('P1'), z.literal('P2'), z.null()]),
      createdAt: z.iso.datetime(),
      boardId: z.uuid(),
      boardTitle: z.string(),
      ownerUserName: z.string(),
      ownerEmail: z.string(),
    })
  ),
  nextCursor: z.union([z.string(), z.null()]),
})

export default adminTaskListSchema
