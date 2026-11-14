package songs

import auth.Public
import klite.annotations.GET
import klite.annotations.POST
import klite.annotations.QueryParam
import klite.jdbc.NoTransaction
import klite.logger
import klite.warn
import lyrics.LrcLibClient
import java.net.URI
import java.util.concurrent.Executors

@Public
class SongRoutes(private val repository: SongRepository, private val ultimateGuitar: UltimateGuitarClient, private val lrcLib: LrcLibClient) {
  private val log = logger()

  /**
   * Own songs first, then chords from Ultimate Guitar, then lyrics from LRCLIB (external ones are searched in parallel, skipping failures).
   * No transaction to avoid holding DB connection while waiting for external sites.
   */
  @GET @NoTransaction fun search(@QueryParam q: String): List<Song> = Executors.newVirtualThreadPerTaskExecutor().use { executor ->
    val chords = executor.submit<List<Song>> { tryOrEmpty("Ultimate Guitar") { ultimateGuitar.search(q) } }
    val lyrics = executor.submit<List<Song>> { tryOrEmpty("LRCLIB") { lrcLib.search(q) } }
    listOf(repository.search(q), chords.get(), lyrics.get()).fold(emptyList()) { found, more -> found + more.filter { m -> found.none { it.isSame(m) } } }
  }

  /** Loads chords of a song found by [search] */
  @GET("/ultimate-guitar") fun ultimateGuitar(@QueryParam url: URI) = ultimateGuitar.chords(url)

  private fun tryOrEmpty(source: String, search: () -> List<Song>) = try { search() } catch (e: Exception) {
    log.warn("$source search failed: $e")
    emptyList()
  }

  /** Same title & artist is updated, previous versions are kept in change_history */
  @POST fun save(song: Song) = song.copy(id = repository.bySame(song)?.id ?: song.id).also { repository.save(it) }
}

/** Quick suggestions from own songs while typing, cheap enough not to be rate limited */
@Public
class SongSuggestionRoutes(private val repository: SongRepository) {
  @GET fun suggest(@QueryParam q: String) = repository.search(q, limit = 8)
}
