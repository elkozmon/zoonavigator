/*
 * Copyright (C) 2020  Ľuboš Kozmon & Contributors
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

package utils

import api.formats.Json._
import play.api.libs.json._

import cats.Eval
import cats.free.Cofree

import com.elkozmon.zoonavigator.core.zookeeper.znode._

import scala.util.Try

object ImportParser {

  /**
   * Unify uploaded content into a ZNode export tree list consumable by ImportZNodesAction.
   *
   * Strategy:
   * - Try gzip + JSON decode into List[Cofree[List, ZNodeExport]]
   * - Else try plain JSON decode into List[Cofree[List, ZNodeExport]]
   * - Else synthesize a single-node tree using provided name under basePath with OPEN_ACL_UNSAFE and raw body as data
   *
   * @param basePath  Base ZNodePath where content should be imported under
   * @param body      Uploaded request bytes
   * @param nameOpt   Optional file name (required when body is not a ZooNavigator export)
   */
  def unify(
    basePath: ZNodePath,
    body: Array[Byte],
    nameOpt: Option[String]
  ): Try[List[Cofree[List, ZNodeExport]]] =
    parseExport(body).orElse(synthesizeSingleNodeTree(basePath, body, nameOpt))

  private def parseExport(bytes: Array[Byte]): Try[List[Cofree[List, ZNodeExport]]] = {
    val jsonReads = implicitly[Reads[List[Cofree[List, ZNodeExport]]]]

    def parseJson(b: Array[Byte]): Try[List[Cofree[List, ZNodeExport]]] =
      jsonReads
        .reads(Json.parse(b))
        .asEither
        .left
        .map(_ => new Exception("Malformed data"))
        .toTry

    Gzip.decompress(bytes).flatMap(parseJson).orElse(parseJson(bytes))
  }

  private def synthesizeSingleNodeTree(
    basePath: ZNodePath,
    body: Array[Byte],
    nameOpt: Option[String]
  ): Try[List[Cofree[List, ZNodeExport]]] =
    for {
      name <- nameOpt
        .filter(_.nonEmpty)
        .toRight(new Exception("Missing 'name' query parameter"))
        .toTry
      childPath <- basePath.down(name)
      openAcl    = ZNodeAcl.OpenAclUnsafe
      data       = ZNodeData(body)
      nodeExport = ZNodeExport(openAcl, childPath, data)
      tree       = Cofree[List, ZNodeExport](nodeExport, Eval.now(Nil))
    } yield List(tree)
}
