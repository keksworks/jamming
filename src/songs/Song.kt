package songs

import db.Entity
import db.Id

data class Song(
  val title: String,
  /** ChordPro-style text: chords in square brackets inline with lyrics, e.g. `[Am]Hello [F]world` */
  val sheet: String,
  val artist: String? = null,
  val key: String? = null,
  override val id: Id<Song> = Id()
): Entity<Song> {
  init { require(title.length <= 200 && (artist?.length ?: 0) <= 200 && sheet.length <= 20000) { "Too long" } }

  fun isSame(other: Song) = title.equals(other.title, true) && (artist ?: "").equals(other.artist ?: "", true)
}
