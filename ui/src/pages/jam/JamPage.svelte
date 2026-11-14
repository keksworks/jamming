<script lang="ts">
  import {t} from 'i18n'
  import {onDestroy, onMount} from 'svelte'
  import Form from 'src/forms/Form.svelte'
  import FormField from 'src/forms/FormField.svelte'
  import Button from 'src/components/Button.svelte'
  import Spinner from 'src/components/Spinner.svelte'
  import {connect, jam, me, setMyName, syncClock} from 'src/stores/jam'
  import {keepScreenOn} from 'src/shared/wakeLock'
  import JamHeader from './JamHeader.svelte'
  import NowPlaying from './NowPlaying.svelte'
  import Suggestions from './Suggestions.svelte'

  export let code: string

  let name = me.name
  let joined = false
  let notFound = false
  let leave: (() => void)[] = []

  async function join() {
    setMyName(name)
    joined = true
    syncClock()
    try {
      leave = [await connect(code), keepScreenOn()]
    } catch {
      notFound = true
    }
  }

  onMount(() => {
    if (me.name) join()
  })

  onDestroy(() => leave.forEach(f => f()))
</script>

{#if notFound}
  <p class="text-center pt-10">{t.jam.notFound}</p>
{:else if !joined}
  <Form submit={join} class="max-w-md mx-auto spaced sm:pt-12">
    <FormField label={t.home.yourName} bind:value={name} maxlength={30} autocomplete="nickname" class="lg"/>
    <Button type="submit" label={t.home.join} size="lg" class="default w-full"/>
  </Form>
{:else if $jam}
  <div class="max-w-3xl mx-auto spaced">
    <JamHeader jam={$jam}/>
    <NowPlaying jam={$jam}/>
    <Suggestions jam={$jam}/>
  </div>
{:else}
  <div class="text-center pt-10"><Spinner/></div>
{/if}
