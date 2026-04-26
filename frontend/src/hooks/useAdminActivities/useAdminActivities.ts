import useSWRInfinite from 'swr/infinite'
import type { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import adminActivityListSchema from '@/schemas/adminActivityList'

type AdminActivityListPage = z.infer<typeof adminActivityListSchema>
type AdminActivity = AdminActivityListPage['items'][number]

interface UseAdminActivitiesResult {
  activities: AdminActivity[]
  error: Error | undefined
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  loadMore: () => void
}

const buildKey = (pageIndex: number, previousPage: AdminActivityListPage | null): string | null => {
  if (pageIndex === 0) {
    return '/admin/activities'
  }
  if (!previousPage?.nextCursor) {
    return null
  }
  return `/admin/activities?cursor=${encodeURIComponent(previousPage.nextCursor)}`
}

const useAdminActivities = (): UseAdminActivitiesResult => {
  const fetcher = useAuthFetcher(adminActivityListSchema)
  const { data, error, isLoading, size, setSize, isValidating } = useSWRInfinite<
    AdminActivityListPage,
    Error
  >(buildKey, fetcher, { shouldRetryOnError: false, revalidateFirstPage: false })

  const pages = data ?? []
  const activities = pages.flatMap(({ items }) => items)
  const hasMore = pages.length > 0 ? pages[pages.length - 1].nextCursor !== null : false
  const isLoadingMore = isValidating && size > pages.length

  return {
    activities,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore: () => {
      void setSize(size + 1)
    },
  }
}

export default useAdminActivities
