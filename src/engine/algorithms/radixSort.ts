import type { SortGenerator } from '../types'

export function* radixSort(arr: number[]): SortGenerator {
  const max = Math.max(...arr)
  let exp = 1

  while (Math.floor(max / exp) > 0) {
    yield* countingSortByDigit(arr, exp)
    exp *= 10
  }
}

function* countingSortByDigit(
  arr: number[],
  exp: number
): SortGenerator {
  const n = arr.length
  const output = new Array(n)
  const count = new Array(10).fill(0)

  for (let i = 0; i < n; i++) {
    const digit = Math.floor(arr[i] / exp) % 10
    count[digit]++
  }

  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1]
  }

  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10
    output[count[digit] - 1] = arr[i]
    count[digit]--
  }

  for (let i = 0; i < n; i++) {
    if (arr[i] !== output[i]) {
      arr[i] = output[i]
      yield { type: 'set', index: i, value: output[i] }
    }
  }
}
