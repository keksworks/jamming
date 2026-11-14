package jams

import db.Id
import songs.Song
import java.time.Instant
import java.time.Instant.now

data class Member(val id: String, val name: String)

data class Suggestion(
  val by: String,
  val song: Song? = null,
  val key: String? = null,
  val votes: Set<String> = emptySet(),
  val id: Id<Suggestion> = Id()
) {
  init { require(song != null || key != null) { "Either song or key must be suggested" } }

  fun toggleVote(memberId: String) = copy(votes = if (memberId in votes) votes - memberId else votes + memberId)
}

/** Shared beat: everyone computes current chord from [startedAt] (server clock), [bpm] and [beatsPerChord] */
data class Playback(val bpm: Int = 90, val beatsPerChord: Int = 4, val startedAt: Instant? = null)

data class Jam(
  val code: String = randomCode(),
  val song: Song? = null,
  /** Key to play the [song] in, transposed from its original key */
  val key: String? = null,
  val playback: Playback = Playback(),
  val members: List<Member> = emptyList(),
  val suggestions: List<Suggestion> = emptyList(),
  val updatedAt: Instant = now()
) {
  fun play(song: Song, key: String? = song.key) = copy(song = song, key = key, playback = playback.copy(startedAt = null))

  fun suggest(suggestion: Suggestion) = copy(suggestions = suggestions + suggestion)

  fun vote(id: Id<Suggestion>, memberId: String) = copy(suggestions = suggestions.map { if (it.id == id) it.toggleVote(memberId) else it })

  fun remove(id: Id<Suggestion>) = copy(suggestions = suggestions.filter { it.id != id })

  fun accept(id: Id<Suggestion>) = suggestions.first { it.id == id }.let { s ->
    (if (s.song != null) play(s.song, s.key ?: s.song.key) else copy(key = s.key)).remove(id)
  }
}

private const val codeChars = "BCDFGHJKLMNPQRSTVWXZ"
fun randomCode() = (1..4).map { codeChars.random() }.joinToString("")
