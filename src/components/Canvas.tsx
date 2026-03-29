import { useRef, useEffect } from 'react'
import type { ImageSliceData } from '../engine/sliceImage'

interface Props {
  imageData: ImageSliceData
  order: number[]
  highlights: number[]
}

export function Canvas({ imageData, order, highlights }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { slices, totalWidth, totalHeight, sliceWidth } = imageData

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, totalWidth, totalHeight)

    for (let i = 0; i < order.length; i++) {
      const sliceIdx = order[i]
      const x = i * sliceWidth
      ctx.putImageData(slices[sliceIdx], x, 0)
    }

    // Draw highlight bars (vertical)
    if (highlights.length > 0) {
      for (const idx of highlights) {
        const x = idx * sliceWidth
        ctx.fillStyle = 'rgba(255, 220, 50, 0.35)'
        ctx.fillRect(x, 0, sliceWidth, totalHeight)
      }
    }
  }, [order, highlights, slices, totalWidth, totalHeight, sliceWidth])

  return (
    <canvas
      ref={canvasRef}
      width={totalWidth}
      height={totalHeight}
      style={{
        width: totalWidth * 2,
        height: totalHeight * 2,
        maxWidth: '100%',
        imageRendering: 'pixelated',
        borderRadius: 8,
        border: '2px solid rgba(255,255,255,0.1)',
      }}
    />
  )
}
