import { useState, useEffect, useRef } from 'react'
import { sliceImage, type ImageSliceData } from '../engine/sliceImage'
import { sliceAudio, type AudioSliceData } from '../engine/sliceAudio'
import type { MediaPair } from '../engine/types'

export interface MediaState {
  imageData: ImageSliceData | null
  audioData: AudioSliceData | null
  audioCtx: AudioContext | null
  masterGain: GainNode | null
  loading: boolean
  error: string | null
}

export function useMediaLoader(pair: MediaPair, sliceCount: number): MediaState {
  const [state, setState] = useState<MediaState>({
    imageData: null,
    audioData: null,
    audioCtx: null,
    masterGain: null,
    loading: true,
    error: null,
  })
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext()
          masterGainRef.current = audioCtxRef.current.createGain()
          masterGainRef.current.gain.value = 0.075
          masterGainRef.current.connect(audioCtxRef.current.destination)
        }
        const ctx = audioCtxRef.current
        const gain = masterGainRef.current!

        const [imageData, audioData] = await Promise.all([
          sliceImage(pair.image, sliceCount),
          sliceAudio(pair.audio, sliceCount, ctx),
        ])

        if (!cancelled) {
          setState({ imageData, audioData, audioCtx: ctx, masterGain: gain, loading: false, error: null })
        }
      } catch (e) {
        if (!cancelled) {
          setState(s => ({ ...s, loading: false, error: String(e) }))
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [pair.id, sliceCount])

  return state
}
