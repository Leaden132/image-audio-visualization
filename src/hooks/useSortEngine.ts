import { useCallback, useEffect, useRef, useState } from 'react'
import type { SortAction, SortGenerator, SortStatus } from '../engine/types'
import type { AudioSliceData } from '../engine/sliceAudio'
import { playSlice, playFullAudio } from '../engine/sliceAudio'
import { shuffle } from '../utils/shuffle'
import { ALGORITHMS } from '../engine/algorithms/index'

export interface SortEngineState {
  order: number[]
  highlights: number[]
  status: SortStatus
  stepCount: number
  algorithmKey: string | null
  speed: number // slider value 1-100, default 50
}

export interface SortEngine {
  state: SortEngineState
  play: () => void
  pause: () => void
  reset: () => void
  setAlgorithm: (key: string | null) => void
  setSpeed: (speed: number) => void
  audioDuration: number
}

/**
 * Maps slider value (1-100) to { delay, batchSize }.
 * - 1 (slowest): 150ms delay, 1 step
 * - 50 (default/medium): 1ms delay, 1 step  (old max speed)
 * - 100 (fastest): 0ms delay, 12 steps per tick
 */
function getSpeedParams(slider: number): { delay: number; batchSize: number } {
  if (slider <= 50) {
    // 1→150ms, 50→1ms (linear)
    const t = (slider - 1) / 49
    const delay = Math.round(150 - t * 149)
    return { delay, batchSize: 1 }
  } else {
    // 51→2 steps, 100→4 steps at 2ms delay (stable for browser rendering)
    const t = (slider - 50) / 50
    const batchSize = Math.round(1 + t * 3)
    return { delay: 2, batchSize }
  }
}

export function useSortEngine(
  sliceCount: number,
  audioData: AudioSliceData | null,
  audioCtx: AudioContext | null,
  masterGain: GainNode | null
): SortEngine {
  const [state, setState] = useState<SortEngineState>({
    order: shuffle(sliceCount),
    highlights: [],
    status: 'idle',
    stepCount: 0,
    algorithmKey: null,
    speed: 50,
  })

  const genRef = useRef<SortGenerator | null>(null)
  const timerRef = useRef<number | null>(null)
  const orderRef = useRef<number[]>(state.order)
  const statusRef = useRef<SortStatus>(state.status)
  const speedRef = useRef<number>(state.speed)
  const algorithmKeyRef = useRef<string | null>(state.algorithmKey)
  const playingSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const pausedFromSortedRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { orderRef.current = state.order }, [state.order])
  useEffect(() => { statusRef.current = state.status }, [state.status])
  useEffect(() => { speedRef.current = state.speed }, [state.speed])
  useEffect(() => { algorithmKeyRef.current = state.algorithmKey }, [state.algorithmKey])

  const audioDuration = audioData ? audioData.buffer.duration : 0

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stopFullAudio = useCallback(() => {
    if (playingSourceRef.current) {
      try { playingSourceRef.current.stop() } catch { /* already stopped */ }
      playingSourceRef.current = null
    }
  }, [])

  const step = useCallback(() => {
    if (statusRef.current !== 'running' || !genRef.current) return

    const { delay, batchSize } = getSpeedParams(speedRef.current)
    const order = [...orderRef.current]
    let highlights: number[] = []
    let steps = 0
    let done = false

    for (let b = 0; b < batchSize; b++) {
      const result = genRef.current.next()

      if (result.done) {
        done = true
        break
      }

      const action: SortAction = result.value
      steps++

      if (action.type === 'compare') {
        highlights = [...action.indices]
        // Only play audio on the last step of the batch
        if (b === batchSize - 1 && audioData && audioCtx && masterGain) {
          playSlice(audioData, order[action.indices[1]], audioCtx, masterGain)
        }
      } else if (action.type === 'swap') {
        const [i, j] = action.indices
        ;[order[i], order[j]] = [order[j], order[i]]
        highlights = [...action.indices]
        if (b === batchSize - 1 && audioData && audioCtx && masterGain) {
          playSlice(audioData, order[action.indices[0]], audioCtx, masterGain)
        }
      } else if (action.type === 'set') {
        order[action.index] = action.value
        highlights = [action.index]
        if (b === batchSize - 1 && audioData && audioCtx && masterGain) {
          playSlice(audioData, action.value, audioCtx, masterGain)
        }
      }
    }

    if (done) {
      // Ensure final order is fully sorted
      orderRef.current = order
      setState(s => ({
        ...s,
        order,
        highlights: [],
        status: 'sorted',
        stepCount: s.stepCount + steps,
      }))
      // Play full sorted audio
      if (audioData && audioCtx && masterGain) {
        playingSourceRef.current = playFullAudio(audioData, audioCtx, masterGain)
      }
      return
    }

    orderRef.current = order
    setState(s => ({
      ...s,
      order,
      highlights,
      stepCount: s.stepCount + steps,
    }))

    timerRef.current = window.setTimeout(step, delay)
  }, [audioData, audioCtx, masterGain])

  const play = useCallback(() => {
    // Resume from sorted-pause: just resume audio and go back to sorted
    if (statusRef.current === 'paused' && pausedFromSortedRef.current) {
      pausedFromSortedRef.current = false
      if (audioCtx?.state === 'suspended') {
        audioCtx.resume()
      }
      setState(s => ({ ...s, status: 'sorted' }))
      statusRef.current = 'sorted'
      return
    }

    stopFullAudio()

    // Resume AudioContext if suspended (browser autoplay policy)
    if (audioCtx?.state === 'suspended') {
      audioCtx.resume()
    }

    if (statusRef.current === 'paused' && genRef.current) {
      setState(s => ({ ...s, status: 'running' }))
      statusRef.current = 'running'
      const { delay } = getSpeedParams(speedRef.current)
      timerRef.current = window.setTimeout(step, delay)
      return
    }

    // Fresh start
    const key = algorithmKeyRef.current
    if (!key) return

    const entry = ALGORITHMS[key]
    if (!entry) return

    const orderCopy = [...orderRef.current]
    genRef.current = entry.fn(orderCopy)

    setState(s => ({ ...s, status: 'running', stepCount: 0 }))
    statusRef.current = 'running'
    const { delay } = getSpeedParams(speedRef.current)
    timerRef.current = window.setTimeout(step, delay)
  }, [step, audioCtx, stopFullAudio])

  const pause = useCallback(() => {
    clearTimer()
    if (statusRef.current === 'sorted') {
      pausedFromSortedRef.current = true
      // Suspend AudioContext to truly pause audio mid-playback
      if (audioCtx?.state === 'running') {
        audioCtx.suspend()
      }
    }
    setState(s => ({ ...s, status: 'paused' }))
    statusRef.current = 'paused'
  }, [clearTimer, audioCtx])

  const reset = useCallback(() => {
    clearTimer()
    stopFullAudio()
    genRef.current = null
    const newOrder = shuffle(sliceCount)
    orderRef.current = newOrder
    setState(s => ({
      ...s,
      order: newOrder,
      highlights: [],
      status: 'idle',
      stepCount: 0,
    }))
    statusRef.current = 'idle'
  }, [sliceCount, clearTimer, stopFullAudio])

  const setAlgorithm = useCallback((key: string | null) => {
    clearTimer()
    stopFullAudio()
    genRef.current = null
    const newOrder = shuffle(sliceCount)
    orderRef.current = newOrder
    algorithmKeyRef.current = key
    setState(s => ({
      ...s,
      algorithmKey: key,
      order: newOrder,
      highlights: [],
      status: 'idle',
      stepCount: 0,
    }))
    statusRef.current = 'idle'
  }, [sliceCount, clearTimer, stopFullAudio])

  const setSpeed = useCallback((speed: number) => {
    speedRef.current = speed
    setState(s => ({ ...s, speed }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer()
      stopFullAudio()
    }
  }, [clearTimer, stopFullAudio])

  return { state, play, pause, reset, setAlgorithm, setSpeed, audioDuration }
}
