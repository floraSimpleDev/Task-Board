import { type FC, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useCreateTask from '@/hooks/useCreateTask'

interface Props {
  boardId: string
  columnId: string
}

const CreateTaskForm: FC<Props> = ({ boardId, columnId }) => {
  const { trigger, isMutating, error } = useCreateTask({ boardId, columnId })
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = (): void => {
    if (title.length === 0) {
      return
    }
    void trigger(
      { title },
      {
        onSuccess: () => {
          setTitle('')
          setAdding(false)
        },
      }
    )
  }

  const handleCancel = (): void => {
    setTitle('')
    setAdding(false)
  }

  if (!adding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => {
          setAdding(true)
        }}
      >
        + Add task
      </Button>
    )
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
    >
      <Input
        autoFocus
        placeholder="Task title"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
        }}
        disabled={isMutating}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isMutating || title.length === 0}>
          {isMutating ? 'Adding...' : 'Add'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isMutating}
        >
          Cancel
        </Button>
      </div>
      {error && <p className="text-destructive text-xs">{error.message}</p>}
    </form>
  )
}

export default CreateTaskForm
