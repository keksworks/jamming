import {render} from '@testing-library/svelte'
import NowPlaying from './NowPlaying.svelte'
import {jam} from 'src/api/testData'

it('shows song transposed to jam key', () => {
  const {container} = render(NowPlaying, {jam: {...jam, key: 'D'}})
  expect(container.textContent).to.contain('Let It Be')
  const chords = [...container.querySelectorAll('.font-mono .chord')].map(b => b.textContent)
  expect(chords).to.deep.eq(['D', 'A'])
})

it('asks to pick a song if nothing playing', () => {
  const {container} = render(NowPlaying, {jam: {...jam, song: undefined}})
  expect(container.textContent).to.contain('Pick a song')
})

it('shows current chord with beats while playing', () => {
  const startedAt = new Date(Date.now() - 1500).toISOString() as any
  const {container} = render(NowPlaying, {jam: {...jam, playback: {bpm: 60, beatsPerChord: 4, startedAt}}})
  expect(container.textContent).to.contain('Next: G')
  expect(container.querySelectorAll('.beats > span').length).to.eq(4)
  expect(container.querySelector('.beats > .bg-primary-600')).to.eq(container.querySelectorAll('.beats > span')[1])
})

it('links to YouTube search for songs with artist', () => {
  const {container} = render(NowPlaying, {jam})
  const link = container.querySelector('a.youtube')!
  expect(link.getAttribute('href')).to.eq('https://www.youtube.com/results?search_query=Let%20It%20Be%20The%20Beatles')
  expect(link.getAttribute('target')).to.eq('_blank')
  expect(link.closest('h4')).to.exist
  expect(render(NowPlaying, {jam: {...jam, song: {...jam.song!, artist: undefined}}}).container.querySelector('a.youtube')).not.to.exist
})
