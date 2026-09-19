/*
 * Monophonic pitch detection via autocorrelation.
 * Adapted from the well-known ACF approach (Chris Wilson's PitchDetect):
 * trims quiet edges, autocorrelates, then parabolic-interpolates the peak.
 * Returns frequency in Hz, or -1 if the signal is too quiet / unpitched.
 */
export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length

  // Remove DC offset (some mic inputs have a small constant bias that
  // otherwise skews the autocorrelation and the loudness gate below).
  let mean = 0
  for (let i = 0; i < SIZE; i++) mean += buf[i]
  mean /= SIZE

  // Bail out if the signal is too quiet (root-mean-square gate).
  // A guitar picked up by a laptop/phone mic rarely reaches 0.01 RMS,
  // so a lower gate is needed or the tuner reads silence most of the time.
  let rms = 0
  for (let i = 0; i < SIZE; i++) {
    const v = buf[i] - mean
    rms += v * v
  }
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.003) return -1

  // Work on a DC-free copy of the full buffer. The previous version trimmed
  // to a fixed absolute-amplitude threshold (0.2), which real mic input
  // rarely reaches consistently — the trim window shifted from frame to
  // frame and shuffled which waveform cycles were correlated, which is what
  // produced the jumpy, unstable readings.
  const n = SIZE
  const b = new Float32Array(n)
  for (let i = 0; i < n; i++) b[i] = buf[i] - mean

  const c = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) c[i] += b[j] * b[j + i]
  }

  // Skip the initial downslope, then find the highest peak.
  let d = 0
  while (d < n - 1 && c[d] > c[d + 1]) d++
  let maxval = -1
  let maxpos = -1
  for (let i = d; i < n; i++) {
    if (c[i] > maxval) {
      maxval = c[i]
      maxpos = i
    }
  }
  if (maxpos <= 0) return -1

  // Parabolic interpolation around the peak for sub-sample accuracy.
  let T0 = maxpos
  const x1 = c[T0 - 1] ?? 0
  const x2 = c[T0]
  const x3 = c[T0 + 1] ?? 0
  const a = (x1 + x3 - 2 * x2) / 2
  const shift = (x3 - x1) / 2
  if (a) T0 -= shift / (2 * a)

  return sampleRate / T0
}
