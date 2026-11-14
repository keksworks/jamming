import {render} from '@testing-library/svelte'
import PlaybackControls from './PlaybackControls.svelte'
import {jam} from 'src/api/testData'

it('shows tempo and beat', () => {
  const {container} = render(PlaybackControls, {playback: jam.playback, beat: 1})
  expect(container.textContent).to.contain('90 BPM')
  expect(container.textContent).to.contain('Play')
  expect(container.querySelectorAll('.bg-primary-600.rounded-sm').length).to.eq(1)
})
