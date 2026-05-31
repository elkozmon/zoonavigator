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

import {AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import "brace";
import "brace/ext/searchbox";
import "brace/mode/text";
import "brace/mode/json";
import "brace/mode/yaml";
import "brace/mode/xml";
import "brace/theme/chrome";
import {AceComponent, AceConfigInterface} from "ngx-ace-wrapper";
import {ModeId} from "./mode";

@Component({
  standalone: false,
  selector: "zoo-editor-data-editor",
  templateUrl: "znode-data-editor.component.html",
  styleUrls: ["znode-data-editor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZNodeDataEditorComponent implements AfterViewInit {

  @ViewChild("dataEditor") dataEditor: AceComponent;

  @Output() submit: EventEmitter<any> = new EventEmitter();

  @Output() dataChange: EventEmitter<string> = new EventEmitter<string>();

  editorOpts: AceConfigInterface = {
    fontFamily: "\"Fira Code Retina\", monospace",
    fontSize: "10pt",
    wrap: true
  };

  editorData = "";
  editorMode = "text";

  private modeIdToEditorMode: Map<ModeId, string> = new Map([
    [ModeId.Text, "text"],
    [ModeId.Base64, "text"],
    [ModeId.Json, "json"],
    [ModeId.Yaml, "yaml"],
    [ModeId.Xml, "xml"],
  ]);

  @Input("mode") set mode(id: ModeId) {
    this.editorMode = this.modeIdToEditorMode.get(id) || "text";
  }

  @Input("wrapEnabled") set wrap(enabled: boolean) {
    this.editorOpts = {
      ...this.editorOpts,
      wrap: enabled
    };
  }

  @Input("data") set data(data: string) {
    this.editorData = data;
  }

  ngAfterViewInit(): void {
    const editor = this.dataEditor.directiveRef && this.dataEditor.directiveRef.ace();

    if (editor) {
      (editor.commands as any).removeCommand("find");
    }
  }

  onDataChange(data: string): void {
    this.dataChange.emit(data);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (navigator.platform.match("Mac")) {
      this.onMacKeyDown(event);
    } else {
      this.onWindowsKeyDown(event);
    }
  }

  onMacKeyDown(event: KeyboardEvent) {
    const charCode = String.fromCharCode(event.which).toLowerCase();
    if (event.metaKey && charCode === "s") {
      // Submit on CMD + S
      event.preventDefault();
      this.submit.emit();
    }
  }

  onWindowsKeyDown(event: KeyboardEvent) {
    const charCode = String.fromCharCode(event.which).toLowerCase();
    if (event.ctrlKey && charCode === "s") {
      // Submit on CTRL + S
      event.preventDefault();
      this.submit.emit();
    }
  }
}
