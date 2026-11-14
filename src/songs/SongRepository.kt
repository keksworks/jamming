package songs

import db.CrudRepository
import klite.jdbc.sql
import javax.sql.DataSource
import kotlin.reflect.KProperty1

class SongRepository(db: DataSource): CrudRepository<Song>(db, "songs") {
  /** All words must match title or artist */
  fun search(q: String, limit: Int = 20) = list(
    *q.split(" ").filter { it.isNotBlank() }.map { sql<KProperty1<Song, *>>("(title || ' ' || coalesce(artist, '')) ilike ?", "%$it%") }.toTypedArray(),
    suffix = "order by title limit $limit")

  fun bySame(song: Song) = by(sql("lower(title) = lower(?) and lower(coalesce(artist, '')) = lower(?)", song.title, song.artist ?: ""))
}
