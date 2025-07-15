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

import api.controllers.ApiController
import api.controllers.FrontendController
import curator.provider.CuratorFrameworkProvider
import loggers.AppLogger
import play.api.BuiltInComponentsFromContext

//noinspection ScalaUnusedSymbol
trait AppModule {
  self: BuiltInComponentsFromContext =>

  val appLogger: AppLogger

  val curatorFrameworkProvider: CuratorFrameworkProvider

  val frontendController: FrontendController

  val apiController: ApiController
}
