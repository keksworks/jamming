import type {Playback} from 'src/api/types'

export function beatMs(playback: Playback) {
  return 60000 / playback.bpm
}

/** Current chord index and beat within it; beat is negative during count-in */
export function position(playback: Playback, now: number, chordCount: number) {
  if (!playback.startedAt || !chordCount) return
  const beats = Math.floor((now - Date.parse(playback.startedAt)) / beatMs(playback))
  if (beats < 0) return {index: 0, beat: beats}
  return {index: Math.floor(beats / playback.beatsPerChord) % chordCount, beat: beats % playback.beatsPerChord}
}

/** Starts after one chord of count-in */
export function start(playback: Playback, now: number): Playback {
  return {...playback, startedAt: new Date(now + playback.beatsPerChord * beatMs(playback)).toISOString() as any}
}

/** Changes tempo keeping the current position */
export function changeTempo(playback: Playback, bpm: number, now: number): Playback {
  const changed = {...playback, bpm}
  if (!playback.startedAt) return changed
  const elapsedBeats = (now - Date.parse(playback.startedAt)) / beatMs(playback)
  return {...changed, startedAt: new Date(now - elapsedBeats * beatMs(changed)).toISOString() as any}
}

let audio: AudioContext|undefined

export function click(accent: boolean) {
  audio ??= new AudioContext()
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.frequency.value = accent ? 1500 : 1000
  gain.gain.setValueAtTime(0.5, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05)
  osc.connect(gain).connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + 0.05)
}
