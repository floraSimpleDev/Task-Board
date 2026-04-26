import { z } from 'zod'

const adminBoardListSchema = z.array(
  z.object({
    id: z.uuid(),
    title: z.string(),
    createdAt: z.iso.datetime(),
    ownerId: z.uuid(),
    ownerUserName: z.string(),
    ownerEmail: z.string(),
  })
)

export default adminBoardListSchema
