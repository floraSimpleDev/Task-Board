import { useCallback } from 'react'
import { useSWRConfig } from 'swr'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import boardSchema, { type Board } from '@/schemas/board/board'

interface CreateBoardInput {
  title: string
}

const useCreateBoard = (): ((input: CreateBoardInput) => Promise<Board>) => {
  const fetcher = useAuthFetcher(boardSchema)
  const { mutate } = useSWRConfig()

  return useCallback(
    async (input) => {
      const board = await fetcher('/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      await mutate('/boards')

      return board
    },
    [fetcher, mutate]
  )
}

export default useCreateBoard
