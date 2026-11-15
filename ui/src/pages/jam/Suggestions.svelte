<script lang="ts">
  import {t} from 'i18n'
  import type {Jam, Song} from 'src/api/types'
  import Button from 'src/components/Button.svelte'
  import Modal from 'src/components/Modal.svelte'
  import SelectField from 'src/forms/SelectField.svelte'
  import {detectKey, keyOptions} from 'src/music/chords'
  import {accept, me, removeSuggestion, suggest, vote} from 'src/stores/jam'
  import SongPicker from './SongPicker.svelte'

  export let jam: Jam

  let showPicker = false
  let key = ''

  $: suggestions = [...jam.suggestions].sort((a, b) => b.votes.length - a.votes.length)
  $: minor = (jam.key ?? jam.song?.key ?? detectKey(jam.song?.sheet ?? ''))?.endsWith('m')

  async function suggestSong(song: Song) {
    await suggest({song})
    showPicker = false
  }
</script>

<section class="card spaced max-sm:-mx-4 max-sm:rounded-none p-4 sm:p-6">
  <h5>{t.suggestions.title}</h5>
  <ul class="divide-y divide-gray-200">
    {#each suggestions as s (s.id)}
      <li class="flex flex-wrap items-center gap-2 py-2">
        <div class="flex-1 min-w-40">
          <b>{s.song?.title ?? ''}</b>
          {#if s.key}<span>{t.suggestions.inKey.replace('{key}', s.key)}</span>{/if}
          <span class="text-sm text-gray-500">{t.suggestions.by.replace('{name}', s.by)}</span>
        </div>
        <Button icon="thumb-up" label={s.votes.length + ''} title={t.suggestions.vote}
                class={s.votes.includes(me.id) ? 'default' : 'outlined'} onclick={() => vote(s.id)}/>
        <Button icon="player-play" label={t.suggestions.accept} class="outlined" onclick={() => accept(s.id)}/>
        <Button icon="trash" title={t.suggestions.remove} class="secondary" onclick={() => removeSuggestion(s.id)}/>
      </li>
    {:else}
      <li class="py-2 text-muted">{t.suggestions.empty}</li>
    {/each}
  </ul>

  <div class="flex flex-wrap items-center gap-2">
    <Button icon="music" label={t.suggestions.suggestSong} class="outlined" onclick={() => showPicker = true}/>
    {#if jam.song}
      <span class="flex items-center gap-2 ml-auto">
        <SelectField bind:value={key} options={keyOptions(minor)}/>
        <Button label={t.suggestions.suggestKey} class="outlined" onclick={() => suggest({key})}/>
      </span>
    {/if}
  </div>
</section>

<Modal bind:show={showPicker} title={t.suggestions.suggestSong} wide>
  <SongPicker actionLabel={t.song.suggest} onpick={suggestSong}/>
</Modal>
