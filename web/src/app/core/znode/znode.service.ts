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
import {ZNodeAcl} from "./znode-acl";
import {ZNodeMeta} from "./znode-meta";
import {ZNodeData} from "./znode-data";
import {ZNodeChildren} from "./znode-children";
import {ZNodeWithChildren} from "./znode-with-children";
import {ZNodeExport} from "./znode-export";

@Injectable()
export abstract class ZNodeService {

  abstract getNode(
    path: string
  ): Observable<ZNodeWithChildren>

  abstract createNode(
    path: string
  ): Observable<void>

  abstract deleteNode(
    path: string,
    version: number
  ): Observable<void>

  abstract duplicateNode(
    sourcePath: string,
    destinationPath: string
  ): Observable<void>

  abstract moveNode(
    sourcePath: string,
    destinationPath: string
  ): Observable<void>

  abstract setAcl(
    path: string,
    version: number,
    acl: ZNodeAcl,
    recursively: boolean
  ): Observable<ZNodeMeta>

  abstract setData(
    path: string,
    version: number,
    data: ZNodeData
  ): Observable<ZNodeMeta>

  abstract getChildren(
    path: string
  ): Observable<ZNodeChildren>

  abstract deleteChildren(
    path: string,
    names: string[]
  ): Observable<void>

  abstract exportNodes(
    paths: string[]
  ): Observable<ZNodeExport>

  abstract importNodes(
    path: string,
    file: File
  ): Observable<void>
}
