import type { FC } from 'react'

import Breadcrumb from '@/components/Breadcrumb'
import { Button } from '@/components/ui/button'
import useAdminActivities from '@/hooks/useAdminActivities'
import DataTable from '@/pages/components/DataTable'
import ApiError from '@/utils/ApiError'
import formatRelativeTime from '@/utils/formatRelativeTime'
import renderActivitySummary from '@/utils/renderActivitySummary'

const isForbidden = (error: Error): boolean => error instanceof ApiError && error.status === 403

const AdminActivitiesPage: FC = () => {
  const { activities, error, isLoading, isLoadingMore, hasMore, loadMore } = useAdminActivities()

  return (
    <>
      <Breadcrumb navigations={[{ label: 'Admin', to: '/admin' }, { label: 'All activities' }]} />
      <h2 className="mt-2 mb-6 text-2xl font-bold">All activities</h2>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {error &&
        (isForbidden(error) ? (
          <p className="text-destructive">You don&apos;t have permission to view activities.</p>
        ) : (
          <p className="text-destructive">Failed to load: {error.message}</p>
        ))}

      {!isLoading &&
        !error &&
        (activities.length === 0 ? (
          <p className="text-muted-foreground">No activities yet.</p>
        ) : (
          <>
            <DataTable headers={['Action', 'Task', 'Actor', 'Summary', 'When']}>
              {activities.map(
                ({ id, action, taskTitle, boardTitle, actorName, createdAt, changes }) => (
                  <tr key={id} className="border-t">
                    <td className="px-4 py-2 font-medium">{action}</td>
                    <td className="px-4 py-2">
                      <div>{taskTitle}</div>
                      <div className="text-muted-foreground text-xs">{boardTitle}</div>
                    </td>
                    <td className="text-muted-foreground px-4 py-2">{actorName ?? '—'}</td>
                    <td className="text-muted-foreground px-4 py-2">
                      {renderActivitySummary({ action, changes })}
                    </td>
                    <td className="text-muted-foreground px-4 py-2">
                      {formatRelativeTime(createdAt)}
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

export default AdminActivitiesPage
