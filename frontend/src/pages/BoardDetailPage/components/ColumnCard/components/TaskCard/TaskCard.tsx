import { type FC, useState } from 'react'
import type z from 'zod'

import { Card, CardContent } from '@/components/ui/card'
import type taskSchema from '@/schemas/task'
import cn from '@/utils/cn'

import EditTaskDialog from '../EditTaskDialog'

type Task = z.infer<typeof taskSchema>
type TaskPriority = 'P0' | 'P1' | 'P2'

interface Props {
  boardId: string
  task: Task
}

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  P0: 'bg-destructive/10 text-destructive',
  P1: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  P2: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

const TaskCard: FC<Props> = ({ boardId, task }) => {
  const { title, priority } = task
  const [editing, setEditing] = useState(false)

  return (
    <>
      <Card
        size="sm"
        className="hover:ring-foreground/20 cursor-pointer"
        onClick={() => {
          setEditing(true)
        }}
      >
        <CardContent className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{title}</p>
            {priority && (
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-xs font-medium',
                  PRIORITY_CLASSES[priority]
                )}
              >
                {priority}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
      <EditTaskDialog boardId={boardId} task={task} open={editing} onOpenChange={setEditing} />
    </>
  )
}

export default TaskCard
