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

import play.api.libs.json._

import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeMeta

import java.time.ZoneId
import java.time.format.DateTimeFormatter

trait JsonZNodeMeta {

  implicit object ZNodeMetaWrites extends Writes[ZNodeMeta] {

    private val isoDateTimeFormatter = DateTimeFormatter.ISO_DATE_TIME

    private val utcTimeZone = ZoneId.of("UTC")

    override def writes(o: ZNodeMeta): JsValue =
      Json.obj(
        "creationId"      -> o.creationId,
        "creationTime"    -> isoDateTimeFormatter.format(o.creationTime.atZone(utcTimeZone)),
        "modifiedId"      -> o.modifiedId,
        "modifiedTime"    -> isoDateTimeFormatter.format(o.modifiedTime.atZone(utcTimeZone)),
        "dataLength"      -> o.dataLength,
        "dataVersion"     -> o.dataVersion.version,
        "aclVersion"      -> o.aclVersion.version,
        "childrenVersion" -> o.childrenVersion.version,
        "childrenNumber"  -> o.childrenNumber,
        "ephemeralOwner"  -> o.ephemeralOwner
      )
  }

}
