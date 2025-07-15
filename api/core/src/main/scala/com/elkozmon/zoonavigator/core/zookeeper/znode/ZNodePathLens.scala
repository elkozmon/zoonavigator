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

package com.elkozmon.zoonavigator.core.zookeeper.znode

trait ZNodePathLens[T] {

  def path(obj: T): ZNodePath

  def update(obj: T, path: ZNodePath): T
}

object ZNodePathLens {

  implicit object ZNodeExportPathLens extends ZNodePathLens[ZNodeExport] {
    override def path(obj: ZNodeExport): ZNodePath = obj.path

    override def update(obj: ZNodeExport, path: ZNodePath): ZNodeExport =
      obj.copy(path = path)
  }

  implicit object ZNodePathLens extends ZNodePathLens[ZNode] {
    override def path(obj: ZNode): ZNodePath = obj.path

    override def update(obj: ZNode, path: ZNodePath): ZNode =
      obj.copy(path = path)
  }
}
