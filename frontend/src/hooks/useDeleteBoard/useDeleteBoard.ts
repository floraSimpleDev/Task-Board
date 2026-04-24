import { useCallback } from 'react'
import { mutate } from 'swr'
import { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'

const useDeleteBoard = (): ((boardId: string) => Promise<void>) => {
  const fetcher = useAuthFetcher(z.void())

  return useCallback(
    async (boardId) => {
      await fetcher(`/boards/${boardId}`, { method: 'DELETE' })
      await mutate('/boards')
    },
    [fetcher]
  )
}

export default useDeleteBoard
