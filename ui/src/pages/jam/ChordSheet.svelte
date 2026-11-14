<script lang="ts">
  import {tick} from 'svelte'
  import type {SheetPart} from 'src/music/chords'
  import ChordPopover from './ChordPopover.svelte'

  export let lines: SheetPart[][]
  export let current: number|undefined = undefined

  let sheet: HTMLElement
  let popover: {chord: string, style: string, pinned: boolean}|undefined
  let hideTimer: ReturnType<typeof setTimeout>

  $: if (current !== undefined && sheet) tick().then(() => sheet.querySelector('.current')?.scrollIntoView({block: 'nearest', behavior: 'smooth'}))

  /** Below the chord on desktop (above if not enough space), bottom sheet on mobile */
  function show(e: Event, chord: string, pinned: boolean) {
    clearTimeout(hideTimer)
    if (popover?.pinned && !pinned) return
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const style = innerWidth < 640 ? 'left: 0; right: 0; bottom: 0' :
      `left: ${Math.max(8, Math.min(r.left, innerWidth - 460))}px; ` + (r.bottom + 260 < innerHeight ? `top: ${r.bottom + 4}px` : `bottom: ${innerHeight - r.top + 4}px`)
    popover = {chord, style, pinned}
  }

  function hover(e: PointerEvent, chord: string) {
    if (e.pointerType == 'mouse') show(e, chord, false)
  }

  function hideSoon() {
    if (!popover?.pinned) hideTimer = setTimeout(() => popover = undefined, 300)
  }

  function closeOutside(e: MouseEvent) {
    if (popover && !(e.target as Element).closest?.('.chord, .chord-popover')) popover = undefined
  }
</script>

<svelte:window onclick={closeOutside} onkeyup={(e: KeyboardEvent) => e.key == 'Escape' && (popover = undefined)}/>

<div bind:this={sheet} class="font-mono text-sm sm:text-base leading-tight">
  {#each lines as line}
    <div class="flex flex-wrap items-end min-h-5">
      {#each line as part}
        {#if part.label}<span class="font-sans font-semibold text-gray-500 mt-3 mr-2">{part.label}</span>{/if}
        <span class="inline-flex flex-col whitespace-pre">
          {#if part.chord}
            <button type="button" class="chord font-bold text-left pr-2 rounded-sm cursor-pointer hover:underline {part.index == current ? 'current bg-primary-600 text-white px-1' : 'text-primary-700 dark:text-primary-300'}"
                    onclick={(e: MouseEvent) => show(e, part.chord!, true)} onpointerenter={(e: PointerEvent) => hover(e, part.chord!)} onpointerleave={hideSoon}>{part.chord}</button>
          {/if}
          <span>{part.text || ' '}</span>
        </span>
      {/each}
    </div>
  {/each}
</div>

{#if popover}
  <div class="chord-popover fixed z-30 bg-surface border border-gray-200 shadow-lg p-4 rounded-t-lg sm:rounded-lg sm:w-[28rem] font-sans" style={popover.style}
       role="dialog" tabindex="-1" onpointerenter={() => clearTimeout(hideTimer)} onpointerleave={hideSoon}>
    <ChordPopover chord={popover.chord} onclose={() => popover = undefined}/>
  </div>
{/if}
