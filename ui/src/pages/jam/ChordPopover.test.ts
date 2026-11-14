import {render} from '@testing-library/svelte'
import ChordPopover from './ChordPopover.svelte'

it('shows guitar and piano diagrams', () => {
  const {container} = render(ChordPopover, {chord: 'Am', onclose: vi.fn()})
  expect(container.querySelector('h4')!.textContent).to.eq('Am')
  expect(container.textContent).to.contain('Guitar')
  expect(container.textContent).to.contain('Piano')
  expect(container.querySelectorAll('svg[aria-label=Am]').length).to.eq(2)
})
