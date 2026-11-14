<script lang="ts">
  import {t} from 'i18n'
  import Icon from 'src/icons/Icon.svelte'
  import GuitarDiagram from './GuitarDiagram.svelte'
  import PianoDiagram from './PianoDiagram.svelte'

  export let chord: string
  export let onclose: () => void
</script>

<div class="flex items-center mb-2">
  <h4 class="flex-1">{chord}</h4>
  <button type="button" title={t.general.close} class="text-gray-400 hover:text-gray-600 p-1" onclick={onclose}><Icon name="x"/></button>
</div>
<div class="grid grid-cols-[auto_1fr] gap-6">
  <div class="flex flex-col items-center gap-2">
    <span class="text-sm text-gray-500">{t.jam.guitar}</span>
    <GuitarDiagram {chord}/>
  </div>
  <div class="flex flex-col items-center gap-2">
    <span class="text-sm text-gray-500">{t.jam.piano}</span>
    <PianoDiagram {chord}/>
  </div>
</div>
