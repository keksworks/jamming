package songs

import auth.Public
import klite.annotations.GET
import klite.annotations.POST
import klite.annotations.QueryParam
import klite.jdbc.NoTransaction
import klite.logger
import klite.warn
import lyrics.LrcLibClient

@Public
class SongRoutes(private val repository: SongRepository, private val lrcLib: LrcLibClient) {
  private val log = logger()

  /** Own songs (with chords) first, then lyrics from LRCLIB; no transaction to avoid holding DB connection while waiting for LRCLIB */
  @GET @NoTransaction fun search(@QueryParam q: String): List<Song> {
    val own = repository.search(q)
    val lyrics = try { lrcLib.search(q) } catch (e: Exception) { log.warn("LRCLIB search failed: $e"); emptyList() }
    return own + lyrics.filter { l -> own.none { it.isSame(l) } }
  }

  /** Same title & artist is updated, previous versions are kept in change_history */
  @POST fun save(song: Song) = song.copy(id = repository.bySame(song)?.id ?: song.id).also { repository.save(it) }
}
