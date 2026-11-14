import {fireEvent, render} from '@testing-library/svelte'
import ChordSheet from './ChordSheet.svelte'
import {parseSheet} from 'src/music/chords'
import {playChord} from 'src/music/playback'

vi.mock('src/music/playback', () => ({playChord: vi.fn()}))

it('renders chords above lyrics and highlights current', () => {
  const {container} = render(ChordSheet, {lines: parseSheet('{c: Chorus}\n[C]Let it [G]be').lines, current: 1})
  expect(container.textContent).to.contain('Chorus')
  expect(container.textContent).to.contain('Let it')
  expect(container.querySelector('.current')!.textContent).to.eq('G')
})

it('keeps text row for chords without text, so that all chords are aligned', () => {
  const {container} = render(ChordSheet, {lines: parseSheet('[C] [F]').lines})
  const texts = [...container.querySelectorAll('.chord')].map(c => c.parentElement!.nextElementSibling!.textContent)
  expect(texts).to.deep.eq([' ', ' '])
})

it('shows chord diagrams on click, closes on second click or Escape', async () => {
  const {container} = render(ChordSheet, {lines: parseSheet('[Am]Hello [F]world').lines})
  const [am, f] = container.querySelectorAll('.chord')
  const popover = () => container.querySelector('.chord-popover h4')?.textContent
  await fireEvent.pointerEnter(am)
  expect(popover()).to.be.undefined

  await fireEvent.click(am)
  expect(popover()).to.eq('Am')
  await fireEvent.click(f)
  expect(popover()).to.eq('F')
  await fireEvent.click(f)
  expect(popover()).to.be.undefined

  await fireEvent.click(am)
  await fireEvent.keyUp(window, {key: 'Escape'})
  expect(popover()).to.be.undefined
})

it('plays chord with play button, without opening diagrams', async () => {
  const {container} = render(ChordSheet, {lines: parseSheet('[Am]Hello').lines})
  await fireEvent.click(container.querySelector('.chord-play')!)
  expect(playChord).toHaveBeenCalledWith('Am', 'guitar')
  expect(container.querySelector('.chord-popover')).not.to.exist
})
