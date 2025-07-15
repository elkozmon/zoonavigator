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
import {ModeProvider} from "./mode.provider";
import {Mode} from "./mode";
import {ModeId} from "./mode-id";
import {TextMode} from "./text-mode";
import {Base64Mode} from "./base64-mode";
import {XmlMode} from "./xml-mode";
import {JsonMode} from "./json-mode";
import {YamlMode} from "./yaml-mode";

@Injectable()
export class DefaultModeProvider implements ModeProvider {
  private modes: Map<ModeId, Mode> = new Map([
    [ModeId.Text, new TextMode()],
    [ModeId.Yaml, new YamlMode()],
    [ModeId.Json, new JsonMode()],
    [ModeId.Xml, new XmlMode()],
    [ModeId.Base64, new Base64Mode()]
  ]);

  getMode(modeId: ModeId): Mode {
    return this.modes.get(modeId);
  }
}
