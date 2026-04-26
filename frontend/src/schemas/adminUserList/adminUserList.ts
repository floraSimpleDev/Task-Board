import { z } from 'zod'

const adminUserListSchema = z.array(
  z.object({
    id: z.uuid(),
    email: z.string(),
    userName: z.string(),
    createdAt: z.iso.datetime(),
  })
)

export default adminUserListSchema
