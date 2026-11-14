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

<div class="max-w-md mx-auto sm:pt-12 spaced">
  <h1 class="font-bold text-center">{t.home.tagline}</h1>
  <p class="text-gray-600 text-center">{t.home.description}</p>

  <Form submit={start} class="spaced pt-4">
    <FormField label={t.home.yourName} bind:value={name} maxlength={30} autocomplete="nickname" class="lg"/>
    <Button type="submit" label={t.home.start} icon="music" size="lg" class="default w-full"/>
  </Form>

  <Form submit={join} class="flex gap-2 items-end pt-4">
    <FormField label={t.home.code} bind:value={code} minlength={4} maxlength={4} autocapitalize="characters" class="lg flex-1 uppercase"/>
    <Button type="submit" label={t.home.join} size="lg" class="outlined"/>
  </Form>
</div>
