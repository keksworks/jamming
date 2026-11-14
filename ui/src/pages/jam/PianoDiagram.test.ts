import {render} from '@testing-library/svelte'
import PianoDiagram from './PianoDiagram.svelte'

it('highlights chord keys', () => {
  const {container} = render(PianoDiagram, {chord: 'D/F#'})
  expect(container.querySelectorAll('.pressed').length).to.eq(4)
  expect(container.querySelectorAll('rect').length).to.eq(2 * 12)
})
