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

package api

import play.api._
import play.api.http.DefaultHttpErrorHandler
import play.api.libs.json.Json
import play.api.mvc.Results.BadRequest
import play.api.mvc.Results.Forbidden
import play.api.mvc.Results.InternalServerError
import play.api.mvc.Results.NotFound
import play.api.mvc.Results.Status
import play.api.mvc._
import play.api.routing.Router
import play.core.SourceMapper

import scala.concurrent._

class ApiErrorHandler(
  env: Environment,
  config: Configuration,
  sourceMapper: Option[SourceMapper],
  router: => Option[Router]
) extends DefaultHttpErrorHandler(env, config, sourceMapper, router)
    with Rendering
    with AcceptExtractors {

  import api.formats.Json._

  override def onProdServerError(
    request: RequestHeader,
    exception: UsefulException
  ): Future[Result] = {
    val response =
      ApiResponse[Unit](
        success = false,
        message = Some("A server error occurred: " + exception.getMessage),
        payload = None
      )

    render.async { case Accepts.Json() =>
      Future.successful(InternalServerError(Json.toJson(response)))
    }(request)
  }

  override protected def onBadRequest(request: RequestHeader, message: String): Future[Result] = {
    val response =
      ApiResponse[Unit](success = false, message = Some(message), payload = None)

    render.async { case Accepts.Json() =>
      Future.successful(BadRequest(Json.toJson(response)))
    }(request)
  }

  override protected def onForbidden(request: RequestHeader, message: String): Future[Result] = {
    val response =
      ApiResponse[Unit](success = false, message = Some(message), payload = None)

    render.async { case Accepts.Json() =>
      Future.successful(Forbidden(Json.toJson(response)))
    }(request)
  }

  override protected def onNotFound(request: RequestHeader, message: String): Future[Result] = {
    val response =
      ApiResponse[Unit](success = false, message = Some(message), payload = None)

    render.async { case Accepts.Json() =>
      Future.successful(NotFound(Json.toJson(response)))
    }(request)
  }

  override protected def onOtherClientError(
    request: RequestHeader,
    statusCode: Int,
    message: String
  ): Future[Result] = {
    val response =
      ApiResponse[Unit](success = false, message = Some(message), payload = None)

    render.async { case Accepts.Json() =>
      Future.successful(Status(statusCode)(Json.toJson(response)))
    }(request)
  }

  override def onServerError(request: RequestHeader, exception: Throwable): Future[Result] = {
    val response =
      ApiResponse[Unit](success = false, message = Some(exception.getMessage), payload = None)

    render.async { case Accepts.Json() =>
      Future.successful(Status(500)(Json.toJson(response)))
    }(request)
  }
}
