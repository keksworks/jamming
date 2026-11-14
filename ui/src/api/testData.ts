import type {Jam, Song} from 'src/api/types'

export const song = {title: 'Let It Be', artist: 'The Beatles', sheet: '[C]When I find myself in [G]times of trouble', key: 'C'} as Song

export const jam = {
  code: 'BCDF', song, playback: {bpm: 90, beatsPerChord: 4},
  members: [{id: 'm1', name: 'Jane'}, {id: 'm1', name: 'Jane'}, {id: 'm2', name: 'John'}],
  suggestions: [{id: 's1', by: 'Jane', song: {...song, title: 'Hey Jude'}, votes: ['m2']}, {id: 's2', by: 'John', key: 'D', votes: []}],
  updatedAt: '2026-01-01T00:00:00Z'
} as Jam
