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

import api.formats.json.zookeeper.acl.JsonAcl
import play.api.libs.json._

import com.elkozmon.zoonavigator.core.zookeeper.acl.Acl
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeAcl

trait JsonZNodeAcl extends JsonAcl {

  implicit object ZNodeAclFormat extends Format[ZNodeAcl] {

    override def writes(o: ZNodeAcl): JsValue =
      Json.toJson(o.aclList)

    override def reads(json: JsValue): JsResult[ZNodeAcl] =
      json.validate[List[Acl]].map(ZNodeAcl.apply)
  }

}
