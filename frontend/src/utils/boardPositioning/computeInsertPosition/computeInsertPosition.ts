interface Positioned {
  position: number
}

const computeInsertPosition = (tasks: Positioned[], insertIndex: number): number => {
  const hasBefore = insertIndex > 0
  const hasAfter = insertIndex < tasks.length

  if (!hasBefore && !hasAfter) {
    return 1
  }
  if (!hasBefore) {
    return tasks[insertIndex].position - 1
  }
  if (!hasAfter) {
    return tasks[insertIndex - 1].position + 1
  }
  return (tasks[insertIndex - 1].position + tasks[insertIndex].position) / 2
}

export default computeInsertPosition
