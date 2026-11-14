<script lang="ts">
  import {t} from 'i18n'
  import type {Playback} from 'src/api/types'
  import Button from 'src/components/Button.svelte'
  import SelectField from 'src/forms/SelectField.svelte'
  import {changeTempo, click, start} from 'src/music/playback'
  import {changePlayback, serverNow} from 'src/stores/jam'

  export let playback: Playback
  export let beat: number|undefined = undefined

  let metronome = false

  $: if (metronome && beat !== undefined) click(beat == 0)

  function togglePlay() {
    changePlayback(playback.startedAt ? {...playback, startedAt: undefined} : start(playback, serverNow()))
  }

  function tempo(delta: number) {
    changePlayback(changeTempo(playback, Math.max(30, playback.bpm + delta), serverNow()))
  }
</script>

<div class="flex flex-wrap items-center gap-3">
  <Button icon={playback.startedAt ? 'player-stop' : 'player-play'} label={playback.startedAt ? t.jam.stop : t.jam.play} size="lg" onclick={togglePlay}/>

  <span class="flex items-center gap-1">
    <Button icon="minus" class="outlined" onclick={() => tempo(-5)}/>
    <span class="w-16 text-center"><b>{playback.bpm}</b> {t.jam.bpm}</span>
    <Button icon="plus" class="outlined" onclick={() => tempo(5)}/>
  </span>

  <SelectField value={playback.beatsPerChord} options={{2: '2', 3: '3', 4: '4', 6: '6', 8: '8'}} title={t.jam.beatsPerChord}
               onchange={(e: Event) => changePlayback({...playback, beatsPerChord: +(e.target as HTMLSelectElement).value})}/>

  <Button icon={metronome ? 'volume' : 'volume-off'} class="outlined" title={t.jam.metronome} onclick={() => metronome = !metronome}/>

  {#if beat !== undefined}
    <span class="flex gap-1.5">
      {#each Array(playback.beatsPerChord) as _, i}
        <span class="w-3.5 h-3.5 rounded-full transition {beat < 0 ? 'bg-warning-400' : i == beat ? 'gradient scale-125 shadow-md shadow-accent-500/50' : 'bg-gray-200'}"></span>
      {/each}
    </span>
  {/if}
</div>
