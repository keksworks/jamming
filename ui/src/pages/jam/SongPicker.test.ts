import {fireEvent, render} from '@testing-library/svelte'
import SongPicker from './SongPicker.svelte'
import api from 'src/api/api'
import {song} from 'src/api/testData'

const lyrics = {...song, id: 'l1', title: 'Lyrics', sheet: 'Just words', key: undefined}

afterEach(() => vi.restoreAllMocks())

async function searchAndUse(title: string) {
  vi.spyOn(api, 'get').mockResolvedValue([song, {...lyrics}])
  const onpick = vi.fn()
  const {container, getByText, findByText} = render(SongPicker, {actionLabel: 'Pick', onpick, tab: 'songs'})
  await fireEvent.input(container.querySelector('input[type=search]')!, {target: {value: 'let it be'}})
  await fireEvent.submit(container.querySelector('form')!)
  expect(api.get).toHaveBeenCalledWith('songs?q=let%20it%20be')
  await findByText('lyrics only')
  expect(container.querySelector('.badge')!.textContent).to.eq('chords')
  await fireEvent.click(getByText(title))
  return onpick
}

it('picks a progression', async () => {
  const onpick = vi.fn()
  const {container, getAllByText} = render(SongPicker, {actionLabel: 'Pick', onpick})
  expect(container.textContent).to.contain('C G Am F')
  await fireEvent.click(getAllByText('Pick')[1])
  expect(onpick).toHaveBeenCalledWith({title: 'Pop', sheet: '[C] [G] [Am] [F]', key: 'C'})

  await fireEvent.change(container.querySelector('select')!, {target: {value: 'G'}})
  expect(container.textContent).to.contain('G D Em C')
  await fireEvent.click(getAllByText('Pick')[1])
  expect(onpick).toHaveBeenLastCalledWith({title: 'Pop', sheet: '[G] [D] [Em] [C]', key: 'G'})
})

it('picks own progression', async () => {
  const onpick = vi.fn()
  const {container, getAllByText} = render(SongPicker, {actionLabel: 'Pick', onpick})
  await fireEvent.input(container.querySelector('input')!, {target: {value: 'I V vi IV'}})
  expect(container.textContent).to.contain('C G Am F')
  await fireEvent.click(getAllByText('Pick')[0])
  expect(onpick).toHaveBeenCalledWith({title: 'I V vi IV', sheet: '[C] [G] [Am] [F]', key: 'C'})
})

it('links to chord sites for the searched song', async () => {
  const {container, getByText} = render(SongPicker, {actionLabel: 'Pick', onpick: vi.fn()})
  await fireEvent.click(getByText('Songs'))
  expect(document.activeElement).to.eq(container.querySelector('input[type=search]'))
  await fireEvent.input(container.querySelector('input[type=search]')!, {target: {value: 'let it be'}})
  await fireEvent.click(getByText('Manual entry'))
  const links = [...container.querySelectorAll('a')].map(a => a.href)
  expect(links[0]).to.eq('https://www.ultimate-guitar.com/search.php?search_type=title&value=let%20it%20be')
})

it('saves confirmed song with chords to own DB', async () => {
  const saved = {...song, id: 'saved'}
  vi.spyOn(api, 'post').mockResolvedValue(saved)
  const onpick = await searchAndUse('Let It Be')
  expect(api.post).toHaveBeenCalledWith('songs', song)
  await vi.waitFor(() => expect(onpick).toHaveBeenCalledWith(saved))
})

it('does not save lyrics without chords', async () => {
  vi.spyOn(api, 'post')
  const onpick = await searchAndUse('Lyrics')
  expect(api.post).not.toHaveBeenCalled()
  await vi.waitFor(() => expect(onpick).toHaveBeenCalledWith(lyrics))
})

it('loads chords from Ultimate Guitar when picked, converted to inline chords', async () => {
  const found = {...song, id: 'ug1', title: 'From UG', sheet: '', url: 'https://tabs.ultimate-guitar.com/tab/1'}
  const get = vi.spyOn(api, 'get').mockImplementation(async (path: string) =>
    path.startsWith('songs?') ? [found] : {...found, sheet: 'C    G\nWhen I find'})
  vi.spyOn(api, 'post').mockImplementation(async (_, song) => song)
  const onpick = vi.fn()
  const {container, getByText, findByText} = render(SongPicker, {actionLabel: 'Pick', onpick, tab: 'songs'})
  await fireEvent.input(container.querySelector('input[type=search]')!, {target: {value: 'let it be'}})
  await fireEvent.submit(container.querySelector('form')!)
  expect((await findByText('ultimate-guitar.com')).textContent).to.eq('ultimate-guitar.com')
  await fireEvent.click(getByText('From UG'))
  expect(get).toHaveBeenLastCalledWith('songs/ultimate-guitar?url=' + encodeURIComponent(found.url))
  await vi.waitFor(() => expect(onpick).toHaveBeenCalledWith({...found, sheet: '[C]When [G]I find'}))
})

it('suggests own songs after typing stops, without searching other sources', async () => {
  const get = vi.spyOn(api, 'get').mockResolvedValue([song])
  const {container, findByText} = render(SongPicker, {actionLabel: 'Pick', onpick: vi.fn(), tab: 'songs'})
  await fireEvent.input(container.querySelector('input[type=search]')!, {target: {value: 'let'}})
  expect(get).not.toHaveBeenCalled()
  await findByText(song.title)
  expect(get).toHaveBeenCalledExactlyOnceWith('songs/suggestions?q=let')
})
