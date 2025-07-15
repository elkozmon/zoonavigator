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

import {Injectable, ViewContainerRef} from "@angular/core";
import {Observable} from "rxjs";
import {ConfirmData, CreateZNodeData, DuplicateZNodeData, ImportZNodesData, InfoData, MoveZNodeData} from "./dialogs";
import {Maybe} from "tsmonad";

@Injectable()
export abstract class DialogService {

  abstract showDiscardChanges(
    viewRef?: ViewContainerRef
  ): Observable<boolean>

  abstract showCreateZNode(
    defaults: CreateZNodeData,
    viewRef?: ViewContainerRef
  ): Observable<Maybe<CreateZNodeData>>

  abstract showImportZNodes(
    defaults: ImportZNodesData,
    viewRef?: ViewContainerRef
  ): Observable<Maybe<ImportZNodesData>>

  abstract showDuplicateZNode(
    defaults: DuplicateZNodeData,
    viewRef?: ViewContainerRef
  ): Observable<Maybe<DuplicateZNodeData>>

  abstract showRecursiveDeleteZNode(
    message: string,
    viewRef?: ViewContainerRef
  ): Observable<boolean>

  abstract showMoveZNode(
    defaults: MoveZNodeData,
    viewRef?: ViewContainerRef
  ): Observable<Maybe<MoveZNodeData>>

  abstract showError(
    error: Error,
    viewRef?: ViewContainerRef
  ): Observable<void>

  abstract showConfirm(
    options: ConfirmData,
    viewRef?: ViewContainerRef
  ): Observable<boolean>

  abstract showInfo(
    options: InfoData,
    viewRef?: ViewContainerRef
  ): Observable<void>

  abstract showSnackbar(
    message: string,
    viewRef?: ViewContainerRef
  ): Observable<void>
}
