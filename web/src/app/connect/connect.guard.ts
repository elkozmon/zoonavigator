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
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {map, take, tap} from "rxjs/operators";
import {ConnectionManager} from "../core/connection/manager";
import {CONNECT_QUERY_RETURN_URL} from "./connect-routing.constants";
import {EDITOR_QUERY_NODE_PATH} from "../editor";

/**
 * Checks whether user already has an active connection.
 * If so, redirects user directly to the editor.
 */
@Injectable()
export class ConnectGuard implements CanActivate {

  constructor(
    private router: Router,
    private connectionManager: ConnectionManager
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.connectionManager
      .observeConnection()
      .pipe(
        take(1),
        map((maybeConnection) => {
          const connectionExists = maybeConnection
            .map(() => true)
            .valueOr(false);

          if (!connectionExists) {
            return true;
          }

          const queryParams = {};

          if (route.queryParamMap.has(CONNECT_QUERY_RETURN_URL)) {
            queryParams[EDITOR_QUERY_NODE_PATH] = route.queryParamMap.get(CONNECT_QUERY_RETURN_URL);
          }

          this.router.navigate(["editor"], {
              queryParams: queryParams
            }
          );

          return false;
        })
      );
  }
}
