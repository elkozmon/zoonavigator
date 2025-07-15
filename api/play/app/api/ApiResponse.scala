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

final case class ApiResponse[+T](success: Boolean, message: Option[String], payload: Option[T])

object ApiResponse {

  val successEmpty: ApiResponse[Unit] =
    ApiResponse[Unit](success = true, None, None)

  def success[T](payload: T): ApiResponse[T] =
    ApiResponse(success = true, None, Some(payload))

  def success[T](payload: T, message: String): ApiResponse[T] =
    ApiResponse(success = true, Some(message), Some(payload))

  def failure[T](message: String): ApiResponse[T] =
    ApiResponse(success = false, Some(message), None)
}
