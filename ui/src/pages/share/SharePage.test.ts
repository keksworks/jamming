import {render} from '@testing-library/svelte'
import {get} from 'svelte/store'
import SharePage from './SharePage.svelte'
import {pendingSong} from 'src/stores/jam'

it('keeps shared song and goes to last jam', () => {
  history.replaceState(null, '', '/share?title=Song&text=%5BC%5DHello')
  localStorage['lastJam'] = 'BCDF'
  render(SharePage)
  expect(get(pendingSong)).to.deep.eq({title: 'Song', artist: undefined, sheet: '[C]Hello'})
  expect(location.pathname).to.eq('/BCDF')
})
