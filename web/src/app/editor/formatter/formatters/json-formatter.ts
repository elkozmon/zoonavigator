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
import {Observable, of, throwError} from "rxjs";
import {Formatter} from "./formatter";
import {ModeId} from "../../content/data/mode";

@Injectable()
export class JsonFormatter extends Formatter {

  mode: ModeId = ModeId.Json;

  format(data: string): Observable<string> {
    try {
      return of(<string>JSON.stringify(JSON.parse(data), null, 4));
    } catch (e) {
      console.error(e);

      return throwError(new Error("Invalid JSON (see console for more info)"));
    }
  }
}
