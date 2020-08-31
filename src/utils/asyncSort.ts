export type SortPair<T> = {
  left: T;
  right: T;
}

type Comparator<T> = (left: T, right: T) => Promise<number>

export async function shellSort<T> (entries: T[], comparator: Comparator<T>): Promise<T[]> {
  const gaps = [701, 301, 132, 57, 23, 10, 4, 1]
  const { length } = entries
  const a = entries.slice()

  for (const gap of gaps) {
    if (gap >= length) continue
    const subRets = splitArray(a, gap)
    const subSorted = await Promise.all(subRets.map(arr => insertionSort(arr, comparator)))
    mergeArray(a, subSorted, gap)
  }
  return a
}

interface InsertionSortSubtask {
  completed: boolean
  startCursor: number
  currentHighCursor: number
}

export async function insertionSort<T> (entries: T[], comparator: Comparator<T>): Promise<T[]> {
  const a = entries.slice()
  const length = entries.length
  const tasks: InsertionSortSubtask[] = []
  for (let i = 0; i < length; i++) {
    tasks.push({
      startCursor: i,
      currentHighCursor: i,
      completed: false
    })
  }
  tasks[0].completed = true

  const remainingTasks: InsertionSortSubtask[] = tasks.slice(1)

  function noCollisionWithPreviousTasks (task: InsertionSortSubtask): boolean {
    const { startCursor } = task
    const prevTask = tasks[startCursor - 1]
    if (!prevTask.completed) {
      if (prevTask.currentHighCursor === task.currentHighCursor) return false
    }
    return true
  }

  while (remainingTasks.length) {
    const taskIdx = Math.random() * remainingTasks.length | 0
    const task = remainingTasks[taskIdx]
    if (!noCollisionWithPreviousTasks(task)) continue

    const { currentHighCursor } = task
    if (await comparator(a[currentHighCursor - 1], a[currentHighCursor]) < 0) {
      task.completed = true
      remainingTasks.splice(taskIdx, 1)
      continue
    } else {
      const temp = a[currentHighCursor]
      a[currentHighCursor] = a[currentHighCursor - 1]
      a[currentHighCursor - 1] = temp
      task.currentHighCursor--
      if (task.currentHighCursor === 0) {
        task.completed = true
        remainingTasks.splice(taskIdx, 1)
      }
    }
  }

  return a
}

function splitArray<T> (entries: T[], gap: number): T[][] {
  const ret = []
  for (let start = 0; start < gap; start++) {
    const subRet = []
    for (let i = start; i < entries.length; i += gap) {
      subRet.push(entries[i])
    }
    ret.push(subRet)
  }
  return ret
}

function mergeArray<T> (out: T[], subSorted: T[][], gap: number): void {
  for (let start = 0; start < gap; start++) {
    const subRet = subSorted[start]
    let cursor = 0
    for (let i = start; i < out.length; i += gap) {
      out[i] = subRet[cursor++]
    }
  }
}
