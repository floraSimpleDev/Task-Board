import type { FC } from 'react'

import Breadcrumb from '@/components/Breadcrumb'
import useAdminBoards from '@/hooks/useAdminBoards'
import ApiError from '@/utils/ApiError'

const isForbidden = (error: Error): boolean => error instanceof ApiError && error.status === 403

const AdminBoardsPage: FC = () => {
  const { data: boardsList, error, isLoading } = useAdminBoards()

  return (
    <>
      <Breadcrumb navigations={[{ label: 'Admin', to: '/admin' }, { label: 'All boards' }]} />
      <h2 className="mt-2 mb-6 text-2xl font-bold">All boards</h2>

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
    </>
  )
}

export default AdminBoardsPage
