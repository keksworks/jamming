import {fireEvent, render} from '@testing-library/svelte'
import SongPicker from './SongPicker.svelte'

it('picks a progression', async () => {
  const onpick = vi.fn()
  const {container, getAllByText} = render(SongPicker, {actionLabel: 'Pick', onpick})
  expect(container.textContent).to.contain('C G Am F')
  await fireEvent.click(getAllByText('Pick')[0])
  expect(onpick).toHaveBeenCalledWith({title: 'Pop', sheet: '[C] [G] [Am] [F]', key: 'C'})

  await fireEvent.change(container.querySelector('select')!, {target: {value: 'G'}})
  expect(container.textContent).to.contain('G D Em C')
  await fireEvent.click(getAllByText('Pick')[0])
  expect(onpick).toHaveBeenLastCalledWith({title: 'Pop', sheet: '[G] [D] [Em] [C]', key: 'G'})
})

it('links to chord sites for the searched song', async () => {
  const {container, getByText} = render(SongPicker, {actionLabel: 'Pick', onpick: vi.fn()})
  await fireEvent.click(getByText('Song'))
  await fireEvent.input(container.querySelector('input[type=search]')!, {target: {value: 'let it be'}})
  const links = [...container.querySelectorAll('a')].map(a => a.href)
  expect(links[0]).to.eq('https://www.ultimate-guitar.com/search.php?search_type=title&value=let%20it%20be')
})
