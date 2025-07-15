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

package api.formats.json.zookeeper

import play.api.libs.json._
import zookeeper.ConnectionId

trait JsonConnectionId {

  implicit object ConnectionIdFormat extends Format[ConnectionId] {

    override def reads(json: JsValue): JsResult[ConnectionId] =
      json match {
        case JsString(connectionId) => JsSuccess(ConnectionId(connectionId))
        case _                      => JsError("Invalid connection id format")
      }

    override def writes(o: ConnectionId): JsValue =
      JsString(o.id)
  }
}
