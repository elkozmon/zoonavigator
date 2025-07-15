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

import config.PlayAssetsPath
import config.PlayHttpContext
import controllers.Assets
import org.jsoup.Jsoup
import play.api.Environment
import play.api.mvc._
import play.mvc.Http.MimeTypes

import com.elkozmon.zoonavigator.core.utils.CommonUtils._

import java.math.BigInteger
import java.security.MessageDigest
import scala.jdk.CollectionConverters._

class FrontendController(
  assets: Assets,
  controllerComponents: ControllerComponents,
  environment: Environment,
  playAssetsPath: PlayAssetsPath,
  playHttpContext: PlayHttpContext
) extends AbstractController(controllerComponents) {

  def indexAction: Action[AnyContent] = {
    val indexHtml: String = {
      val path = playAssetsPath.path + "/index.html"
      val html = environment
        .resourceAsStream(path)
        .map(scala.io.Source.fromInputStream(_, "UTF-8"))
        .map(_.mkString)
        .get

      val document = Jsoup.parse(html, "UTF-8")
      document
        .getElementsByTag("base")
        .asScala
        .foreach(_.attr("href", playHttpContext.context.stripSuffix("/").concat("/")).discard())
      document.outerHtml()
    }

    val indexEtag: String = {
      val md5    = MessageDigest.getInstance("MD5")
      val md5Sum = md5.digest(indexHtml.getBytes)
      String.format("%032X", new BigInteger(1, md5Sum)).toLowerCase
    }

    Action {
      Ok(indexHtml)
        .as(MimeTypes.HTML)
        .withHeaders((ETAG, indexEtag))
    }
  }

  def assetOrDefault(resource: String): Action[AnyContent] =
    if (resource.contains(".") && resource != "index.html") {
      assets.at(resource)
    } else {
      indexAction
    }
}
