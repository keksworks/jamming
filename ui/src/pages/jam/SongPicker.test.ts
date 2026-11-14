import {fireEvent, render} from '@testing-library/svelte'
import SongPicker from './SongPicker.svelte'

it('picks a progression', async () => {
  const onpick = vi.fn()
  const {container, getAllByText} = render(SongPicker, {actionLabel: 'Pick', onpick})
  expect(container.textContent).to.contain('C G Am F')
  await fireEvent.click(getAllByText('Pick')[0])
  expect(onpick).toHaveBeenCalledWith({title: 'Pop', sheet: '[C] [G] [Am] [F]', key: 'C'})
})
