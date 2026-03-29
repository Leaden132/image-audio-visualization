import type { SortGenerator } from '../types'

export function* shellSort(arr: number[]): SortGenerator {
  const n = arr.length
  let gap = Math.floor(n / 2)

  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      let j = i
      while (j >= gap) {
        yield { type: 'compare', indices: [j - gap, j] }
        if (arr[j - gap] > arr[j]) {
          ;[arr[j - gap], arr[j]] = [arr[j], arr[j - gap]]
          yield { type: 'swap', indices: [j - gap, j] }
          j -= gap
        } else {
          break
        }
      }
    }
    gap = Math.floor(gap / 2)
  }
}
