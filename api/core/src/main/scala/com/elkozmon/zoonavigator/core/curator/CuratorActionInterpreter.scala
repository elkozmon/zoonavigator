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

package com.elkozmon.zoonavigator.core.curator

import cats.Applicative
import cats.Parallel
import cats.arrow.FunctionK
import cats.effect.Async
import cats.effect.Resource
import cats.free.Cofree
import cats.syntax.applicativeError._
import cats.syntax.flatMap._
import cats.syntax.functor._
import cats.syntax.reducible._
import cats.syntax.traverse._
import cats.~>

import com.elkozmon.zoonavigator.core.action._
import com.elkozmon.zoonavigator.core.curator.syntax.all._
import com.elkozmon.zoonavigator.core.utils.CommonUtils._
import com.elkozmon.zoonavigator.core.utils.ZooKeeperUtils
import com.elkozmon.zoonavigator.core.zookeeper.acl.Acl
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNode
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeAcl
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeAclVersion
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeDataVersion
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeExport
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeMeta
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodePath

import org.apache.curator.framework.CuratorFramework
import org.apache.curator.framework.api.CuratorEvent
import org.apache.curator.framework.api.transaction.CuratorOp
import org.apache.curator.utils.ZKPaths
import org.apache.zookeeper.KeeperException
import org.apache.zookeeper.KeeperException.Code

import scala.jdk.CollectionConverters._

class CuratorActionInterpreter[F[_]: Async: Parallel](
  curatorResource: Resource[F, CuratorFramework]
) extends ActionInterpreter[F] {

  def apply[A](action: ActionIO[A]): F[A] =
    curatorResource.use(c => action.foldMap(actionFolder(c)))

  private def actionFolder(curator: CuratorFramework): ActionOp ~> F =
    new FunctionK[ActionOp, F] {

      def createZNodeTree(tree: Cofree[List, ZNode]): F[Unit] = {
        val ops: Seq[CuratorOp] =
          tree.reduceMap((node: ZNode) => List(createZNodeOp(node)))

        curator
          .transaction()
          .forOperationsF(ops)
          .map(discard[CuratorEvent])
      }

      def deleteZNodeTrees(trees: List[Cofree[List, ZNodePath]]): F[Unit] = {
        val ops: Seq[CuratorOp] = trees
          .flatMap(_.reduceMap(path => List(deleteZNodeOp(path))))
          .reverse

        curator
          .transaction()
          .forOperationsF(ops)
          .map(discard[CuratorEvent])
      }

      def createZNodeOp(node: ZNode): CuratorOp =
        curator
          .transactionOp()
          .create()
          .withACL(node.acl.aclList.map(Acl.toZooKeeper).asJava)
          .forPath(node.path.path, node.data.bytes)

      def deleteZNodeOp(path: ZNodePath): CuratorOp =
        curator
          .transactionOp()
          .delete()
          .forPath(path.path)

      def importZNodeOp(node: ZNodeExport): CuratorOp =
        curator
          .transactionOp()
          .create()
          .withACL(node.acl.aclList.map(Acl.toZooKeeper).asJava)
          .forPath(node.path.path, node.data.bytes)

      def moveZNodeTree(dest: ZNodePath, tree: Cofree[List, ZNode]): F[Unit] = {
        val deleteOps: F[Seq[CuratorOp]] = Applicative[F].pure(
          tree
            .reduceMap((node: ZNode) => List(deleteZNodeOp(node.path)))
            .reverse
        )

        val createOps: F[Seq[CuratorOp]] = Async[F].fromTry(
          ZooKeeperUtils
            .rewriteZNodePaths(dest, tree)
            .map(_.reduceMap((node: ZNode) => List(createZNodeOp(node))))
        )

        Applicative[F]
          .map2(deleteOps, createOps)(_ ++ _)
          .flatMap { allOps =>
            curator
              .transaction()
              .forOperationsF(allOps)
              .map(discard[CuratorEvent])
          }
      }

      def setZNodeAcl(
        path: ZNodePath,
        acl: ZNodeAcl,
        aclVersionOpt: Option[ZNodeAclVersion]
      ): F[ZNodeMeta] =
        aclVersionOpt
          .map(ver => curator.setACL().withVersion(ver.version.toInt))
          .getOrElse(curator.setACL())
          .withACL(acl.aclList.map(Acl.toZooKeeper).asJava)
          .forPathF(path.path)
          .map(event => ZNodeMeta.fromStat(event.getStat))

      override def apply[A](fa: ActionOp[A]): F[A] =
        fa match {
          case CreateZNodeAction(ZNodePath(path)) =>
            curator
              .create()
              .creatingParentsIfNeeded()
              .forPathF(path)
              .map(discard[CuratorEvent])

          case DuplicateZNodeRecursiveAction(source, destination) =>
            for {
              tree <- curator
                .walkTreeF(curator.getZNodeF)(source)
                .flatMap(t => Async[F].fromTry(ZooKeeperUtils.rewriteZNodePaths(destination, t)))
              _ <- createZNodeTree(tree)
            } yield ()

          case GetZNodeAclAction(path) =>
            curator.getAclF(path)

          case GetZNodeChildrenAction(path) =>
            curator.getChildrenF(path)

          case GetZNodeDataAction(path) =>
            curator.getDataF(path)

          case GetZNodeMetaAction(path) =>
            curator
              .checkExists()
              .forPathF(path.path)
              .map(event => ZNodeMeta.fromStat(event.getStat))

          case GetZNodeWithChildrenAction(path) =>
            curator.getZNodeWithChildrenF(path)

          case UpdateZNodeAclListAction(path, acl, aclVersion) =>
            curator
              .setACL()
              .withVersion(aclVersion.version.toInt)
              .withACL(acl.aclList.map(Acl.toZooKeeper).asJava)
              .forPathF(path.path)
              .map(event => ZNodeMeta.fromStat(event.getStat))

          case UpdateZNodeAclListRecursiveAction(path, acl, aclVersion) =>
            for {
              tree <- curator.walkTreeF(Applicative[F].pure)(path)
              meta <- setZNodeAcl(tree.head, acl, Some(aclVersion))
              _    <- tree.forceTail.reduceMap(path => List(setZNodeAcl(path, acl, None))).sequence
            } yield meta

          case UpdateZNodeDataAction(path, data, dataVersion) =>
            curator
              .setData()
              .withVersion(dataVersion.version.toInt)
              .forPathF(path.path, data.bytes)
              .map(event => ZNodeMeta.fromStat(event.getStat))

          case MoveZNodeRecursiveAction(source, destination) =>
            for {
              tree <- curator.walkTreeF(curator.getZNodeF)(source)
              _    <- moveZNodeTree(destination, tree)
            } yield ()

          case ExportZNodesAction(paths) =>
            paths.toList.traverse { path =>
              curator
                .walkTreeF(curator.getZNodeF)(path)
                .map(_.map(n => ZNodeExport(n.acl, n.path, n.data)))
                .flatMap { tree =>
                  Async[F].fromTry(
                    ZNodePath
                      .parse(ZKPaths.PATH_SEPARATOR + tree.head.path.name.string)
                      .flatMap(ZooKeeperUtils.rewriteZNodePaths(_, tree))
                  )
                }
            }

          case ImportZNodesAction(path, nodes) =>
            for {
              _ <- curator
                .checkExists()
                .forPathF(path.path)
                .map(discard[CuratorEvent])
                .handleErrorWith {
                  case e: KeeperException if e.code() == Code.NONODE =>
                    curator
                      .create()
                      .creatingParentContainersIfNeeded()
                      .forPathF(path.path)
                      .map(discard[CuratorEvent])
                }

              trees <- nodes.traverse { tree =>
                Async[F].fromTry(
                  path
                    .down(tree.head.path.name)
                    .flatMap(ZooKeeperUtils.rewriteZNodePaths(_, tree))
                )
              }

              ops = trees.flatMap(_.reduceMap((node: ZNodeExport) => List(importZNodeOp(node))))

              _ <- curator
                .transaction()
                .forOperationsF(ops)
                .map(discard[CuratorEvent])
            } yield ()

          case DeleteZNodeRecursiveAction(ZNodePath(path), ZNodeDataVersion(dataVersion)) =>
            curator
              .delete()
              .deletingChildrenIfNeeded()
              .withVersion(dataVersion.toInt)
              .forPathF(path)
              .map(discard[CuratorEvent])

          case ForceDeleteZNodeRecursiveAction(paths) =>
            paths.toList
              .traverse(curator.walkTreeF(Applicative[F].pure))
              .flatMap(deleteZNodeTrees)
        }
    }
}
