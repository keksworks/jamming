package jams

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.verbs.expect
import db.BaseMocks
import db.TestData.member
import db.TestData.song
import db.TestData.suggestion
import org.junit.jupiter.api.Test

/** JamHub is mostly in-memory, so no need to mock it */
class JamRoutesTest: BaseMocks() {
  val routes = JamRoutes(JamHub(jamRepository))
  val jam = routes.create()

  @Test fun `play song, change key & suggest`() {
    expect(routes.play(jam.code, song)).toEqual(routes.get(jam.code))
    expect(routes.key(jam.code, "D").key).toEqual("D")
    expect(routes.key(jam.code).key).toEqual(null)

    routes.suggest(jam.code, suggestion)
    expect(routes.vote(jam.code, suggestion.id, member.id).suggestions).toEqual(listOf(suggestion.copy(votes = setOf(member.id))))
    expect(routes.accept(jam.code, suggestion.id).song).toEqual(suggestion.song)

    routes.suggest(jam.code, suggestion)
    expect(routes.remove(jam.code, suggestion.id).suggestions).toEqual(emptyList())
  }

  @Test fun playback() {
    val playback = Playback(120, 2)
    expect(routes.playback(jam.code, playback).playback).toEqual(playback)
  }
}
