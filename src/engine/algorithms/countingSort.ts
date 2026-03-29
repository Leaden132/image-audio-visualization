import type { SortGenerator } from '../types'

export function* countingSort(arr: number[]): SortGenerator {
  const max = Math.max(...arr)
  const count = new Array(max + 1).fill(0)

  // Count occurrences
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++
    yield { type: 'compare', indices: [i, i] }
  }

  // Rebuild sorted array
  let pos = 0
  for (let val = 0; val <= max; val++) {
    while (count[val] > 0) {
      if (arr[pos] !== val) {
        arr[pos] = val
        yield { type: 'set', index: pos, value: val }
      }
      pos++
      count[val]--
    }
  }
}
