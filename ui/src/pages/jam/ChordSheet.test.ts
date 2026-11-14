import {render} from '@testing-library/svelte'
import ChordSheet from './ChordSheet.svelte'
import {parseSheet} from 'src/music/chords'

it('renders chords above lyrics and highlights current', () => {
  const {container} = render(ChordSheet, {lines: parseSheet('{c: Chorus}\n[C]Let it [G]be').lines, current: 1})
  expect(container.textContent).to.contain('Chorus')
  expect(container.textContent).to.contain('Let it')
  expect(container.querySelector('.current')!.textContent).to.eq('G')
})

it('keeps text row for chords without text, so that all chords are aligned', () => {
  const {container} = render(ChordSheet, {lines: parseSheet('[C] [F]').lines})
  const texts = [...container.querySelectorAll('b + span')].map(s => s.textContent)
  expect(texts).to.deep.eq([' ', ' '])
})
