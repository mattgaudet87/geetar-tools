/*
 * Monophonic pitch detection via autocorrelation.
 * Adapted from the well-known ACF approach (Chris Wilson's PitchDetect):
 * trims quiet edges, autocorrelates, then parabolic-interpolates the peak.
 * Returns frequency in Hz, or -1 if the signal is too quiet / unpitched.
 */
export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length

  // Bail out if the signal is too quiet (root-mean-square gate).
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return -1

  // Trim near-silent samples from both ends.
  const thres = 0.2
  let r1 = 0
  let r2 = SIZE - 1
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i
      break
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i
      break
    }
  }

  const b = buf.slice(r1, r2)
  const n = b.length
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
