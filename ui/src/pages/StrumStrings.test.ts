import {render} from '@testing-library/svelte'
import StrumStrings from './StrumStrings.svelte'

it('renders strings canvas', () => {
  const {container} = render(StrumStrings)
  expect(container.querySelector('canvas')).to.exist
})
