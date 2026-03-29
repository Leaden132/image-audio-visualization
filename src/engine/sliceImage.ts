const MAX_DIMENSION = 400

export interface ImageSliceData {
  slices: ImageData[]
  totalWidth: number
  totalHeight: number
  sliceWidth: number
}

export async function sliceImage(
  imageSrc: string,
  sliceCount: number
): Promise<ImageSliceData> {
  const img = await loadImage(imageSrc)

  // Scale down if either dimension exceeds MAX_DIMENSION
  let w = img.width
  let h = img.height
  const scale = Math.min(1, MAX_DIMENSION / w, MAX_DIMENSION / h)
  w = Math.round(w * scale)
  h = Math.round(h * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)

  const sliceWidth = Math.floor(w / sliceCount)
  const slices: ImageData[] = []

  for (let i = 0; i < sliceCount; i++) {
    const x = i * sliceWidth
    const sw = i === sliceCount - 1 ? w - x : sliceWidth
    slices.push(ctx.getImageData(x, 0, sw, h))
  }

  return { slices, totalWidth: w, totalHeight: h, sliceWidth }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
