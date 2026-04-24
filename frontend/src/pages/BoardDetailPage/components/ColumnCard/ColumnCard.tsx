import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { useSortable } from '@dnd-kit/sortable'
import type { FC } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Column } from '@/schemas/column/column'
import type { Task } from '@/schemas/task/task'

import DeleteColumnDialog from '../DeleteColumnDialog'

import CreateTaskForm from './components/CreateTaskForm'
import SortableTaskCard from './components/SortableTaskCard'

type Sortable = ReturnType<typeof useSortable>

interface DragHandleProps {
  attributes: Sortable['attributes']
  listeners: Sortable['listeners']
}

interface Props {
  boardId: string
  column: Column & { tasks: Task[] }
  dragHandleProps?: DragHandleProps
}

const ColumnCard: FC<Props> = ({ boardId, column, dragHandleProps }) => {
  const { id, title, tasks } = column
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `column-drop-${id}`,
    data: { type: 'column-drop', columnId: id },
  })

  return (
    <Card className="w-72 shrink-0">
      <CardHeader
        className="cursor-grab active:cursor-grabbing"
        {...dragHandleProps?.attributes}
        {...dragHandleProps?.listeners}
      >
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="truncate">{title}</CardTitle>
          <DeleteColumnDialog boardId={boardId} columnId={id} columnTitle={title} />
        </div>
      </CardHeader>
      <CardContent
        ref={setDroppableRef}
        data-droppable-active={isOver || undefined}
        className="data-droppable-active:bg-muted/40 space-y-2 rounded-md transition-colors"
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 && <p className="text-muted-foreground text-sm">No tasks yet</p>}
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} boardId={boardId} columnId={id} task={task} />
          ))}
        </SortableContext>
        <CreateTaskForm boardId={boardId} columnId={id} />
      </CardContent>
    </Card>
  )
}

export default ColumnCard
