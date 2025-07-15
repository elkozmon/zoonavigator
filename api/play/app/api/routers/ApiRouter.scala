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

package api.routers

import api.controllers.ApiController
import play.api.http.HttpErrorHandler
import play.api.mvc.DefaultActionBuilder
import play.api.routing.Router.Routes
import play.api.routing.SimpleRouter
import play.api.routing.sird._

import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeAclVersion
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeDataVersion
import com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodePath

class ApiRouter(
  apiController: ApiController,
  httpErrorHandler: HttpErrorHandler,
  actionBuilder: DefaultActionBuilder
) extends SimpleRouter {

  override def routes: Routes = {
    case GET(p"/config") =>
      apiController.getConfig

    case GET(p"/znode" ? q"path=$path") =>
      apiController.getNode(ZNodePath(path))

    case GET(p"/znode/children" ? q"path=$path") =>
      apiController.getChildrenNodes(ZNodePath(path))

    case GET(p"/znode/export" ? q_s"paths=$paths") =>
      apiController.getExportNodes(paths.map(ZNodePath.apply).toList)

    case POST(p"/znode" ? q"path=$path") =>
      apiController.createNode(ZNodePath(path))

    case DELETE(p"/znode" ? q"path=$path" & q"version=${long(version)}") =>
      apiController.deleteNode(ZNodePath(path), ZNodeDataVersion(version))

    case POST(p"/znode/duplicate" ? q"source=$source" & q"destination=$destination") =>
      apiController.duplicateNode(ZNodePath(source), ZNodePath(destination))

    case POST(p"/znode/import" ? q"path=$path") =>
      apiController.importNodes(ZNodePath(path))

    case POST(p"/znode/move" ? q"source=$source" & q"destination=$destination") =>
      apiController.moveNode(ZNodePath(source), ZNodePath(destination))

    case DELETE(p"/znode/children" ? q"path=$path" & q_s"names=$names") =>
      apiController.deleteChildrenNodes(ZNodePath(path), names)

    case PUT(
          p"/znode/acl" ? q"path=$path" & q"version=${long(version)}" & q_o"recursive=${bool(recursive)}"
        ) =>
      apiController.updateAcl(ZNodePath(path), ZNodeAclVersion(version), recursive)

    case PUT(p"/znode/data" ? q"path=$path" & q"version=${long(version)}") =>
      apiController.updateData(ZNodePath(path), ZNodeDataVersion(version))

    case p =>
      actionBuilder.async(httpErrorHandler.onClientError(p, 404, "Not found"))
  }
}
