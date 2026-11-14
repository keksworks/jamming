import {render} from '@testing-library/svelte'
import Suggestions from './Suggestions.svelte'
import {jam} from 'src/api/testData'

it('lists suggestions sorted by votes', () => {
  const {container} = render(Suggestions, {jam})
  const items = container.querySelectorAll('li')
  expect(items[0].textContent).to.contain('Hey Jude')
  expect(items[1].textContent).to.contain('in D')
})
