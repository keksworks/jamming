import {render} from '@testing-library/svelte'
import JamPage from './JamPage.svelte'

it('asks for name before joining', () => {
  const {container} = render(JamPage, {code: 'BCDF'})
  expect(container.querySelector('input')).to.exist
  expect(container.textContent).to.contain('Join')
})
