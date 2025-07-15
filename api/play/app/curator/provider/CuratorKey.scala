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

package curator.provider

import zookeeper.AuthInfo
import zookeeper.ConnectionString

import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.SecureRandom

final case class CuratorKey(connectionString: ConnectionString, authInfoHash: String)

object CuratorKey {

  private val utf8 = StandardCharsets.UTF_8

  private val randomSalt: Array[Byte] = {
    val secureRandom = new SecureRandom()
    val bytes        = Array.fill[Byte](20)(0)

    secureRandom.nextBytes(bytes)
    bytes
  }

  def apply(connectionString: ConnectionString, authInfoList: List[AuthInfo]): CuratorKey = {
    val authInfoListBytes = authInfoList
      .flatMap(info => info.scheme.toString.getBytes(utf8) ++ info.auth)
      .toArray

    val digestedBytes = MessageDigest
      .getInstance("SHA-256")
      .digest(randomSalt ++ authInfoListBytes)

    CuratorKey(connectionString, new String(digestedBytes, utf8))
  }
}
