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

import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {TdMediaService} from "@covalent/core";
import {Observable, of, Subscription, throwError} from "rxjs";
import {catchError, map, mapTo, pluck, switchMap, tap} from "rxjs/operators";
import {Either, Maybe} from "tsmonad";
import {Ordering} from "./ordering";
import {EDITOR_QUERY_NODE_PATH} from "./editor-routing.constants";
import {DialogService, ZNodePath, ZNodeWithChildren, ZPath, ZPathService, ConnectionManager} from "../core";
import {RegexpFilterComponent} from "../shared";
import {environment} from "../../environments/environment";

@Component({
  templateUrl: "editor.component.html",
  styleUrls: ["editor.component.scss"]
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild("childrenFilter") childrenFilter: RegexpFilterComponent;

  private subscription: Subscription;

  zPath: Observable<ZPath>;
  zNode: Observable<Maybe<ZNodeWithChildren>>;

  childrenOrdering: Ordering = Ordering.Ascending;
  childrenFilterRegexp: RegExp = null;
  childrenZNodes: ZPath[] = [];
  filteredZNodes: ZPath[] = [];
  selectedZNodes: ZPath[] = [];

  docsUrl: string = environment.docsUrl;

  private static filterZNodes(nodes: ZPath[], regexp: RegExp): ZPath[] {
    return nodes.filter(node => node.name.valueOrThrow().match(regexp));
  }

  constructor(
    public mediaService: TdMediaService,
    private route: ActivatedRoute,
    private router: Router,
    private zPathService: ZPathService,
    private connectionManager: ConnectionManager,
    private dialogService: DialogService,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  get selectedFilteredNodes(): ZPath[] {
    return this.selectedZNodes.filter(value => -1 !== this.filteredZNodes.indexOf(value));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.zPath = this.route
      .queryParams
      .pipe(
        pluck(EDITOR_QUERY_NODE_PATH),
        map((maybePath: string) => {
          if (maybePath) {
            return this.zPathService.parse(decodeURI(maybePath));
          }

          return this.zPathService.parse("/");
        })
      );

    this.zNode = (<Observable<Either<Error, ZNodeWithChildren>>>this.route.data)
      .pipe(
        pluck("zNodeWithChildren"),
        tap(() => this.childrenFilter.clear()),
        switchMap((either: Either<Error, ZNodeWithChildren>) =>
          either.caseOf<Observable<Maybe<ZNodeWithChildren>>>({
            left: error =>
              this.dialogService
                .showError(error, this.viewContainerRef)
                .pipe(mapTo(Maybe.nothing())),
            right: node =>
              of(Maybe.just(node))
          })
        )
      );

    this.subscription = new Subscription(() => {});

    this.subscription.add(
      this.zNode.subscribe(maybeNode =>
        maybeNode.caseOf({
          just: node => this.updateChildren(node.children),
          nothing: () => {}
        })
      )
    );
  }

  ngAfterViewInit(): void {
    this.mediaService.broadcast();
    this.changeDetectorRef.detectChanges();
  }

  onFilterRegexpChange(regexp: RegExp): void {
    this.childrenFilterRegexp = regexp;
    this.updateFilteredChildren();
  }

  disconnect(): void {
    this.subscription.add(
      this.connectionManager
        .removeConnection()
        .subscribe(
          () => this.router.navigate(["connect"]),
          err => this.dialogService.showError(err, this.viewContainerRef)
        )
    );
  }

  selectZNode(zPath: ZPath): void {
    this.selectedZNodes.push(zPath);
  }

  deselectZNode(zPath: ZPath): void {
    this.selectedZNodes = this.selectedZNodes.filter(selectedNode => selectedNode !== zPath);
  }

  toggleSelectAll(): void {
    const selectedFilteredNodes = this.selectedZNodes.filter(node => this.filteredZNodes.indexOf(node) >= 0);
    const allFilteredNodesSelected = selectedFilteredNodes.length === this.filteredZNodes.length;

    if (!allFilteredNodesSelected) {
      this.selectedZNodes = this.filteredZNodes;

      return;
    }

    this.selectedZNodes = [];
  }

  reloadEditor(): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: {
          at: (Math.round((new Date()).getTime() / 1000))
        },
        queryParamsHandling: "merge"
      })
      .catch(err => this.dialogService.showError(err, this.viewContainerRef))
  }

  private updateChildren(children: ZNodePath[]): void {
    this.childrenZNodes = children.map(path => this.zPathService.parse(path));

    this.updateFilteredChildren();
    this.updateSelectedChildren();
  }

  private updateFilteredChildren(): void {
    if (this.childrenFilterRegexp) {
      this.filteredZNodes = EditorComponent.filterZNodes(
        this.childrenZNodes,
        this.childrenFilterRegexp
      );

      return;
    }

    this.filteredZNodes = this.childrenZNodes;
  }

  private updateSelectedChildren(): void {
    // Remove non-existing selected nodes
    this.selectedZNodes = this.selectedZNodes.filter(node => this.childrenZNodes.indexOf(node) >= 0);
  }
}
