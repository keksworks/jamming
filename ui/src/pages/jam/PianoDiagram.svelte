<script lang="ts">
  import {t} from 'i18n'
  import Button from 'src/components/Button.svelte'
  import {midiFrequency, pianoNotes} from 'src/music/chords'
  import {playPiano, unlockAudio} from 'src/music/playback'

  export let chord: string

  const whiteWidth = 14, whiteHeight = 70, blackWidth = 9, blackHeight = 42
  const whitePitches = [0, 2, 4, 5, 7, 9, 11]
  /** Black keys with index of the white key on their left */
  const blackPitches = {1: 0, 3: 1, 6: 3, 8: 4, 10: 5}

  $: notes = pianoNotes(chord)
  $: start = Math.floor(Math.min(...notes) / 12) * 12
  $: octaves = Math.max(2, Math.ceil((Math.max(...notes) + 1 - start) / 12))
  $: octaveStarts = Array.from({length: octaves}, (_, o) => start + o * 12)
  /** White keys first, so that black keys are drawn on top of them */
  $: keys = [
    ...octaveStarts.flatMap((octave, o) => whitePitches.map((pitch, w) =>
      ({note: octave + pitch, x: (o * 7 + w) * whiteWidth, width: whiteWidth, height: whiteHeight, black: false}))),
    ...octaveStarts.flatMap((octave, o) => Object.entries(blackPitches).map(([pitch, w]) =>
      ({note: octave + +pitch, x: (o * 7 + w + 1) * whiteWidth - blackWidth / 2, width: blackWidth, height: blackHeight, black: true})))
  ]

  function keyClass(key: {note: number, black: boolean}) {
    const inChord = notes.includes(key.note)
    return key.black ? (inChord ? 'pressed fill-primary-700' : 'fill-gray-950 dark:fill-black') :
      'stroke-gray-400 ' + (inChord ? 'pressed fill-primary-500' : 'fill-white')
  }

  async function play(notes: number[]) {
    await unlockAudio()
    playPiano(notes.map(midiFrequency))
  }
</script>

{#if notes.length}
  <div class="flex-1 flex items-end w-full">
  <svg viewBox="0 0 {octaves * 7 * whiteWidth} {whiteHeight}" class="w-full max-w-72 mx-auto select-none" role="group" aria-label={chord}>
    {#each keys as key (key.note)}
      <rect x={key.x} y="0" width={key.width} height={key.height} rx="1.5" role="button" tabindex="0"
            class="key cursor-pointer outline-none active:opacity-60 focus-visible:opacity-75 {keyClass(key)}"
            onclick={() => play([key.note])} onkeydown={(e: KeyboardEvent) => (e.key == 'Enter' || e.key == ' ') && play([key.note])}/>
    {/each}
  </svg>
  </div>
  <Button icon="player-play" label={t.jam.playChord} size="sm" class="outlined" onclick={() => play(notes)}/>
{/if}
