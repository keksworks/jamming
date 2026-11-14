import {crossedStrings, frequencies, guitarChords} from './strings'

it('frequencies of chord shape', () => {
  const freqs = frequencies(guitarChords.Am).map(f => f && Math.round(f))
  expect(freqs).to.deep.eq([undefined, 110, 165, 220, 262, 330])
})

it('crossedStrings in order of movement', () => {
  const positions = [10, 20, 30, 40]
  expect(crossedStrings(5, 25, positions)).to.deep.eq([0, 1])
  expect(crossedStrings(35, 15, positions)).to.deep.eq([2, 1])
  expect(crossedStrings(21, 29, positions)).to.deep.eq([])
})
