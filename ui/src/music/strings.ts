import {midiFrequency, parseChord} from './chords'

/** Standard guitar tuning as MIDI notes: E2 A2 D3 G3 B3 E4 */
const openStrings = [40, 45, 50, 55, 59, 64]

/** Frets per string from low E, undefined for muted strings */
export type Frets = (number|undefined)[]

export function frequencies(frets: Frets) {
  return frets.map((fret, i) => fret === undefined ? undefined : midiFrequency(openStrings[i] + fret))
}

/** Indexes of strings (by their positions) crossed when moving from one point to another, in order of crossing */
export function crossedStrings(from: number, to: number, positions: number[]) {
  const crossed = positions.map((p, i) => ({p, i})).filter(({p}) => Math.min(from, to) < p && p <= Math.max(from, to)).map(({i}) => i)
  return to < from ? crossed.reverse() : crossed
}

/** Lower is easier, undefined if not playable: only low strings may be muted, lowest note is bass, all required notes, max 4 fingers (barre counts as one, unless open strings are under it) */
function difficulty(frets: Frets, bass: number, required: number[]) {
  const lowest = frets.findIndex(f => f !== undefined)
  if (lowest < 0 || lowest > 2 || frets.slice(lowest).includes(undefined)) return
  const notes = frets.map((f, i) => f === undefined ? undefined : (openStrings[i] + f) % 12)
  if (notes[lowest] != bass || required.some(n => !notes.includes(n))) return
  const fretted = frets.filter(f => f) as number[]
  const barre = Math.min(...fretted)
  const barred = frets.flatMap((f, i) => f === barre ? [i] : [])
  const canBarre = !frets.slice(barred[0], barred.at(-1)).includes(0)
  const fingers = canBarre ? fretted.filter(f => f > barre).length + (fretted.length ? 1 : 0) : fretted.length
  if (fingers > 4) return
  return lowest * 2 + Math.max(0, ...fretted) * 1.5 + fingers / 2 - frets.filter(f => f === 0).length / 2 + (canBarre ? 0 : 2)
}

const voicings: Record<string, Frets|undefined> = {}

/** Finds the easiest guitar fingering by trying all frets within 4-fret windows (plus open strings) */
export function guitarVoicing(chord: string) {
  if (chord in voicings) return voicings[chord]
  const parsed = parseChord(chord)
  let best: {frets: Frets, difficulty: number}|undefined
  if (parsed) {
    const notes = new Set(parsed.intervals.map(i => (parsed.root + i) % 12))
    const optionalFifth = parsed.intervals.length > 3 ? 7 : undefined
    const required = parsed.intervals.filter(i => i != optionalFifth).map(i => (parsed.root + i) % 12)
    for (let base = 1; base <= 10; base++) {
      const options = openStrings.map(open => [...new Set([0, base, base + 1, base + 2, base + 3])]
        .filter(f => notes.has((open + f) % 12)) as Frets).map(o => [...o, undefined])
      const combine = (frets: Frets) => {
        if (frets.length < options.length) return options[frets.length].forEach(f => combine([...frets, f]))
        const d = difficulty(frets, parsed.bass, required)
        if (d !== undefined && (!best || d < best.difficulty)) best = {frets, difficulty: d}
      }
      combine([])
    }
  }
  return voicings[chord] = best?.frets
}
