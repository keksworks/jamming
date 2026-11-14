<script lang="ts">
  import {t} from 'i18n'
  import Button from 'src/components/Button.svelte'
  import Icon from 'src/icons/Icon.svelte'
  import {installPrompt} from 'src/stores/install'

  const installed = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform == 'MacIntel' && navigator.maxTouchPoints > 1
  const android = /Android/.test(navigator.userAgent)
  const [iosBeforeIcon, iosAfterIcon] = t.home.install.ios.split('{share}')

  async function install() {
    await $installPrompt!.prompt()
    await $installPrompt!.userChoice
    installPrompt.set(undefined)
  }
</script>

{#if !installed && (ios || android)}
  <div class="install card flex items-center gap-4 p-6">
    <img src="/icon-192.png" alt="" class="w-12 h-12 rounded-lg shrink-0">
    <div class="flex-1 space-y-2">
      <b>{t.home.install.title}</b>
      <p class="text-sm text-gray-600">{t.home.install.description}</p>
      {#if ios}
        <p class="text-sm">{iosBeforeIcon}<Icon name="share-ios" class="inline align-text-bottom text-primary-600 dark:text-primary-400"/>{iosAfterIcon}</p>
      {:else if $installPrompt}
        <Button label={t.home.install.button} icon="plus" onclick={install}/>
      {:else}
        <p class="text-sm">{t.home.install.android}</p>
      {/if}
    </div>
  </div>
{/if}
