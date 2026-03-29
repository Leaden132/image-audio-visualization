import { ALGORITHMS } from '../engine/algorithms/index'
import type { SortStatus } from '../engine/types'

interface Props {
  algorithmKey: string | null
  status: SortStatus
  stepCount: number
  playAllMode: boolean
  playAllIndex: number
}

export function AlgorithmInfo({ algorithmKey, status, stepCount, playAllMode, playAllIndex }: Props) {
  const name = algorithmKey ? ALGORITHMS[algorithmKey]?.name ?? algorithmKey : 'None'

  const statusLabel: Record<SortStatus, string> = {
    idle: 'Ready',
    running: 'Sorting...',
    paused: 'Paused',
    sorted: 'Sorted!',
  }

  return (
    <div className="algorithm-info">
      <div className="algo-name">{name}</div>
      <div className="algo-stats">
        <span className={`status-badge status-${status}`}>{statusLabel[status]}</span>
        <span className="step-count">{stepCount.toLocaleString()} steps</span>
        {playAllMode && (
          <span className="play-all-badge">Play All ({playAllIndex + 1}/10)</span>
        )}
      </div>
    </div>
  )
}
