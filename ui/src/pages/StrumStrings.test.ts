import {render} from '@testing-library/svelte'
import StrumStrings from './StrumStrings.svelte'

it('renders strings canvas with hint', () => {
  const {container} = render(StrumStrings)
  expect(container.querySelector('canvas')).to.exist
  expect(container.textContent).to.contain('strum')
})
