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

package curator.action

import curator.provider.CuratorFrameworkProvider
import monix.eval.Task
import monix.execution.Scheduler
import play.api.http.HttpErrorHandler
import play.api.libs.json.JsString
import play.api.libs.json.Json
import play.api.mvc._
import zookeeper.ConnectionId
import zookeeper.ConnectionParams

import cats.instances.either._
import cats.instances.future._
import cats.syntax.bitraverse._

import org.apache.curator.framework.CuratorFramework

import java.nio.charset.StandardCharsets
import java.util.Base64
import scala.concurrent.Future

class CuratorAction(
  httpErrorHandler: HttpErrorHandler,
  curatorFrameworkProvider: CuratorFrameworkProvider
) extends ActionRefiner[Request, CuratorRequest] {

  import api.formats.Json._

  private val cxnPresetHeaderPrefix = "CxnPreset"

  private val cxnParamsHeaderPrefix = "CxnParams"

  private def missingAuthHeaderResult[A](request: Request[A]): Future[Result] =
    httpErrorHandler.onClientError(request, 401, "Missing Zoo-Authorization header")

  private def malformedAuthHeaderResult[A](request: Request[A]): Future[Result] =
    httpErrorHandler.onClientError(request, 401, "Malformed Zoo-Authorization header")

  private def invalidCxnNameHeaderResult[A](request: Request[A]): Future[Result] =
    httpErrorHandler.onClientError(request, 401, "Invalid connection name")

  override protected implicit def executionContext: Scheduler = Scheduler.global

  override protected def refine[A](request: Request[A]): Future[Either[Result, CuratorRequest[A]]] =
    request.headers
      .get("Zoo-Authorization")
      .toRight(missingAuthHeaderResult(request))
      .map(_.trim)
      .flatMap[Future[Result], Task[Either[Result, CuratorFramework]]] {
        case x if x.startsWith(cxnPresetHeaderPrefix) =>
          val b64  = x.stripPrefix(cxnPresetHeaderPrefix).trim
          val json = JsString(new String(Base64.getDecoder.decode(b64), StandardCharsets.UTF_8))

          json
            .asOpt[ConnectionId]
            .toRight(malformedAuthHeaderResult(request))
            .map(
              curatorFrameworkProvider
                .getCuratorInstance(_)
                .flatMap(
                  _.toRight(Task.fromFuture(invalidCxnNameHeaderResult(request))).leftSequence
                )
            )

        case x if x.startsWith(cxnParamsHeaderPrefix) =>
          val b64  = x.stripPrefix(cxnParamsHeaderPrefix).trim
          val json = Json.parse(Base64.getDecoder.decode(b64))

          json
            .asOpt[ConnectionParams]
            .toRight(malformedAuthHeaderResult(request))
            .map(curatorFrameworkProvider.getCuratorInstance(_).map(Right(_)))

        case _ =>
          Left(malformedAuthHeaderResult(request))
      }
      .map[Future[Either[Result, CuratorFramework]]](_.runToFuture)
      .bisequence
      .map(_.flatten.map(new CuratorRequest(_, request)))
}
