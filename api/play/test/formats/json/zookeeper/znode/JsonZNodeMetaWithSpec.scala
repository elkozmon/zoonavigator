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

package api.formats.json.zookeeper.znode

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.Assertions
import play.api.libs.json._

import com.elkozmon.zoonavigator.core.zookeeper.znode._

import java.time.Instant
import scala.language.postfixOps

class JsonZNodeMetaWithSpec extends AnyFlatSpec with Assertions with JsonZNodeMetaWith {

  private val zNodeMetaWith =
    ZNodeMetaWith(
      "data",
      ZNodeMeta(
        0L,
        Instant.now(),
        0L,
        Instant.now(),
        0,
        ZNodeDataVersion(0L),
        ZNodeAclVersion(0L),
        ZNodeChildrenVersion(0L),
        0,
        0L
      )
    )

  "Serialized JsonZNodeMetaWith" should "be a JSON object with 'data' field" in {
    val j = Json.toJson(zNodeMetaWith)

    assert(j \ "data" isDefined)
  }

  it should "be a JSON object with 'meta' field" in {
    val j = Json.toJson(zNodeMetaWith)

    assert(j \ "meta" isDefined)
  }
}
