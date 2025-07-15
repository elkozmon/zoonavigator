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

package api.controllers

import _root_.curator.action.CuratorRequest
import akka.util.ByteString
import api.ApiResponse
import api.exceptions.BadRequestException
import api.exceptions.HttpException
import api.formats.Json._
import config.ApplicationConfig
import curator.action.CuratorAction
import monix.eval.Task
import play.api.http.HttpErrorHandler
import play.api.libs.json._
import play.api.mvc._
import utils.Gzip
import org.apache.curator.framework.CuratorFramework

import cats.effect.Resource
import cats.free.Cofree
import cats.instances.list._
import cats.instances.try_._
import cats.syntax.traverse._

import com.elkozmon.zoonavigator.core.action._
import com.elkozmon.zoonavigator.core.curator.CuratorActionInterpreter
import com.elkozmon.zoonavigator.core.zookeeper.acl.Acl
import com.elkozmon.zoonavigator.core.zookeeper.znode._

import java.nio.charset.StandardCharsets
import java.util.Base64

class ApiController(
  applicationConfig: ApplicationConfig,
  httpErrorHandler: HttpErrorHandler,
  curatorAction: CuratorAction,
  playBodyParsers: PlayBodyParsers,
  controllerComponents: ControllerComponents
) extends AbstractController(controllerComponents) {

  import monix.execution.Scheduler.Implicits.global

  private val malformedDataException =
    new Exception("Malformed data")

  def getConfig: Action[AnyContent] =
    Action { implicit request =>
      render { case Accepts.Json() =>
        Ok(Json.toJson(applicationConfig))
      }
    }

  def getNode(path: ZNodePath): Action[Unit] =
    Action(playBodyParsers.empty).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = curatorRequest
        .apply(GetZNodeWithChildrenAction(path).free)
        .map(ApiResponse.success(_))
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def getChildrenNodes(path: ZNodePath): Action[Unit] =
    Action(playBodyParsers.empty).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = curatorRequest
        .apply(GetZNodeChildrenAction(path).free)
        .map(ApiResponse.success(_))
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def createNode(path: ZNodePath): Action[Unit] =
    Action(playBodyParsers.empty).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = curatorRequest
        .apply(CreateZNodeAction(path).free)
        .map(_ => ApiResponse.successEmpty)
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def duplicateNode(source: ZNodePath, destination: ZNodePath): Action[Unit] =
    Action(playBodyParsers.empty).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = curatorRequest
        .apply(DuplicateZNodeRecursiveAction(source, destination).free)
        .map(_ => ApiResponse.successEmpty)
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def moveNode(source: ZNodePath, destination: ZNodePath): Action[Unit] =
    Action(playBodyParsers.empty).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = curatorRequest
        .apply(MoveZNodeRecursiveAction(source, destination).free)
        .map(_ => ApiResponse.successEmpty)
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def deleteNode(path: ZNodePath, version: ZNodeDataVersion): Action[Unit] =
    Action(playBodyParsers.empty).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = curatorRequest
        .apply(DeleteZNodeRecursiveAction(path, version).free)
        .map(_ => ApiResponse.successEmpty)
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def deleteChildrenNodes(path: ZNodePath, names: Seq[String]): Action[Unit] =
    Action(playBodyParsers.empty).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = Task
        .fromTry(names.toList.traverse(path.down))
        .flatMap { t =>
          curatorRequest.apply(ForceDeleteZNodeRecursiveAction(t).free)
        }
        .map(_ => ApiResponse.successEmpty)
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def updateAcl(
    path: ZNodePath,
    version: ZNodeAclVersion,
    recursive: Option[Boolean]
  ): Action[JsValue] =
    Action(playBodyParsers.json).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = parseRequestBodyJson[List[Acl]]
        .flatMap {
          case jsonAclList if recursive.contains(true) =>
            curatorRequest(
              UpdateZNodeAclListRecursiveAction(path, ZNodeAcl(jsonAclList), version).free
            )

          case jsonAclList =>
            curatorRequest(UpdateZNodeAclListAction(path, ZNodeAcl(jsonAclList), version).free)
        }
        .map(ApiResponse.success(_))
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def updateData(path: ZNodePath, version: ZNodeDataVersion): Action[JsValue] =
    Action(playBodyParsers.json).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = parseRequestBodyJson[ZNodeData]
        .flatMap { t =>
          curatorRequest(UpdateZNodeDataAction(path, t, version).free)
        }
        .map(ApiResponse.success(_))
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def getExportNodes(paths: List[ZNodePath]): Action[Unit] =
    Action(playBodyParsers.empty).andThen(curatorAction).async { implicit curatorRequest =>
      val futureApiResponse = curatorRequest
        .apply(ExportZNodesAction(paths).free)
        .map(implicitly[Writes[List[Cofree[List, ZNodeExport]]]].writes)
        .map(Json.toBytes)
        .map(Gzip.compress)
        .map(Base64.getEncoder.encode)
        .map(new String(_, StandardCharsets.UTF_8))
        .map(ApiResponse.success(_))
        .runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  def importNodes(path: ZNodePath): Action[ByteString] =
    Action(playBodyParsers.byteString).andThen(curatorAction).async { implicit curatorRequest =>
      def applyImport(exportZNodes: List[Cofree[List, ZNodeExport]]) =
        curatorRequest
          .apply(ImportZNodesAction(path, exportZNodes).free)
          .map(ApiResponse.success(_))

      val importNodesT =
        curatorRequest.contentType match {
          case Some("application/json") =>
            implicitly[Reads[List[Cofree[List, ZNodeExport]]]]
              .reads(Json.parse(curatorRequest.body.toArray))
              .asEither
              .left
              .map(_ => malformedDataException)
              .toTry
              .traverse(applyImport)
              .flatMap(Task.fromTry)

          case Some("application/gzip") | Some("application/x-gzip") =>
            Gzip
              .decompress(curatorRequest.body.toArray)
              .flatMap { byteArray =>
                implicitly[Reads[List[Cofree[List, ZNodeExport]]]]
                  .reads(Json.parse(byteArray))
                  .asEither
                  .left
                  .map(_ => malformedDataException)
                  .toTry
              }
              .traverse(applyImport)
              .flatMap(Task.fromTry)

          case _ =>
            Task.raiseError(
              new BadRequestException(
                s"Unsupported content type: ${curatorRequest.contentType.getOrElse("?")}"
              )
            )
        }

      val futureApiResponse = importNodesT.runToFuture

      render.async { case Accepts.Json() =>
        futureApiResponse
          .map(apiResponse => Ok(Json.toJson(apiResponse)))
          .recoverWith(HttpException.resultHandler(curatorRequest, httpErrorHandler))
      }
    }

  implicit class CuratorRequestOps(curatorRequest: CuratorRequest[_]) {

    def apply[T](actionIO: ActionIO[T]): Task[T] = {
      val actionInterpreter = new CuratorActionInterpreter[Task](
        Resource.pure[Task, CuratorFramework](curatorRequest.curatorFramework)
      )

      actionInterpreter(actionIO)
    }
  }

  private def parseRequestBodyJson[T](implicit
    request: Request[JsValue],
    reads: Reads[T]
  ): Task[T] =
    request.body.validateOpt[T] match {
      case JsSuccess(Some(value), _) =>
        Task.now(value)
      case JsError(_) =>
        Task.raiseError(new BadRequestException("Malformed request body"))
      case JsSuccess(None, _) =>
        Task.raiseError(new BadRequestException("Missing request body"))
    }
}
