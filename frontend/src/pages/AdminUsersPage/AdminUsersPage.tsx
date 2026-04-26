import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import useAdminUsers from '@/hooks/useAdminUsers'

const isForbidden = (error: Error): boolean => error.message.startsWith('403')

const AdminUsersPage: FC = () => {
  const { data: usersList, error, isLoading } = useAdminUsers()

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">All users</h2>
        <Button variant="outline" asChild>
          <Link to="/admin">← Back to stats</Link>
        </Button>
      </div>

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
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(({ id, userName, email, createdAt }) => (
                  <tr key={id} className="border-t">
                    <td className="px-4 py-2 font-medium">{userName}</td>
                    <td className="text-muted-foreground px-4 py-2">{email}</td>
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

export default AdminUsersPage
