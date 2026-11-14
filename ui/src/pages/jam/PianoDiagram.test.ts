import {fireEvent, render} from '@testing-library/svelte'
import PianoDiagram from './PianoDiagram.svelte'
import {playPiano} from 'src/music/playback'
import {midiFrequency, pianoNotes} from 'src/music/chords'

vi.mock('src/music/playback', () => ({playPiano: vi.fn(), unlockAudio: vi.fn().mockResolvedValue(undefined)}))

it('highlights chord keys, plays single key or the whole chord', async () => {
  const {container, getByText} = render(PianoDiagram, {chord: 'D/F#'})
  const pressed = container.querySelectorAll('.pressed')
  expect(pressed.length).to.eq(4)
  expect(container.querySelectorAll('.key').length).to.eq(2 * 12)

  await fireEvent.click(pressed[0])
  await vi.waitFor(() => expect(playPiano).toHaveBeenCalledWith([midiFrequency(50)]))

  await fireEvent.click(getByText('Play'))
  await vi.waitFor(() => expect(playPiano).toHaveBeenLastCalledWith(pianoNotes('D/F#').map(midiFrequency)))
})
