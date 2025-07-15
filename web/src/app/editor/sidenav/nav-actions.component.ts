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

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewContainerRef} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {state, style, trigger} from "@angular/animations";
import {EMPTY} from "rxjs";
import {catchError, mapTo, switchMap} from "rxjs/operators";
import {
  CreateZNodeData,
  DialogService,
  FileReaderService,
  FileSaverService,
  ImportZNodesData,
  ZNodeExport,
  ZNodeService,
  ZPath
} from "../../core";
import {EDITOR_QUERY_NODE_PATH} from "../editor-routing.constants";
import {Ordering} from "../ordering";
import {Subscription} from "rxjs/Rx";

@Component({
  selector: "zoo-editor-nav-actions",
  templateUrl: "nav-actions.component.html",
  styleUrls: ["nav-actions.component.scss"],
  animations: [
    trigger("flippedState", [
      state("default", style({transform: "scale(1, 1)"})),
      state("flipped", style({transform: "scale(1, -1) translate(0, -2px)"}))
    ])
  ]
})
export class NavActionsComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  @Output() selectAll: EventEmitter<any> = new EventEmitter();
  @Output() refresh: EventEmitter<any> = new EventEmitter();

  @Input() zPath: ZPath;
  @Input() zNodes: ZPath[];

  @Input() ordering: Ordering;
  @Output() orderingChange = new EventEmitter<Ordering>();

  toggleSortButtonFlippedState = "flipped";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zNodeService: ZNodeService,
    private dialogService: DialogService,
    private fileSaverService: FileSaverService,
    private fileReaderService: FileReaderService,
    private viewContainerRef: ViewContainerRef
  ) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = new Subscription(() => {});
  }

  onSelectAllClick(): void {
    this.selectAll.emit();
  }

  onToggleSortClick(): void {
    let newOrdering: Ordering;

    if (this.ordering === Ordering.Descending) {
      newOrdering = Ordering.Ascending;
      this.toggleSortButtonFlippedState = "flipped";
    } else {
      newOrdering = Ordering.Descending;
      this.toggleSortButtonFlippedState = "default";
    }

    this.ordering = newOrdering;
    this.orderingChange.emit(newOrdering);
  }

  onImportClick(): void {
    this.subscription.add(
      this.dialogService
        .showImportZNodes(
          {
            path: this.zPath.isRoot ? "/" : this.zPath.path.concat("/"),
            redirect: false
          },
          this.viewContainerRef
        )
        .pipe(
          switchMap((maybeData) =>
            maybeData.caseOf({
              just: data => {
                if (data.file) {
                  return this.zNodeService
                    .importNodes(data.path, data.file)
                    .pipe(
                      mapTo(data)
                    );
                }

                return EMPTY;
              },
              nothing: () => EMPTY
            })
          ),
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY)))
        )
        .subscribe(
          (data: ImportZNodesData) => {
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

  onCreateClick(): void {
    this.subscription.add(
      this.dialogService
        .showCreateZNode(
          {
            path: this.zPath.isRoot ? "/" : this.zPath.path.concat("/"),
            redirect: false
          },
          this.viewContainerRef
        )
        .pipe(
          switchMap((maybeData) =>
            maybeData.caseOf({
              just: data => this.zNodeService.createNode(data.path).pipe(mapTo(data)),
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

  onExportClick(): void {
    const paths = this.zNodes.map(node => node.path);

    this.subscription.add(
      this.zNodeService
        .exportNodes(paths)
        .pipe(
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY)))
        )
        .subscribe(
          (data: ZNodeExport) => this.fileSaverService.save(data.blob, data.name)
        )
    );
  }

  onDeleteClick(): void {
    const path = this.zPath.path;
    const names = this.zNodes.map(node => node.name);

    const message = `Do you want to delete ${names.length} ${names.length === 1 ? "node and its" : "nodes and their"} children?`;

    this.subscription.add(
      this.dialogService
        .showRecursiveDeleteZNode(message, this.viewContainerRef)
        .pipe(
          switchMap((confirm: boolean) => {
            if (confirm) {
              return this.zNodeService.deleteChildren(path, names.map(name => name.valueOrThrow()));
            }

            return EMPTY;
          }),
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY)))
        )
        .subscribe(() => this.refresh.emit())
    );
  }
}
