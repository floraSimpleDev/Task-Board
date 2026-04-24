import { z } from 'zod'

const boardSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  title: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable(),
})

export type Board = z.infer<typeof boardSchema>

export default boardSchema
