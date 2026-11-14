import {get, writable} from 'svelte/store'
import api from 'src/api/api'
import type {Id, Jam, Member, Playback, Song, Suggestion} from 'src/api/types'

export const jam = writable<Jam|undefined>()

export const me: Member = {
  id: localStorage['memberId'] ??= crypto.randomUUID(),
  name: localStorage['memberName'] ?? ''
}

export function setMyName(name: string) {
  me.name = localStorage['memberName'] = name
}

let clockOffset = 0

/** Server time, used for syncing the beat between devices */
export function serverNow() {
  return Date.now() + clockOffset
}

/** NTP-like: use the sample with the shortest round-trip */
export async function syncClock(samples = 5) {
  let bestRtt = Infinity
  for (let i = 0; i < samples; i++) {
    const sent = Date.now()
    const server = await (await fetch('/api/time')).json() as number
    const received = Date.now()
    if (received - sent < bestRtt) {
      bestRtt = received - sent
      clockOffset = server - (sent + received) / 2
    }
  }
}

function update(updated: Jam) {
  const current = get(jam)
  if (!current || Date.parse(updated.updatedAt) >= Date.parse(current.updatedAt)) jam.set(updated)
  return updated
}

export async function createJam() {
  return update(await api.post<Jam>('jams'))
}

/** Loads jam and listens for live updates, returns function to disconnect */
export async function connect(code: string) {
  jam.set(undefined)
  update(await api.get<Jam>('jams/' + code))
  const events = new EventSource(`/api/jams/${code}/events?memberId=${me.id}&name=${encodeURIComponent(me.name)}`)
  events.onmessage = e => update(JSON.parse(e.data))
  return () => events.close()
}

function jamPath(sub: string) {
  return `jams/${get(jam)!.code}/${sub}`
}

export async function playSong(song: Song) {
  return update(await api.put<Jam>(jamPath('song'), song))
}

export async function changeKey(key?: string) {
  return update(await api.put<Jam>(jamPath('key') + (key ? '?key=' + encodeURIComponent(key) : ''), {}))
}

export async function changePlayback(playback: Playback) {
  return update(await api.put<Jam>(jamPath('playback'), playback))
}

export async function suggest(suggestion: Partial<Suggestion>) {
  return update(await api.post<Jam>(jamPath('suggestions'), {...suggestion, by: me.name}))
}

export async function vote(id: Id<Suggestion>) {
  return update(await api.post<Jam>(jamPath(`suggestions/${id}/vote?memberId=${me.id}`)))
}

export async function accept(id: Id<Suggestion>) {
  return update(await api.post<Jam>(jamPath(`suggestions/${id}/accept`)))
}

export async function removeSuggestion(id: Id<Suggestion>) {
  return update(await api.delete<Jam>(jamPath(`suggestions/${id}`)))
}
