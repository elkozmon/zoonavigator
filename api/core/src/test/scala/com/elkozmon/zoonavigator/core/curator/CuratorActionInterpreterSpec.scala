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

import monix.eval.Task
import monix.execution.Scheduler
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.Assertions

import cats.Eval
import cats.effect.Resource
import cats.free.Cofree

import com.elkozmon.zoonavigator.core.action._
import com.elkozmon.zoonavigator.core.curator.CuratorSpec
import com.elkozmon.zoonavigator.core.utils.CommonUtils._
import com.elkozmon.zoonavigator.core.zookeeper.acl.Acl
import com.elkozmon.zoonavigator.core.zookeeper.acl.AclId
import com.elkozmon.zoonavigator.core.zookeeper.acl.Permission
import com.elkozmon.zoonavigator.core.zookeeper.acl.Permission._
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeAcl
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeAclVersion
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeData
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeExport
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodePath

import org.apache.curator.framework.CuratorFramework
import org.apache.zookeeper.data.ACL
import org.apache.zookeeper.data.Id

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.jdk.CollectionConverters._
import scala.util.Try

class CuratorActionInterpreterSpec extends AnyFreeSpec with CuratorSpec with Assertions {

  import Scheduler.Implicits.global

  def interpreter(implicit curator: CuratorFramework): CuratorActionInterpreter[Task] = {
    implicit val F: cats.Applicative[Task] = monix.eval.Task.catsAsync
    new CuratorActionInterpreter[Task](Resource.pure(curator))
  }

  "DuplicateZNodeRecursiveAction" - {
    "should copy child nodes data" in withCurator { implicit curatorFramework =>
      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo", "foo".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo/bar", "bar".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo/baz", "baz".getBytes)
        )
        .discard()

      val action =
        DuplicateZNodeRecursiveAction(ZNodePath.parse("/foo").get, ZNodePath.parse("/foo-copy").get)

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      val bar = new String(curatorFramework.getData.forPath("/foo-copy/bar"))
      val baz = new String(curatorFramework.getData.forPath("/foo-copy/baz"))

      assertResult("barbaz")(bar + baz)
    }

    "should copy ACLs" in withCurator { implicit curatorFramework =>
      val acl = new ACL(
        Permission.toZooKeeperMask(Set(Permission.Admin, Permission.Read)),
        new Id("world", "anyone")
      )

      curatorFramework
        .create()
        .withACL(List(acl).asJava)
        .forPath("/foo", "foo".getBytes)
        .discard()

      val action =
        DuplicateZNodeRecursiveAction(ZNodePath.parse("/foo").get, ZNodePath.parse("/foo-copy").get)

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      assert(
        curatorFramework.getACL
          .forPath("/foo-copy")
          .asScala
          .forall(_.equals(acl))
      )
    }
  }

  "ExportZNodesAction" - {
    def getDefaultExportNode(path: String, data: String): ZNodeExport =
      ZNodeExport(
        ZNodeAcl(List(Acl(AclId("world", "anyone"), Permission.All))),
        ZNodePath.parse(path).get,
        ZNodeData(data.getBytes)
      )

    "shouldexport two sibling nodes" in withCurator { implicit curatorFramework =>
      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo", "foo".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/bar", "bar".getBytes)
        )
        .discard()

      val action =
        ExportZNodesAction(Seq(ZNodePath.parse("/foo").get, ZNodePath.parse("/bar").get))

      val exported =
        Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      assertResult {
        List(
          Cofree(
            getDefaultExportNode("/foo", "foo"),
            Eval.now(List.empty[Cofree[List, ZNodeExport]])
          ),
          Cofree(
            getDefaultExportNode("/bar", "bar"),
            Eval.now(List.empty[Cofree[List, ZNodeExport]])
          )
        )
      }(exported.map(_.forceAll))
    }

    "should export one node with child" in withCurator { implicit curatorFramework =>
      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo", "foo".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo/bar", "bar".getBytes)
        )
        .discard()

      val action =
        ExportZNodesAction(Seq(ZNodePath.parse("/foo").get))

      val exported =
        Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      assertResult {
        List(
          Cofree(
            getDefaultExportNode("/foo", "foo"),
            Eval.now(
              List(
                Cofree(
                  getDefaultExportNode("/foo/bar", "bar"),
                  Eval.now(List.empty[Cofree[List, ZNodeExport]])
                )
              )
            )
          )
        )
      }(exported.map(_.forceAll))
    }

    "should export nodes as root nodes (path of the parent node is cut out)" in withCurator {
      implicit curatorFramework =>
        curatorFramework
          .transaction()
          .forOperations(
            curatorFramework
              .transactionOp()
              .create()
              .forPath("/export", Array.emptyByteArray),
            curatorFramework
              .transactionOp()
              .create()
              .forPath("/export/foo", "foo".getBytes),
            curatorFramework
              .transactionOp()
              .create()
              .forPath("/export/foo/bar", "bar".getBytes),
            curatorFramework
              .transactionOp()
              .create()
              .forPath("/export/baz", "baz".getBytes)
          )
          .discard()

        val action =
          ExportZNodesAction(
            Seq(ZNodePath.parse("/export/foo").get, ZNodePath.parse("/export/baz").get)
          )

        val exported =
          Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

        assertResult {
          List(
            Cofree(
              getDefaultExportNode("/foo", "foo"),
              Eval.now(
                List(
                  Cofree(
                    getDefaultExportNode("/foo/bar", "bar"),
                    Eval.now(List.empty[Cofree[List, ZNodeExport]])
                  )
                )
              )
            ),
            Cofree(
              getDefaultExportNode("/baz", "baz"),
              Eval.now(List.empty[Cofree[List, ZNodeExport]])
            )
          )
        }(exported.map(_.forceAll))
    }
  }

  "ForceDeleteZNodeRecursiveAction" - {
    "should delete two sibling nodes" in withCurator { implicit curatorFramework =>
      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo", "foo".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/bar", "bar".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/baz", "baz".getBytes)
        )
        .discard()

      val action =
        ForceDeleteZNodeRecursiveAction(Seq("/foo", "/bar").map(ZNodePath.parse _ andThen (_.get)))

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      assert(checkExists("/foo").isEmpty)
      assert(checkExists("/bar").isEmpty)
      assert(checkExists("/baz").isDefined)
    }

    "should delete node with its children" in withCurator { implicit curatorFramework =>
      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo", "foo".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo/bar", "bar".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo/baz", "baz".getBytes)
        )
        .discard()

      val action =
        ForceDeleteZNodeRecursiveAction(Seq(ZNodePath.parse("/foo").get))

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      assert(checkExists("/foo").isEmpty)
      assert(checkExists("/foo/bar").isEmpty)
      assert(checkExists("/foo/baz").isEmpty)
    }

    "should not delete anything if there is an error" in withCurator { implicit curatorFramework =>
      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo", "foo".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/bar", "bar".getBytes)
        )
        .discard()

      val action =
        ForceDeleteZNodeRecursiveAction(
          Seq("/foo", "/bar", "/nonexistent").map(ZNodePath.parse _ andThen (_.get))
        )

      val tryResult =
        Try(Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf))

      assert(tryResult.isFailure)
      assert(checkExists("/foo").isDefined)
      assert(checkExists("/bar").isDefined)
      assert(checkExists("/nonexistent").isEmpty)
    }
  }

  "GetZNodeDataActionHandler" - {
    "should return empty byte array for node with null data" in withCurator {
      implicit curatorFramework =>
        curatorFramework
          .create()
          .forPath("/null-node", null)
          .discard()

        val action = GetZNodeDataAction(ZNodePath.parse("/null-node").get)

        val metadata =
          Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

        assert(metadata.data.bytes.isEmpty)
    }
  }

  "ImportZNodeActionHandler" - {

    def getExportNode(path: String, data: String, acls: List[Acl]): ZNodeExport =
      ZNodeExport(ZNodeAcl(acls), ZNodePath.parse(path).get, ZNodeData(data.getBytes))

    "should import two sibling nodes" in withCurator { implicit curatorFramework =>
      val fooAclDefault =
        List(Acl(AclId("world", "anyone"), Set(Read, Create)))
      val barAclDefault =
        List(Acl(AclId("world", "anyone"), Set(Read, Create, Delete)))

      val exported =
        List(
          Cofree(
            getExportNode("/foo", "foo", fooAclDefault),
            Eval.now(List.empty[Cofree[List, ZNodeExport]])
          ),
          Cofree(
            getExportNode("/bar", "bar", barAclDefault),
            Eval.now(List.empty[Cofree[List, ZNodeExport]])
          )
        )

      val action =
        ImportZNodesAction(ZNodePath.parse("/").get, exported)

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      val fooData = new String(curatorFramework.getData.forPath("/foo"))
      val fooAcl = curatorFramework.getACL
        .forPath("/foo")
        .asScala
        .map(Acl.fromZooKeeper)

      val barData = new String(curatorFramework.getData.forPath("/bar"))
      val barAcl = curatorFramework.getACL
        .forPath("/bar")
        .asScala
        .map(Acl.fromZooKeeper)

      assertResult("foo")(fooData)
      assertResult(fooAclDefault)(fooAcl)

      assertResult("bar")(barData)
      assertResult(barAclDefault)(barAcl)
    }

    "should import one node with child" in withCurator { implicit curatorFramework =>
      val fooAclDefault =
        List(Acl(AclId("world", "anyone"), Set(Read, Create)))
      val barAclDefault =
        List(Acl(AclId("world", "anyone"), Set(Read, Create, Delete)))

      val exported =
        List(
          Cofree(
            getExportNode("/foo", "foo", fooAclDefault),
            Eval.now(
              List(
                Cofree(
                  getExportNode("/foo/bar", "bar", barAclDefault),
                  Eval.now(List.empty[Cofree[List, ZNodeExport]])
                )
              )
            )
          )
        )

      val action =
        ImportZNodesAction(ZNodePath.parse("/").get, exported)

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      val fooData = new String(curatorFramework.getData.forPath("/foo"))
      val fooAcl = curatorFramework.getACL
        .forPath("/foo")
        .asScala
        .map(Acl.fromZooKeeper)

      val barData = new String(curatorFramework.getData.forPath("/foo/bar"))
      val barAcl = curatorFramework.getACL
        .forPath("/foo/bar")
        .asScala
        .map(Acl.fromZooKeeper)

      assertResult("foo")(fooData)
      assertResult(fooAclDefault)(fooAcl)

      assertResult("bar")(barData)
      assertResult(barAclDefault)(barAcl)
    }

    "should import node as a child of 'import' ZNode" in withCurator { implicit curatorFramework =>
      val fooAclDefault =
        List(Acl(AclId("world", "anyone"), Set(Read, Create)))
      val barAclDefault =
        List(Acl(AclId("world", "anyone"), Set(Read, Create, Delete)))
      val bazAclDefault =
        List(Acl(AclId("world", "anyone"), Set(Read, Create, Write, Delete)))

      val exported =
        List(
          Cofree(
            getExportNode("/foo", "foo", fooAclDefault),
            Eval.now(
              List(
                Cofree(
                  getExportNode("/foo/bar", "bar", barAclDefault),
                  Eval.now(List.empty[Cofree[List, ZNodeExport]])
                )
              )
            )
          ),
          Cofree(
            getExportNode("/baz", "baz", bazAclDefault),
            Eval.now(List.empty[Cofree[List, ZNodeExport]])
          )
        )

      // create "import" container node
      curatorFramework.createContainers("/import")

      val action =
        ImportZNodesAction(ZNodePath.parse("/import").get, exported)

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      val fooData = new String(curatorFramework.getData.forPath("/import/foo"))
      val fooAcl = curatorFramework.getACL
        .forPath("/import/foo")
        .asScala
        .map(Acl.fromZooKeeper)

      val barData =
        new String(curatorFramework.getData.forPath("/import/foo/bar"))
      val barAcl = curatorFramework.getACL
        .forPath("/import/foo/bar")
        .asScala
        .map(Acl.fromZooKeeper)

      val bazData = new String(curatorFramework.getData.forPath("/import/baz"))
      val bazAcl = curatorFramework.getACL
        .forPath("/import/baz")
        .asScala
        .map(Acl.fromZooKeeper)

      assertResult("foo")(fooData)
      assertResult(fooAclDefault)(fooAcl)

      assertResult("bar")(barData)
      assertResult(barAclDefault)(barAcl)

      assertResult("baz")(bazData)
      assertResult(bazAclDefault)(bazAcl)
    }

    "should import node creating its non-existent target parent" in withCurator {
      implicit curatorFramework =>
        val fooAclDefault =
          List(Acl(AclId("world", "anyone"), Set(Read, Create)))

        val exported =
          List(
            Cofree(
              getExportNode("/foo", "foo", fooAclDefault),
              Eval.now(List.empty[Cofree[List, ZNodeExport]])
            )
          )

        val action =
          ImportZNodesAction(ZNodePath.parse("/non-existent-parent").get, exported)

        Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

        val fooData = new String(curatorFramework.getData.forPath("/non-existent-parent/foo"))

        assertResult("foo")(fooData)
    }
  }

  "MoveZNodeRecursiveActionHandler" - {
    "should copy child nodes data" in withCurator { implicit curatorFramework =>
      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo", "foo".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo/bar", "bar".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo/baz", "baz".getBytes)
        )
        .discard()

      val action =
        MoveZNodeRecursiveAction(ZNodePath.parse("/foo").get, ZNodePath.parse("/foo-move").get)

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      val bar = new String(curatorFramework.getData.forPath("/foo-move/bar"))
      val baz = new String(curatorFramework.getData.forPath("/foo-move/baz"))

      assertResult("barbaz")(bar + baz)
    }

    "should remove old nodes" in withCurator { implicit curatorFramework =>
      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo", "foo".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo/bar", "bar".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .forPath("/foo/baz", "baz".getBytes)
        )
        .discard()

      val action =
        MoveZNodeRecursiveAction(ZNodePath.parse("/foo").get, ZNodePath.parse("/foo-move").get)

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      assert(checkExists("/foo").isEmpty).discard()
      assert(checkExists("/foo/bar").isEmpty).discard()
      assert(checkExists("/foo/baz").isEmpty).discard()
    }

    "should copy ACLs" in withCurator { implicit curatorFramework =>
      val acl = new ACL(
        Permission.toZooKeeperMask(Set(Permission.Admin, Permission.Read)),
        new Id("world", "anyone")
      )

      curatorFramework
        .create()
        .withACL(List(acl).asJava)
        .forPath("/foo", "foo".getBytes)
        .discard()

      val action =
        MoveZNodeRecursiveAction(ZNodePath.parse("/foo").get, ZNodePath.parse("/foo-move").get)

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf)

      assert(
        curatorFramework.getACL
          .forPath("/foo-move")
          .asScala
          .forall(_.equals(acl))
      )
    }
  }

  "UpdateZNodeAclListRecursiveAction" - {
    "should set root node ACLs" in withCurator { implicit curatorFramework =>
      val initAcl =
        ZNodeAcl(List(Acl(AclId("world", "anyone"), Permission.All))).aclList
          .map(Acl.toZooKeeper)
          .asJava

      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .withACL(initAcl)
            .forPath("/foo", "foo".getBytes)
        )
        .discard()

      val newAcl =
        ZNodeAcl(List(Acl(AclId("world", "anyone"), Set(Permission.Admin, Permission.Read))))

      val action =
        UpdateZNodeAclListRecursiveAction(ZNodePath.parse("/foo").get, newAcl, ZNodeAclVersion(0L))

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf).discard()

      val currentAclList = curatorFramework.getACL
        .forPath("/foo")
        .asScala
        .toList
        .map(Acl.fromZooKeeper)

      assertResult(newAcl.aclList)(currentAclList)
    }

    "should set children node ACLs" in withCurator { implicit curatorFramework =>
      val initAcl =
        ZNodeAcl(List(Acl(AclId("world", "anyone"), Permission.All))).aclList
          .map(Acl.toZooKeeper)
          .asJava

      curatorFramework
        .transaction()
        .forOperations(
          curatorFramework
            .transactionOp()
            .create()
            .withACL(initAcl)
            .forPath("/foo", "foo".getBytes),
          curatorFramework
            .transactionOp()
            .create()
            .withACL(initAcl)
            .forPath("/foo/bar", "bar".getBytes)
        )
        .discard()

      val newAcl =
        ZNodeAcl(List(Acl(AclId("world", "anyone"), Set(Permission.Admin, Permission.Read))))

      val action =
        UpdateZNodeAclListRecursiveAction(ZNodePath.parse("/foo").get, newAcl, ZNodeAclVersion(0L))

      Await.result(interpreter.apply(action.free).runToFuture, Duration.Inf).discard()

      val currentAclList = curatorFramework.getACL
        .forPath("/foo/bar")
        .asScala
        .toList
        .map(Acl.fromZooKeeper)

      assertResult(newAcl.aclList)(currentAclList)
    }
  }
}
