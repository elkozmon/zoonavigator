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
import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree} from "@angular/router";
import {ZNodeAclComponent} from "./znode-acl.component";
import {DialogService} from "../../../core/dialog";
import {Observable} from "rxjs";
import {switchMap} from "rxjs/operators";

@Injectable()
export class CanDeactivateZNodeAclComponent implements CanDeactivate<ZNodeAclComponent> {

  constructor(
    private dialogService: DialogService
  ) {
  }

  canDeactivate(
    component: ZNodeAclComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!component.aclForm) {
      return true;
    }

    if (!component.aclForm.isDirty) {
      return true;
    }

    const currentAt = currentState.root.queryParamMap.get("at");
    const currentPath = currentState.root.queryParamMap.get("path");

    const nextAt = nextState.root.queryParamMap.get("at");
    const nextPath = nextState.root.queryParamMap.get("path");

    const isSubmitRedirect = currentAt == nextAt && currentPath == nextPath;

    if (isSubmitRedirect) {
      return true;
    }

    return this.dialogService.showDiscardChanges(component.viewContainerRef);
  }
}
