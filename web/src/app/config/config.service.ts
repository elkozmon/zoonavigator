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

import {HttpClient} from "@angular/common/http";
import {Inject, Injectable} from "@angular/core";
import {Config} from "./config";
import {APP_BASE_HREF} from "@angular/common";
import {environment} from "../../environments/environment";

@Injectable()
export class ConfigService {

  private _config: Config;

  constructor(
    private httpClient: HttpClient,
    @Inject(APP_BASE_HREF) private baseHref: string
  ) {
  }

  load() {
    return this.httpClient
      .get(this.baseHref.replace(/\/$/, "") + environment.apiHref.replace(/\/$/, "") + "/config")
      .forEach((data: Config) => this._config = data);
  }

  get config(): Config {
    return this._config;
  }
}
