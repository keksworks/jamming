package jams

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.fluent.en_GB.toMatch
import ch.tutteli.atrium.api.verbs.expect
import db.TestData.jam
import db.TestData.member
import db.TestData.song
import db.TestData.suggestion
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.Instant

class JamTest {
  val playing = jam.copy(playback = Playback(startedAt = Instant.now()), suggestions = listOf(suggestion))

  @Test fun `random code`() {
    expect(randomCode()).toMatch(Regex("[B-Z]{4}"))
  }

  @Test fun `suggestion needs song or key`() {
    assertThrows<IllegalArgumentException> { Suggestion(member.name) }
  }

  @Test fun `vote toggles`() {
    val voted = playing.vote(suggestion.id, member.id)
    expect(voted.suggestions).toEqual(listOf(suggestion.copy(votes = setOf(member.id))))
    expect(voted.vote(suggestion.id, member.id)).toEqual(playing)
  }

  @Test fun `accept song suggestion plays it in its key and stops playback`() {
    expect(playing.accept(suggestion.id)).toEqual(jam.copy(song = suggestion.song, key = "G"))
  }

  @Test fun `accept song suggestion with another key`() {
    val withKey = playing.copy(suggestions = listOf(suggestion.copy(key = "A")))
    expect(withKey.accept(suggestion.id)).toEqual(jam.copy(song = suggestion.song, key = "A"))
  }

  @Test fun `accept key suggestion keeps song playing`() {
    val keyOnly = playing.copy(suggestions = listOf(suggestion.copy(song = null, key = "D")))
    expect(keyOnly.accept(suggestion.id)).toEqual(playing.copy(key = "D", suggestions = emptyList()))
  }

  @Test fun `play song`() {
    expect(jam.play(song.copy(key = "E"))).toEqual(jam.copy(song = song.copy(key = "E"), key = "E"))
  }
}
