import type { SortGenerator } from '../types'

export function* mergeSort(arr: number[]): SortGenerator {
  yield* mergeSortHelper(arr, 0, arr.length - 1)
}

function* mergeSortHelper(
  arr: number[],
  left: number,
  right: number
): SortGenerator {
  if (left >= right) return

  const mid = Math.floor((left + right) / 2)
  yield* mergeSortHelper(arr, left, mid)
  yield* mergeSortHelper(arr, mid + 1, right)
  yield* merge(arr, left, mid, right)
}

function* merge(
  arr: number[],
  left: number,
  mid: number,
  right: number
): SortGenerator {
  const temp: number[] = []
  let i = left
  let j = mid + 1

  while (i <= mid && j <= right) {
    yield { type: 'compare', indices: [i, j] }
    if (arr[i] <= arr[j]) {
      temp.push(arr[i++])
    } else {
      temp.push(arr[j++])
    }
  }

  while (i <= mid) temp.push(arr[i++])
  while (j <= right) temp.push(arr[j++])

  for (let k = 0; k < temp.length; k++) {
    arr[left + k] = temp[k]
    yield { type: 'set', index: left + k, value: temp[k] }
  }
}
