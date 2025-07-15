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
import {ZNodeService} from "./znode.service";
import {Observable} from "rxjs";
import {ZNodeExport} from "./znode-export";
import {ZNodeChildren} from "./znode-children";
import {ZNodeWithChildren} from "./znode-with-children";
import {ZNodeAcl} from "./znode-acl";
import {ZNodeMeta} from "./znode-meta";
import {ZNodeData} from "./znode-data";

@Injectable()
export class PathSanitizingZNodeService implements ZNodeService {

  private static stripSeparatorSuffix(path: string): string {
    return path.endsWith("/") && path.length > 1
      ? path.substr(0, path.length - 1)
      : path;
  }

  constructor(
    private zNodeService: ZNodeService
  ) {
  }

  createNode(path: string): Observable<void> {
    return this.zNodeService.createNode(
      PathSanitizingZNodeService.stripSeparatorSuffix(path)
    );
  }

  deleteChildren(path: string, names: string[]): Observable<void> {
    return this.zNodeService.deleteChildren(
      PathSanitizingZNodeService.stripSeparatorSuffix(path),
      names
    );
  }

  deleteNode(path: string, version: number): Observable<void> {
    return this.zNodeService.deleteNode(
      PathSanitizingZNodeService.stripSeparatorSuffix(path),
      version
    );
  }

  duplicateNode(sourcePath: string, destinationPath: string): Observable<void> {
    return this.zNodeService.duplicateNode(
      PathSanitizingZNodeService.stripSeparatorSuffix(sourcePath),
      PathSanitizingZNodeService.stripSeparatorSuffix(destinationPath)
    );
  }

  exportNodes(paths: string[]): Observable<ZNodeExport> {
    return this.zNodeService.exportNodes(
      paths.map(PathSanitizingZNodeService.stripSeparatorSuffix)
    );
  }

  getChildren(path: string): Observable<ZNodeChildren> {
    return this.zNodeService.getChildren(
      PathSanitizingZNodeService.stripSeparatorSuffix(path)
    );
  }

  getNode(path: string): Observable<ZNodeWithChildren> {
    return this.zNodeService.getNode(
      PathSanitizingZNodeService.stripSeparatorSuffix(path)
    );
  }

  importNodes(path: string, file: File): Observable<void> {
    return this.zNodeService.importNodes(
      PathSanitizingZNodeService.stripSeparatorSuffix(path),
      file
    );
  }

  moveNode(sourcePath: string, destinationPath: string): Observable<void> {
    return this.zNodeService.moveNode(
      PathSanitizingZNodeService.stripSeparatorSuffix(sourcePath),
      PathSanitizingZNodeService.stripSeparatorSuffix(destinationPath)
    );
  }

  setAcl(path: string, version: number, acl: ZNodeAcl, recursively: boolean): Observable<ZNodeMeta> {
    return this.zNodeService.setAcl(
      PathSanitizingZNodeService.stripSeparatorSuffix(path),
      version,
      acl,
      recursively
    );
  }

  setData(path: string, version: number, data: ZNodeData): Observable<ZNodeMeta> {
    return this.zNodeService.setData(
      PathSanitizingZNodeService.stripSeparatorSuffix(path),
      version,
      data
    );
  }
}
