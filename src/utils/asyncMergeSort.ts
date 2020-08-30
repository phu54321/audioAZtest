export type SortPair<T> = {
  left: T;
  right: T;
}

type Comparator<T> = (left: T, right: T) => Promise<number>

export async function mergeSort<T> (entries: T[], comparator: Comparator<T>): Promise<T[]> {
  if (entries.length <= 1) return entries

  const midPoint = (entries.length / 2) | 0
  const [left, right] = await Promise.all([
    mergeSort(entries.slice(0, midPoint), comparator),
    mergeSort(entries.slice(midPoint), comparator)
  ])
  return merge(left, right, comparator)
}

async function merge <T> (left: T[], right: T[], comparator: Comparator<T>): Promise<T[]> {
  let leftIndex = 0
  let rightIndex = 0
  const output = []

  while (leftIndex < left.length && rightIndex < right.length) {
    const compare = await comparator(left[leftIndex], right[rightIndex])
    if (compare < 0) output.push(left[leftIndex++])
    else output.push(right[rightIndex++])
  }

  return output.concat(left.slice(leftIndex), right.slice(rightIndex))
}
