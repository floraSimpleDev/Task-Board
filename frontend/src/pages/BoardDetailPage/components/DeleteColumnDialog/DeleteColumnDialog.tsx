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
import useDeleteColumn from '@/hooks/useDeleteColumn'

interface Props {
  boardId: string
  columnId: string
  columnTitle: string
}

const DeleteColumnDialog: FC<Props> = ({ boardId, columnId, columnTitle }) => {
  const { trigger, isMutating, error } = useDeleteColumn(boardId)
  const [open, setOpen] = useState(false)

  const handleConfirm = (): void => {
    void trigger(columnId, {
      onSuccess: () => {
        setOpen(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="xs">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{columnTitle}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the column and all of its tasks. This action cannot be
            undone.
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

export default DeleteColumnDialog
