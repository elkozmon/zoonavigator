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

import {Inject, Injectable} from "@angular/core";
import {Maybe} from "tsmonad";
import {FormatterProvider} from "./formatter.provider";
import {Formatter} from "./formatters";
import {ModeId} from "../content";

@Injectable()
export class DefaultFormatterProvider extends FormatterProvider {

  private formatters: Map<ModeId, Formatter>;

  constructor(@Inject(Formatter) formatters: Formatter[]) {
    super();

    this.formatters = new Map(formatters.map<[ModeId, Formatter]>(f => [f.mode, f]));
  }

  getFormatter(mode: ModeId): Maybe<Formatter> {
    return Maybe.maybe(this.formatters.get(mode) || null);
  }
}
