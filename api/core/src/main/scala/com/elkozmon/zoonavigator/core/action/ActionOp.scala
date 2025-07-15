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

package com.elkozmon.zoonavigator.core.action

import cats.free.Cofree
import cats.free.Free

import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeAcl
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeAclVersion
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeChildren
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeData
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeDataVersion
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeExport
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeMeta
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeMetaWith
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodePath
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeWithChildren

// Algebra of operations of this program
sealed trait ActionOp[A] {
  lazy val free: ActionIO[A] = Free.liftF(this)
}

// format: off
final case class CreateZNodeAction(path: ZNodePath) 
    extends ActionOp[Unit]

final case class DuplicateZNodeRecursiveAction(source: ZNodePath, destination: ZNodePath) 
    extends ActionOp[Unit]

final case class GetZNodeAclAction(path: ZNodePath) 
    extends ActionOp[ZNodeMetaWith[ZNodeAcl]]

final case class GetZNodeChildrenAction(path: ZNodePath) 
    extends ActionOp[ZNodeMetaWith[ZNodeChildren]]

final case class GetZNodeDataAction(path: ZNodePath) 
    extends ActionOp[ZNodeMetaWith[ZNodeData]]

final case class GetZNodeMetaAction(path: ZNodePath) 
    extends ActionOp[ZNodeMeta]

final case class GetZNodeWithChildrenAction(path: ZNodePath) 
    extends ActionOp[ZNodeWithChildren]

final case class UpdateZNodeAclListAction(path: ZNodePath, acl: ZNodeAcl, aclVersion: ZNodeAclVersion) 
    extends ActionOp[ZNodeMeta]

final case class UpdateZNodeAclListRecursiveAction(path: ZNodePath, acl: ZNodeAcl, aclVersion: ZNodeAclVersion) 
    extends ActionOp[ZNodeMeta]

final case class UpdateZNodeDataAction(path: ZNodePath, data: ZNodeData, dataVersion: ZNodeDataVersion) 
    extends ActionOp[ZNodeMeta]

final case class MoveZNodeRecursiveAction(source: ZNodePath, destination: ZNodePath) 
    extends ActionOp[Unit]

final case class ExportZNodesAction(paths: Seq[ZNodePath]) 
    extends ActionOp[List[Cofree[List, ZNodeExport]]]

final case class ImportZNodesAction(path: ZNodePath, nodes: List[Cofree[List, ZNodeExport]]) 
    extends ActionOp[Unit]

final case class DeleteZNodeRecursiveAction(path: ZNodePath, dataVersion: ZNodeDataVersion) 
    extends ActionOp[Unit]

final case class ForceDeleteZNodeRecursiveAction(paths: Seq[ZNodePath]) 
    extends ActionOp[Unit]
