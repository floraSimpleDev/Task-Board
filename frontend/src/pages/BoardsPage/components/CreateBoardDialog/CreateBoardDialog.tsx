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
  const createBoard = useCreateBoard()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    if (title.length === 0) {
      return
    }
    setSubmitting(true)
    try {
      await createBoard({ title })
      setTitle('')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
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
            void handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>New board</DialogTitle>
            <DialogDescription>Give your board a title to get started.</DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <Input
              autoFocus
              placeholder="e.g. Personal goals"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
              }}
              disabled={submitting}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting || title.length === 0}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateBoardDialog
