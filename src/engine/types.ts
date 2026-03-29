export interface MediaPair {
  id: string
  name: string
  image: string
  audio: string
}

export const MEDIA_PAIRS: MediaPair[] = [
  { id: '1', name: 'Speaki', image: '/media/1/speaki.webp', audio: '/media/1/speaki.mp3' },
  { id: '2', name: 'Developers', image: '/media/2/developers.webp', audio: '/media/2/developers.mp3' },
]

export type SortAction =
  | { type: 'compare'; indices: [number, number] }
  | { type: 'swap'; indices: [number, number] }
  | { type: 'set'; index: number; value: number }
  | { type: 'done' }

export type SortGenerator = Generator<SortAction, void, void>
export type SortAlgorithmFn = (arr: number[]) => SortGenerator

export interface AlgorithmEntry {
  name: string
  fn: SortAlgorithmFn
}

export type SortStatus = 'idle' | 'running' | 'paused' | 'sorted'
