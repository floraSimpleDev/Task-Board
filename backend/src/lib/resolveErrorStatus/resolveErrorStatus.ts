import type { FastifyError } from 'fastify'
import { DatabaseError } from 'pg'

const PG_CODE_TO_STATUS: Record<string, number> = {
  '23505': 409, // unique_violation
  '23503': 409, // foreign_key_violation
  '23502': 400, // not_null_violation
  '23514': 400, // check_violation
  '22P02': 400, // invalid_text_representation (bad UUID, malformed input)
}

interface ResolvedStatus {
  statusCode: number
  trustMessage: boolean
}

const resolveErrorStatus = (error: FastifyError): ResolvedStatus => {
  if (error.statusCode) {
    return { statusCode: error.statusCode, trustMessage: true }
  }
  if (error instanceof DatabaseError && error.code) {
    const mapped = PG_CODE_TO_STATUS[error.code]
    if (mapped) {
      return { statusCode: mapped, trustMessage: false }
    }
  }
  return { statusCode: 500, trustMessage: false }
}

export default resolveErrorStatus
