import { useState, useEffect, useCallback, useRef } from 'react'
import { MEDIA_PAIRS } from './engine/types'
import { ALGORITHM_ORDER } from './engine/algorithms/index'
import { useMediaLoader } from './hooks/useMediaLoader'
import { useSortEngine } from './hooks/useSortEngine'
import { Canvas } from './components/Canvas'
import { Controls } from './components/Controls'
import { AlgorithmInfo } from './components/AlgorithmInfo'

const SLICE_COUNT = 50

export default function App() {
  const [pairIndex, setPairIndex] = useState(0)
  const pair = MEDIA_PAIRS[pairIndex]
  const { imageData, audioData, audioCtx, masterGain, loading, error } = useMediaLoader(pair, SLICE_COUNT)
  const engine = useSortEngine(SLICE_COUNT, audioData, audioCtx, masterGain)
  const { state, audioDuration } = engine
  const [volume, setVolume] = useState(50)

  // Play All mode
  const [playAllMode, setPlayAllMode] = useState(false)
  const [playAllIndex, setPlayAllIndex] = useState(0)
  const advanceTimerRef = useRef<number | null>(null)
  const sortedAtRef = useRef<number>(0)
  const elapsedBeforePauseRef = useRef<number>(0)

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
  }, [])

  const startPlayAll = useCallback(() => {
    setPlayAllMode(true)
    setPlayAllIndex(0)
    const firstKey = ALGORITHM_ORDER[0]
    engine.setAlgorithm(firstKey)
  }, [engine])

  // Handle media change
  const handleMediaChange = useCallback((index: number) => {
    clearAdvanceTimer()
    setPlayAllMode(false)
    engine.reset()
    setPairIndex(index)
  }, [engine, clearAdvanceTimer])

  // Handle algorithm selection from Controls
  const handleAlgorithmChange = useCallback((key: string | null) => {
    clearAdvanceTimer()
    if (key === null) {
      startPlayAll()
    } else {
      setPlayAllMode(false)
      engine.setAlgorithm(key)
    }
  }, [engine, startPlayAll, clearAdvanceTimer])

  // Reset elapsed pause tracker when sorting starts
  useEffect(() => {
    if (state.status === 'running') {
      elapsedBeforePauseRef.current = 0
    }
  }, [state.status])

  // Handle pause — track elapsed time for sorted-state resume
  const handlePause = useCallback(() => {
    if (state.status === 'sorted') {
      elapsedBeforePauseRef.current += Date.now() - sortedAtRef.current
    }
    clearAdvanceTimer()
    engine.pause()
  }, [engine, state.status, clearAdvanceTimer])

  // Handle play button
  const handlePlay = useCallback(() => {
    // If "Play All" is selected but hasn't been initialized yet, start it
    if (!playAllMode && !state.algorithmKey) {
      setPlayAllMode(true)
      setPlayAllIndex(0)
      const firstKey = ALGORITHM_ORDER[0]
      engine.setAlgorithm(firstKey)
      setTimeout(() => engine.play(), 50)
      return
    }
    engine.play()
  }, [engine, playAllMode, state.algorithmKey])

  // Schedule advance/restart when sorted, accounting for pauses
  const scheduleAdvance = useCallback((remainingMs: number) => {
    clearAdvanceTimer()

    const doAdvance = () => {
      if (playAllMode) {
        const nextIndex = playAllIndex + 1
        if (nextIndex < ALGORITHM_ORDER.length) {
          setPlayAllIndex(nextIndex)
          engine.setAlgorithm(ALGORITHM_ORDER[nextIndex])
          setTimeout(() => engine.play(), 200)
        } else {
          setPlayAllIndex(0)
          engine.setAlgorithm(ALGORITHM_ORDER[0])
          setTimeout(() => engine.play(), 200)
        }
      } else {
        const key = state.algorithmKey
        if (key) {
          engine.setAlgorithm(key)
          setTimeout(() => engine.play(), 200)
        }
      }
    }

    advanceTimerRef.current = window.setTimeout(doAdvance, remainingMs)
  }, [clearAdvanceTimer, playAllMode, playAllIndex, engine, state.algorithmKey])

  // React to sorted status — fresh sort completion or resume from pause
  useEffect(() => {
    if (state.status !== 'sorted') return

    const totalWaitMs = Math.ceil(audioDuration * 1000) + 1000
    const remaining = Math.max(0, totalWaitMs - elapsedBeforePauseRef.current)

    sortedAtRef.current = Date.now()
    scheduleAdvance(remaining)

    return clearAdvanceTimer
  }, [state.status, audioDuration, scheduleAdvance, clearAdvanceTimer])

  // Volume control
  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v)
    if (masterGain) {
      masterGain.gain.value = (v / 100) * 0.15
    }
  }, [masterGain])

  // Cleanup on unmount
  useEffect(() => {
    return clearAdvanceTimer
  }, [clearAdvanceTimer])

  if (loading) {
    return (
      <div className="app">
        <div className="loader">
          <div className="loader-ring" />
          <span>Loading media...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-state">Failed to load: {error}</div>
      </div>
    )
  }



  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          <span className="title-glyph">&#9632;</span>
          Sort<span className="title-accent">Vis</span>
        </h1>
        <p className="subtitle">algorithmic image &amp; sound sorting</p>
      </header>

      <main className="main">
        <AlgorithmInfo
          algorithmKey={state.algorithmKey}
          status={state.status}
          stepCount={state.stepCount}
          playAllMode={playAllMode}
          playAllIndex={playAllIndex}
        />

        <div className="canvas-wrapper">
          <div className="canvas-glow" />
          {imageData && (
            <Canvas
              imageData={imageData}
              order={state.order}
              highlights={state.highlights}
            />
          )}
        </div>

        <Controls
          algorithmKey={playAllMode ? null : state.algorithmKey}
          status={state.status}
          speed={state.speed}
          pairIndex={pairIndex}
          onMediaChange={handleMediaChange}
          onAlgorithmChange={handleAlgorithmChange}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={() => {
            clearAdvanceTimer()
            setPlayAllMode(false)
            engine.reset()
          }}
          onSpeedChange={engine.setSpeed}
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />
      </main>

      <footer className="footer">
        <span className="footer-dot" />
        {ALGORITHM_ORDER.length} algorithms &middot; {SLICE_COUNT} slices
      </footer>
    </div>
  )
}
