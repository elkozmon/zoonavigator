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

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import "brace";
import "brace/ext/searchbox";
import "brace/mode/text";
import "brace/mode/json";
import "brace/mode/yaml";
import "brace/mode/xml";
import "brace/theme/chrome";
import {AceEditorComponent} from "ng2-ace-editor";
import {ModeId} from "./mode";

@Component({
  selector: "zoo-editor-data-editor",
  templateUrl: "znode-data-editor.component.html",
  styleUrls: ["znode-data-editor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZNodeDataEditorComponent {

  @ViewChild("dataEditor") set dataEditor(comp: AceEditorComponent) {
    if (comp) {
      this._dataEditor = comp;

      // Disable Ace editors search box
      this._dataEditor._editor.commands.removeCommand("find");
    }
  }

  @Output() submit: EventEmitter<any> = new EventEmitter();

  @Output() dataChange: EventEmitter<string> = new EventEmitter<string>();

  @Input("mode") set mode(id: ModeId) {
    this._dataEditor.setMode(this.modeIdToEditorMode.get(id));
  }

  @Input("wrapEnabled") set wrap(enabled: boolean) {
    this.editorOpts.wrap = enabled;
    this._dataEditor.setOptions(this.editorOpts);
  }

  @Input("data") set data(data: string) {
    this._dataEditor.setText(data);
  }

  editorOpts: any = {
    fontFamily: "\"Fira Code Retina\", monospace",
    fontSize: "10pt",
    wrap: true
  };

  private _dataEditor: AceEditorComponent;

  private modeIdToEditorMode: Map<ModeId, string> = new Map([
    [ModeId.Text, "text"],
    [ModeId.Base64, "text"],
    [ModeId.Json, "json"],
    [ModeId.Yaml, "yaml"],
    [ModeId.Xml, "xml"],
  ]);

  onDataChange(data: string): void {
    this.dataChange.emit(data);
  }

  onKeyDown(event: KeyboardEvent): void {
    if(navigator.platform.match('Mac')){
      this.onMacKeyDown(event);
    } else {
      this.onWindowsKeyDown(event);
    }
  }

  onMacKeyDown(event: KeyboardEvent) {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if (event.metaKey && charCode === 's') {
      // Submit on CMD + S
      event.preventDefault();
      this.submit.emit();
    }
  }

  onWindowsKeyDown(event: KeyboardEvent) {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if (event.ctrlKey && charCode === 's') {
      // Submit on CTRL + S
      event.preventDefault();
      this.submit.emit();
    }
  }
}
