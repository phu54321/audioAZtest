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

export async function insertionSort<T> (entries: T[], comparator: Comparator<T>): Promise<T[]> {
  const a = entries.slice()
  const length = entries.length
  for (let i = 1; i < length; i++) {
    const temp = a[i]
    let j
    for (j = i; j >= 1 && await comparator(a[j - 1], temp) > 0; j--) {
      a[j] = a[j - 1]
    }
    a[j] = temp
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
