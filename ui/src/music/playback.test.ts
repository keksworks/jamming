import {changeTempo, position, start} from './playback'
import type {Playback} from 'src/api/types'

const now = Date.parse('2026-01-01T00:00:00Z')
const playback = {bpm: 120, beatsPerChord: 4, startedAt: new Date(now).toISOString()} as Playback

it('position', () => {
  expect(position({...playback, startedAt: undefined}, now, 4)).to.be.undefined
  expect(position(playback, now - 1000, 4)).to.deep.eq({index: 0, beat: -2})
  expect(position(playback, now, 4)).to.deep.eq({index: 0, beat: 0})
  expect(position(playback, now + 2500, 4)).to.deep.eq({index: 1, beat: 1})
  expect(position(playback, now + 8000, 4)).to.deep.eq({index: 0, beat: 0})
})

it('start with count-in of one chord', () => {
  expect(start(playback, now).startedAt).to.eq('2026-01-01T00:00:02.000Z')
})

it('changeTempo keeps position', () => {
  const changed = changeTempo(playback, 60, now + 3000)
  expect(changed.bpm).to.eq(60)
  expect(position(changed, now + 3000, 4)).to.deep.eq(position(playback, now + 3000, 4))
})
