package jams

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.verbs.expect
import db.TestData.member
import db.TestData.song
import klite.NotFoundException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.time.Duration.Companion.ZERO

class JamHubTest {
  val hub = JamHub()
  val jam = hub.create()
  val received = mutableListOf<Jam>()

  @Test fun `create & get case-insensitively`() {
    expect(hub[jam.code.lowercase()]).toEqual(jam)
    assertThrows<NotFoundException> { hub["XXXX"] }
  }

  @Test fun `join, receive updates & leave`() {
    val leave = hub.join(jam.code, member) { received += it }
    expect(received.last().members).toEqual(listOf(member))

    val updated = hub.update(jam.code) { it.play(song) }
    expect(received.last()).toEqual(updated)
    expect(hub[jam.code]).toEqual(updated)

    leave()
    expect(hub[jam.code].members).toEqual(emptyList())
    hub.update(jam.code) { it }
    expect(received.size).toEqual(2)
  }

  @Test fun `idle jams without members are removed on create`() {
    val hub = JamHub(maxIdle = ZERO)
    val idle = hub.create()
    val active = hub.create()
    hub.join(active.code, member) {}
    hub.create()
    assertThrows<NotFoundException> { hub[idle.code] }
    expect(hub[active.code].members).toEqual(listOf(member))
  }
}
