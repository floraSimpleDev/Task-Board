import { Type } from '@sinclair/typebox'

import boardSchema from '@/types/boardSchema'

const boardListSchema = Type.Array(boardSchema)

export default boardListSchema
