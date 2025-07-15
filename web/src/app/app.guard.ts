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
import {ActivatedRouteSnapshot, CanActivate, PRIMARY_OUTLET, Router, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {ConfigService} from "./config";
import {ConnectionManager} from "./core";
import {CONNECT_QUERY_ERROR_MSG, CONNECT_QUERY_RETURN_URL} from "./connect/connect-routing.constants";
import {ConnectionPreset} from "./core/connection/connection-preset";
import {EDITOR_QUERY_NODE_CONNECTION} from "./editor";

/**
 * Looks for auto-connect configuration which this guard uses
 * to connect to ZooKeeper and then redirects user to editor.
 *
 * Otherwise it redirects user to connect form.
 */
@Injectable()
export class AppGuard implements CanActivate {

  constructor(
    private router: Router,
    private configService: ConfigService,
    private connectionManager: ConnectionManager
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const autoConnect = this.configService.config.autoConnect;

    if (autoConnect) {
      const conn: ConnectionPreset | undefined = this.configService.config.connections.find(t => t.id === autoConnect);

      if (conn) {
        this.connectionManager
          .useConnection(conn)
          .subscribe(
            () => {
              if (route.queryParamMap.has(CONNECT_QUERY_RETURN_URL)) {
                this.router.navigateByUrl(route.queryParamMap.get(CONNECT_QUERY_RETURN_URL));

                return;
              }

              this.navigateToEditor();
            },
            error => this.navigateToConnect(route, error)
          );
      } else {
        this.navigateToConnect(route, `Auto connect failed. Make sure connection with id '${autoConnect}' was defined.`);
      }
    } else {
      this.navigateToConnect(route);
    }

    return of(false);
  }

  private navigateToEditor(): void {
    this.router.navigate(["editor"]);
  }

  private navigateToConnect(
    route: ActivatedRouteSnapshot,
    error?: string
  ): void {
    const queryParams = {};

    if (error) {
      queryParams[CONNECT_QUERY_ERROR_MSG] = encodeURI(error);
    }

    if (route.queryParamMap.has(CONNECT_QUERY_RETURN_URL)) {
      queryParams[CONNECT_QUERY_RETURN_URL] = encodeURI(route.queryParamMap.get(CONNECT_QUERY_RETURN_URL));
    }

    this.router.navigate(["connect"], {
      queryParams: queryParams
    });
  }
}
