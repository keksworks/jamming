/** Prevents screen from dimming while jamming, returns function to release */
export function keepScreenOn() {
  let lock: WakeLockSentinel|undefined
  async function request() {
    if (document.visibilityState == 'visible') lock = await navigator.wakeLock?.request('screen').catch(() => undefined)
  }
  request()
  document.addEventListener('visibilitychange', request)
  return () => {
    document.removeEventListener('visibilitychange', request)
    lock?.release()
  }
}
