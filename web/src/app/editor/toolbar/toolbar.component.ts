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

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef} from "@angular/core";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatInput, MatSelectChange} from "@angular/material";
import {ActivatedRoute, Router} from "@angular/router";
import {EMPTY, of} from "rxjs";
import {catchError, map, mapTo, switchMap, take} from "rxjs/operators";
import {Maybe} from "tsmonad";
import {
  ConnectionManager,
  ConnectionParams,
  DialogService,
  FileSaverService,
  ZNodeExport,
  ZNodeService,
  ZNodeWithChildren,
  ZPath,
  ZPathService
} from "../../core";
import {EDITOR_QUERY_NODE_CONNECTION, EDITOR_QUERY_NODE_PATH} from "../editor-routing.constants";
import {CreateZNodeData} from "../../core/dialog";
import {Subscription} from "rxjs/Rx";
import {ConfigService} from "../../config";
import {ConnectionPreset} from "../../core/connection/connection-preset";
import {Observable} from "rxjs/Observable";

interface ConnectionOption {
  label: string;
  value: ConnectionPreset | ConnectionParams;
}

@Component({
  selector: "zoo-toolbar",
  templateUrl: "toolbar.component.html",
  styleUrls: ["toolbar.component.scss"],
  animations: [
    trigger("rotatedState", [
      state("default", style({transform: "rotate(0)"})),
      state("rotated", style({transform: "rotate(360deg)"})),
      transition("default => rotated", animate("400ms ease-in"))
    ])
  ]
})
export class ToolbarComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  @ViewChild("pathInput") pathInput: MatInput;

  @Output() refresh: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() duplicate: EventEmitter<any> = new EventEmitter();
  @Output() move: EventEmitter<any> = new EventEmitter();

  @Input() zPath: ZPath;
  @Input() zNode: Maybe<ZNodeWithChildren>;

  connections: Observable<(ConnectionPreset | ConnectionParams)[]>;
  connectionsOptionCurrent: Observable<ConnectionOption>;
  connectionsOptionArray: Observable<ConnectionOption[]>;

  navigationError: string;

  refreshButtonRotatedState = "default";

  compareConnections = (c1: ConnectionOption, c2: ConnectionOption): boolean => {
    if (c1.label !== c2.label) {
      return false;
    }

    if (c1.value.connectionString !== c2.value.connectionString) {
      return false;
    }

    return this.isConnectionPreset(c1.value) === this.isConnectionPreset(c2.value);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zNodeService: ZNodeService,
    private zPathService: ZPathService,
    private dialogService: DialogService,
    private configService: ConfigService,
    private connectionManager: ConnectionManager,
    private fileSaverService: FileSaverService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.connections = this.connectionManager.observeConnection().pipe(
      take(1), // hack to retain custom connection on connection change
      map((maybeConn) => {
          const connArray = maybeConn.caseOf<(ConnectionPreset | ConnectionParams)[]>({
            just: conn => {
              if (this.isConnectionPreset(conn)) {
                return [];
              }

              return [conn];
            },
            nothing: () => []
          });

          return connArray.concat(this.configService.config.connections);
        }
      )
    );

    this.connectionsOptionCurrent = this.connectionManager.observeConnection().pipe(
      switchMap((maybeConn) =>
        maybeConn.caseOf<Observable<ConnectionOption>>({
          just: conn => {
            if (this.isConnectionPreset(conn)) {
              return of({
                label: conn.name || conn.id,
                value: conn
              });
            }

            return of({
              label: conn.connectionString,
              value: conn
            });
          },
          nothing: () => EMPTY
        })
      )
    );

    this.connectionsOptionArray = this.connections.pipe(
      map((connections) =>
        connections.map(conn => {
          if (this.isConnectionPreset(conn)) {
            return {
              label: conn.name || conn.id,
              value: conn
            };
          }

          return {
            label: conn.connectionString,
            value: conn
          };
        })
      )
    );
  }

  isConnectionPreset(object: any): object is ConnectionPreset {
    return "id" in object;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = new Subscription(() => {
    });
  }

  onConnectionOptionChange(selectChange: MatSelectChange): void {
    const option = selectChange.value as ConnectionOption;
    const conn = option.value;

    if (this.isConnectionPreset(conn)) {
      this.subscription.add(
        this.connectionManager
          .useConnection(conn)
          .subscribe(() => {
            this.router.navigate([], {
                queryParams: {
                  [EDITOR_QUERY_NODE_CONNECTION]: encodeURI(conn.id)
                },
                queryParamsHandling: "merge"
              }
            )
          })
      );
      return;
    }

    this.subscription.add(
      this.connectionManager
        .useConnection(conn)
        .subscribe(() => {
          this.router.navigate([], {
              queryParams: {
                [EDITOR_QUERY_NODE_CONNECTION]: undefined
              },
              queryParamsHandling: "merge"
            }
          )
        })
    );
  }

  onRefreshClick(): void {
    this.refreshButtonRotatedState = "default";
    setTimeout(() => this.refreshButtonRotatedState = "rotated", 0);

    this.refresh.emit();
  }

  onHomeClick(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [EDITOR_QUERY_NODE_PATH]: undefined
      },
      queryParamsHandling: "merge"
    });
  }

  onDeleteClick(): void {
    const zNode = this.zNode.valueOrThrow();
    const zPath = this.zPath;
    const parentPath = zPath.goUp().path;

    this.subscription.add(
      this.dialogService
        .showRecursiveDeleteZNode(
          "Do you want to delete this node and its children?",
          this.viewContainerRef
        )
        .pipe(
          switchMap((confirm: boolean) => {
            if (confirm) {
              return this.zNodeService.deleteNode(zNode.path, zNode.meta.dataVersion);
            }

            return EMPTY;
          }),
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY)))
        )
        .subscribe(
          () => {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {
                [EDITOR_QUERY_NODE_PATH]: encodeURI(parentPath)
              },
              queryParamsHandling: "merge"
            });
          }
        )
    );
  }

  onExportClick(): void {
    this.subscription.add(
      this.zNodeService
        .exportNodes([this.zPath.path])
        .pipe(
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY)))
        )
        .subscribe(
          (data: ZNodeExport) => this.fileSaverService.save(data.blob, data.name)
        )
    );
  }

  onDuplicateClick(): void {
    const source = this.zNode.valueOrThrow().path;

    this.subscription.add(
      this.dialogService
        .showDuplicateZNode(
          {
            path: source,
            redirect: false
          },
          this.viewContainerRef
        )
        .pipe(
          switchMap((maybeData) =>
            maybeData.caseOf({
              just: data => this.zNodeService
                .duplicateNode(source, data.path)
                .pipe(mapTo(data)),
              nothing: () => EMPTY
            })
          ),
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY)))
        )
        .subscribe(
          (data: CreateZNodeData) => {
            if (data.redirect) {
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                  [EDITOR_QUERY_NODE_PATH]: encodeURI(data.path)
                },
                queryParamsHandling: "merge"
              });

              return;
            }

            this.refresh.emit();
          }
        )
    );
  }

  onMoveClick(): void {
    const source = this.zNode.valueOrThrow().path;

    this.subscription.add(
      this.dialogService
        .showMoveZNode(
          {
            path: source
          },
          this.viewContainerRef
        )
        .pipe(
          switchMap((maybeData) =>
            maybeData.caseOf({
              just: data => this.zNodeService
                .moveNode(source, data.path)
                .pipe(mapTo(data)),
              nothing: () => EMPTY
            })
          ),
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY)))
        )
        .subscribe(
          (data: CreateZNodeData) => {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {
                [EDITOR_QUERY_NODE_PATH]: encodeURI(data.path)
              },
              queryParamsHandling: "merge"
            });
          }
        )
    );
  }

  onPathKeyPress(event: KeyboardEvent): void {
    if (event.which === 13) {
      // Enter pressed
      this.navigatePath(this.pathInput.value);
    }
  }

  navigatePath(path: string): void {
    // Parse (validate) path
    const zPath = this.zPathService.parse(path);

    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: {
          [EDITOR_QUERY_NODE_PATH]: encodeURI(zPath.path)
        },
        queryParamsHandling: "merge"
      })
      .catch(err => this.handleNavigateError(err));
  }

  handleNavigateError(error: string): void {
    this.navigationError = error;
  }
}
