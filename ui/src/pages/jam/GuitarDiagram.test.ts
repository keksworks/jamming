import {render} from '@testing-library/svelte'
import GuitarDiagram from './GuitarDiagram.svelte'

it('shows fingering with muted and open strings', () => {
  const {container} = render(GuitarDiagram, {chord: 'C'})
  expect(container.querySelectorAll('.dot').length).to.eq(3)
  expect(container.querySelectorAll('.mute').length).to.eq(1)
  expect(container.querySelectorAll('.open').length).to.eq(2)
  expect(container.textContent).to.contain('Strum')
})

it('shows fret position for higher chords', () => {
  const {container} = render(GuitarDiagram, {chord: 'B9'})
  expect(container.textContent).to.contain('4fr')
})
