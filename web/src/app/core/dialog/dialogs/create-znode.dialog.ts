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

import {Component, Inject, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatButton} from "@angular/material"
import {CreateZNodeData} from "./create-znode.data";

@Component({
  selector: "zoo-create-znode.dialog",
  templateUrl: "create-znode.dialog.html",
  styleUrls: ["dialog.scss"]
})
export class CreateZNodeDialogComponent {

  @ViewChild("submitButton") submitButton: MatButton;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CreateZNodeData) {
  }

  onKeyPress(event: KeyboardEvent): void {
    const code = event.which || event.keyCode;

    if (code === 13) {
      this.submitButton._elementRef.nativeElement.click();
    }
  }
}
