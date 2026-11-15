<script lang="ts">
  import {t} from 'i18n'
  import {onMount} from 'svelte'
  import type {Jam, Song} from 'src/api/types'
  import Button from 'src/components/Button.svelte'
  import Modal from 'src/components/Modal.svelte'
  import Icon from 'src/icons/Icon.svelte'
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

<section class="card spaced p-4 sm:p-6">
  {#if jam.song}
    <div class="flex flex-wrap items-end gap-3">
      <div class="flex-1 min-w-40">
        <h4 class="flex items-center gap-2">
          {jam.song.title}
          {#if jam.song.artist}
            <a href="https://www.youtube.com/results?search_query={encodeURIComponent(jam.song.title + ' ' + jam.song.artist)}" target="_blank" rel="noopener"
               title={t.jam.youtube} aria-label={t.jam.youtube} class="youtube flex text-2xl hover:opacity-80"><Icon name="youtube"/></a>
          {/if}
        </h4>
        {#if jam.song.artist}<p class="text-sm text-gray-600">{jam.song.artist}</p>{/if}
      </div>
      {#if key}
        <SelectField label={t.jam.key} bind:value={key} options={keyOptions(key.endsWith('m'))} onchange={() => changeKey(key)}/>
      {/if}
      <Button label={t.jam.changeSong} icon="music" class="outlined" onclick={() => showPicker = true}/>
    </div>

    <PlaybackControls playback={jam.playback} {beat} total={pos?.total} chord={pos && !countIn ? sheet.chords[pos.index] : undefined}/>

    {#if pos}
      <div class="sticky top-14 z-20 bg-surface py-2 flex items-baseline gap-3 sm:gap-6">
        <span class="shrink-0 text-5xl sm:text-7xl font-black tracking-tight text-primary-600 dark:text-primary-400">{countIn ? -pos.beat : sheet.chords[pos.index]}</span>
        {#if countIn}
          <span class="truncate text-gray-500">{t.jam.getReady}</span>
        {:else}
          <span class="truncate text-lg sm:text-2xl text-gray-400">{t.jam.next}: {sheet.chords[(pos.index + 1) % sheet.chords.length]}</span>
        {/if}
        <span class="beats shrink-0 flex gap-1 sm:gap-1.5 ml-auto self-center">
          {#each Array(jam.playback.beatsPerChord) as _, i}
            <span class="w-2 sm:w-3 h-5 rounded-sm {countIn ? 'bg-warning-400' : i == pos.beat ? 'bg-primary-600' : 'bg-gray-200'}"></span>
          {/each}
        </span>
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
