package lyrics

import auth.Public
import klite.Registry
import klite.annotations.GET
import klite.annotations.QueryParam
import klite.json.JsonHttpClient
import klite.urlEncodeParams

data class Lyrics(val id: Long, val trackName: String, val artistName: String, val plainLyrics: String? = null)

/** Free & open lyrics database: https://lrclib.net/docs */
class LrcLibClient(registry: Registry): JsonHttpClient("https://lrclib.net/api", { setHeader("User-Agent", "Jamming.me") }, registry = registry) {
  fun search(q: String) = get<List<Lyrics>>("/search?" + urlEncodeParams("q" to q)).filter { it.plainLyrics != null }.take(20)
}

@Public
class LyricsRoutes(private val lrcLib: LrcLibClient) {
  @GET fun search(@QueryParam q: String) = lrcLib.search(q)
}
