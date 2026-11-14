<script lang="ts">
  import {t} from 'i18n'
  import {navigate} from '@keksworks/svelte-tiny-router'
  import Form from 'src/forms/Form.svelte'
  import FormField from 'src/forms/FormField.svelte'
  import Button from 'src/components/Button.svelte'
  import {createJam, me, setMyName} from 'src/stores/jam'
  import StrumStrings from './StrumStrings.svelte'
  import InstallApp from './InstallApp.svelte'

  let name = me.name
  let code = ''

  async function start() {
    setMyName(name)
    navigate('/' + (await createJam()).code)
  }

  function join() {
    navigate('/' + code.toUpperCase())
  }
</script>

<div class="max-w-lg mx-auto pt-6 sm:pt-16 spaced">
  <h1 class="text-5xl sm:text-5xl font-black tracking-tight text-center leading-tight pb-1 bg-linear-to-r from-primary-600 to-amber-600 dark:from-primary-500 dark:to-amber-400 bg-clip-text text-transparent">{t.home.tagline}</h1>
  <p class="text-gray-600 text-center text-lg">{t.home.description}</p>

  <StrumStrings/>

  <Form submit={start} class="card spaced p-6">
    <FormField label={t.home.yourName} bind:value={name} maxlength={30} autocomplete="nickname" class="lg"/>
    <Button type="submit" label={t.home.start} icon="music" size="lg" class="default w-full"/>
  </Form>

  <Form submit={join} class="card flex gap-2 items-end p-6">
    <FormField label={t.home.code} bind:value={code} minlength={4} maxlength={4} autocapitalize="characters" class="lg flex-1 [&_input]:uppercase [&_input]:font-mono [&_input]:tracking-widest"/>
    <Button type="submit" label={t.home.join} size="lg" class="outlined"/>
  </Form>

  <InstallApp/>
</div>
