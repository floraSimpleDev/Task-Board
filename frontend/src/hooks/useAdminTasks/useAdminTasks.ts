import useSWRInfinite from 'swr/infinite'
import type { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import adminTaskListSchema from '@/schemas/adminTaskList'

type AdminTaskListPage = z.infer<typeof adminTaskListSchema>
type AdminTask = AdminTaskListPage['items'][number]

interface UseAdminTasksResult {
  tasks: AdminTask[]
  error: Error | undefined
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  loadMore: () => void
}

const buildKey = (pageIndex: number, previousPage: AdminTaskListPage | null): string | null => {
  if (pageIndex === 0) {
    return '/admin/tasks'
  }
  if (!previousPage?.nextCursor) {
    return null
  }
  return `/admin/tasks?cursor=${encodeURIComponent(previousPage.nextCursor)}`
}

const useAdminTasks = (): UseAdminTasksResult => {
  const fetcher = useAuthFetcher(adminTaskListSchema)
  const { data, error, isLoading, size, setSize, isValidating } = useSWRInfinite<
    AdminTaskListPage,
    Error
  >(buildKey, fetcher, { shouldRetryOnError: false, revalidateFirstPage: false })

  const pages = data ?? []
  const tasks = pages.flatMap(({ items }) => items)
  const hasMore = pages.length > 0 ? pages[pages.length - 1].nextCursor !== null : false
  const isLoadingMore = isValidating && size > pages.length

  return {
    tasks,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore: () => {
      void setSize(size + 1)
    },
  }
}

export default useAdminTasks
