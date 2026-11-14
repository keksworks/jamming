import {
  detectKey,
  isChord,
  numeralToChord,
  parseSheet,
  progressions,
  progressionSheet,
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
