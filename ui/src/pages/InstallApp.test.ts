import {fireEvent, render} from '@testing-library/svelte'
import InstallApp from './InstallApp.svelte'
import {installPrompt, type InstallPromptEvent} from 'src/stores/install'

function userAgent(value: string) {
  Object.defineProperty(navigator, 'userAgent', {value, configurable: true})
}

afterEach(() => installPrompt.set(undefined))

it('is not shown on desktop', () => {
  userAgent('Mozilla/5.0 (X11; Linux x86_64)')
  expect(render(InstallApp).container.querySelector('.install')).not.to.exist
})

it('explains Add to Home Screen on iOS', () => {
  userAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X)')
  const {container} = render(InstallApp)
  expect(container.textContent).to.contain('Add to Home Screen')
  expect(container.querySelector('.share-ios')).to.exist
})

it('offers install button on Android when browser allows', async () => {
  userAgent('Mozilla/5.0 (Linux; Android 16)')
  const prompt = {prompt: vi.fn(), userChoice: Promise.resolve({outcome: 'accepted'})} as unknown as InstallPromptEvent
  installPrompt.set(prompt)
  const {getByText, container} = render(InstallApp)
  await fireEvent.click(getByText('Add to home screen'))
  expect(prompt.prompt).toHaveBeenCalled()
  await vi.waitFor(() => expect(container.querySelector('button')).not.to.exist)
  expect(container.textContent).to.contain('Install app')
})
