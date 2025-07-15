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

package com.elkozmon.zoonavigator.core.curator.syntax

import cats.Applicative
import cats.Eval
import cats.Parallel
import cats.effect.Async
import cats.free.Cofree
import cats.instances.list._
import cats.instances.try_._
import cats.syntax.flatMap._
import cats.syntax.functor._
import cats.syntax.parallel._
import cats.syntax.traverse._

import com.elkozmon.zoonavigator.core.curator.syntax.async._
import com.elkozmon.zoonavigator.core.zookeeper.acl.Acl
import com.elkozmon.zoonavigator.core.zookeeper.acl.AclId
import com.elkozmon.zoonavigator.core.zookeeper.acl.Permission
import com.elkozmon.zoonavigator.core.zookeeper.znode._

import org.apache.curator.framework.CuratorFramework
import org.apache.curator.framework.api.CuratorEvent
import org.apache.curator.utils.ZKPaths

import scala.jdk.CollectionConverters._
import scala.language.implicitConversions
import scala.util.Try

trait ZNodeOps {

  implicit def toZNodeF[F[_]: Async: Parallel](
    c: CuratorFramework
  ): ZNodeF[F] =
    new ZNodeF[F] {

      override def walkTreeF[T](
        fn: ZNodePath => F[T]
      )(node: ZNodePath): F[Cofree[List, T]] = {
        val tF = fn(node)
        val childrenF = for {
          paths <- getChildrenF(node).map(_.data.children)
          trees <- paths.parTraverse(walkTreeF(fn)).map(Eval.now(_))
        } yield trees

        (tF, childrenF).parMapN(Cofree(_, _))
      }

      override def getZNodeF(path: ZNodePath): F[ZNode] = {
        val aclF  = getAclF(path)
        val dataF = getDataF(path)

        Applicative[F].map2(aclF, dataF) { (acl, data) =>
          ZNode(acl.data, path, data.data, data.meta)
        }
      }

      override def getZNodeWithChildrenF(path: ZNodePath): F[ZNodeWithChildren] = {
        val zNodeF         = getZNodeF(path)
        val zNodeChildrenF = getChildrenF(path).map(_.data)

        Applicative[F].map2(zNodeF, zNodeChildrenF) { (node, children) =>
          ZNodeWithChildren(node, children)
        }
      }

      override def getDataF(path: ZNodePath): F[ZNodeMetaWith[ZNodeData]] =
        c.getData
          .forPathF(path.path)
          .map { event =>
            ZNodeMetaWith(
              ZNodeData(Option(event.getData).getOrElse(Array.empty)),
              ZNodeMeta.fromStat(event.getStat)
            )
          }

      override def getAclF(path: ZNodePath): F[ZNodeMetaWith[ZNodeAcl]] =
        c.getACL
          .forPathF(path.path)
          .map { event =>
            val acl = ZNodeAcl(
              event.getACLList.asScala.toList
                .map { acl =>
                  Acl(
                    AclId(acl.getId.getScheme, acl.getId.getId),
                    Permission.fromZooKeeperMask(acl.getPerms)
                  )
                }
            )

            val meta = ZNodeMeta.fromStat(event.getStat)

            ZNodeMetaWith(acl, meta)
          }

      override def getChildrenF(path: ZNodePath): F[ZNodeMetaWith[ZNodeChildren]] = {
        def getChildrenFromEvent(event: CuratorEvent): Try[ZNodeChildren] =
          event.getChildren.asScala.toList
            .traverse { name =>
              val path = event.getPath
                .stripSuffix(ZKPaths.PATH_SEPARATOR)
                .concat(ZKPaths.PATH_SEPARATOR + name)

              ZNodePath.parse(path)
            }
            .map(ZNodeChildren)

        c.getChildren
          .forPathF(path.path)
          .flatMap { event =>
            val meta      = ZNodeMeta.fromStat(event.getStat)
            val childrenF = Async[F].fromTry(getChildrenFromEvent(event))

            childrenF.map(ZNodeMetaWith(_, meta))
          }
      }
    }
}
