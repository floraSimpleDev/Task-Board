import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import type { z } from 'zod'

import type boardWithColumnsSchema from '@/schemas/boardWithColumns'

import computeColumnReorder from '../../utils/computeColumnReorder'
import computeTaskMove from '../../utils/computeTaskMove'
import parseDragData from '../../utils/parseDragData'

type BoardWithColumns = z.infer<typeof boardWithColumnsSchema>

type ActiveDrag =
  | { type: 'column'; columnId: string }
  | { type: 'task'; taskId: string; fromColumnId: string }
  | null

interface TaskMove {
  taskId: string
  targetColumnId: string
  position: number
}

interface Props {
  board: BoardWithColumns | undefined
  onReorderColumns: (columnIds: string[]) => void
  onMoveTask: (move: TaskMove) => void
}

const useBoardDnd = ({ board, onReorderColumns, onMoveTask }: Props) => {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragStart = (event: DragStartEvent): void => {
    const data = parseDragData(event.active)
    if (data?.type === 'column') {
      setActiveDrag({ type: 'column', columnId: String(event.active.id) })
      return
    }
    if (data?.type === 'task') {
      setActiveDrag({
        type: 'task',
        taskId: String(event.active.id),
        fromColumnId: data.columnId,
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent): void => {
    setActiveDrag(null)
    if (!activeDrag || !board || !event.over) {
      return
    }

    if (activeDrag.type === 'column') {
      const nextOrder = computeColumnReorder(board, activeDrag.columnId, String(event.over.id))
      if (nextOrder) {
        onReorderColumns(nextOrder)
      }
      return
    }

    const overData = parseDragData(event.over)
    if (!overData) {
      return
    }
    const targetColumnId =
      overData.type === 'task' || overData.type === 'column-drop' ? overData.columnId : null
    if (!targetColumnId) {
      return
    }
    const overTaskId = overData.type === 'task' ? String(event.over.id) : null

    const move = computeTaskMove({
      board,
      draggedTaskId: activeDrag.taskId,
      fromColumnId: activeDrag.fromColumnId,
      targetColumnId,
      overTaskId,
    })
    if (move) {
      onMoveTask({ taskId: activeDrag.taskId, ...move })
    }
  }

  const handleDragCancel = (): void => {
    setActiveDrag(null)
  }

  return {
    sensors,
    activeDrag,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }
}

export default useBoardDnd
