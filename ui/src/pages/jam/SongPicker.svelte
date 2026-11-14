<script lang="ts">
  import {t} from 'i18n'
  import api from 'src/api/api'
  import type {Song} from 'src/api/types'
  import Button from 'src/components/Button.svelte'
  import Form from 'src/forms/Form.svelte'
  import FormField from 'src/forms/FormField.svelte'
  import SelectField from 'src/forms/SelectField.svelte'
  import TextAreaField from 'src/forms/TextAreaField.svelte'
  import {onDestroy} from 'svelte'
  import {debounce} from 'src/shared/debounce'
  import {hasChords, isValidProgression, keyOptions, progressions, progressionSong, toChordPro} from 'src/music/chords'

  export let actionLabel: string
  export let onpick: (song: Song) => void

  const tabs = ['progressions', 'song'] as const
  export let tab: typeof tabs[number] = 'progressions'
  let root = 'C'
  export let song = {} as Song
  let query = ''
  let results: Song[]|undefined
  let custom = ''

  const chordSites = {
    'Ultimate Guitar': 'https://www.ultimate-guitar.com/search.php?search_type=title&value=',
    'Chordie': 'https://www.chordie.com/results.php?q=',
    'Google': 'https://www.google.com/search?q=chords+'
  }

  $: chordQuery = [song.title, song.artist].filter(s => s).join(' ') || query

  $: customSong = isValidProgression(custom) ? progressionSong(custom, custom, root) : undefined

  function preview(song: Song) {
    return song.sheet.replace(/[[\]]/g, '').replace(/\n/g, ' ')
  }

  /** Only the latest request may update results */
  let latestRequest = 0
  /** Query for which full search was already done, so that late suggestions don't replace its results */
  let searched = ''

  /** Own songs while typing, other sources only on explicit search */
  const suggest = debounce(async (q: string) => {
    if (q == searched) return
    const request = ++latestRequest
    const found = q.trim().length > 1 ? await api.get<Song[]>('songs/suggestions?q=' + encodeURIComponent(q)) : []
    if (request == latestRequest) results = found.length ? found : undefined
  }, 400)
  $: suggest(query)
  onDestroy(suggest.cancel)

  async function search() {
    searched = query
    const request = ++latestRequest
    const found = await api.get<Song[]>('songs?q=' + encodeURIComponent(query))
    if (request == latestRequest) results = found
  }

  /** Chords found on external sites are loaded only when picked */
  async function use(found: Song) {
    results = undefined
    if (found.sheet || !found.url) return song = found
    const loaded = await api.get<Song>('songs/ultimate-guitar?url=' + encodeURIComponent(found.url))
    song = {...loaded, sheet: toChordPro(loaded.sheet)}
  }

  function source(url: string) {
    return new URL(url).hostname.replace(/^(www|tabs)\./, '')
  }

  /** Songs with chords are saved to our own DB for others to find */
  async function confirm() {
    const confirmed = {...song, sheet: toChordPro(song.sheet)}
    onpick(hasChords(confirmed.sheet) ? await api.post<Song>('songs', confirmed) : confirmed)
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
    <Form submit={() => customSong && onpick(customSong)} class="flex gap-2 items-end">
      <FormField label={t.song.ownProgression} bind:value={custom} placeholder="C G Am F  /  I V vi IV" class="flex-1"
                 validator={v => !v || isValidProgression(v) ? '' : t.song.invalidProgression}/>
      <Button type="submit" label={actionLabel}/>
    </Form>
    {#if customSong}<p class="text-sm text-gray-500 font-mono -mt-2">{preview(customSong)}</p>{/if}
    <ul class="divide-y divide-gray-200">
      {#each Object.keys(progressions) as (keyof typeof progressions)[] as name}
        {@const p = progressionSong(t.progressions[name], progressions[name], root)}
        <li class="flex items-center gap-3 py-2">
          <div class="flex-1">
            <div class="font-medium">{p.title}</div>
            <div class="text-sm text-gray-500 font-mono">{preview(p)}</div>
          </div>
          <Button label={actionLabel} class="outlined" onclick={() => onpick(p)}/>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <div class="spaced">
    <Form submit={search}>
      <FormField label={t.song.searchSongs} bind:value={query} type="search">
        <svelte:fragment slot="after"><Button type="submit" icon="search" title={t.song.searchSongs} class="outlined ml-2"/></svelte:fragment>
      </FormField>
    </Form>
    {#if results}
      <ul class="divide-y divide-gray-200 max-h-64 overflow-y-auto">
        {#each results as found (found.id)}
          <li><button type="button" class="w-full flex items-center gap-2 py-2 hover:bg-gray-50" onclick={() => use(found)}>
            <b>{found.title}</b> <span class="text-gray-500 flex-1">{found.artist ?? ''}</span>
            {#if found.url}<span class="text-xs text-muted">{source(found.url)}</span>{/if}
            {#if found.url || hasChords(found.sheet)}<span class="badge">{t.song.withChords}</span>{:else}<span class="text-sm text-muted">{t.song.lyricsOnly}</span>{/if}
          </button></li>
        {:else}
          <li class="py-2 text-muted">{t.song.noResults}</li>
        {/each}
      </ul>
    {/if}

    <Form submit={confirm}>
      <div class="flex flex-wrap gap-3">
        <FormField label={t.song.title} bind:value={song.title} class="flex-1 min-w-40"/>
        <FormField label={t.song.artist} bind:value={song.artist} required={false} class="flex-1 min-w-40"/>
        <SelectField label={t.song.key} bind:value={song.key} options={{...keyOptions(), ...keyOptions(true)}} emptyOption={t.song.detectKey} required={false}/>
      </div>
      <TextAreaField label={t.song.sheet} bind:value={song.sheet} maxlength={20000} rows={10} class="[&_textarea]:font-mono"/>
      <p class="text-sm text-gray-500">{t.song.sheetHelp}</p>
      {#if song.url}<p class="text-sm">{t.song.source}: <a href={song.url} target="_blank" rel="noopener">{source(song.url)}</a></p>{/if}
      {#if chordQuery}
        <p class="text-sm flex flex-wrap gap-x-3">
          {t.song.findChords}
          {#each Object.entries(chordSites) as [site, url]}
            <a href={url + encodeURIComponent(chordQuery)} target="_blank" rel="noopener">{site}</a>
          {/each}
        </p>
      {/if}
      <Button type="submit" label={actionLabel}/>
    </Form>
  </div>
{/if}
