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

import org.slf4j.LoggerFactory

import org.apache.curator.framework.api.BackgroundCallback
import org.apache.curator.framework.api.CuratorEvent
import org.apache.curator.framework.api.UnhandledErrorListener
import org.apache.zookeeper.KeeperException
import org.apache.zookeeper.KeeperException.Code

package object syntax {

  object async extends AsyncOps
  object znode extends ZNodeOps
  object all   extends AsyncOps with ZNodeOps

  private[curator] val logger = LoggerFactory.getLogger("curator")

  private[curator] def newEventCallback(
    callback: Either[Throwable, CuratorEvent] => Unit
  ): BackgroundCallback =
    (_, event: CuratorEvent) => {
      logger.debug("{} event completed with result code {}", event.getType, event.getResultCode)

      if (event.getResultCode == 0) {
        callback(Right(event))
      } else {
        val code = Code.get(event.getResultCode)
        val path = event.getPath

        callback(Left(KeeperException.create(code, path)))
      }
    }

  private[curator] def newErrorListener[A](
    callback: Either[Throwable, A] => Unit
  ): UnhandledErrorListener =
    (message: String, e: Throwable) => {
      logger.error(message, e)
      callback(Left(e))
    }
}
