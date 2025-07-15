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

import play.api.libs.functional.syntax._
import play.api.libs.json._

import com.elkozmon.zoonavigator.core.zookeeper.acl.Acl
import com.elkozmon.zoonavigator.core.zookeeper.acl.AclId
import com.elkozmon.zoonavigator.core.zookeeper.acl.Permission

trait JsonAcl extends JsonPermission {

  private final val IdKey          = "id"
  private final val SchemeKey      = "scheme"
  private final val PermissionsKey = "permissions"

  implicit object AclFormat extends Format[Acl] {

    private val aclIdReads: Reads[AclId] = (
      (JsPath \ SchemeKey).read[String] and (JsPath \ IdKey).read[String]
    )(AclId.apply _)

    private val aclReads: Reads[Acl] = (
      JsPath.read(aclIdReads) and (JsPath \ PermissionsKey).read[List[Permission]].map(_.toSet)
    )(Acl.apply _)

    override def reads(json: JsValue): JsResult[Acl] =
      json.validate(aclReads)

    override def writes(o: Acl): JsValue = {
      val jsonPermissions = o.permissions.toList

      Json
        .obj(
          IdKey          -> o.aclId.id.mkString,
          SchemeKey      -> o.aclId.scheme,
          PermissionsKey -> Json.toJson(jsonPermissions)
        )
    }
  }

}
