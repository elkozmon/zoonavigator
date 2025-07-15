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

package curator.provider

import com.google.common.cache._
import config.ApplicationConfig
import loggers.AppLogger
import monix.eval.Task
import monix.execution.Cancelable
import monix.execution.Scheduler
import zookeeper.AuthInfo
import zookeeper.ConnectionId
import zookeeper.ConnectionParams
import zookeeper.ConnectionString

import cats.instances.option._
import cats.syntax.traverse._

import com.elkozmon.zoonavigator.core.utils.CommonUtils._

import org.apache.curator.framework
import org.apache.curator.framework.CuratorFramework
import org.apache.curator.framework.CuratorFrameworkFactory
import org.apache.curator.framework.api.UnhandledErrorListener
import org.apache.curator.framework.state.ConnectionState
import org.apache.curator.framework.state.ConnectionStateListener
import org.apache.curator.retry.ExponentialBackoffRetry

import java.util.concurrent._
import scala.concurrent.duration._
import scala.jdk.CollectionConverters._
import scala.language.postfixOps
import scala.util.Try

class CacheCuratorFrameworkProvider(
  appLogger: AppLogger,
  appConfig: ApplicationConfig,
  curatorCacheMaxAge: CuratorCacheMaxAge,
  curatorConnectTimeout: CuratorConnectTimeout,
  implicit val scheduler: Scheduler
) extends CuratorFrameworkProvider
    with RemovalListener[CuratorKey, Task[CuratorFramework]] {

  private val presetConnectionParamMap =
    appConfig.connections
      .map(c => ConnectionId(c.id) -> ConnectionParams(c.connectionString, c.authInfoList))
      .toMap

  private val curatorFrameworkCache =
    CacheBuilder
      .newBuilder()
      .expireAfterAccess(curatorCacheMaxAge.duration.toMillis, TimeUnit.MILLISECONDS)
      .removalListener(CacheCuratorFrameworkProvider.this)
      .build[CuratorKey, Task[CuratorFramework]]()

  private val curatorFrameworkCacheMap =
    curatorFrameworkCache
      .asMap()
      .asScala

  // start clean up job
  scheduler
    .scheduleWithFixedDelay(1 second, 1 second)(curatorFrameworkCache.cleanUp())
    .discard()

  override def onRemoval(
    notification: RemovalNotification[CuratorKey, Task[CuratorFramework]]
  ): Unit = {
    val curatorKey   = notification.getKey
    val removalCause = notification.getCause

    appLogger.debug(
      s"Closing connection to ${curatorKey.connectionString.string}. " +
        s"Cause: ${removalCause.name()}"
    )

    notification.getValue
      .foreach(_.close())
      .discard()
  }

  override def getCuratorInstance(connectionId: ConnectionId): Task[Option[CuratorFramework]] =
    presetConnectionParamMap.get(connectionId).map(getCuratorInstance).sequence

  override def getCuratorInstance(
    connectionString: ConnectionString,
    authInfoList: List[AuthInfo]
  ): Task[CuratorFramework] =
    curatorFrameworkCacheMap
      .getOrElseUpdate(
        CuratorKey(connectionString, authInfoList),
        newCuratorInstance(connectionString, authInfoList)
      )

  private def newCuratorInstance(
    connectionString: ConnectionString,
    authInfoList: List[AuthInfo]
  ): Task[CuratorFramework] =
    Task
      .create[CuratorFramework] { (scheduler, callback) =>
        val tryStartCurator = Try {
          // Create Curator instance
          val frameworkAuthInfoList = authInfoList.map { authInfo =>
            new framework.AuthInfo(authInfo.scheme, authInfo.auth)
          }

          val curatorFramework = CuratorFrameworkFactory
            .builder()
            .authorization(frameworkAuthInfoList.asJava)
            .connectString(connectionString.string)
            .retryPolicy(new ExponentialBackoffRetry(100, 3))
            .defaultData(Array.emptyByteArray)
            .build()

          // Log unhandled errors
          val unhandledErrorListener: UnhandledErrorListener =
            (message: String, e: Throwable) => appLogger.warn(message, e)

          curatorFramework.getUnhandledErrorListenable
            .addListener(unhandledErrorListener, scheduler)

          // Timeout hanging connection
          val connectionTimeoutJob =
            scheduler.scheduleOnce(curatorConnectTimeout.duration) {
              val throwable = new Exception(
                s"Unable to establish connection " +
                  s"with ZooKeeper (${connectionString.string})."
              )

              callback.onError(throwable)

              // Curator didn't make it to the cache,
              // stop it from retrying indefinitely
              appLogger.debug("Stopping Curator Framework", throwable)
              curatorFramework.close()
            }

          // Listen for successful connection
          val connectionListener =
            new ConnectionStateListener {
              override def stateChanged(client: CuratorFramework, newState: ConnectionState): Unit =
                newState match {
                  case ConnectionState.CONNECTED =>
                    callback.onSuccess(client)
                    client.getConnectionStateListenable.removeListener(this)
                    connectionTimeoutJob.cancel()

                  case ConnectionState.LOST =>
                    appLogger.debug("Connection lost")

                  case ConnectionState.SUSPENDED =>
                    appLogger.debug("Connection suspended")

                  case _ =>
                }
            }

          curatorFramework.getConnectionStateListenable
            .addListener(connectionListener, scheduler)

          // Start the client
          curatorFramework.start()
        }

        tryStartCurator.toEither.left.foreach(callback.onError)

        Cancelable.empty
      }
      .memoize

}
