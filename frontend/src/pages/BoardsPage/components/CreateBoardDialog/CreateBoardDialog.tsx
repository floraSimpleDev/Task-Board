import { type FC, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import useCreateBoard from '@/hooks/useCreateBoard'

const CreateBoardDialog: FC = () => {
  const { trigger, isMutating, error } = useCreateBoard()
  const [open, setOpen] = useState(false)
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
          setOpen(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create board</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>New board</DialogTitle>
            <DialogDescription>Give your board a title to get started.</DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2">
            <Input
              autoFocus
              placeholder="e.g. Personal goals"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
              }}
              disabled={isMutating}
            />
            {error && <p className="text-destructive text-sm">Failed to create: {error.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isMutating}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isMutating || title.length === 0}>
              {isMutating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateBoardDialog
