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

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {ModeId} from "./mode";
import {CompressionId} from "./compression";
import {Maybe} from "tsmonad";

@Component({
  selector: "zoo-editor-data-toolbar",
  templateUrl: "znode-data-toolbar.component.html",
  styleUrls: ["znode-data-toolbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZNodeDataToolbarComponent {

  @Input() submitEnabled: boolean;
  @Output() submit: EventEmitter<any> = new EventEmitter();

  @Input() formatEnabled: boolean;
  @Output() format: EventEmitter<any> = new EventEmitter();

  @Input() wrapEnabled: boolean;
  @Output() wrapChange: EventEmitter<boolean> = new EventEmitter();

  @Input() modes: ModeId[];
  @Input() compressions: CompressionId[];

  @Input() mode: ModeId;
  @Output() modeChange: EventEmitter<ModeId> = new EventEmitter();

  @Input() compression: Maybe<CompressionId>;
  @Output() compressionChange: EventEmitter<Maybe<CompressionId>> = new EventEmitter();

  get compressionLabel(): string {
    return this.compression
      .map(x => x.toString())
      .valueOr("none");
  }

  get submitShortcutTooltip(): string {
    if(navigator.platform.match('Mac')){
      return "CMD+S";
    } else {
      return "CTRL+S";
    }
  }

  onSubmit(): void {
    this.submit.emit();
  }

  onFormat(): void {
    this.format.emit();
  }

  onToggleWrap(): void {
    this.wrapChange.emit(!this.wrapEnabled);
  }

  onModeChange(modeId: ModeId): void {
    this.modeChange.emit(modeId);
  }

  onCompressionChange(compressionId: CompressionId): void {
    this.compressionChange.emit(Maybe.maybe(compressionId));
  }
}
