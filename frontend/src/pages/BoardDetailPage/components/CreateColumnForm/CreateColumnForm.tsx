import { type FC, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useCreateColumn from '@/hooks/useCreateColumn'

interface Props {
  boardId: string
}

const CreateColumnForm: FC<Props> = ({ boardId }) => {
  const { trigger, isMutating, error } = useCreateColumn(boardId)
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
        variant="outline"
        className="h-fit w-72 shrink-0"
        onClick={() => {
          setAdding(true)
        }}
      >
        + Add column
      </Button>
    )
  }

  return (
    <form
      className="w-72 shrink-0 space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
    >
      <Input
        autoFocus
        placeholder="Column title"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
        }}
        disabled={isMutating}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isMutating || title.length === 0}>
          {isMutating ? 'Adding...' : 'Add'}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isMutating}>
          Cancel
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </form>
  )
}

export default CreateColumnForm
