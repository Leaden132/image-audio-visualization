# Sorting Visualizer — Future Plans

## Phase 2: Multiple Media Pairs
- [ ] Add more image + audio pairs to `public/media/`
- [ ] Add a media selector UI (dropdown or thumbnail gallery)
- [ ] Update `MEDIA_PAIRS` in `src/engine/types.ts` for each new pair
- [ ] Support different image sizes (auto-calculate slice height per image)

## Phase 3: Video Support
- [ ] Accept video files (mp4, webm) as input
- [ ] Extract a single frame from the video to use as the image source
- [ ] Use the video's audio track as the audio source
- [ ] Option to extract frame at a user-specified timestamp
- [ ] Use `<video>` element + canvas `drawImage` for frame extraction

## Phase 4: User Uploads
- [ ] Add drag-and-drop upload zone for image + audio files
- [ ] Support image formats: PNG, JPG, WebP, GIF (first frame)
- [ ] Support audio formats: MP3, WAV, OGG, M4A
- [ ] Use `URL.createObjectURL()` for local file URLs (no server needed)
- [ ] Validate file types and sizes before processing
- [ ] Option to upload a video file that auto-splits into image + audio

## Phase 5: Enhanced Controls
- [ ] Configurable slice count (slider from 10 to 200)
- [ ] Step-through mode (advance one step at a time)
- [ ] Rewind / restart current algorithm
- [ ] Side-by-side comparison of two algorithms
- [ ] Show comparison count and swap count stats
- [ ] Algorithm complexity info tooltip (Big-O notation)

## Phase 6: More Algorithms
- [ ] Bogo Sort (for fun, with safety limit)
- [ ] Comb Sort
- [ ] Tim Sort
- [ ] Bitonic Sort
- [ ] Gnome Sort
- [ ] Pancake Sort
- [ ] Stooge Sort
- [ ] Odd-Even Sort

## Phase 7: Visual Enhancements
- [ ] Color-coded highlights (yellow=compare, green=swap, red=pivot)
- [ ] Side bar showing element positions as a bar chart
- [ ] Sorting progress bar
- [ ] Full-screen mode
- [ ] Dark / light theme toggle
- [ ] Animation for the "sorted" celebration (confetti, glow pulse)

## Phase 8: Sharing & Export
- [ ] Record sorting visualization as video (MediaRecorder API)
- [ ] Export as GIF
- [ ] Share link with encoded settings
- [ ] Screenshot current state

## Technical Debt
- [ ] Add unit tests for all sorting algorithms
- [ ] Add error boundaries for media loading failures
- [ ] PWA support (offline capable)
- [ ] Performance optimization for high slice counts (OffscreenCanvas, Web Workers)
