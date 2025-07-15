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

package api.formats

import api.formats.json.api.JsonApiResponse
import api.formats.json.cats.JsonCofree
import api.formats.json.config.JsonApplicationConfig
import api.formats.json.zookeeper._
import api.formats.json.zookeeper.acl.JsonAcl
import api.formats.json.zookeeper.znode._

object Json
    extends JsonApiResponse
    with JsonApplicationConfig
    with JsonZNodeWithChildren
    with JsonZNodeMetaWith
    with JsonZNodeMeta
    with JsonZNodeChildren
    with JsonZNode
    with JsonConnectionParams
    with JsonConnectionId
    with JsonConnectionName
    with JsonAcl
    with JsonZNodeExport
    with JsonCofree
