import type { SortGenerator } from '../types'

export function* heapSort(arr: number[]): SortGenerator {
  const n = arr.length

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(arr, n, i)
  }

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    ;[arr[0], arr[i]] = [arr[i], arr[0]]
    yield { type: 'swap', indices: [0, i] }
    yield* heapify(arr, i, 0)
  }
}

function* heapify(
  arr: number[],
  size: number,
  root: number
): SortGenerator {
  let largest = root
  const left = 2 * root + 1
  const right = 2 * root + 2

  if (left < size) {
    yield { type: 'compare', indices: [left, largest] }
    if (arr[left] > arr[largest]) largest = left
  }

  if (right < size) {
    yield { type: 'compare', indices: [right, largest] }
    if (arr[right] > arr[largest]) largest = right
  }

  if (largest !== root) {
    ;[arr[root], arr[largest]] = [arr[largest], arr[root]]
    yield { type: 'swap', indices: [root, largest] }
    yield* heapify(arr, size, largest)
  }
}
