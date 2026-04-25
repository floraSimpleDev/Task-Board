import { type FC, useState } from 'react'
import { useSWRConfig } from 'swr'
import type z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import useUpdateTask from '@/hooks/useUpdateTask'
import type taskSchema from '@/schemas/task'

import DeleteTaskDialog from '../DeleteTaskDialog'

import TaskActivityList from './components/TaskActivityList'

const TASK_PRIORITIES = ['P0', 'P1', 'P2'] as const
type Task = z.infer<typeof taskSchema>
type TaskPriority = (typeof TASK_PRIORITIES)[number]

interface Props {
  boardId: string
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormProps {
  boardId: string
  task: Task
  onDone: () => void
}

const EditTaskForm: FC<FormProps> = ({ boardId, task, onDone }) => {
  const {
    id,
    title: initialTitle,
    description: initialDescription,
    priority: initialPriority,
  } = task
  const { trigger, isMutating, error } = useUpdateTask({ boardId })
  const { mutate } = useSWRConfig()

  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription ?? '')
  const [priority, setPriority] = useState<TaskPriority | null>(initialPriority)

  const handleSave = (): void => {
    if (title.length === 0) {
      return
    }
    void trigger(
      {
        taskId: id,
        patch: {
          title,
          description: description.length === 0 ? null : description,
          priority,
        },
      },
      {
        onSuccess: () => {
          void mutate(`/tasks/${id}/activities`)
          onDone()
        },
      }
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        handleSave()
      }}
    >
      <div className="space-y-1">
        <label className="text-xs font-medium" htmlFor="task-title">
          Title
        </label>
        <Input
          id="task-title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
          }}
          disabled={isMutating}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium" htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full resize-y rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 disabled:opacity-50"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value)
          }}
          disabled={isMutating}
          placeholder="Add more detail…"
        />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-medium">Priority</span>
        <div className="flex gap-2">
          {TASK_PRIORITIES.map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={priority === value ? 'default' : 'outline'}
              onClick={() => {
                setPriority(value)
              }}
              disabled={isMutating}
            >
              {value}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={priority === null ? 'default' : 'outline'}
            onClick={() => {
              setPriority(null)
            }}
            disabled={isMutating}
          >
            None
          </Button>
        </div>
      </div>

      {error && <p className="text-destructive text-xs">{error.message}</p>}

      <div className="space-y-1 border-t pt-3">
        <span className="text-xs font-medium">Activity</span>
        <TaskActivityList boardId={boardId} taskId={id} />
      </div>

      <DialogFooter className="items-center">
        <DeleteTaskDialog
          boardId={boardId}
          taskId={id}
          taskTitle={initialTitle}
          onDeleted={onDone}
        />
        <Button type="button" variant="outline" onClick={onDone} disabled={isMutating}>
          Cancel
        </Button>
        <Button type="submit" disabled={isMutating || title.length === 0}>
          {isMutating ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  )
}

const EditTaskDialog: FC<Props> = ({ boardId, task, open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit task</DialogTitle>
        <DialogDescription>Update title, description, and priority.</DialogDescription>
      </DialogHeader>
      {open && (
        <EditTaskForm
          boardId={boardId}
          task={task}
          onDone={() => {
            onOpenChange(false)
          }}
        />
      )}
    </DialogContent>
  </Dialog>
)

export default EditTaskDialog
