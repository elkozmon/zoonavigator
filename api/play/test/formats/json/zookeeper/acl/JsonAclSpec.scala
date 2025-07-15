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

package api.formats.json.zookeeper.acl

import org.scalatest.FlatSpec
import play.api.libs.json._

import com.elkozmon.zoonavigator.core.utils.CommonUtils._
import com.elkozmon.zoonavigator.core.zookeeper.acl.Acl
import com.elkozmon.zoonavigator.core.zookeeper.acl.AclId
import com.elkozmon.zoonavigator.core.zookeeper.acl.Permission

import scala.language.postfixOps

class JsonAclSpec extends FlatSpec with JsonAcl {

  private val acl =
    Acl(AclId("world", "anyone"), Permission.All)

  private val stringAcl =
    """{"id":"anyone","scheme":"world","permissions":[]}"""

  "Serialized JsonAcl" should "be a JSON object with 'id' field" in {
    val j = Json.toJson(acl)

    assert(j \ "id" isDefined)
  }

  it should "be a JSON object with 'scheme' field" in {
    val j = Json.toJson(acl)

    assert(j \ "scheme" isDefined)
  }

  it should "be a JSON object with 'permissions' field" in {
    val j = Json.toJson(acl)

    assert(j \ "permissions" isDefined)
  }

  "JsonAcl" should "be able to deserialize simple Acl" in {
    val j = implicitly[Reads[Acl]].reads(Json.parse(stringAcl))

    assert(j.isSuccess).discard()

    j.foreach { acl =>
      assertResult("anyone")(acl.aclId.id).discard()
      assertResult("world")(acl.aclId.scheme).discard()
    }
  }
}
