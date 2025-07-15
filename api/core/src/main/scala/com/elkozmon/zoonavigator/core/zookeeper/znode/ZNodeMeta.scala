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

package com.elkozmon.zoonavigator.core.zookeeper.znode

import org.apache.zookeeper.data.Stat

import java.time.Instant

final case class ZNodeMeta(
  creationId: Long,
  creationTime: Instant,
  modifiedId: Long,
  modifiedTime: Instant,
  dataLength: Int,
  dataVersion: ZNodeDataVersion,
  aclVersion: ZNodeAclVersion,
  childrenVersion: ZNodeChildrenVersion,
  childrenNumber: Int,
  ephemeralOwner: Long
)

object ZNodeMeta {

  def fromStat(stat: Stat): ZNodeMeta = ZNodeMeta(
    creationId = stat.getCzxid,
    creationTime = Instant.ofEpochMilli(stat.getCtime),
    modifiedId = stat.getMzxid,
    modifiedTime = Instant.ofEpochMilli(stat.getMtime),
    dataLength = stat.getDataLength,
    dataVersion = ZNodeDataVersion(stat.getVersion),
    aclVersion = ZNodeAclVersion(stat.getAversion),
    childrenVersion = ZNodeChildrenVersion(stat.getCversion),
    childrenNumber = stat.getNumChildren,
    ephemeralOwner = stat.getEphemeralOwner
  )
}
