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

package api.formats.json.config

import api.formats.json.zookeeper.JsonConnectionString
import config.ApplicationConfig
import config.ApplicationConfig.Connection
import play.api.libs.functional.syntax._
import play.api.libs.json._
import zookeeper.ConnectionString

import scala.concurrent.duration.FiniteDuration

trait JsonApplicationConfig extends JsonConnectionString with DefaultWrites {

  private implicit val connectionOWrites: OWrites[Connection] =
    (
      (JsPath \ "id").write[String] and
        (JsPath \ "name").writeNullable[String] and
        (JsPath \ "connectionString").write[ConnectionString]
    )((c: Connection) => (c.id, c.name, c.connectionString))

  implicit val applicationConfigOWrites: OWrites[ApplicationConfig] =
    (
      (JsPath \ "requestTimeoutMillis").write[Long].contramap[FiniteDuration](_.toMillis) and
        (JsPath \ "autoConnect").writeNullable[String] and
        (JsPath \ "connections").write[List[Connection]]
    )(unlift(ApplicationConfig.unapply))
}
