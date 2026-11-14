/** Standard guitar tuning as MIDI notes: E2 A2 D3 G3 B3 E4 */
const openStrings = [40, 45, 50, 55, 59, 64]

/** Frets per string, undefined for muted strings */
export const guitarChords: Record<string, (number|undefined)[]> = {
  C: [undefined, 3, 2, 0, 1, 0],
  G: [3, 2, 0, 0, 0, 3],
  Am: [undefined, 0, 2, 2, 1, 0],
  F: [1, 3, 3, 2, 1, 1]
}

export function frequencies(frets: (number|undefined)[]) {
  return frets.map((fret, i) => fret === undefined ? undefined : 440 * 2 ** ((openStrings[i] + fret - 69) / 12))
}

/** Indexes of strings (by their positions) crossed when moving from one point to another, in order of crossing */
export function crossedStrings(from: number, to: number, positions: number[]) {
  const crossed = positions.map((p, i) => ({p, i})).filter(({p}) => Math.min(from, to) < p && p <= Math.max(from, to)).map(({i}) => i)
  return to < from ? crossed.reverse() : crossed
}
