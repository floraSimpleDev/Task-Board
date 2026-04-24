import type { FC } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Column } from '@/schemas/column/column'
import type { Task } from '@/schemas/task/task'

import DeleteColumnDialog from '../DeleteColumnDialog'

import CreateTaskForm from './components/CreateTaskForm'
import TaskCard from './components/TaskCard'

interface Props {
  boardId: string
  column: Column & { tasks: Task[] }
}

const ColumnCard: FC<Props> = ({ boardId, column }) => {
  const { id, title, tasks } = column

  return (
    <Card className="w-72 shrink-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="truncate">{title}</CardTitle>
          <DeleteColumnDialog boardId={boardId} columnId={id} columnTitle={title} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 && <p className="text-muted-foreground text-sm">No tasks yet</p>}
        {tasks.map((task) => (
          <TaskCard key={task.id} boardId={boardId} task={task} />
        ))}
        <CreateTaskForm boardId={boardId} columnId={id} />
      </CardContent>
    </Card>
  )
}

export default ColumnCard
