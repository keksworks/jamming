<script lang="ts">
  import {t} from 'i18n'
  import Button from 'src/components/Button.svelte'
  import {midiFrequency, pianoNotes} from 'src/music/chords'
  import {playPiano, unlockAudio} from 'src/music/playback'

  export let chord: string

  const whiteWidth = 14, blackWidth = 9
  const whitePitches = [0, 2, 4, 5, 7, 9, 11]
  /** Black keys with index of the white key on their left */
  const blackPitches = {1: 0, 3: 1, 6: 3, 8: 4, 10: 5}

  $: notes = pianoNotes(chord)
  $: start = Math.floor(Math.min(...notes) / 12) * 12
  $: octaves = Math.max(2, Math.ceil((Math.max(...notes) + 1 - start) / 12))
  $: octaveStarts = Array.from({length: octaves}, (_, o) => start + o * 12)

  async function play(notes: number[]) {
    await unlockAudio()
    playPiano(notes.map(midiFrequency))
  }
</script>

{#if notes.length}
  <button type="button" title={t.jam.playChord} class="cursor-pointer select-none" onclick={() => play(notes)}>
  <svg viewBox="0 0 {octaves * 7 * whiteWidth} 60" class="w-56 max-w-full" role="img" aria-label={chord}>
    {#each octaveStarts as octave, o}
      {#each whitePitches as pitch, w}
        <rect x={(o * 7 + w) * whiteWidth} y="0" width={whiteWidth} height="60" rx="1.5"
              class="stroke-gray-400 {notes.includes(octave + pitch) ? 'pressed fill-primary-500' : 'fill-white'}"/>
      {/each}
    {/each}
    {#each octaveStarts as octave, o}
      {#each Object.entries(blackPitches) as [pitch, w]}
        <rect x={(o * 7 + w + 1) * whiteWidth - blackWidth / 2} y="0" width={blackWidth} height="36" rx="1.5"
              class="{notes.includes(octave + +pitch) ? 'pressed fill-primary-700' : 'fill-gray-950 dark:fill-black'}"/>
      {/each}
    {/each}
  </svg>
  </button>
  <Button icon="player-play" label={t.jam.playChord} size="sm" class="outlined" onclick={() => play(notes)}/>
{/if}
