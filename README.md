# Sorting Visualizer

A React web app that visualizes sorting algorithms using image slices and synchronized audio.

## How It Works

1. An image is horizontally sliced into 50 pieces
2. The matching audio file is sliced into 50 segments
3. The slices are randomly shuffled
4. A sorting algorithm rearranges the slices step-by-step
5. Each step plays the corresponding audio segment
6. When sorted, the full audio plays and the original image is shown

## Sorting Algorithms

- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort
- Shell Sort
- Radix Sort
- Cocktail Shaker Sort
- Counting Sort

## Features

- **Play All mode**: Automatically cycles through every algorithm
- **Play / Pause / Reset** controls
- **Speed slider**: Adjust sorting visualization speed
- **Audio feedback**: Hear the sorting progress in real-time
- **Completion playback**: Full sorted audio + image on algorithm finish

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Adding Media

Place image + audio pairs in `public/media/` and add entries to `MEDIA_PAIRS` in `src/engine/types.ts`:

```ts
{ id: 'my-pair', image: '/media/my-image.png', audio: '/media/my-audio.mp3' }
```

## Tech Stack

- Vite + React + TypeScript
- Canvas API (image slicing/rendering)
- Web Audio API (audio slicing/playback)
- Zero external dependencies beyond React
