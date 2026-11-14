package jams

import klite.jdbc.*
import java.sql.ResultSet
import java.time.Instant
import javax.sql.DataSource

/** Members are not stored, as they are live connections that rejoin after restart */
class JamRepository(db: DataSource): BaseRepository(db, "jams") {
  fun get(code: String) = db.select(table, "code" to code) { toJam() }.firstOrNull()

  fun save(jam: Jam) = db.upsert(table, mapOf(
    "code" to jam.code,
    "song" to jsonb(jam.song),
    "key" to jam.key,
    "playback" to jsonb(jam.playback),
    "suggestions" to jsonb(jam.suggestions),
    "updatedAt" to jam.updatedAt
  ), setOf("code"))

  fun deleteIdle(since: Instant) = db.delete(table, "updatedAt" lt since)

  private fun ResultSet.toJam() = Jam(getString("code"), getJsonOrNull("song"), getString("key"),
    getJson("playback"), suggestions = getJson("suggestions"), updatedAt = getInstant("updatedAt"))
}
