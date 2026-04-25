import type { SWRMutationResponse } from 'swr/mutation'
import { z } from 'zod'

import useResourceMutation from '@/hooks/useResourceMutation'

const voidSchema = z.void()

const useDeleteColumn = (boardId: string): SWRMutationResponse<void, Error, string, string> =>
  useResourceMutation<typeof voidSchema, string>({
    swrKey: `/boards/${boardId}`,
    schema: voidSchema,
    buildRequest: (columnId) => ({ url: `/columns/${columnId}`, method: 'DELETE' }),
  })

export default useDeleteColumn
