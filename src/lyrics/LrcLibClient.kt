package lyrics

import klite.Registry
import klite.json.JsonHttpClient
import klite.urlEncodeParams
import songs.Song
import java.time.Duration

data class Lyrics(val id: Long, val trackName: String, val artistName: String, val plainLyrics: String? = null) {
  fun toSong() = Song(trackName, plainLyrics!!, artistName)
}

/** Free & open lyrics database: https://lrclib.net/docs */
class LrcLibClient(registry: Registry): JsonHttpClient("https://lrclib.net/api", {
  setHeader("User-Agent", "Jamming.me")
  timeout(Duration.ofSeconds(5))
}, registry = registry) {
  fun search(q: String) = get<List<Lyrics>>("/search?" + urlEncodeParams("q" to q)).filter { it.plainLyrics != null }.take(20).map { it.toSong() }
}
