import type { SortGenerator } from '../types'

export function* quickSort(arr: number[]): SortGenerator {
  yield* quickSortHelper(arr, 0, arr.length - 1)
}

function* quickSortHelper(
  arr: number[],
  low: number,
  high: number
): SortGenerator {
  if (low >= high) return

  const pivotIdx = yield* partition(arr, low, high)
  yield* quickSortHelper(arr, low, pivotIdx - 1)
  yield* quickSortHelper(arr, pivotIdx + 1, high)
}

function* partition(
  arr: number[],
  low: number,
  high: number
): Generator<
  { type: 'compare'; indices: [number, number] } | { type: 'swap'; indices: [number, number] },
  number,
  void
> {
  const pivot = arr[high]
  let i = low - 1

  for (let j = low; j < high; j++) {
    yield { type: 'compare', indices: [j, high] }
    if (arr[j] < pivot) {
      i++
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      yield { type: 'swap', indices: [i, j] }
    }
  }

  ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
  yield { type: 'swap', indices: [i + 1, high] }
  return i + 1
}
