import {sharedSong} from './sharedSong'

it('parses chord site title and strips link from text', () => {
  const params = new URLSearchParams({title: 'LET IT BE CHORDS by The Beatles @ Ultimate-Guitar.Com', text: 'C   G\nWhen I find\nhttps://tabs.ultimate-guitar.com/tab/123'})
  expect(sharedSong(params)).to.deep.eq({title: 'LET IT BE', artist: 'The Beatles', sheet: 'C   G\nWhen I find'})
})

it('works with plain title and link only', () => {
  expect(sharedSong(new URLSearchParams({title: 'Let It Be Chords | Chordie', url: 'https://chordie.com/x'}))).to.deep.eq({title: 'Let It Be', artist: undefined, sheet: ''})
})
