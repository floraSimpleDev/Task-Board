import type { FC } from 'react'

import Breadcrumb from '@/components/Breadcrumb'
import { Button } from '@/components/ui/button'
import useAdminTasks from '@/hooks/useAdminTasks'
import DataTable from '@/pages/components/DataTable'
import ApiError from '@/utils/ApiError'

const isForbidden = (error: Error): boolean => error instanceof ApiError && error.status === 403

const AdminTasksPage: FC = () => {
  const { tasks, error, isLoading, isLoadingMore, hasMore, loadMore } = useAdminTasks()

  return (
    <>
      <Breadcrumb navigations={[{ label: 'Admin', to: '/admin' }, { label: 'All tasks' }]} />
      <h2 className="mt-2 mb-6 text-2xl font-bold">All tasks</h2>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {error &&
        (isForbidden(error) ? (
          <p className="text-destructive">You don&apos;t have permission to view tasks.</p>
        ) : (
          <p className="text-destructive">Failed to load: {error.message}</p>
        ))}

      {!isLoading &&
        !error &&
        (tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks yet.</p>
        ) : (
          <>
            <DataTable headers={['Title', 'Board', 'Owner', 'Priority', 'Created']}>
              {tasks.map(
                ({ id, title, boardTitle, ownerUserName, ownerEmail, priority, createdAt }) => (
                  <tr key={id} className="border-t">
                    <td className="px-4 py-2 font-medium">{title}</td>
                    <td className="text-muted-foreground px-4 py-2">{boardTitle}</td>
                    <td className="px-4 py-2">
                      <div>{ownerUserName}</div>
                      <div className="text-muted-foreground text-xs">{ownerEmail}</div>
                    </td>
                    <td className="text-muted-foreground px-4 py-2">{priority ?? '—'}</td>
                    <td className="text-muted-foreground px-4 py-2">
                      {new Date(createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              )}
            </DataTable>

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={loadMore} disabled={isLoadingMore}>
                  {isLoadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        ))}
    </>
  )
}

export default AdminTasksPage
