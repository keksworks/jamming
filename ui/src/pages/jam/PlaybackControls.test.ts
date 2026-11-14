import {fireEvent, render} from '@testing-library/svelte'
import {playChord, unlockAudio} from 'src/music/playback'
import PlaybackControls from './PlaybackControls.svelte'
import {jam} from 'src/api/testData'

vi.mock('src/music/playback', async original => ({...await original(), unlockAudio: vi.fn(), click: vi.fn(), playChord: vi.fn()}))

it('shows tempo', () => {
  const {container} = render(PlaybackControls, {playback: jam.playback})
  expect(container.textContent).to.contain('90 BPM')
  expect(container.textContent).to.contain('Play')
})

it('turning metronome on unlocks audio', async () => {
  const {getByTitle} = render(PlaybackControls, {playback: jam.playback})
  const button = getByTitle('Metronome')
  expect(button.getAttribute('aria-pressed')).to.eq('false')
  await fireEvent.click(button)
  expect(unlockAudio).toHaveBeenCalled()
  expect(button.getAttribute('aria-pressed')).to.eq('true')
})

it('plays chords along on the first beat of each chord, with chosen instrument', async () => {
  const {getByTitle, rerender} = render(PlaybackControls, {playback: jam.playback, beat: 3, total: 3, chord: 'G'})
  await fireEvent.change(getByTitle('Play chords along'), {target: {value: 'piano'}})
  await rerender({beat: 0, total: 4, chord: 'Am'})
  expect(playChord).toHaveBeenCalledExactlyOnceWith('Am', 'piano')
  await rerender({beat: 1, total: 5, chord: 'Am'})
  expect(playChord).toHaveBeenCalledOnce()
})
