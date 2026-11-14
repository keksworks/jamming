package songs

import klite.BadRequestException
import klite.Config
import klite.http.bodyOrThrow
import klite.http.get
import klite.json.JsonMapper
import klite.urlEncodeParams
import java.net.URI
import java.net.http.HttpClient
import kotlin.time.Duration.Companion.seconds
import kotlin.time.toJavaDuration

/**
 * Unofficial: Ultimate Guitar has no public API, so data is read from the JSON embedded in their pages.
 * May break if they change their pages, can be disabled with ULTIMATE_GUITAR=false.
 */
class UltimateGuitarClient(private val http: HttpClient, private val json: JsonMapper) {
  private val enabled = Config.optional("ULTIMATE_GUITAR", "true").toBoolean()

  /** Best voted community chords per song, without sheet: use [chords] to load it */
  fun search(q: String): List<Song> {
    if (!enabled) return emptyList()
    val results = page(URI("https://www.ultimate-guitar.com/search.php?" + urlEncodeParams("search_type" to "title", "value" to q))).at("results") as? List<*> ?: emptyList<Any>()
    return results.filter { it.at("type") == "Chords" }
      .groupBy { "${it.at("song_name")}|${it.at("artist_name")}".lowercase() }.values
      .map { versions -> versions.maxBy { (it.at("votes") as? Number)?.toInt() ?: 0 } }
      .sortedByDescending { (it.at("votes") as? Number)?.toInt() ?: 0 }.take(10)
      .map { Song(it.at("song_name").toString(), "", it.at("artist_name").toString(), (it.at("tonality_name") as? String)?.ifEmpty { null }, url = URI(it.at("tab_url").toString())) }
  }

  /** Sheet with chords above lyrics, `[ch]` markup removed (UI converts it to inline chords) */
  fun chords(url: URI): Song {
    if (url.scheme != "https" || url.host != "tabs.ultimate-guitar.com") throw BadRequestException("Not an Ultimate Guitar chords URL")
    val data = page(url)
    val tab = data.at("tab")
    val content = data.at("tab_view", "wiki_tab", "content").toString().replace("\r", "").replace(Regex("\\[/?(tab|ch)]"), "")
    val capo = (data.at("tab_view", "meta", "capo") as? Number)?.toInt() ?: 0
    return Song(tab.at("song_name").toString(), (if (capo > 0) "{c: Capo $capo}\n" else "") + content,
      tab.at("artist_name").toString(), (tab.at("tonality_name") as? String)?.ifEmpty { null }, url = url)
  }

  private fun page(url: URI): Any? {
    val html = http.get(url) {
      setHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36")
      timeout(5.seconds.toJavaDuration())
    }.bodyOrThrow()
    val store = Regex("""class="js-store" data-content="([^"]*)"""").find(html)?.groupValues?.get(1) ?: error("No data in $url")
    return json.parse<Any?>(unescapeHtml(store), null).at("store", "page", "data")
  }
}

private fun Any?.at(vararg path: String): Any? = path.fold(this) { o, key -> (o as? Map<*, *>)?.get(key) }

private val entities = mapOf("quot" to "\"", "amp" to "&", "lt" to "<", "gt" to ">", "apos" to "'")
fun unescapeHtml(s: String) = Regex("&(#?\\w+);").replace(s) { m ->
  val e = m.groupValues[1]
  if (e.startsWith("#")) e.drop(1).toInt().toChar().toString() else entities[e] ?: m.value
}
