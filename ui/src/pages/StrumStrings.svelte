<script lang="ts">
  import {onDestroy, onMount} from 'svelte'
  import {crossedStrings, frequencies, guitarVoicing} from 'src/music/strings'
  import {pluck, unlockAudio} from 'src/music/playback'

  export let height = 180

  const chordNames = ['C', 'G', 'Am', 'F']
  const glyphs = ['♪', '♫', '♩', '♬']
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const strings = Array.from({length: 6}, () => ({amplitude: 0, phase: 0}))

  let canvas: HTMLCanvasElement
  let width = 0
  let chord = 0
  let strummed = new Set<number>()
  let notes: {x: number, y: number, age: number, glyph: string}[] = []
  let lastX: number|undefined
  let frame = 0

  $: positions = strings.map((_, i) => width / 2 + (i - 2.5) * Math.min(width / 7, 44))
  $: if (canvas && width) draw()

  function move(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (lastX !== undefined) for (const i of crossedStrings(lastX, x, positions)) strum(i, e.clientY - rect.top, Math.abs(x - lastX))
    lastX = x
  }

  function strum(i: number, y: number, speed: number) {
    const frequency = frequencies(guitarVoicing(chordNames[chord])!)[i]
    if (frequency) pluck(frequency, Math.min(0.4, 0.1 + speed / 150))
    strings[i].amplitude = Math.min(14, (frequency ? 4 : 1) + speed / 4)
    if (frequency && !reducedMotion) notes.push({x: positions[i], y, age: 0, glyph: glyphs[i % glyphs.length]})
    strummed.add(i)
    if (strummed.size == strings.length) {
      strummed.clear()
      chord = (chord + 1) % chordNames.length
    }
    animate()
  }

  function color(name: string) {
    return getComputedStyle(canvas).getPropertyValue('--color-' + name)
  }

  /** Returns true while something is still moving */
  function draw() {
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    const scale = devicePixelRatio
    canvas.width = width * scale
    canvas.height = height * scale
    ctx.scale(scale, scale)

    ctx.fillStyle = color('gray-200')
    ctx.font = `900 ${height * 0.7}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(chordNames[chord], width / 2, height / 2)

    strings.forEach((s, i) => {
      if (!reducedMotion) s.phase += 0.9
      s.amplitude *= 0.97
      ctx.strokeStyle = s.amplitude > 0.5 ? color('primary-600') : color('gray-400')
      ctx.lineWidth = 3 - i * 0.35
      ctx.beginPath()
      for (let y = 0; y <= height; y += 4) {
        const x = positions[i] + (reducedMotion ? 0 : s.amplitude * Math.sin(Math.PI * y / height) * Math.sin(s.phase))
        if (y) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      ctx.stroke()
    })

    ctx.fillStyle = color('primary-500')
    ctx.font = '26px system-ui, sans-serif'
    for (const note of notes) {
      ctx.globalAlpha = 1 - note.age / 90
      ctx.fillText(note.glyph, note.x + 12 * Math.sin(note.age / 8), note.y - note.age * 1.2)
      note.age++
    }
    ctx.globalAlpha = 1
    notes = notes.filter(n => n.age < 90)
    return strings.some(s => s.amplitude > 0.1) || notes.length > 0
  }

  function animate() {
    frame ||= requestAnimationFrame(() => {
      frame = 0
      if (draw()) animate()
    })
  }

  /** Visual-only strum on load to show that the strings are alive */
  onMount(() => {
    if (!reducedMotion) strings.forEach((_, i) => setTimeout(() => {
      strings[i].amplitude = 4
      animate()
    }, 500 + i * 60))
  })

  onDestroy(() => cancelAnimationFrame(frame))
</script>

<div class="select-none" bind:clientWidth={width}>
  <canvas bind:this={canvas} aria-hidden="true" class="block w-full cursor-crosshair touch-pan-y" style="height: {height}px"
          onpointerdown={(e: PointerEvent) => { unlockAudio(); lastX = undefined; move(e) }}
          onpointermove={move} onpointerleave={() => lastX = undefined}></canvas>
</div>
