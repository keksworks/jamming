import {fireEvent, render} from '@testing-library/svelte'
import JamHeader from './JamHeader.svelte'
import {jam} from 'src/api/testData'

it('shows code and distinct members', () => {
  const {container} = render(JamHeader, {jam})
  expect(container.textContent).to.contain('BCDF')
  expect(container.textContent).to.contain('2 jamming')
})

it('shows QR code for joining in invite dialog', async () => {
  const {getByText} = render(JamHeader, {jam})
  await fireEvent.click(getByText('Invite'))
  expect(document.querySelector('.qr svg')).to.exist
})
