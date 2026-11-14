import {writable} from 'svelte/store'

/** Chrome-specific event, not in TypeScript DOM types */
export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{outcome: 'accepted'|'dismissed'}>
}

/** Browser may offer installing the app before any page is shown, so the offer is kept here for later */
export const installPrompt = writable<InstallPromptEvent|undefined>()

export function listenForInstallPrompt() {
  addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    installPrompt.set(e as InstallPromptEvent)
  })
  addEventListener('appinstalled', () => installPrompt.set(undefined))
}
