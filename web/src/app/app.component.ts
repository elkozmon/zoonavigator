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

import {Component, OnDestroy, OnInit} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {ActivatedRoute} from "@angular/router";
import {EDITOR_QUERY_NODE_PATH} from "./editor";
import {Subscription, of, zip} from "rxjs";
import {ConnectionManager} from "./core/connection/manager";
import {switchMap} from "rxjs/operators";
import {ConnectionPreset} from "./core/connection/connection-preset";

@Component({
  selector: "zoo-app",
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  constructor(
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private connectionManager: ConnectionManager
  ) {
  }

  private isConnectionPreset(object: any): object is ConnectionPreset {
    return "id" in object;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = new Subscription(() => {});

    this.subscription.add(
      this.activatedRoute
        .queryParamMap
        .pipe(
          switchMap(map => zip(of(map), this.connectionManager.observeConnection()))
        )
        .subscribe(
          ([map, maybeConnection]) => {
            let title = "ZooNavigator";

            maybeConnection.caseOf({
              just: val => {
                if (this.isConnectionPreset(val)) {
                  title += " – " + (val.name || val.id);
                }
              },
              nothing: () => {}
            });

            if (map.has(EDITOR_QUERY_NODE_PATH) && map.get(EDITOR_QUERY_NODE_PATH).length > 1) {
              title += " – " + decodeURI(map.get(EDITOR_QUERY_NODE_PATH))
            }

            this.titleService.setTitle(title);
          }
        )
    );
  }
}
