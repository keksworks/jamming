import {crossedStrings, frequencies, guitarVoicing} from './strings'

it('frequencies of fingering', () => {
  const freqs = frequencies(guitarVoicing('Am')!).map(f => f && Math.round(f))
  expect(freqs).to.deep.eq([undefined, 110, 165, 220, 262, 330])
})

it('crossedStrings in order of movement', () => {
  const positions = [10, 20, 30, 40]
  expect(crossedStrings(5, 25, positions)).to.deep.eq([0, 1])
  expect(crossedStrings(35, 15, positions)).to.deep.eq([2, 1])
  expect(crossedStrings(21, 29, positions)).to.deep.eq([])
})

it('guitarVoicing finds standard shapes', () => {
  const x = undefined
  const shapes = {
    C: [x, 3, 2, 0, 1, 0], G: [3, 2, 0, 0, 0, 3], D: [x, x, 0, 2, 3, 2], A: [x, 0, 2, 2, 2, 0], E: [0, 2, 2, 1, 0, 0],
    Am: [x, 0, 2, 2, 1, 0], Em: [0, 2, 2, 0, 0, 0], Dm: [x, x, 0, 2, 3, 1], F: [1, 3, 3, 2, 1, 1],
    C7: [x, 3, 2, 3, 1, 0], E7: [0, 2, 0, 1, 0, 0], A7: [x, 0, 2, 0, 2, 0], D7: [x, x, 0, 2, 1, 2], G7: [3, 2, 0, 0, 0, 1], B7: [x, 2, 1, 2, 0, 2],
    Bm: [x, 2, 4, 4, 3, 2], Bb: [x, 1, 3, 3, 3, 1], Cmaj7: [x, 3, 2, 0, 0, 0], Am7: [x, 0, 2, 0, 1, 0], Dsus4: [x, x, 0, 2, 3, 3],
    'D/F#': [2, 0, 0, 2, 3, 2]
  }
  const found = Object.fromEntries(Object.keys(shapes).map(c => [c, guitarVoicing(c)]))
  expect(found).to.deep.eq(shapes)
})
