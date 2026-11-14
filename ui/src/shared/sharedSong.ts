import type {Song} from 'src/api/types'

/** Song draft from Web Share Target params, e.g. title "LET IT BE CHORDS by The Beatles @ Ultimate-Guitar.Com" */
export function sharedSong(params: URLSearchParams) {
  const title = (params.get('title') ?? '').replace(/\s+[@|]\s+.*$/, '')
  const [, name, artist] = title.match(/^(.*?)\s+(?:chords|tabs?)\s+by\s+(.+)$/i) ?? [, title.replace(/\s+(chords|tabs?)$/i, '')]
  const sheet = (params.get('text') ?? '').replace(/\s*https?:\/\/\S+\s*$/, '')
  return {title: name, artist, sheet} as Song
}
