<script lang="ts">
  import {t} from 'i18n'
  import {navigate} from '@keksworks/svelte-tiny-router'
  import Form from 'src/forms/Form.svelte'
  import FormField from 'src/forms/FormField.svelte'
  import Button from 'src/components/Button.svelte'
  import {createJam, me, setMyName} from 'src/stores/jam'

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

<div class="max-w-md mx-auto pt-6 sm:pt-16 spaced">
  <h1 class="text-5xl sm:text-6xl font-extrabold tracking-tight text-center leading-tight">
    <span class="gradient-text">{t.home.tagline}</span>
  </h1>
  <p class="text-gray-600 text-center text-lg">{t.home.description}</p>

  <Form submit={start} class="card spaced p-6 mt-8">
    <FormField label={t.home.yourName} bind:value={name} maxlength={30} autocomplete="nickname" class="lg"/>
    <Button type="submit" label={t.home.start} icon="music" size="lg" class="default w-full"/>
  </Form>

  <Form submit={join} class="card flex gap-2 items-end p-6">
    <FormField label={t.home.code} bind:value={code} minlength={4} maxlength={4} autocapitalize="characters" class="lg flex-1 [&_input]:uppercase [&_input]:font-mono [&_input]:tracking-widest"/>
    <Button type="submit" label={t.home.join} size="lg" class="outlined"/>
  </Form>
</div>
