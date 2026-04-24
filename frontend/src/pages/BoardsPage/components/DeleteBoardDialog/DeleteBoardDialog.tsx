import { type FC, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import useDeleteBoard from '@/hooks/useDeleteBoard'

interface Props {
  boardId: string
  boardTitle: string
}

const DeleteBoardDialog: FC<Props> = ({ boardId, boardTitle }) => {
  const { trigger, isMutating, error } = useDeleteBoard()
  const [open, setOpen] = useState(false)

  const handleConfirm = (): void => {
    void trigger(boardId, {
      onSuccess: () => {
        setOpen(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{boardTitle}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the board and all of its columns and tasks. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-destructive text-sm">Failed to delete: {error.message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isMutating}>
            {isMutating ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteBoardDialog
