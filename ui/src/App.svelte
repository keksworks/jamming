<script lang="ts">
  import {t} from 'i18n'
  import {logout, user} from 'src/stores/auth'
  import Toasts from 'src/components/Toasts.svelte'
  import {activePath, Link, Route, Router} from '@keksworks/svelte-tiny-router'
  import HomePage from 'src/pages/HomePage.svelte'
  import NotFoundPage from 'src/pages/NotFoundPage.svelte'
  import LoginPage from 'src/pages/login/LoginPage.svelte'
  import Icon from 'src/icons/Icon.svelte'
  import JamPage from 'src/pages/jam/JamPage.svelte'
  import SharePage from 'src/pages/share/SharePage.svelte'

  const pages = {
    '/': {title: t.home.title, component: HomePage},
  }
</script>

<svelte:head>
  <title>{t.title} – {t.home.tagline}</title>
</svelte:head>

<Toasts/>

<menu class="sticky top-0 z-30 flex gap-4 px-4 py-3 items-center bg-surface border-b border-gray-200">
  <Link to="/" class="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-950 hover:text-gray-950 dark:text-gray-950 dark:hover:text-gray-950">
    <span class="bg-primary-600 text-white rounded-md p-1.5 flex"><Icon name="music"/></span>
    {t.title}
  </Link>
  <span class="ml-auto">
    {#if $user}
      <span class="flex items-center gap-2">
        {#if $user.avatarUrl}
          <img src={$user.avatarUrl} alt="" class="w-7 h-7 rounded-full">
        {/if}
        <span class="text-sm text-gray-600">{$user.name}</span>
        <button class="btn outlined text-sm" on:click={logout}>{t.login.logout}</button>
      </span>
    {:else if $activePath !== '/login'}
<!--      <LoginButton redirect={location.pathname} class="default"/>-->
    {/if}
  </span>
</menu>

<main class="p-4">
  <Router routes={pages}>
    <Route path="/login" component={LoginPage}/>
    <Route path="/share" component={SharePage}/>
    <Route path="/:code" let:code><JamPage {code}/></Route>
    <Route component={NotFoundPage}/>
  </Router>
</main>
