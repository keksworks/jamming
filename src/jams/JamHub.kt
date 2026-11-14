package jams

import klite.NotFoundException
import java.time.Instant.now
import java.util.concurrent.ConcurrentHashMap
import kotlin.time.Duration
import kotlin.time.Duration.Companion.hours
import kotlin.time.toJavaDuration

typealias JamListener = (Jam) -> Unit

/** Live jams are kept in memory and broadcast to all listeners on every change */
class JamHub(private val maxIdle: Duration = 12.hours) {
  private val jams = ConcurrentHashMap<String, Jam>()
  private val listeners = ConcurrentHashMap<String, MutableSet<JamListener>>()

  fun create(): Jam {
    removeIdle()
    return generateSequence { Jam() }.first { jams.putIfAbsent(it.code, it) == null }
  }

  operator fun get(code: String) = jams[code.uppercase()] ?: throw NotFoundException(code)

  fun update(code: String, change: (Jam) -> Jam) =
    jams.computeIfPresent(code.uppercase()) { _, jam ->
      change(jam).copy(updatedAt = now()).also { updated -> listeners[updated.code]?.forEach { it(updated) } }
    } ?: throw NotFoundException(code)

  /** Adds member and starts sending updates to listener, returns function to leave */
  fun join(code: String, member: Member, listener: JamListener): () -> Unit {
    val jam = get(code)
    listeners.computeIfAbsent(jam.code) { ConcurrentHashMap.newKeySet() } += listener
    update(jam.code) { it.copy(members = it.members + member) }
    return {
      listeners[jam.code]?.remove(listener)
      update(jam.code) { it.copy(members = it.members - member) }
    }
  }

  private fun removeIdle() {
    val idleSince = now() - maxIdle.toJavaDuration()
    jams.values.removeIf { it.members.isEmpty() && it.updatedAt < idleSince }
    listeners.keys.retainAll(jams.keys)
  }
}
