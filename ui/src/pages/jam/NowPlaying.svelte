<script lang="ts">
  import {t} from 'i18n'
  import {onMount} from 'svelte'
  import type {Jam, Song} from 'src/api/types'
  import Button from 'src/components/Button.svelte'
  import Modal from 'src/components/Modal.svelte'
  import SelectField from 'src/forms/SelectField.svelte'
  import {detectKey, keyOptions, parseSheet, semitonesBetween, usesFlats} from 'src/music/chords'
  import {position} from 'src/music/playback'
  import {changeKey, playSong, serverNow} from 'src/stores/jam'
  import ChordSheet from './ChordSheet.svelte'
  import PlaybackControls from './PlaybackControls.svelte'
  import SongPicker from './SongPicker.svelte'

  export let jam: Jam

  let showPicker = false
  let now = serverNow()

  onMount(() => {
    let frame = 0
    function update() {
      now = serverNow()
      frame = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(frame)
  })

  $: songKey = jam.song?.key ?? detectKey(jam.song?.sheet ?? '')
  $: key = jam.key ?? songKey
  $: sheet = parseSheet(jam.song?.sheet ?? '', songKey && key ? semitonesBetween(songKey, key) : 0, usesFlats(key))
  $: pos = position(jam.playback, now, sheet.chords.length)
  $: index = pos?.index
  $: beat = pos?.beat
  $: countIn = !!pos && pos.beat < 0

  async function play(song: Song) {
    await playSong(song)
    showPicker = false
  }
</script>

<section class="spaced rounded-lg bg-gray-50 p-4">
  {#if jam.song}
    <div class="flex flex-wrap items-end gap-3">
      <div class="flex-1 min-w-40">
        <h4>{jam.song.title}</h4>
        {#if jam.song.artist}<p class="text-sm text-gray-600">{jam.song.artist}</p>{/if}
      </div>
      {#if key}
        <SelectField label={t.jam.key} bind:value={key} options={keyOptions(key.endsWith('m'))} onchange={() => changeKey(key)}/>
      {/if}
      <Button label={t.jam.changeSong} icon="music" class="outlined" onclick={() => showPicker = true}/>
    </div>

    <PlaybackControls playback={jam.playback} {beat}/>

    {#if pos}
      <div class="flex items-baseline gap-6">
        <span class="text-6xl font-bold text-primary-700">{countIn ? -pos.beat : sheet.chords[pos.index]}</span>
        {#if countIn}
          <span class="text-gray-500">{t.jam.getReady}</span>
        {:else}
          <span class="text-2xl text-gray-400">{t.jam.next}: {sheet.chords[(pos.index + 1) % sheet.chords.length]}</span>
        {/if}
      </div>
    {/if}

    <ChordSheet lines={sheet.lines} current={countIn ? undefined : index}/>
  {:else}
    <div class="text-center spaced py-6">
      <p class="text-gray-600">{t.jam.nothingPlaying}</p>
      <Button label={t.jam.pickSong} icon="music" size="lg" onclick={() => showPicker = true}/>
    </div>
  {/if}
</section>

<Modal bind:show={showPicker} title={t.jam.pickSong} wide>
  <SongPicker actionLabel={t.song.playNow} onpick={play}/>
</Modal>
