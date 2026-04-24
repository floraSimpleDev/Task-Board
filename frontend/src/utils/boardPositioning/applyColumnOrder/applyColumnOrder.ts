import type { z } from 'zod'

import type boardWithColumnsSchema from '@/schemas/boardWithColumns'

type BoardWithColumns = z.infer<typeof boardWithColumnsSchema>
type Column = BoardWithColumns['columns'][number]

const applyColumnOrder = (board: BoardWithColumns, columnIds: string[]): BoardWithColumns => {
  const columnsById = new Map(board.columns.map((column) => [column.id, column]))
  const reordered = columnIds
    .map((columnId, nextPosition) => {
      const column = columnsById.get(columnId)
      return column ? { ...column, position: nextPosition } : null
    })
    .filter((column): column is Column => column !== null)
  return { ...board, columns: reordered }
}

export default applyColumnOrder
