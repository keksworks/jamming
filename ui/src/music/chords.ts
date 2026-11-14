import type {Song} from 'src/api/types'

const sharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
export const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
export const minorKeys = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm']

export function keyOptions(minor = false) {
  return Object.fromEntries((minor ? minorKeys : keys).map(k => [k, k]))
}

const chordRegex = /^([A-G][#b]?)((?:m|maj|min|dim|aug|sus|add|M|\d|[#b+°ø()-])*)(?:\/([A-G][#b]?))?$/

export function isChord(s: string) {
  return chordRegex.test(s)
}

function noteIndex(note: string) {
  const i = sharps.indexOf(note)
  return i >= 0 ? i : flats.indexOf(note)
}

/** Intervals in semitones from root, by chord suffix */
const qualities: Record<string, number[]> = {
  '': [0, 4, 7], m: [0, 3, 7], min: [0, 3, 7], 5: [0, 7],
  7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], mM7: [0, 3, 7, 11], mmaj7: [0, 3, 7, 11],
  6: [0, 4, 7, 9], m6: [0, 3, 7, 9], 9: [0, 4, 7, 10, 14], maj9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14],
  add9: [0, 4, 7, 14], madd9: [0, 3, 7, 14], sus2: [0, 2, 7], sus4: [0, 5, 7], sus: [0, 5, 7], '7sus4': [0, 5, 7, 10],
  dim: [0, 3, 6], '°': [0, 3, 6], dim7: [0, 3, 6, 9], '°7': [0, 3, 6, 9], m7b5: [0, 3, 6, 10], 'ø': [0, 3, 6, 10], 'ø7': [0, 3, 6, 10],
  aug: [0, 4, 8], '+': [0, 4, 8], '7#9': [0, 4, 7, 10, 15], '7b9': [0, 4, 7, 10, 13], 11: [0, 4, 7, 10, 14, 17], 13: [0, 4, 7, 10, 14, 21]
}

/** Pitch classes of root and bass (0 = C) and intervals from root; unknown suffixes fall back to major or minor triad */
export function parseChord(chord: string) {
  const m = chord.match(chordRegex)
  if (!m) return
  const [, root, suffix, bass] = m
  const intervals = qualities[suffix.replace(/[()]/g, '')] ?? (/^m(?!aj)/.test(suffix) ? qualities.m : qualities[''])
  return {root: noteIndex(root), bass: noteIndex(bass ?? root), intervals}
}

export function midiFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12)
}

/** MIDI notes for piano: chord stacked from root in the octave of C3, bass of slash chords an octave lower */
export function pianoNotes(chord: string) {
  const parsed = parseChord(chord)
  if (!parsed) return []
  const notes = parsed.intervals.map(i => 48 + parsed.root + i)
  return parsed.bass != parsed.root ? [36 + parsed.bass, ...notes] : notes
}

function keyRoot(key: string) {
  return key.match(/^[A-G][#b]?/)?.[0] ?? key
}

export function usesFlats(key?: string) {
  return !!key && (keyRoot(key).endsWith('b') || ['F', 'Dm', 'Gm', 'Cm', 'Fm'].includes(key))
}

function transposeNote(note: string, semitones: number, flat: boolean) {
  return (flat ? flats : sharps)[(noteIndex(note) + semitones + 120) % 12]
}

export function transposeChord(chord: string, semitones: number, flat = false) {
  const m = chord.match(chordRegex)
  if (!m || !semitones) return chord
  const [, root, rest, bass] = m
  return transposeNote(root, semitones, flat) + rest + (bass ? '/' + transposeNote(bass, semitones, flat) : '')
}

/** Key from first chord, if not specified */
export function detectKey(sheet: string) {
  const m = sheet.match(/\[([A-G][#b]?)(m(?!aj))?/)
  return m ? m[1] + (m[2] ?? '') : undefined
}

export function semitonesBetween(fromKey: string, toKey: string) {
  return (noteIndex(keyRoot(toKey)) - noteIndex(keyRoot(fromKey)) + 12) % 12
}

export type SheetPart = {text: string, chord?: string, label?: string, index?: number}

/** Parses ChordPro-like sheet into lines and sequence of chords (for timing) */
export function parseSheet(sheet: string, semitones = 0, flat = false) {
  const chords: string[] = []
  const lines = sheet.split('\n').map(line => {
    const directive = line.trim().match(/^\{(\w+)(?::\s*(.*))?}$/)
    if (directive) return ['c', 'comment', 'ci', 'cb'].includes(directive[1]) ? [{text: '', label: directive[2]}] : undefined
    const tokens = line.split(/\[([^\]]*)]/)
    const parts: SheetPart[] = tokens[0] ? [{text: tokens[0]}] : []
    for (let i = 1; i < tokens.length; i += 2) {
      if (isChord(tokens[i])) {
        parts.push({chord: transposeChord(tokens[i], semitones, flat), text: tokens[i + 1], index: chords.length})
        chords.push(parts.at(-1)!.chord!)
      } else parts.push({text: tokens[i + 1], label: tokens[i]})
    }
    return parts
  }).filter(l => l) as SheetPart[][]
  return {lines, chords}
}

export function hasChords(sheet: string) {
  return parseSheet(sheet).chords.length > 0
}

function isChordLine(line: string) {
  const tokens = line.trim().split(/\s+/).filter(t => t != '|')
  return tokens[0] && tokens.every(isChord)
}

/** Converts "chords over lyrics" format (common on chord sites) to inline ChordPro */
export function toChordPro(text: string) {
  const lines = text.replace(/\r/g, '').split('\n')
  const result: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const section = line.trim().match(/^\[([^\]]+)]$/)
    if (section && !isChord(section[1])) result.push(`{c: ${section[1]}}`)
    else if (!isChordLine(line)) result.push(line)
    else {
      const next = lines[i + 1]
      const hasLyrics = next?.trim() && !isChordLine(next) && !next.trim().startsWith('[')
      let lyrics = hasLyrics ? next : ''
      const positions = [...line.matchAll(/\S+/g)].filter(m => m[0] != '|').reverse()
      for (const m of positions) {
        lyrics = lyrics.padEnd(m.index!)
        lyrics = lyrics.slice(0, m.index) + `[${m[0]}]` + lyrics.slice(m.index)
      }
      result.push(hasLyrics ? lyrics.trimEnd() : lyrics.replace(/] +\[/g, '] ['))
      if (hasLyrics) i++
    }
  }
  return result.join('\n')
}

const degrees = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const degreeSemitones = [0, 2, 4, 5, 7, 9, 11]
const numeralRegex = /^([b#]?)(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)(.*)$/

function isNumeral(s: string) {
  const m = s.match(numeralRegex)
  return !!m && isChord('C' + m[3])
}

export function numeralToChord(numeral: string, key: string) {
  const [, accidental, degree, suffix] = numeral.match(numeralRegex)!
  const semitones = degreeSemitones[degrees.indexOf(degree.toUpperCase())] + (accidental == 'b' ? -1 : accidental == '#' ? 1 : 0)
  const minor = degree == degree.toLowerCase() && !suffix.startsWith('dim') && !suffix.startsWith('ø')
  return transposeNote(keyRoot(key), semitones, usesFlats(key) || accidental == 'b') + (minor ? 'm' : '') + suffix
}

export const progressions = {
  pop: 'I V vi IV',
  fifties: 'I vi IV V',
  sadPop: 'vi IV I V',
  jazz: 'ii7 V7 Imaj7 Imaj7',
  blues: 'I7 I7 I7 I7 IV7 IV7 I7 I7 V7 IV7 I7 V7',
  canon: 'I V vi iii IV I IV V',
  andalusian: 'i bVII bVI V',
  minorRock: 'i bVI bIII bVII',
  mixolydian: 'I bVII IV I'
}

/** Chords or roman numerals separated by spaces, commas, dashes or bars */
export function progressionChords(progression: string) {
  return progression.split(/[\s,|–—]+/).filter(c => c && c != '-')
}

export function isValidProgression(progression: string) {
  const chords = progressionChords(progression)
  return chords.length > 0 && chords.every(c => isChord(c) || isNumeral(c))
}

export function isMinorProgression(progression: string) {
  return /^i(?![iv])/.test(progressionChords(progression)[0] ?? '')
}

/** Builds a sheet with 4 chords per line, roman numerals are converted to chords in the key */
export function progressionSheet(progression: string, key: string) {
  return progressionChords(progression).map((c, i) => (i && i % 4 == 0 ? '\n' : '') + `[${isChord(c) ? c : numeralToChord(c, key)}]`).join(' ').replace(/ \n/g, '\n')
}

/** Key is detected from the first chord, unless roman numerals are used, which are played in the key of root */
export function progressionSong(title: string, progression: string, root: string) {
  const usesNumerals = !progressionChords(progression).every(isChord)
  const key = usesNumerals ? root + (isMinorProgression(progression) ? 'm' : '') : undefined
  return {title, sheet: progressionSheet(progression, key ?? root), key} as Song
}
