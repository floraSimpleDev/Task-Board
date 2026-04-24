import { z } from 'zod'

const columnDragDataSchema = z.object({ type: z.literal('column') })
const taskDragDataSchema = z.object({ type: z.literal('task'), columnId: z.string() })
const columnDropDataSchema = z.object({ type: z.literal('column-drop'), columnId: z.string() })

const dragDataSchema = z.discriminatedUnion('type', [
  columnDragDataSchema,
  taskDragDataSchema,
  columnDropDataSchema,
])

const dndSourceSchema = z.object({
  data: z.object({
    current: z.unknown(),
  }),
})

type DragData = z.infer<typeof dragDataSchema>

const parseDragData = (source: unknown): DragData | null => {
  const sourceResult = dndSourceSchema.safeParse(source)
  if (!sourceResult.success) {
    return null
  }
  const dragResult = dragDataSchema.safeParse(sourceResult.data.data.current)
  return dragResult.success ? dragResult.data : null
}

export default parseDragData
