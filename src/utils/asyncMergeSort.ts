export type SortPair<T> = {
  left: T;
  right: T;
}

export type MergeSortGenerator<T> = Generator<SortPair<T>, T[], number>

export function * mergeSortGenerator<T> (entries: T[]) : MergeSortGenerator<T> {
  if (entries.length <= 1) return entries

  const midPoint = (entries.length / 2) | 0
  const left = yield * mergeSortGenerator(entries.slice(0, midPoint))
  const right = yield * mergeSortGenerator(entries.slice(midPoint))
  return yield * merge(left, right)
}

function * merge <T> (left: T[], right: T[]): MergeSortGenerator<T> {
  let leftIndex = 0
  let rightIndex = 0
  const output = []

  while (leftIndex < left.length && rightIndex < right.length) {
    const compare = yield { left: left[leftIndex], right: right[rightIndex] }
    if (compare < 0) output.push(left[leftIndex++])
    else output.push(right[rightIndex++])
  }

  return output.concat(left.slice(leftIndex), right.slice(rightIndex))
}
