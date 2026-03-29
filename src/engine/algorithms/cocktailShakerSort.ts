import type { SortGenerator } from '../types'

export function* cocktailShakerSort(arr: number[]): SortGenerator {
  let start = 0
  let end = arr.length - 1
  let swapped = true

  while (swapped) {
    swapped = false

    for (let i = start; i < end; i++) {
      yield { type: 'compare', indices: [i, i + 1] }
      if (arr[i] > arr[i + 1]) {
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        yield { type: 'swap', indices: [i, i + 1] }
        swapped = true
      }
    }

    if (!swapped) break
    end--
    swapped = false

    for (let i = end; i > start; i--) {
      yield { type: 'compare', indices: [i - 1, i] }
      if (arr[i - 1] > arr[i]) {
        ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
        yield { type: 'swap', indices: [i - 1, i] }
        swapped = true
      }
    }

    start++
  }
}
