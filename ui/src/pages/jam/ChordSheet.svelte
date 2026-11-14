<script lang="ts">
  import {tick} from 'svelte'
  import type {SheetPart} from 'src/music/chords'

  export let lines: SheetPart[][]
  export let current: number|undefined = undefined

  let sheet: HTMLElement
  $: if (current !== undefined && sheet) tick().then(() => sheet.querySelector('.current')?.scrollIntoView({block: 'nearest', behavior: 'smooth'}))
</script>

<div bind:this={sheet} class="font-mono text-sm sm:text-base leading-tight">
  {#each lines as line}
    <div class="flex flex-wrap items-end min-h-5">
      {#each line as part}
        {#if part.label}<span class="font-sans font-semibold text-gray-500 mt-3 mr-2">{part.label}</span>{/if}
        <span class="inline-flex flex-col whitespace-pre">
          {#if part.chord}
            <b class="pr-2 rounded transition-colors {part.index == current ? 'current bg-primary-600 text-white px-1' : 'text-primary-700'}">{part.chord}</b>
          {/if}
          <span>{part.text || ' '}</span>
        </span>
      {/each}
    </div>
  {/each}
</div>
