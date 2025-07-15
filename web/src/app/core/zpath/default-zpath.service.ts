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

import {Injectable} from "@angular/core";
import {ZPathService} from "./zpath.service";
import {ZPath} from "./zpath";

@Injectable()
export class DefaultZPathService implements ZPathService {

  parse(path: string): ZPath {
    // Validate first char
    if (path[0] !== "/") {
      throw new Error("Path must start with / character!");
    }

    // Handle root path
    if (path.length === 1) {
      return new ZPath([]);
    }

    // Strip trailing slash
    if (path.slice(-1) === "/") {
      path = path.slice(0, -1);
    }

    return new ZPath(path.split("/").slice(1));
  }

}
