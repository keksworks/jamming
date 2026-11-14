package jams

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.verbs.expect
import db.BaseMocks
import db.TestData
import db.TestData.member
import db.TestData.song
import io.mockk.every
import io.mockk.verify
import klite.NotFoundException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.time.Duration.Companion.ZERO

class JamHubTest: BaseMocks() {
  val hub = JamHub(jamRepository)
  val jam = hub.create()
  val received = mutableListOf<Jam>()

  @Test fun `create, store & get case-insensitively`() {
    verify { jamRepository.save(jam) }
    expect(hub[jam.code.lowercase()]).toEqual(jam)
    assertThrows<NotFoundException> { hub["XXXX"] }
  }

  @Test fun `jam not in memory is loaded from DB after restart`() {
    every { jamRepository.get(TestData.jam.code) } returns TestData.jam
    expect(hub[TestData.jam.code.lowercase()]).toEqual(TestData.jam)
    expect(hub.update(TestData.jam.code) { it.copy(key = "D") }.key).toEqual("D")
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

  @Test fun `only changes to song, key, playback or suggestions are stored, not members`() {
    hub.join(jam.code, member) {}
    verify(exactly = 1) { jamRepository.save(any()) }
    val updated = hub.update(jam.code) { it.play(song) }
    verify { jamRepository.save(updated) }
  }

  @Test fun `idle jams without members are removed from memory on create, old ones from DB`() {
    val hub = JamHub(jamRepository, maxIdleInMemory = ZERO)
    val idle = hub.create()
    val active = hub.create()
    hub.join(active.code, member) {}
    hub.create()
    assertThrows<NotFoundException> { hub[idle.code] }
    expect(hub[active.code].members).toEqual(listOf(member))
    verify { jamRepository.deleteIdle(any()) }
  }
}
