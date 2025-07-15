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

import org.apache.curator.framework.CuratorFramework
import org.apache.curator.framework.CuratorFrameworkFactory
import org.apache.curator.retry.RetryOneTime
import org.apache.curator.test.TestingServer
import org.apache.zookeeper.data.Stat

import java.util.concurrent.atomic.AtomicInteger

trait CuratorSpec {

  import CuratorSpec._

  def checkExists(path: String)(implicit cf: CuratorFramework): Option[Stat] =
    Option(cf.checkExists().forPath(path))

  def withCurator[T](fn: CuratorFramework => T): T = {
    val id = atomicCounter.getAndIncrement().toString
    val cf = curatorFramework.usingNamespace(id)

    fn(cf)
  }
}

object CuratorSpec {

  private val atomicCounter = new AtomicInteger(0)

  private val testingServer = new TestingServer(true)

  private val curatorFramework = {
    val curator = CuratorFrameworkFactory
      .newClient(testingServer.getConnectString, new RetryOneTime(1000))

    curator.start()
    curator.usingNamespace("tests")
  }
}
