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

let pianoOutput: AudioNode|undefined

/** Compressor lets chords be loud without clipping */
function pianoBus() {
  const audio = audioContext()
  if (!pianoOutput) {
    const compressor = audio.createDynamicsCompressor()
    compressor.threshold.value = -20
    compressor.ratio.value = 4
    const makeup = audio.createGain()
    makeup.gain.value = 2
    compressor.connect(makeup).connect(audio.destination)
    pianoOutput = compressor
  }
  return pianoOutput
}

/**
 * Piano-like tone, synthesized from what makes piano sound like a piano:
 * slightly sharp (inharmonic) overtones of stiff strings, quick drop after the hammer strike followed by a long tail,
 * higher overtones fading faster, two slightly detuned strings per note and a soft hammer thump.
 */
export function playPiano(frequencies: number[]) {
  const audio = audioContext()
  const now = audio.currentTime
  const output = pianoBus()
  const volume = 0.5 / Math.sqrt(frequencies.length)

  function partial(frequency: number, amplitude: number, sustain: number, detune = 0) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.frequency.value = frequency
    osc.detune.value = detune
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(amplitude, now + 0.003)
    gain.gain.setTargetAtTime(amplitude * 0.35, now + 0.003, 0.08)
    gain.gain.setTargetAtTime(0, now + 0.2, sustain / 4)
    osc.connect(gain).connect(output)
    osc.start(now)
    osc.stop(now + sustain)
  }

  for (const frequency of frequencies) {
    const sustain = 3 * Math.min(1.5, Math.sqrt(220 / frequency))
    for (let n = 1; n <= 8 && n * frequency < 10000; n++) {
      const overtone = n * frequency * Math.sqrt(1 + 0.0004 * n * n)
      const amplitude = volume / n ** 1.3
      if (n == 1) [-1, 1].forEach(detune => partial(overtone, amplitude / 2, sustain, detune))
      else partial(overtone, amplitude, sustain / n ** 0.6)
    }
    hammer(frequency, volume * 0.3, output)
  }
}

function hammer(frequency: number, volume: number, output: AudioNode) {
  const audio = audioContext()
  const noise = audio.createBuffer(1, audio.sampleRate * 0.03, audio.sampleRate)
  noise.getChannelData(0).forEach((_, i, data) => data[i] = Math.random() * 2 - 1)
  const source = audio.createBufferSource()
  const filter = audio.createBiquadFilter()
  const gain = audio.createGain()
  source.buffer = noise
  filter.type = 'lowpass'
  filter.frequency.value = Math.min(4000, frequency * 6)
  gain.gain.setValueAtTime(volume, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.03)
  source.connect(filter).connect(gain).connect(output)
  source.start()
}
