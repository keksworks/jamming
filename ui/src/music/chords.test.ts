import {
  detectKey,
  isChord,
  isMinorProgression,
  isValidProgression,
  numeralToChord,
  parseChord,
  parseSheet,
  pianoNotes,
  progressions,
  progressionSheet,
  progressionSong,
  semitonesBetween,
  toChordPro,
  transposeChord,
  usesFlats
} from './chords'

it('isChord', () => {
  for (const c of ['C', 'Am', 'F#m7', 'Bb', 'Cmaj7', 'Dsus4', 'G/B', 'Am7b5', 'Cdim', 'E7(#9)']) expect(isChord(c), c).to.be.true
  for (const c of ['Be', 'Bad', 'Verse 1', 'H', 'Am I']) expect(isChord(c), c).to.be.false
})

it('transposeChord', () => {
  expect(transposeChord('C', 2)).to.eq('D')
  expect(transposeChord('Am7', 3)).to.eq('Cm7')
  expect(transposeChord('G/B', 1, true)).to.eq('Ab/C')
  expect(transposeChord('Bb', 2)).to.eq('C')
  expect(transposeChord('B', -1)).to.eq('A#')
  expect(transposeChord('Verse', 2)).to.eq('Verse')
})

it('keys', () => {
  expect(detectKey('Intro\n[Am]Hello [F]world')).to.eq('Am')
  expect(detectKey('[Cmaj7]Hello')).to.eq('C')
  expect(detectKey('no chords')).to.be.undefined
  expect(semitonesBetween('C', 'A')).to.eq(9)
  expect(semitonesBetween('Am', 'Em')).to.eq(7)
  expect(usesFlats('F')).to.be.true
  expect(usesFlats('Bbm')).to.be.true
  expect(usesFlats('G')).to.be.false
})

it('parseSheet', () => {
  const {lines, chords} = parseSheet('{title: Song}\n{c: Chorus}\n[C]Let it [G]be\n[Verse]\n\n[Am] [F]', 2)
  expect(chords).to.deep.eq(['D', 'A', 'Bm', 'G'])
  expect(lines).to.deep.eq([
    [{text: '', label: 'Chorus'}],
    [{chord: 'D', text: 'Let it ', index: 0}, {chord: 'A', text: 'be', index: 1}],
    [{text: '', label: 'Verse'}],
    [],
    [{chord: 'Bm', text: ' ', index: 2}, {chord: 'G', text: '', index: 3}]
  ])
})

it('toChordPro converts chords over lyrics', () => {
  expect(toChordPro('[Verse 1]\nC         G\nWhen I find myself\nAm  F\n\nLyrics only')).to.eq(
    '{c: Verse 1}\n[C]When I fin[G]d myself\n[Am] [F]\n\nLyrics only')
  expect(toChordPro('C  G\nHi')).to.eq('[C]Hi [G]')
  expect(toChordPro('[C]Already [G]inline')).to.eq('[C]Already [G]inline')
})

it('progressions', () => {
  expect(numeralToChord('vi', 'G')).to.eq('Em')
  expect(numeralToChord('bVII', 'C')).to.eq('Bb')
  expect(numeralToChord('ii7', 'C')).to.eq('Dm7')
  expect(numeralToChord('i', 'Am')).to.eq('Am')
  expect(progressionSheet(progressions.pop, 'C')).to.eq('[C] [G] [Am] [F]')
  expect(progressionSheet(progressions.andalusian, 'Am')).to.eq('[Am] [G] [F] [E]')
  expect(progressionSheet(progressions.canon, 'D')).to.eq('[D] [A] [Bm] [F#m]\n[G] [D] [G] [A]')
})

it('custom progressions of chords or numerals', () => {
  expect(isValidProgression('C G Am F')).to.be.true
  expect(isValidProgression('I–V–vi–IV')).to.be.true
  expect(isValidProgression('ii7, V7 | Imaj7')).to.be.true
  expect(isValidProgression('C X')).to.be.false
  expect(isValidProgression('IIII')).to.be.false
  expect(isValidProgression(' ')).to.be.false
  expect(progressionSheet('I - V7, bVII', 'G')).to.eq('[G] [D7] [F]')
  expect(progressionSong('Mine', 'Am F C G', 'D')).to.deep.eq({title: 'Mine', sheet: '[Am] [F] [C] [G]', key: undefined})
  expect(progressionSong('Mine', 'i iv v', 'E')).to.deep.eq({title: 'Mine', sheet: '[Em] [Am] [Bm]', key: 'Em'})
})

it('isMinorProgression', () => {
  expect(isMinorProgression(progressions.andalusian)).to.be.true
  expect(isMinorProgression(progressions.jazz)).to.be.false
  expect(isMinorProgression('iv I')).to.be.false
})

it('parseChord', () => {
  expect(parseChord('C')).to.deep.eq({root: 0, bass: 0, intervals: [0, 4, 7]})
  expect(parseChord('F#m7')).to.deep.eq({root: 6, bass: 6, intervals: [0, 3, 7, 10]})
  expect(parseChord('D/F#')).to.deep.eq({root: 2, bass: 6, intervals: [0, 4, 7]})
  expect(parseChord('E7(#9)')!.intervals).to.deep.eq([0, 4, 7, 10, 15])
  expect(parseChord('Am7add11')!.intervals).to.deep.eq([0, 3, 7])
  expect(parseChord('Verse')).to.be.undefined
})

it('pianoNotes', () => {
  expect(pianoNotes('C')).to.deep.eq([48, 52, 55])
  expect(pianoNotes('Am7')).to.deep.eq([57, 60, 64, 67])
  expect(pianoNotes('D/F#')).to.deep.eq([42, 50, 54, 57])
})
