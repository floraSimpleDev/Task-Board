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
  const deleteBoard = useDeleteBoard()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async (): Promise<void> => {
    setDeleting(true)
    try {
      await deleteBoard(boardId)
      setOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  const onConfirm = (): void => {
    void handleConfirm()
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteBoardDialog
