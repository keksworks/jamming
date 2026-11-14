import {render} from '@testing-library/svelte'
import NowPlaying from './NowPlaying.svelte'
import {jam} from 'src/api/testData'

it('shows song transposed to jam key', () => {
  const {container} = render(NowPlaying, {jam: {...jam, key: 'D'}})
  expect(container.textContent).to.contain('Let It Be')
  const chords = [...container.querySelectorAll('.font-mono b')].map(b => b.textContent)
  expect(chords).to.deep.eq(['D', 'A'])
})

it('asks to pick a song if nothing playing', () => {
  const {container} = render(NowPlaying, {jam: {...jam, song: undefined}})
  expect(container.textContent).to.contain('Pick a song')
})
