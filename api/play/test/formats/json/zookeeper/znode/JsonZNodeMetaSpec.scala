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

import org.scalatest.FlatSpec
import play.api.libs.json._

import com.elkozmon.zoonavigator.core.zookeeper.znode._

import java.time.Instant
import scala.language.postfixOps

class JsonZNodeMetaSpec extends FlatSpec with JsonZNodeMeta {

  private val zNodeMeta =
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

  "Serialized JsonZNodeMeta" should "be a JSON object with 'creationId' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "creationId" isDefined)
  }

  it should "be a JSON object with 'creationTime' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "creationTime" isDefined)
  }

  it should "be a JSON object with 'modifiedId' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "modifiedId" isDefined)
  }

  it should "be a JSON object with 'modifiedTime' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "modifiedTime" isDefined)
  }

  it should "be a JSON object with 'dataLength' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "dataLength" isDefined)
  }

  it should "be a JSON object with 'dataVersion' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "dataVersion" isDefined)
  }

  it should "be a JSON object with 'aclVersion' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "aclVersion" isDefined)
  }

  it should "be a JSON object with 'childrenVersion' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "childrenVersion" isDefined)
  }

  it should "be a JSON object with 'childrenNumber' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "childrenNumber" isDefined)
  }

  it should "be a JSON object with 'ephemeralOwner' field" in {
    val j = Json.toJson(zNodeMeta)

    assert(j \ "ephemeralOwner" isDefined)
  }
}
