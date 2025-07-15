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

import com.elkozmon.zoonavigator.core.zookeeper.acl.Permission

class JsonPermissionSpec extends FlatSpec with JsonPermission {

  "JsonPermission" should "serialize Create permission as a JSON string 'create'" in {
    val j = implicitly[Writes[Permission]].writes(Permission.Create)

    assertResult(JsString("create"))(j)
  }

  it should "serialize Write permission as a JSON string 'write'" in {
    val j = implicitly[Writes[Permission]].writes(Permission.Write)

    assertResult(JsString("write"))(j)
  }

  it should "serialize Delete permission as a JSON string 'delete'" in {
    val j = implicitly[Writes[Permission]].writes(Permission.Delete)

    assertResult(JsString("delete"))(j)
  }

  it should "serialize Read permission as a JSON string 'read'" in {
    val j = implicitly[Writes[Permission]].writes(Permission.Read)

    assertResult(JsString("read"))(j)
  }

  it should "serialize Admin permission as a JSON string 'admin'" in {
    val j = implicitly[Writes[Permission]].writes(Permission.Admin)

    assertResult(JsString("admin"))(j)
  }

  it should "deserialize 'create' string as Create permission" in {
    val j = implicitly[Reads[Permission]].reads(JsString("create"))

    assertResult(JsSuccess(Permission.Create))(j)
  }

  it should "deserialize 'write' string as Write permission" in {
    val j = implicitly[Reads[Permission]].reads(JsString("write"))

    assertResult(JsSuccess(Permission.Write))(j)
  }

  it should "deserialize 'delete' string as Delete permission" in {
    val j = implicitly[Reads[Permission]].reads(JsString("delete"))

    assertResult(JsSuccess(Permission.Delete))(j)
  }

  it should "deserialize 'read' string as Read permission" in {
    val j = implicitly[Reads[Permission]].reads(JsString("read"))

    assertResult(JsSuccess(Permission.Read))(j)
  }

  it should "deserialize 'admin' string as Admin permission" in {
    val j = implicitly[Reads[Permission]].reads(JsString("admin"))

    assertResult(JsSuccess(Permission.Admin))(j)
  }
}
