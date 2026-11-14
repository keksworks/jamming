package songs

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.verbs.expect
import db.BaseMocks
import db.Id
import db.TestData.song
import io.mockk.every
import io.mockk.verify
import org.junit.jupiter.api.Test
import java.net.URI

class SongRoutesTest: BaseMocks() {
  val routes = SongRoutes(songRepository, ultimateGuitarClient, lrcLibClient)
  val chords = song.copy(title = "LET IT BE", sheet = "", url = URI("https://tabs.ultimate-guitar.com/tab/1"), id = Id())
  val otherChords = chords.copy(title = "Let It Be Me", id = Id())
  val lyrics = song.copy(title = "Let it be", sheet = "When I find myself", key = null, id = Id())
  val otherLyrics = lyrics.copy(title = "Let It Bleed", id = Id())

  @Test fun `search returns own songs first, then chords and lyrics not found before`() {
    every { songRepository.search("let it be") } returns listOf(song)
    every { ultimateGuitarClient.search("let it be") } returns listOf(chords, otherChords)
    every { lrcLibClient.search("let it be") } returns listOf(lyrics, otherLyrics.copy(title = "let it be me"), otherLyrics)
    expect(routes.search("let it be")).toEqual(listOf(song, otherChords, otherLyrics))
  }

  @Test fun `search works without external sites`() {
    every { songRepository.search("let it be") } returns listOf(song)
    every { ultimateGuitarClient.search("let it be") } throws RuntimeException("blocked")
    every { lrcLibClient.search("let it be") } throws RuntimeException("timeout")
    expect(routes.search("let it be")).toEqual(listOf(song))
  }

  @Test fun `load Ultimate Guitar chords`() {
    every { ultimateGuitarClient.chords(chords.url!!) } returns chords
    expect(routes.ultimateGuitar(chords.url!!)).toEqual(chords)
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

class SongSuggestionRoutesTest: BaseMocks() {
  @Test fun `suggests only own songs`() {
    every { songRepository.search("let", 8) } returns listOf(song)
    expect(SongSuggestionRoutes(songRepository).suggest("let")).toEqual(listOf(song))
    verify(exactly = 0) { ultimateGuitarClient.search(any()) }
  }
}
