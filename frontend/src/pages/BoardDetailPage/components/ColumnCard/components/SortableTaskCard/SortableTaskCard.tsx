import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FC } from 'react'
import type z from 'zod'

import type taskSchema from '@/schemas/task'

import TaskCard from '../TaskCard'

type Task = z.infer<typeof taskSchema>

interface Props {
  boardId: string
  columnId: string
  task: Task
}

const SortableTaskCard: FC<Props> = ({ boardId, columnId, task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', columnId },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCard boardId={boardId} task={task} />
    </div>
  )
}

export default SortableTaskCard
