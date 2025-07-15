/*
 * Copyright (C) 2020  Ľuboš Kozmon <https://www.elkozmon.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package api.formats.json.cats

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.Assertions
import play.api.libs.json._

import cats.Eval
import cats.free.Cofree

class JsonCofreeSpec extends AnyFlatSpec with JsonCofree with Assertions {

  "JsonCofree" should "serialize simple integer tree" in {
    val c = Cofree(
      1,
      Eval.now(
        List(
          Cofree(2, Eval.now(List.empty[Cofree[List, Int]])),
          Cofree(3, Eval.now(List.empty[Cofree[List, Int]]))
        )
      )
    )
    val s = implicitly[Writes[Cofree[List, Int]]].writes(c)

    assertResult(expected = """{"h":1,"t":[{"h":2,"t":[]},{"h":3,"t":[]}]}""")(s.toString())
  }

  it should "deserialize simple integer tree" in {
    val s = """{"h":1,"t":[{"h":2,"t":[]},{"h":3,"t":[]}]}"""
    val c = implicitly[Reads[Cofree[List, Int]]].reads(Json.parse(s))
    val e = Cofree(
      1,
      Eval.now(
        List(
          Cofree(2, Eval.now(List.empty[Cofree[List, Int]])),
          Cofree(3, Eval.now(List.empty[Cofree[List, Int]]))
        )
      )
    )

    assertResult(expected = e)(c.get)
  }

  it should "deserialize list of integer trees" in {
    val s = """[{"h":1,"t":[]}, {"h":2,"t":[]}]"""
    val c = implicitly[Reads[List[Cofree[List, Int]]]].reads(Json.parse(s))
    val e = List(
      Cofree(1, Eval.now(List.empty[Cofree[List, Int]])),
      Cofree(2, Eval.now(List.empty[Cofree[List, Int]]))
    )

    assertResult(expected = e)(c.get)
  }
}
