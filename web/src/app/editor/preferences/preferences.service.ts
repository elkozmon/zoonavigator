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
import {Maybe} from "tsmonad";
import {ModeId} from "../content";

@Injectable()
export abstract class PreferencesService {

  abstract setModeFor(path: string, creationId: number, mode: Maybe<ModeId>): Observable<void>

  abstract getModeFor(path: string, creationId: number): Observable<Maybe<ModeId>>

  abstract setWrapFor(path: string, creationId: number, enabled: Maybe<boolean>): Observable<void>

  abstract getWrapFor(path: string, creationId: number): Observable<Maybe<boolean>>
}

