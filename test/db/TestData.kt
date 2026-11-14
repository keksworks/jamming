package db

import jams.Jam
import jams.Member
import jams.Suggestion
import klite.Email
import songs.Song
import users.User

/** Immutable domain object samples for unit tests */
object TestData {
  val user = User("Test", "User", Email("test@example.com"), id = Id(123))
  val song = Song("Let It Be", "[C]When I find myself in [G]times of trouble", "The Beatles", "C", Id(789))
  val member = Member("m1", "Jane")
  val suggestion = Suggestion(member.name, song.copy(title = "Next song", key = "G"), id = Id(456))
  val jam = Jam("BCDF", song)
}
