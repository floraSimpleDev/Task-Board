import type { z } from 'zod'

import type boardWithColumnsSchema from '@/schemas/boardWithColumns'

type BoardWithColumns = z.infer<typeof boardWithColumnsSchema>
type Task = BoardWithColumns['columns'][number]['tasks'][number]

const applyTaskMove = (
  board: BoardWithColumns,
  taskId: string,
  targetColumnId: string,
  nextPosition: number
): BoardWithColumns => {
  const movedTask = board.columns
    .flatMap((column) => column.tasks)
    .find((task) => task.id === taskId)

  if (!movedTask) {
    return board
  }

  const updatedTask: Task = {
    ...movedTask,
    boardColumnId: targetColumnId,
    position: nextPosition,
  }

  const columns = board.columns.map((column) => {
    const movedTasks = column.tasks.filter((task) => task.id !== taskId)
    if (column.id !== targetColumnId) {
      return { ...column, tasks: movedTasks }
    }
    const tasks = [...movedTasks, updatedTask].sort(
      (first, second) => first.position - second.position
    )
    return { ...column, tasks }
  })

  return { ...board, columns }
}

export default applyTaskMove
