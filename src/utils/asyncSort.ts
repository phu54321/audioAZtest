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

export async function combSort<T> (entries: T[], comparator: Comparator<T>): Promise<T[]> {
  const length = entries.length
  const shrink = 1.3
  let _gap = length

  const out = entries.slice()
  let sorted = false

  while (!sorted) {
    _gap /= shrink
    let gap = _gap | 0
    if (gap <= 1) {
      sorted = true
      gap = 1
    }

    for (let i = 0; i < length - gap; i++) {
      const sm = gap + i
      if (await comparator(out[i], out[sm]) > 0) {
        const tmp = out[i]
        out[i] = out[sm]
        out[sm] = tmp
        sorted = false
      }
    }
  }
  return out
}

export async function shellSort<T> (entries: T[], comparator: Comparator<T>): Promise<T[]> {
  const gaps = [701, 301, 132, 57, 23, 10, 4, 1]
  const { length } = entries
  const a = entries.slice()

  for (const gap of gaps) {
    if (gap >= length) continue
    for (let i = gap; i < length; i++) {
      const temp = a[i]
      let j
      for (j = i; j >= gap && await comparator(a[j - gap], temp) > 0; j -= gap) {
        a[j] = a[j - gap]
      }
      a[j] = temp
    }
  }
  return a
}
