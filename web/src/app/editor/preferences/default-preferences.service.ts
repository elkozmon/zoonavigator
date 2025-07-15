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
import {PreferencesService} from "./preferences.service";
import {ModeId} from "../content";
import {StorageService} from "../../core/storage";

@Injectable()
export class DefaultPreferencesService extends PreferencesService {

  private static getModeKey(path: string, creationId: number): string {
    return "DefaultPreferencesService.modeId:" + path + "@" + creationId;
  }

  private static getWrapKey(path: string, creationId: number): string {
    return "DefaultPreferencesService.wrap:" + path + "@" + creationId;
  }

  constructor(private storageService: StorageService) {
    super();
  }

  setModeFor(path: string, creationId: number, mode: Maybe<ModeId>): Observable<void> {
    const key = DefaultPreferencesService.getModeKey(path, creationId);

    return mode.caseOf({
      just: val => this.storageService.set(key, val),
      nothing: () => this.storageService.remove(key)
    });
  }

  getModeFor(path: string, creationId: number): Observable<Maybe<ModeId>> {
    const key = DefaultPreferencesService.getModeKey(path, creationId);

    return this.storageService
      .observe(key)
      .pipe(
        map(Maybe.maybe)
      );
  }

  setWrapFor(path: string, creationId: number, enabled: Maybe<boolean>): Observable<void> {
    const key = DefaultPreferencesService.getWrapKey(path, creationId);

    return enabled.caseOf({
      just: val => this.storageService.set(key, val ? "true" : "false"),
      nothing: () => this.storageService.remove(key)
    });
  }

  getWrapFor(path: string, creationId: number): Observable<Maybe<boolean>> {
    const key = DefaultPreferencesService.getWrapKey(path, creationId);

    return this.storageService
      .observe(key)
      .pipe(
        map(Maybe.maybe),
        map(ms => ms.map(s => s === "true"))
      );
  }
}
