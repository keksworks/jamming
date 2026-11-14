package jams

import klite.NotFoundException
import java.time.Instant.now
import java.util.concurrent.ConcurrentHashMap
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.hours
import kotlin.time.toJavaDuration

typealias JamListener = (Jam) -> Unit

/**
 * Live jams are kept in memory and broadcast to all listeners on every change.
 * Changes are also stored in DB, so jams survive restarts and are loaded back on first access.
 */
class JamHub(
  private val repository: JamRepository,
  private val maxIdleInMemory: Duration = 12.hours,
  private val maxIdleInDB: Duration = 30.days
) {
  private val jams = ConcurrentHashMap<String, Jam>()
  private val listeners = ConcurrentHashMap<String, MutableSet<JamListener>>()

  fun create(): Jam {
    removeIdle()
    return generateSequence { Jam() }.first { repository.get(it.code) == null && jams.putIfAbsent(it.code, it) == null }
      .also { repository.save(it) }
  }

  operator fun get(code: String) = load(code.uppercase()) ?: throw NotFoundException(code)

  private fun load(code: String): Jam? = jams[code] ?: repository.get(code)?.let { jams.putIfAbsent(code, it) ?: it }

  fun update(code: String, change: (Jam) -> Jam): Jam = get(code).let { loaded ->
    jams.computeIfPresent(loaded.code) { _, jam ->
      change(jam).copy(updatedAt = now()).also { updated ->
        if (updated.copy(members = jam.members, updatedAt = jam.updatedAt) != jam) repository.save(updated)
        listeners[updated.code]?.forEach { it(updated) }
      }
    } ?: throw NotFoundException(code)
  }

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
    val idleSince = now() - maxIdleInMemory.toJavaDuration()
    jams.values.removeIf { it.members.isEmpty() && it.updatedAt < idleSince }
    listeners.keys.retainAll(jams.keys)
    repository.deleteIdle(now() - maxIdleInDB.toJavaDuration())
  }
}
