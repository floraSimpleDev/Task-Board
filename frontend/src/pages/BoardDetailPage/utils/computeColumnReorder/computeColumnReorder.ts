import { arrayMove } from '@dnd-kit/sortable'
import type { z } from 'zod'

import type boardWithColumnsSchema from '@/schemas/boardWithColumns'

type BoardWithColumns = z.infer<typeof boardWithColumnsSchema>

const computeColumnReorder = (
  board: BoardWithColumns,
  activeColumnId: string,
  overColumnId: string
): string[] | null => {
  if (activeColumnId === overColumnId) {
    return null
  }
  const oldIndex = board.columns.findIndex((column) => column.id === activeColumnId)
  const newIndex = board.columns.findIndex((column) => column.id === overColumnId)
  if (oldIndex === -1 || newIndex === -1) {
    return null
  }
  return arrayMove(board.columns, oldIndex, newIndex).map((column) => column.id)
}

export default computeColumnReorder
