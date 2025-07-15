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

package com.elkozmon.zoonavigator.core.zookeeper.acl

import org.apache.zookeeper.data.ACL
import org.apache.zookeeper.data.Id

final case class Acl(aclId: AclId, permissions: Set[Permission])

object Acl {

  def fromZooKeeper(acl: ACL): Acl =
    Acl(AclId(acl.getId.getScheme, acl.getId.getId), Permission.fromZooKeeperMask(acl.getPerms))

  def toZooKeeper(acl: Acl): ACL =
    new ACL(Permission.toZooKeeperMask(acl.permissions), new Id(acl.aclId.scheme, acl.aclId.id))
}
