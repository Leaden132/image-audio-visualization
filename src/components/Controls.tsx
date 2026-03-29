import { ALGORITHMS, ALGORITHM_ORDER } from '../engine/algorithms/index'
import { MEDIA_PAIRS } from '../engine/types'
import type { SortStatus } from '../engine/types'

interface Props {
  algorithmKey: string | null
  status: SortStatus
  speed: number
  volume: number
  pairIndex: number
  onMediaChange: (index: number) => void
  onAlgorithmChange: (key: string | null) => void
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
  onVolumeChange: (volume: number) => void
}

export function Controls({
  algorithmKey,
  status,
  speed,
  volume,
  pairIndex,
  onMediaChange,
  onAlgorithmChange,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
  onVolumeChange,
}: Props) {
  const isRunning = status === 'running'
  const canPlay = status === 'idle' || status === 'paused'

  return (
    <div className="controls">
      <div className="controls-row">
        <select
          value={pairIndex}
          onChange={e => onMediaChange(Number(e.target.value))}
          disabled={isRunning}
        >
          {MEDIA_PAIRS.map((pair, i) => (
            <option key={pair.id} value={i}>
              {pair.name}
            </option>
          ))}
        </select>

        <select
          value={algorithmKey ?? '__all__'}
          onChange={e => {
            const val = e.target.value
            onAlgorithmChange(val === '__all__' ? null : val)
          }}
          disabled={isRunning}
        >
          <option value="__all__">▶ Play All</option>
          {ALGORITHM_ORDER.map(key => (
            <option key={key} value={key}>
              {ALGORITHMS[key].name}
            </option>
          ))}
        </select>

        {canPlay ? (
          <button className="btn btn-play" onClick={onPlay}>
            Play
          </button>
        ) : (
          <button className="btn btn-pause" onClick={onPause}>
            Pause
          </button>
        )}

        <button className="btn btn-reset" onClick={onReset} disabled={status === 'idle'}>
          Reset
        </button>
      </div>

      <div className="controls-row speed-row">
        <label>
          Speed
          <input
            type="range"
            min={1}
            max={100}
            value={speed}
            onChange={e => onSpeedChange(Number(e.target.value))}
          />
        </label>
        <label>
          Vol
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={e => onVolumeChange(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  )
}
