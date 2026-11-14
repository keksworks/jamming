package lyrics

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.verbs.expect
import db.TestData.song
import io.mockk.every
import io.mockk.mockk
import klite.DependencyInjectingRegistry
import org.junit.jupiter.api.Test
import java.net.http.HttpClient
import java.net.http.HttpResponse

class LrcLibClientTest {
  val http = mockk<HttpClient>()
  val client = LrcLibClient(DependencyInjectingRegistry().apply {
    register(HttpClient::class, http)
  })

  @Test fun `search returns only songs with lyrics`() {
    every { http.send(match { it.uri().toString() == "https://lrclib.net/api/search?q=let%20it%20be" }, any<HttpResponse.BodyHandler<String>>()) } returns mockk {
      every { statusCode() } returns 200
      every { body() } returns """[{"id":1,"trackName":"Let It Be","artistName":"The Beatles","plainLyrics":"When I find myself","extra":1},
        {"id":2,"trackName":"Instrumental","artistName":"Some"}]"""
    }
    expect(client.search("let it be").map { it.copy(id = song.id) }).toEqual(listOf(song.copy(sheet = "When I find myself", key = null)))
  }
}
