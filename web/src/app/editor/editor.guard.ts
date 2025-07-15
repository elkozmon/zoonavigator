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
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, PRIMARY_OUTLET, Router, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {switchMap, map, mapTo, take, tap} from "rxjs/operators";
import {ConnectionManager} from "../core/connection/manager";
import {CONNECT_QUERY_RETURN_URL} from "../connect/connect-routing.constants";
import {EDITOR_QUERY_NODE_CONNECTION} from "./editor-routing.constants";
import {ConfigService} from "../config";
import {ConnectionPreset} from "../core/connection/connection-preset";

@Injectable()
export class EditorGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    private connectionManager: ConnectionManager,
    private configService: ConfigService,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkConnection(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }

  private isConnectionPreset(object: any): object is ConnectionPreset {
    return "id" in object;
  }

  private checkConnection(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.connectionManager
      .observeConnection()
      .pipe(
        take(1),
        switchMap((maybeConnection) => {
          if (route.queryParamMap.has(EDITOR_QUERY_NODE_CONNECTION)) {
            const connId = decodeURI(route.queryParamMap.get(EDITOR_QUERY_NODE_CONNECTION));
            const conn = this.configService.config.connections.find(f => f.id === connId);

            if (conn) {
              return this.connectionManager.useConnection(conn).pipe(mapTo(true));
            }
          }

          const connection = maybeConnection.valueOr(null);

          if (connection) {
            // add node connection query param when using preset conn
            if (this.isConnectionPreset(connection) && !route.queryParamMap.has(EDITOR_QUERY_NODE_CONNECTION)) {
              const segments = route
                .url
                .map(s => s.path);

              this.router.navigate(segments, {
                  queryParams: {
                    [EDITOR_QUERY_NODE_CONNECTION]: encodeURI(connection.id)
                  },
                  queryParamsHandling: "merge"
                }
              );

              return of(false);
            }

            // remove node connection query param when not using preset conn
            if (!this.isConnectionPreset(connection) && route.queryParamMap.has(EDITOR_QUERY_NODE_CONNECTION)) {
              const segments = route
                .url
                .map(s => s.path);

              this.router.navigate(segments, {
                  queryParams: {
                    [EDITOR_QUERY_NODE_CONNECTION]: undefined
                  },
                  queryParamsHandling: "merge"
                }
              );

              return of(false);
            }

            return of(true);
          }

          this.router.navigate(["connect"], {
              queryParams: {
                [CONNECT_QUERY_RETURN_URL]: encodeURI(state.url)
              }
            }
          );

          return of(false);
        })
      );
  }
}
