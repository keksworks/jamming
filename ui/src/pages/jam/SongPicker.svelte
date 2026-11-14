<script lang="ts">
  import {t} from 'i18n'
  import api from 'src/api/api'
  import type {Lyrics, Song} from 'src/api/types'
  import Button from 'src/components/Button.svelte'
  import Form from 'src/forms/Form.svelte'
  import FormField from 'src/forms/FormField.svelte'
  import SelectField from 'src/forms/SelectField.svelte'
  import TextAreaField from 'src/forms/TextAreaField.svelte'
  import {isMinorProgression, keyOptions, progressions, progressionSheet, toChordPro} from 'src/music/chords'

  export let actionLabel: string
  export let onpick: (song: Song) => void

  const tabs = ['progressions', 'song'] as const
  let tab: typeof tabs[number] = 'progressions'
  let root = 'C'
  let song = {} as Song
  let query = ''
  let results: Lyrics[]|undefined

  function progression(name: keyof typeof progressions) {
    const numerals = progressions[name]
    const key = root + (isMinorProgression(numerals) ? 'm' : '')
    return {title: t.progressions[name], sheet: progressionSheet(numerals, key), key}
  }

  async function search() {
    results = await api.get<Lyrics[]>('lyrics?q=' + encodeURIComponent(query))
  }

  function useLyrics(lyrics: Lyrics) {
    song = {title: lyrics.trackName, artist: lyrics.artistName, sheet: lyrics.plainLyrics!}
    results = undefined
  }
</script>

<div class="flex gap-2 mb-4">
  {#each tabs as name}
    <Button label={t.song[name]} class={tab == name ? 'default' : 'secondary'} onclick={() => tab = name}/>
  {/each}
</div>

{#if tab == 'progressions'}
  <div class="spaced">
    <SelectField label={t.song.key} bind:value={root} options={keyOptions()} class="w-32"/>
    <ul class="divide-y divide-gray-200">
      {#each Object.keys(progressions) as (keyof typeof progressions)[] as name}
        {@const song = progression(name)}
        <li class="flex items-center gap-3 py-2">
          <div class="flex-1">
            <div class="font-medium">{song.title}</div>
            <div class="text-sm text-gray-500 font-mono">{song.sheet.replace(/[[\]]/g, '').replace(/\n/g, ' ')}</div>
          </div>
          <Button label={actionLabel} class="outlined" onclick={() => onpick(song)}/>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <div class="spaced">
    <Form submit={search} class="flex gap-2 items-end">
      <FormField label={t.song.searchLyrics} bind:value={query} type="search" class="flex-1"/>
      <Button type="submit" icon="search" class="outlined"/>
    </Form>
    {#if results}
      <ul class="divide-y divide-gray-200 max-h-64 overflow-y-auto">
        {#each results as lyrics (lyrics.id)}
          <li><button type="button" class="w-full py-2 hover:bg-gray-50" onclick={() => useLyrics(lyrics)}>
            <b>{lyrics.trackName}</b> <span class="text-gray-500">{lyrics.artistName}</span>
          </button></li>
        {:else}
          <li class="py-2 text-muted">{t.song.noResults}</li>
        {/each}
      </ul>
    {/if}

    <Form submit={() => onpick({...song, sheet: toChordPro(song.sheet)})}>
      <div class="flex flex-wrap gap-3">
        <FormField label={t.song.title} bind:value={song.title} class="flex-1 min-w-40"/>
        <FormField label={t.song.artist} bind:value={song.artist} required={false} class="flex-1 min-w-40"/>
        <SelectField label={t.song.key} bind:value={song.key} options={{...keyOptions(), ...keyOptions(true)}} emptyOption={t.song.detectKey} required={false}/>
      </div>
      <TextAreaField label={t.song.sheet} bind:value={song.sheet} maxlength={20000} rows={10} class="font-mono"/>
      <p class="text-sm text-gray-500">{t.song.sheetHelp}</p>
      <Button type="submit" label={actionLabel}/>
    </Form>
  </div>
{/if}
