export interface AudioSliceData {
  buffer: AudioBuffer
  samplesPerSlice: number
  sliceCount: number
}

export async function sliceAudio(
  audioSrc: string,
  sliceCount: number,
  audioCtx: AudioContext
): Promise<AudioSliceData> {
  const response = await fetch(audioSrc)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = await audioCtx.decodeAudioData(arrayBuffer)
  const samplesPerSlice = Math.floor(buffer.length / sliceCount)

  return { buffer, samplesPerSlice, sliceCount }
}

export function playSlice(
  audioData: AudioSliceData,
  sliceIndex: number,
  audioCtx: AudioContext,
  masterGain: GainNode
): void {
  const { buffer, samplesPerSlice } = audioData
  const startSample = sliceIndex * samplesPerSlice
  const endSample = Math.min(startSample + samplesPerSlice, buffer.length)
  const length = endSample - startSample

  const sliceBuffer = audioCtx.createBuffer(
    buffer.numberOfChannels,
    length,
    buffer.sampleRate
  )

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const fullData = buffer.getChannelData(ch)
    const sliceData = sliceBuffer.getChannelData(ch)
    sliceData.set(fullData.subarray(startSample, endSample))
  }

  const source = audioCtx.createBufferSource()
  source.buffer = sliceBuffer
  source.connect(masterGain)
  source.start(0)
}

export function playFullAudio(
  audioData: AudioSliceData,
  audioCtx: AudioContext,
  masterGain: GainNode
): AudioBufferSourceNode {
  const source = audioCtx.createBufferSource()
  source.buffer = audioData.buffer
  source.connect(masterGain)
  source.start(0)
  return source
}
