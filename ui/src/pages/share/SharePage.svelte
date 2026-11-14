<script lang="ts">
  import {onMount} from 'svelte'
  import {navigate} from '@keksworks/svelte-tiny-router'
  import {pendingSong} from 'src/stores/jam'
  import {sharedSong} from 'src/shared/sharedSong'

  onMount(() => {
    pendingSong.set(sharedSong(new URLSearchParams(location.search)))
    navigate('/' + (localStorage['lastJam'] ?? ''), {replace: true})
  })
</script>
