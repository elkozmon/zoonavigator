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
import org.apache.curator.framework.CuratorFramework
import org.scalatest.Assertion
import org.scalatest.Assertions
import org.scalatest.flatspec.AnyFlatSpec
import play.api.http.HttpErrorHandler
import play.api.mvc._
import play.api.test.FakeRequest
import zookeeper._

import java.nio.charset.StandardCharsets
import java.util.Base64
import scala.concurrent.Await
import scala.concurrent.Future
import scala.concurrent.duration._

class CuratorActionSpec extends AnyFlatSpec with Assertions {

  private val errorHandler = new HttpErrorHandler {
    override def onClientError(
      request: RequestHeader,
      statusCode: Int,
      message: String
    ): Future[Result] =
      Future.successful(Results.Status(statusCode)(message))

    override def onServerError(request: RequestHeader, exception: Throwable): Future[Result] =
      Future.successful(Results.InternalServerError(exception.getMessage))
  }

  private val curatorFrameworkProvider = new CuratorFrameworkProvider {
    private def unexpectedCall: Task[Nothing] =
      Task.raiseError(new AssertionError("Curator provider should not be used"))

    override def getCuratorInstance(connectionId: ConnectionId): Task[Option[CuratorFramework]] =
      unexpectedCall

    override def getCuratorInstance(
      connectionString: ConnectionString,
      authInfoList: List[AuthInfo]
    ): Task[CuratorFramework] =
      unexpectedCall
  }

  private class TestCuratorAction extends CuratorAction(errorHandler, curatorFrameworkProvider) {
    def refineRequest[A](request: Request[A]): Future[Either[Result, CuratorRequest[A]]] =
      refine(request)
  }

  private def encoded(value: String): String =
    Base64.getEncoder.encodeToString(value.getBytes(StandardCharsets.UTF_8))

  private def assertUnauthorized(header: String): Assertion = {
    val request = FakeRequest().withHeaders("Zoo-Authorization" -> header)
    val result  = Await.result(new TestCuratorAction().refineRequest(request), 5.seconds)

    result match {
      case Left(response) =>
        assertResult(401)(response.header.status)
      case Right(_) =>
        fail("Expected malformed authorization header to be rejected")
    }
  }

  "CuratorAction" should "reject preset headers with malformed base64" in {
    assertUnauthorized("CxnPreset !!!")
  }

  it should "reject connection parameter headers with malformed json" in {
    assertUnauthorized(s"CxnParams ${encoded("not-json")}")
  }
}
