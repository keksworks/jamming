package songs

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.verbs.expect
import db.DBTest
import db.Id
import db.TestData.song
import org.junit.jupiter.api.Test

class SongRepositoryTest: DBTest() {
  val repository = SongRepository(db)

  @Test fun `save & search by words in title or artist`() {
    repository.save(song)
    expect(repository.get(song.id)).toEqual(song)
    expect(repository.search("let BEATLES")).toEqual(listOf(song))
    expect(repository.search("let stones")).toEqual(emptyList())
  }

  @Test fun `bySame ignores case`() {
    repository.save(song)
    expect(repository.bySame(song.copy(title = "LET IT BE", artist = "the beatles", id = Id()))).toEqual(song)
    expect(repository.bySame(song.copy(artist = null))).toEqual(null)
  }
}
