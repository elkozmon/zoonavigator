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
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Maybe} from "tsmonad";
import {ConnectionManager} from "./connection-manager";
import {StorageService} from "../../storage";
import {ConnectionPreset} from "../connection-preset";
import {ConnectionParams} from "../connection-params";
import {ConfigService} from "../../../config";
import {of} from "rxjs/internal/observable/of";

@Injectable()
export class DefaultConnectionManager implements ConnectionManager {

  private connectionKey = "DefaultConnectionManager.connection";

  constructor(private storageService: StorageService, private configService: ConfigService) {
  }

  // TODO
  observeConnection(): Observable<Maybe<ConnectionPreset | ConnectionParams>> {
    return this.storageService
      .observe(this.connectionKey)
      .pipe(
        map((value) => Maybe.maybe(value ? JSON.parse(value) : null))
      );
  }

  // TODO
  useConnection(value: ConnectionPreset | ConnectionParams): Observable<void> {
    return this.storageService
      .set(this.connectionKey, JSON.stringify(value));
  }

  // TODO
  removeConnection(): Observable<void> {
    return this.storageService
      .remove(this.connectionKey);
  }
}
