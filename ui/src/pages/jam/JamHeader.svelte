<script lang="ts">
  import {t} from 'i18n'
  import type {Jam} from 'src/api/types'
  import Button from 'src/components/Button.svelte'
  import Modal from 'src/components/Modal.svelte'
  import Icon from 'src/icons/Icon.svelte'
  import {showToast} from 'src/stores/toasts'

  export let jam: Jam

  let showInvite = false

  $: link = location.origin + '/' + jam.code
  $: members = jam.members.filter((m, i, all) => all.findIndex(o => o.id == m.id) == i)

  async function copyLink() {
    await navigator.clipboard.writeText(link)
    showToast(t.jam.copied)
  }
</script>

<div class="flex items-center gap-3 flex-wrap">
  <span class="text-3xl font-mono font-bold tracking-widest">{jam.code}</span>
  <span class="flex items-center gap-1 text-sm text-gray-600" title={members.map(m => m.name).join(', ')}>
    <Icon name="users"/> {t.jam.members.replace('{count}', members.length + '')}
  </span>
  <Button label={t.jam.invite} icon="share" class="outlined ml-auto" onclick={() => showInvite = true}/>
</div>

<Modal bind:show={showInvite} title={t.jam.invite}>
  <div class="spaced text-center">
    <p class="text-6xl font-mono font-bold tracking-widest">{jam.code}</p>
    <p class="text-gray-600">{t.jam.inviteHelp}</p>
    <a href={link} class="block break-all">{link}</a>
    <div class="flex gap-2 justify-center">
      <Button label={t.jam.copyLink} class="outlined" onclick={copyLink}/>
      {#if navigator.share}
        <Button label={t.jam.share} icon="share" onclick={() => navigator.share({title: t.title, text: t.jam.inviteText, url: link})}/>
      {/if}
    </div>
  </div>
</Modal>
