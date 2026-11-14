package jams

import auth.Public
import db.Id
import klite.HttpExchange
import klite.annotations.*
import klite.jdbc.NoTransaction
import klite.sse.Event
import klite.sse.send
import klite.sse.startEventStream
import songs.Song
import java.io.IOException
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit.SECONDS

@Public
class JamRoutes(private val hub: JamHub) {
  @POST fun create() = hub.create()
  @GET("/:code") fun get(@PathParam code: String) = hub[code]

  @GET("/:code/events") @NoTransaction
  fun events(@PathParam code: String, @QueryParam memberId: String, @QueryParam name: String, e: HttpExchange) {
    val queue = LinkedBlockingQueue<Jam>()
    val leave = hub.join(code, Member(memberId, name), queue::put)
    try {
      e.startEventStream()
      while (true) e.send(queue.poll(15, SECONDS)?.let { Event(it) } ?: Event(name = "ping"))
    } catch (_: IOException) {
      // client disconnected
    } finally {
      leave()
    }
  }

  @PUT("/:code/song") fun play(@PathParam code: String, song: Song) = hub.update(code) { it.play(song) }
  @PUT("/:code/key") fun key(@PathParam code: String, @QueryParam key: String? = null) = hub.update(code) { it.copy(key = key) }
  @PUT("/:code/playback") fun playback(@PathParam code: String, playback: Playback) = hub.update(code) { it.copy(playback = playback) }

  @POST("/:code/suggestions") fun suggest(@PathParam code: String, suggestion: Suggestion) = hub.update(code) { it.suggest(suggestion) }
  @POST("/:code/suggestions/:id/vote") fun vote(@PathParam code: String, @PathParam id: Id<Suggestion>, @QueryParam memberId: String) = hub.update(code) { it.vote(id, memberId) }
  @POST("/:code/suggestions/:id/accept") fun accept(@PathParam code: String, @PathParam id: Id<Suggestion>) = hub.update(code) { it.accept(id) }
  @DELETE("/:code/suggestions/:id") fun remove(@PathParam code: String, @PathParam id: Id<Suggestion>) = hub.update(code) { it.remove(id) }
}
