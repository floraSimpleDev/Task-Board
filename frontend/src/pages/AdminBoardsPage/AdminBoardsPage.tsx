import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import useAdminBoards from '@/hooks/useAdminBoards'

const isForbidden = (error: Error): boolean => error.message.startsWith('403')

const AdminBoardsPage: FC = () => {
  const { data: boardsList, error, isLoading } = useAdminBoards()

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">All boards</h2>
        <Button variant="outline" asChild>
          <Link to="/admin">← Back to stats</Link>
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {error &&
        (isForbidden(error) ? (
          <p className="text-destructive">You don&apos;t have permission to view boards.</p>
        ) : (
          <p className="text-destructive">Failed to load: {error.message}</p>
        ))}

      {boardsList &&
        (boardsList.length === 0 ? (
          <p className="text-muted-foreground">No boards yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Owner</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {boardsList.map(({ id, title, ownerUserName, ownerEmail, createdAt }) => (
                  <tr key={id} className="border-t">
                    <td className="px-4 py-2 font-medium">{title}</td>
                    <td className="px-4 py-2">
                      <div>{ownerUserName}</div>
                      <div className="text-muted-foreground text-xs">{ownerEmail}</div>
                    </td>
                    <td className="text-muted-foreground px-4 py-2">
                      {new Date(createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </main>
  )
}

export default AdminBoardsPage
