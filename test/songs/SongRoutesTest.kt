package songs

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.verbs.expect
import db.BaseMocks
import db.Id
import db.TestData.song
import io.mockk.every
import io.mockk.verify
import org.junit.jupiter.api.Test

class SongRoutesTest: BaseMocks() {
  val routes = SongRoutes(songRepository, lrcLibClient)
  val lyrics = song.copy(title = "Let it be", sheet = "When I find myself", key = null, id = Id())
  val other = song.copy(title = "Let It Be Me", sheet = "I bless the day", key = null, id = Id())

  @Test fun `search returns own songs first, then lyrics not already in own songs`() {
    every { songRepository.search("let it be") } returns listOf(song)
    every { lrcLibClient.search("let it be") } returns listOf(lyrics, other)
    expect(routes.search("let it be")).toEqual(listOf(song, other))
  }

  @Test fun `search works without LRCLIB`() {
    every { songRepository.search("let it be") } returns listOf(song)
    every { lrcLibClient.search("let it be") } throws RuntimeException("timeout")
    expect(routes.search("let it be")).toEqual(listOf(song))
  }

  @Test fun `save updates the same song`() {
    val edited = song.copy(sheet = "[D]Edited", id = Id())
    every { songRepository.bySame(edited) } returns song
    expect(routes.save(edited)).toEqual(edited.copy(id = song.id))
    verify { songRepository.save(edited.copy(id = song.id)) }
  }

  @Test fun `save new song`() {
    every { songRepository.bySame(song) } returns null
    expect(routes.save(song)).toEqual(song)
    verify { songRepository.save(song) }
  }
}
