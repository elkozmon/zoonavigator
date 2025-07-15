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

import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatButtonModule, MatCheckboxModule, MatDialogModule, MatIconModule, MatInputModule} from "@angular/material";
import {CovalentFileModule} from "@covalent/core";
import {ApiRequestFactory, ApiService, DefaultApiRequestFactory, DefaultApiService} from "./api";
import {DefaultConnectionManager, ConnectionManager} from "./connection";
import {
  ConfirmDialogComponent,
  CreateZNodeDialogComponent,
  DefaultDialogService,
  DialogService,
  DuplicateZNodeDialogComponent,
  ImportZNodesDialogComponent,
  InfoDialogComponent,
  MoveZNodeDialogComponent
} from "./dialog";
import {LocalStorageService, StorageService} from "./storage";
import {DefaultFileSaverService, FileSaverService} from "./file-saver";
import {DefaultZPathService, ZPathService} from "./zpath";
import {ApiZNodeService, ZNodeService} from "./znode";
import {DefaultFileReaderService, FileReaderService} from "./file-reader";
import {PathSanitizingZNodeService} from "./znode/path-sanitizing-znode.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    CovalentFileModule
  ],
  providers: [
    {provide: ApiService, useClass: DefaultApiService},
    {provide: ApiRequestFactory, useClass: DefaultApiRequestFactory},
    {provide: StorageService, useClass: LocalStorageService},
    {provide: FileSaverService, useClass: DefaultFileSaverService},
    {provide: FileReaderService, useClass: DefaultFileReaderService},
    ApiZNodeService,
    {provide: ZNodeService, deps: [ApiZNodeService], useFactory: (apiService) => new PathSanitizingZNodeService(apiService)},
    {provide: ZPathService, useClass: DefaultZPathService},
    {provide: ConnectionManager, useClass: DefaultConnectionManager},
    {provide: DialogService, useClass: DefaultDialogService}
  ],
  entryComponents: [
    MoveZNodeDialogComponent,
    CreateZNodeDialogComponent,
    ImportZNodesDialogComponent,
    DuplicateZNodeDialogComponent,
    ConfirmDialogComponent,
    InfoDialogComponent
  ],
  declarations: [
    MoveZNodeDialogComponent,
    CreateZNodeDialogComponent,
    ImportZNodesDialogComponent,
    DuplicateZNodeDialogComponent,
    ConfirmDialogComponent,
    InfoDialogComponent
  ]
})
export class CoreModule {
}
