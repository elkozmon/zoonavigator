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
import {Compression} from "./compression";
import {Observable, of} from "rxjs";

const pako = require("pako");
const isGzip = require("is-gzip");

@Injectable()
export class GzipCompression implements Compression {

  isCompressed(bytes: ArrayBuffer): boolean {
    return isGzip(new Uint8Array(bytes));
  }

  compress(bytes: ArrayBuffer): Observable<ArrayBuffer> {
    return of(pako.gzip(new Uint8Array(bytes)).buffer);
  }

  decompress(bytes: ArrayBuffer): Observable<ArrayBuffer> {
    return of(pako.ungzip(new Uint8Array(bytes)).buffer);
  }
}
