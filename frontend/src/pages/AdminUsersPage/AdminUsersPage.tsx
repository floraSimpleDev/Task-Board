import type { FC } from 'react'

import Breadcrumb from '@/components/Breadcrumb'
import useAdminUsers from '@/hooks/useAdminUsers'
import DataTable from '@/pages/components/DataTable'
import ApiError from '@/utils/ApiError'

const isForbidden = (error: Error): boolean => error instanceof ApiError && error.status === 403

const AdminUsersPage: FC = () => {
  const { data: usersList, error, isLoading } = useAdminUsers()

  return (
    <>
      <Breadcrumb navigations={[{ label: 'Admin', to: '/admin' }, { label: 'Users' }]} />
      <h2 className="mt-2 mb-6 text-2xl font-bold">All users</h2>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {error &&
        (isForbidden(error) ? (
          <p className="text-destructive">You don&apos;t have permission to view users.</p>
        ) : (
          <p className="text-destructive">Failed to load: {error.message}</p>
        ))}

      {usersList &&
        (usersList.length === 0 ? (
          <p className="text-muted-foreground">No users yet.</p>
        ) : (
          <DataTable headers={['Name', 'Email', 'Joined']}>
            {usersList.map(({ id, userName, email, createdAt }) => (
              <tr key={id} className="border-t">
                <td className="px-4 py-2 font-medium">{userName}</td>
                <td className="text-muted-foreground px-4 py-2">{email}</td>
                <td className="text-muted-foreground px-4 py-2">
                  {new Date(createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </DataTable>
        ))}
    </>
  )
}

export default AdminUsersPage
