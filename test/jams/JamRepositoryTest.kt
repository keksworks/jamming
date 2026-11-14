package jams

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.verbs.expect
import db.DBTest
import db.TestData.jam
import db.TestData.member
import db.TestData.suggestion
import org.junit.jupiter.api.Test
import java.time.Instant

class JamRepositoryTest: DBTest() {
  val repository = JamRepository(db)
  val stored = jam.copy(
    key = "D", playback = Playback(120, 2, Instant.parse("2026-01-01T10:00:00.123Z")),
    suggestions = listOf(suggestion.copy(votes = setOf(member.id))), updatedAt = Instant.parse("2026-01-01T10:00:00Z"))

  @Test fun `save & get without members`() {
    repository.save(stored.copy(members = listOf(member)))
    expect(repository.get(jam.code)).toEqual(stored)
    expect(repository.get("XXXX")).toEqual(null)

    repository.save(stored.copy(song = null))
    expect(repository.get(jam.code)).toEqual(stored.copy(song = null))
  }

  @Test fun deleteIdle() {
    repository.save(stored)
    repository.deleteIdle(stored.updatedAt)
    expect(repository.get(jam.code)).toEqual(stored)
    repository.deleteIdle(stored.updatedAt.plusSeconds(1))
    expect(repository.get(jam.code)).toEqual(null)
  }
}
