import { z } from 'zod'

const columnSchema = z.object({
  id: z.uuid(),
  boardId: z.uuid(),
  title: z.string(),
  position: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable(),
})

export type Column = z.infer<typeof columnSchema>

export default columnSchema
