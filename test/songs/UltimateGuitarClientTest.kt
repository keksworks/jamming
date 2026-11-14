package songs

import ch.tutteli.atrium.api.fluent.en_GB.toEqual
import ch.tutteli.atrium.api.verbs.expect
import db.Id
import io.mockk.every
import io.mockk.mockk
import klite.BadRequestException
import klite.json.JsonMapper
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpResponse

class UltimateGuitarClientTest {
  val http = mockk<HttpClient>()
  val client = UltimateGuitarClient(http, JsonMapper())

  fun respond(url: String, data: String) = every { http.send(match { it.uri().toString() == url }, any<HttpResponse.BodyHandler<String>>()) } returns mockk {
    every { statusCode() } returns 200
    every { body() } returns """<html><div class="js-store" data-content="${"""{"store":{"page":{"data":$data}}}""".replace("&", "&amp;").replace("\"", "&quot;")}"></div></html>"""
  }

  @Test fun `search returns best voted chords per song`() {
    respond("https://www.ultimate-guitar.com/search.php?search_type=title&value=let%20it%20be", """{"results":[
      {"song_name":"Let It Be","artist_name":"The Beatles","marketing_type":"official","tab_url":"https://www.ultimate-guitar.com/pro/?tab_id=1"},
      {"song_name":"Let It Be","artist_name":"The Beatles","type":"Chords","votes":100,"tonality_name":"C","tab_url":"https://tabs.ultimate-guitar.com/tab/1"},
      {"song_name":"Let It Be","artist_name":"The Beatles","type":"Chords","votes":2000,"tonality_name":"C","tab_url":"https://tabs.ultimate-guitar.com/tab/2"},
      {"song_name":"Let It Be","artist_name":"The Beatles","type":"Tabs","votes":5000,"tab_url":"https://tabs.ultimate-guitar.com/tab/3"},
      {"song_name":"Let It Be Me","artist_name":"Everly Brothers","type":"Chords","votes":300,"tonality_name":"","tab_url":"https://tabs.ultimate-guitar.com/tab/4"}
    ]}""")
    expect(client.search("let it be").map { it.copy(id = TestId) }).toEqual(listOf(
      Song("Let It Be", "", "The Beatles", "C", URI("https://tabs.ultimate-guitar.com/tab/2"), TestId),
      Song("Let It Be Me", "", "Everly Brothers", null, URI("https://tabs.ultimate-guitar.com/tab/4"), TestId)
    ))
  }

  @Test fun `chords without markup, with capo`() {
    val url = URI("https://tabs.ultimate-guitar.com/tab/2")
    respond(url.toString(), """{"tab":{"song_name":"Let It Be","artist_name":"The Beatles","tonality_name":"C"},
      "tab_view":{"meta":{"capo":2},"wiki_tab":{"content":"[Verse]\r\n[tab][ch]C[/ch]    [ch]G[/ch]\r\nWhen I find[/tab]"}}}""")
    expect(client.chords(url).copy(id = TestId)).toEqual(Song("Let It Be", "{c: Capo 2}\n[Verse]\nC    G\nWhen I find", "The Beatles", "C", url, TestId))
  }

  @Test fun `chords only from Ultimate Guitar`() {
    assertThrows<BadRequestException> { client.chords(URI("https://example.com/tab/2")) }
    assertThrows<BadRequestException> { client.chords(URI("http://tabs.ultimate-guitar.com/tab/2")) }
  }

  @Test fun unescapeHtml() {
    expect(unescapeHtml("&quot;Rock &amp; Roll&quot; &#039;n&#39; &lt;3")).toEqual("\"Rock & Roll\" 'n' <3")
  }

  companion object {
    val TestId = Id<Song>(1)
  }
}
