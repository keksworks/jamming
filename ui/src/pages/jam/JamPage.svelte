<script lang="ts">
  import {t} from 'i18n'
  import {onDestroy, onMount} from 'svelte'
  import Form from 'src/forms/Form.svelte'
  import FormField from 'src/forms/FormField.svelte'
  import Button from 'src/components/Button.svelte'
  import Modal from 'src/components/Modal.svelte'
  import {Link} from '@keksworks/svelte-tiny-router'
  import type {Song} from 'src/api/types'
  import Spinner from 'src/components/Spinner.svelte'
  import {connect, jam, me, pendingSong, playSong, setMyName, suggest, syncClock} from 'src/stores/jam'
  import {keepScreenOn} from 'src/shared/wakeLock'
  import JamHeader from './JamHeader.svelte'
  import NowPlaying from './NowPlaying.svelte'
  import Suggestions from './Suggestions.svelte'
  import SongPicker from './SongPicker.svelte'

  export let code: string

  let name = me.name
  let joined = false
  let notFound = false
  let leave: (() => void)[] = []

  const shared = $pendingSong
  let showShared = !!shared
  $: if (!showShared) pendingSong.set(undefined)

  async function join() {
    setMyName(name)
    joined = true
    syncClock()
    try {
      leave = [await connect(code), keepScreenOn()]
    } catch {
      delete localStorage['lastJam']
      notFound = true
    }
  }

  async function pickShared(song: Song) {
    await ($jam!.song ? suggest({song}) : playSong(song))
    showShared = false
  }

  onMount(() => {
    if (me.name) join()
  })

  onDestroy(() => leave.forEach(f => f()))
</script>

{#if notFound}
  <p class="text-center pt-10">{t.jam.notFound}</p>
  <p class="text-center pt-4"><Link to="/" label={t.home.start}/></p>
{:else if !joined}
  <Form submit={join} class="card max-w-md mx-auto spaced max-sm:-m-4 p-6 mt-6 sm:mt-12">
    <FormField label={t.home.yourName} bind:value={name} maxlength={30} autocomplete="nickname" class="lg"/>
    <Button type="submit" label={t.home.join} size="lg" class="default w-full"/>
  </Form>
{:else if $jam}
  <div class="max-w-3xl mx-auto spaced">
    <JamHeader jam={$jam}/>
    <NowPlaying jam={$jam}/>
    <Suggestions jam={$jam}/>
  </div>

  {#if shared}
    <Modal bind:show={showShared} title={t.song.shared} wide>
      {#if !shared.sheet}<p class="mb-4 text-sm text-warning-700 dark:text-warning-300">{t.song.sharedLinkOnly}</p>{/if}
      <SongPicker song={shared} tab="manual" actionLabel={$jam.song ? t.song.suggest : t.song.playNow} onpick={pickShared}/>
    </Modal>
  {/if}
{:else}
  <div class="text-center pt-10"><Spinner/></div>
{/if}
