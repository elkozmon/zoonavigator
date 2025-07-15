/*
 * Copyright (C) 2019  Ľuboš Kozmon <https://www.elkozmon.com>
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

import {ZNodePath} from "../znode/znode-path";
import {Maybe} from "tsmonad";

export class ZPath {

  constructor(private segments: string[]) {
  }

  get name(): Maybe<string> {
    return this.isRoot ? Maybe.nothing() : Maybe.just(this.segments.slice(-1)[0]);
  }

  get path(): ZNodePath {
    return "/" + this.segments.join("/");
  }

  get isRoot(): boolean {
    return this.segments.length === 0;
  }

  goUp(): ZPath {
    if (this.isRoot) {
      return this;
    }

    const copy = this.segments.slice();
    copy.pop();

    return new ZPath(copy);
  }

  goDown(name: string): ZPath {
    const copy = this.segments.slice();
    copy.push(name);

    return new ZPath(copy);
  }
}
