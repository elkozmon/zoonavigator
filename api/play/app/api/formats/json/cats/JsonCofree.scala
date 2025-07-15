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

package api.formats.json.cats

import play.api.libs.functional.syntax._
import play.api.libs.json._

import cats.Eval
import cats.free.Cofree

import scala.collection.Factory

trait JsonCofree extends DefaultReads with DefaultWrites {

  implicit def cofreeEvalSWrites[S[M] <: Iterable[M], A](implicit
    writesA: Writes[A]
  ): Writes[Eval[S[Cofree[S, A]]]] =
    s => traversableWrites[Cofree[S, A]].writes(s.value)

  implicit def cofreeWrites[S[M] <: Iterable[M], A](implicit
    writesA: Writes[A]
  ): Writes[Cofree[S, A]] =
    (
      (JsPath \ "h").write[A] and
        (JsPath \ "t").lazyWrite[Eval[S[Cofree[S, A]]]](cofreeEvalSWrites[S, A])
    )(unlift(Cofree.unapply[S, A]))

  implicit def cofreeEvalSReads[S[_], A](implicit
    readsA: Reads[A],
    f: Factory[Cofree[S, A], S[Cofree[S, A]]]
  ): Reads[Eval[S[Cofree[S, A]]]] =
    traversableReads[S, Cofree[S, A]].map(Eval.now)

  implicit def cofreeReads[S[_], A](implicit
    readsA: Reads[A],
    f: Factory[Cofree[S, A], S[Cofree[S, A]]]
  ): Reads[Cofree[S, A]] =
    (
      (JsPath \ "h").read[A] and
        (JsPath \ "t").lazyRead[Eval[S[Cofree[S, A]]]](cofreeEvalSReads)
    ).apply((f1, f2) => Cofree(f1, f2))
}
