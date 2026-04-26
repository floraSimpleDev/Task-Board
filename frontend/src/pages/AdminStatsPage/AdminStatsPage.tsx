import type { FC } from 'react'
import type z from 'zod'

import useAdminStats from '@/hooks/useAdminStats'
import type adminStatsSchema from '@/schemas/adminStats'
import ApiError from '@/utils/ApiError'

import StatCard from './components/StatCard'

type AdminStats = z.infer<typeof adminStatsSchema>

interface StatItem {
  title: string
  description: string
  value: number
  to?: string
}

const buildStatItems = (stats: AdminStats): StatItem[] => [
  {
    title: 'Users',
    description: 'Provisioned via Auth0',
    value: stats.totalUsers,
    to: '/admin/users',
  },
  {
    title: 'Boards',
    description: 'Across all users',
    value: stats.totalBoards,
    to: '/admin/boards',
  },
  {
    title: 'Tasks',
    description: 'Across all boards',
    value: stats.totalTasks,
    to: '/admin/tasks',
  },
  { title: 'Activities', description: 'Logged task events', value: stats.totalActivities },
]

const isForbidden = (error: Error): boolean => error instanceof ApiError && error.status === 403

const AdminStatsPage: FC = () => {
  const { data, error, isLoading } = useAdminStats()

  return (
    <>
      <h2 className="mb-6 text-2xl font-bold">Admin status</h2>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {error &&
        (isForbidden(error) ? (
          <p className="text-destructive">You don&apos;t have permission to view admin stats.</p>
        ) : (
          <p className="text-destructive">Failed to load: {error.message}</p>
        ))}

      {data && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {buildStatItems(data).map(({ title, description, value, to }) => (
            <li key={title}>
              <StatCard title={title} description={description} value={value} to={to} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default AdminStatsPage
