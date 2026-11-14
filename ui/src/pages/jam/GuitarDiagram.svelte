<script lang="ts">
  import {t} from 'i18n'
  import Button from 'src/components/Button.svelte'
  import {crossedStrings, frequencies, guitarVoicing} from 'src/music/strings'
  import {pluck, strum, unlockAudio} from 'src/music/playback'

  export let chord: string

  const left = 15, gap = 18, top = 28, fretGap = 22, rows = 4
  const positions = Array.from({length: 6}, (_, i) => left + i * gap)

  let svg: SVGSVGElement
  let lastX: number|undefined
  let plucked: boolean[] = []

  $: frets = guitarVoicing(chord)
  $: fretted = (frets?.filter(f => f) ?? []) as number[]
  $: base = Math.max(0, ...fretted) <= rows ? 1 : Math.min(...fretted)

  function highlight(i: number) {
    plucked[i] = true
    setTimeout(() => plucked[i] = false, 300)
  }

  function move(e: PointerEvent) {
    const rect = svg.getBoundingClientRect()
    const x = (e.clientX - rect.left) * 120 / rect.width
    if (lastX !== undefined) for (const i of crossedStrings(lastX, x, positions)) {
      const frequency = frequencies(frets!)[i]
      if (frequency) pluck(frequency)
      highlight(i)
    }
    lastX = x
  }

  async function strumAll() {
    await unlockAudio()
    strum(frequencies(frets!))
    positions.forEach((_, i) => setTimeout(() => highlight(i), i * 30))
  }
</script>

{#if frets}
  <div class="flex-1 flex items-end">
  <button type="button" title={t.jam.strum} class="cursor-pointer touch-pan-y select-none" onclick={strumAll}
          onpointerdown={() => unlockAudio()} onpointermove={move} onpointerleave={() => lastX = undefined}>
  <svg bind:this={svg} viewBox="0 0 120 {top + rows * fretGap + 1}" class="w-32 block" role="img" aria-label={chord}>
    {#if base == 1}
      <rect x={left} y={top - 3} width={gap * 5} height="3" class="fill-gray-700"/>
    {:else}
      <text x="0" y={top + fretGap / 2 + 4} class="fill-gray-500 text-[9px]">{base}fr</text>
    {/if}
    {#each Array(rows + 1) as _, row}
      <line x1={left} x2={left + gap * 5} y1={top + row * fretGap} y2={top + row * fretGap} class="stroke-gray-300"/>
    {/each}
    {#each frets as fret, i}
      <line x1={positions[i]} x2={positions[i]} y1={top} y2={top + rows * fretGap} stroke-width={plucked[i] ? 2.5 : 1.5}
            class="transition-colors {plucked[i] ? 'stroke-primary-500' : 'stroke-gray-500'}"/>
      {#if fret === undefined}
        <text x={positions[i]} y={top - 9} text-anchor="middle" class="mute fill-gray-500 text-[11px]">×</text>
      {:else if fret === 0}
        <circle cx={positions[i]} cy={top - 13} r="4" class="open fill-none stroke-gray-500"/>
      {:else}
        <circle cx={positions[i]} cy={top + (fret - base + 0.5) * fretGap} r="6.5" class="dot fill-primary-600"/>
      {/if}
    {/each}
  </svg>
  </button>
  </div>
  <Button icon="player-play" label={t.jam.strum} size="sm" class="outlined" onclick={strumAll}/>
{:else}
  <p class="text-sm text-muted">{t.jam.noDiagram}</p>
{/if}
