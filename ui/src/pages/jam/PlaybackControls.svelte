<script lang="ts">
  import {t} from 'i18n'
  import type {Playback} from 'src/api/types'
  import Button from 'src/components/Button.svelte'
  import SelectField from 'src/forms/SelectField.svelte'
  import {changeTempo, click, type Instrument, playChord, start, unlockAudio} from 'src/music/playback'
  import {changePlayback, serverNow} from 'src/stores/jam'

  export let playback: Playback
  export let beat: number|undefined = undefined
  /** Beats since start, changes on every beat */
  export let total: number|undefined = undefined
  /** Current chord, not set during count-in */
  export let chord: string|undefined = undefined

  /** Sounds are local to this device, so that not every phone in the room is playing them */
  let metronome = false
  let chordSound: Instrument|'none' = 'none'

  $: onBeat(total)

  function onBeat(total: number|undefined) {
    if (total === undefined) return
    if (metronome) click(beat == 0)
    if (beat == 0 && chord && chordSound != 'none') playChord(chord, chordSound)
  }

  function toggleMetronome() {
    metronome = !metronome
    if (metronome) unlockAudio()
  }

  function togglePlay() {
    changePlayback(playback.startedAt ? {...playback, startedAt: undefined} : start(playback, serverNow()))
  }

  function tempo(delta: number) {
    changePlayback(changeTempo(playback, Math.max(30, playback.bpm + delta), serverNow()))
  }
</script>

<div class="flex flex-wrap items-center gap-x-6 gap-y-3">
  <div class="flex flex-wrap items-center gap-3">
  <Button icon={playback.startedAt ? 'player-stop' : 'player-play'} label={playback.startedAt ? t.jam.stop : t.jam.play} size="lg" onclick={togglePlay}/>

  <span class="flex items-center gap-1">
    <Button icon="minus" class="outlined" onclick={() => tempo(-5)}/>
    <span class="w-16 text-center"><b>{playback.bpm}</b> {t.jam.bpm}</span>
    <Button icon="plus" class="outlined" onclick={() => tempo(5)}/>
  </span>

  <SelectField value={playback.beatsPerChord} options={{2: '2', 3: '3', 4: '4', 6: '6', 8: '8'}} title={t.jam.beatsPerChord}
               onchange={(e: Event) => changePlayback({...playback, beatsPerChord: +(e.target as HTMLSelectElement).value})}/>

  </div>

  <div class="flex items-center gap-2 sm:ml-auto">
    <Button icon="metronome" title={t.jam.metronome} class="{metronome ? 'default' : 'outlined'} text-lg" aria-pressed={metronome} onclick={toggleMetronome}/>
    <SelectField bind:value={chordSound} options={t.jam.chordSound.options} title={t.jam.chordSound.title} onchange={() => chordSound != 'none' && unlockAudio()}/>
  </div>
</div>
