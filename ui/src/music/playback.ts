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

function audioContext() {
  return audio ??= new AudioContext()
}

/** Browsers allow sound only after user interaction, e.g. click or tap */
export function unlockAudio() {
  return audioContext().resume()
}

export function click(accent: boolean) {
  const audio = audioContext()
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.frequency.value = accent ? 1500 : 1000
  gain.gain.setValueAtTime(0.5, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05)
  osc.connect(gain).connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + 0.05)
}

/** Plucked string sound using Karplus-Strong synthesis: noise burst fed through a decaying delay line */
export function pluck(frequency: number, volume = 0.3) {
  const audio = audioContext()
  if (audio.state != 'running') return
  const data = new Float32Array(Math.floor(audio.sampleRate * 1.5))
  const period = Math.round(audio.sampleRate / frequency)
  for (let i = 0; i < data.length; i++)
    data[i] = i < period ? Math.random() * 2 - 1 : (data[i - period] + data[i - period + 1]) / 2 * 0.996
  const buffer = audio.createBuffer(1, data.length, audio.sampleRate)
  buffer.copyToChannel(data, 0)
  const source = audio.createBufferSource()
  const gain = audio.createGain()
  source.buffer = buffer
  gain.gain.value = volume
  source.connect(gain).connect(audio.destination)
  source.start()
}

/** Guitar strum: plucks strings one after another, from low to high */
export function strum(frequencies: (number|undefined)[], delayMs = 30) {
  frequencies.filter(f => f).forEach((f, i) => setTimeout(() => pluck(f!), i * delayMs))
}

/** Simple piano-like tone: soft triangle wave with quick attack and long decay */
export function playPiano(frequencies: number[]) {
  const audio = audioContext()
  for (const frequency of frequencies) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'triangle'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0, audio.currentTime)
    gain.gain.linearRampToValueAtTime(0.2, audio.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1.5)
    osc.connect(gain).connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + 1.5)
  }
}
