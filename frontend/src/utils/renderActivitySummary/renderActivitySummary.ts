interface MovedChanges {
  fromBoardColumnId: string
  toBoardColumnId: string
}

interface Activity {
  action: 'created' | 'updated' | 'moved'
  changes: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const renderUpdatedSummary = (changes: unknown): string => {
  if (!isObject(changes)) {
    return 'updated this task'
  }
  const fieldNames = Object.keys(changes)
  if (fieldNames.length === 0) {
    return 'updated this task'
  }
  return `changed ${fieldNames.join(', ')}`
}

const renderMovedSummary = (changes: unknown, columnTitlesById?: Map<string, string>): string => {
  if (!isObject(changes)) {
    return 'moved this task'
  }
  if (!columnTitlesById) {
    return 'moved this task between columns'
  }
  const moved = changes as Partial<MovedChanges>
  const fromTitle = moved.fromBoardColumnId
    ? (columnTitlesById.get(moved.fromBoardColumnId) ?? 'a column')
    : 'a column'
  const toTitle = moved.toBoardColumnId
    ? (columnTitlesById.get(moved.toBoardColumnId) ?? 'a column')
    : 'a column'
  return `moved from ${fromTitle} to ${toTitle}`
}

const renderActivitySummary = (
  activity: Activity,
  columnTitlesById?: Map<string, string>
): string => {
  if (activity.action === 'created') {
    return 'created this task'
  }
  if (activity.action === 'moved') {
    return renderMovedSummary(activity.changes, columnTitlesById)
  }
  return renderUpdatedSummary(activity.changes)
}

export default renderActivitySummary
