import {render} from '@testing-library/svelte'
import HomePage from './HomePage.svelte'

it('renders start and join forms', () => {
  const {container} = render(HomePage)
  expect(container.querySelectorAll('form').length).to.eq(2)
  expect(container.textContent).to.contain('Start a jam')
})

it('links to source code on GitHub', () => {
  const {container} = render(HomePage)
  expect(container.textContent).to.contain('open-source')
  expect(container.querySelector('a.github')!.getAttribute('href')).to.eq('https://github.com/keksworks/jamming')
})
