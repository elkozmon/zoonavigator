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

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewContainerRef} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EMPTY, of} from "rxjs";
import {catchError, map, mapTo, switchMap, switchMapTo} from "rxjs/operators";
import {difference} from "underscore";
import {Ordering} from "../ordering";
import {DialogService, FileSaverService, ZNodeExport, ZNodePath, ZNodeService, ZPath} from "../../core";
import {EDITOR_QUERY_NODE_PATH} from "../editor-routing.constants";
import {DuplicateZNodeData, MoveZNodeData} from "../../core/dialog/dialogs";
import {CreateZNodeData} from "../../core/dialog";
import {Subscription} from "rxjs/Rx";

@Component({
  selector: "zoo-editor-nav-list",
  templateUrl: "nav-list.component.html",
  styleUrls: ["nav-list.component.scss"]
})
export class NavListComponent implements OnInit, OnDestroy, OnChanges {

  private subscription: Subscription;

  @Output() refresh: EventEmitter<any> = new EventEmitter();
  @Output() select: EventEmitter<ZPath> = new EventEmitter();
  @Output() deselect: EventEmitter<ZPath> = new EventEmitter();

  @Input() zPath: ZPath;
  @Input() zNodesChildren: ZPath[];
  @Input() zNodesFiltered: ZPath[];
  @Input() zNodesSelected: ZPath[];
  @Input() zNodesOrdering: Ordering;

  zNodesSorted: ZPath[];

  private static compareZNodesAscending(a: ZPath, b: ZPath): number {
    if (a.name.valueOrThrow() > b.name.valueOrThrow()) {
      return 1;
    }

    if (a.name.valueOrThrow() < b.name.valueOrThrow()) {
      return -1;
    }

    return 0;
  }

  private static compareZNodesDescending(a: ZPath, b: ZPath): number {
    if (a.name.valueOrThrow() > b.name.valueOrThrow()) {
      return -1;
    }

    if (a.name.valueOrThrow() < b.name.valueOrThrow()) {
      return 1;
    }

    return 0;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zNodeService: ZNodeService,
    private dialogService: DialogService,
    private fileSaverService: FileSaverService,
    private viewContainerRef: ViewContainerRef
  ) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = new Subscription(() => {});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty("zNodesChildren") || changes.hasOwnProperty("zNodesFiltered") || changes.hasOwnProperty("zNodesOrdering")) {
      this.sortZNodes();
    }
  }

  onNavigateClick(zPath: ZPath): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [EDITOR_QUERY_NODE_PATH]: encodeURI(zPath.path)
      },
      queryParamsHandling: "merge"
    });
  }

  onNodeChecked(zPath: ZPath): void {
    this.select.emit(zPath);
  }

  onNodeUnchecked(zPath: ZPath): void {
    this.deselect.emit(zPath);
  }

  onNodeDeleteClick(zPath: ZPath): void {
    this.subscription.add(
      this.dialogService
        .showRecursiveDeleteZNode(
          `Do you want to delete node '${zPath.name.valueOrThrow()}' and its children?`,
          this.viewContainerRef
        )
        .pipe(
          switchMap((confirm: boolean) => {
            if (confirm) {
              const parentDir = zPath.goUp().path;

              return this.zNodeService.deleteChildren(parentDir, [zPath.name.valueOrThrow()]);
            }

            return EMPTY;
          }),
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY)))
        )
        .subscribe(() => this.refresh.emit())
    );
  }

  onNodeExportClick(zPath: ZPath): void {
    this.subscription.add(
      this.zNodeService
        .exportNodes([zPath.path])
        .pipe(
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY)))
        )
        .subscribe(
          (data: ZNodeExport) => this.fileSaverService.save(data.blob, data.name)
        )
    );
  }

  onNodeDuplicateClick(zPath: ZPath): void {
    this.subscription.add(
      this.dialogService
        .showDuplicateZNode(
          {
            path: zPath.path,
            redirect: false
          },
          this.viewContainerRef
        )
        .pipe(
          switchMap((maybeData) =>
            maybeData.caseOf({
              just: data =>
                this.zNodeService
                  .duplicateNode(zPath.path, data.path)
                  .pipe(switchMapTo(of(data))),
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

  onNodeMoveClick(zPath: ZPath): void {
    this.subscription.add(
      this.dialogService
        .showMoveZNode(
          {
            path: zPath.path,
            redirect: false
          },
          this.viewContainerRef
        )
        .pipe(
          switchMap((maybeData) =>
            maybeData.caseOf({
              just: data =>
                this.zNodeService
                  .moveNode(zPath.path, data.path)
                  .pipe(switchMapTo(of(data))),
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

  //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  trackByPath(index: number, zPath: ZPath): string {
    return zPath.path;
  }

  private sortZNodes(): void {
    const zNodesFiltered = this.zNodesFiltered ? this.zNodesFiltered : this.zNodesChildren;
    const zNodesUnfiltered = this.zNodesFiltered ? difference(this.zNodesChildren, this.zNodesFiltered) : [];

    let compareFun = NavListComponent.compareZNodesDescending;
    if (this.zNodesOrdering === Ordering.Ascending) {
      compareFun = NavListComponent.compareZNodesAscending;
    }

    this.zNodesSorted = zNodesFiltered.sort(compareFun).concat(zNodesUnfiltered.sort(compareFun))
  }
}
