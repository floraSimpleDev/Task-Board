import { arrayMove } from '@dnd-kit/sortable'
import type { z } from 'zod'

import type boardWithColumnsSchema from '@/schemas/boardWithColumns'
import computeInsertPosition from '@/utils/boardPositioning/computeInsertPosition'

type BoardWithColumns = z.infer<typeof boardWithColumnsSchema>

interface Props {
  board: BoardWithColumns
  draggedTaskId: string
  fromColumnId: string
  targetColumnId: string
  overTaskId: string | null
}

interface TaskMove {
  targetColumnId: string
  position: number
}

const computeTaskMove = ({
  board,
  draggedTaskId,
  fromColumnId,
  targetColumnId,
  overTaskId,
}: Props): TaskMove | null => {
  const targetColumn = board.columns.find((column) => column.id === targetColumnId)
  if (!targetColumn) {
    return null
  }

  if (fromColumnId === targetColumnId) {
    const activeIndex = targetColumn.tasks.findIndex((task) => task.id === draggedTaskId)
    const overIndex = overTaskId
      ? targetColumn.tasks.findIndex((task) => task.id === overTaskId)
      : targetColumn.tasks.length - 1
    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return null
    }

    const reorderedTasks = arrayMove(targetColumn.tasks, activeIndex, overIndex)
    const tasksWithoutDragged = reorderedTasks.filter((task) => task.id !== draggedTaskId)
    return {
      targetColumnId,
      position: computeInsertPosition(tasksWithoutDragged, overIndex),
    }
  }

  const overTaskIndex = overTaskId
    ? targetColumn.tasks.findIndex((task) => task.id === overTaskId)
    : -1
  const insertIndex = overTaskIndex === -1 ? targetColumn.tasks.length : overTaskIndex
  return {
    targetColumnId,
    position: computeInsertPosition(targetColumn.tasks, insertIndex),
  }
}

export default computeTaskMove
