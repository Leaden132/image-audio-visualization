import type { AlgorithmEntry } from '../types'
import { bubbleSort } from './bubbleSort'
import { selectionSort } from './selectionSort'
import { insertionSort } from './insertionSort'
import { mergeSort } from './mergeSort'
import { quickSort } from './quickSort'
import { heapSort } from './heapSort'
import { shellSort } from './shellSort'
import { radixSort } from './radixSort'
import { cocktailShakerSort } from './cocktailShakerSort'
import { countingSort } from './countingSort'

export const ALGORITHMS: Record<string, AlgorithmEntry> = {
  bubble: { name: 'Bubble Sort', fn: bubbleSort },
  selection: { name: 'Selection Sort', fn: selectionSort },
  insertion: { name: 'Insertion Sort', fn: insertionSort },
  merge: { name: 'Merge Sort', fn: mergeSort },
  quick: { name: 'Quick Sort', fn: quickSort },
  heap: { name: 'Heap Sort', fn: heapSort },
  shell: { name: 'Shell Sort', fn: shellSort },
  radix: { name: 'Radix Sort', fn: radixSort },
  cocktail: { name: 'Cocktail Shaker Sort', fn: cocktailShakerSort },
  counting: { name: 'Counting Sort', fn: countingSort },
}

export const ALGORITHM_ORDER = Object.keys(ALGORITHMS)
