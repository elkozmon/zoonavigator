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

import {Component, OnDestroy, OnInit, ViewContainerRef} from "@angular/core";
import {ActivatedRoute, Router, UrlTree} from "@angular/router";
import {from, Observable, Subscription, of} from "rxjs";
import {catchError, mapTo, pluck, switchMap, tap} from "rxjs/operators";
import {Either} from "tsmonad";
import {DialogService, ZNodeAcl, ZNodeService, ZNodeWithChildren} from "../../../core";
import {ZPathService} from "../../../core/zpath";
import {AclFormFactory} from "./acl-form.factory";
import {AclForm} from "./acl-form";
import {EDITOR_QUERY_NODE_PATH} from "../../editor-routing.constants";
import {EMPTY} from "rxjs/internal/observable/empty";

@Component({
  templateUrl: "znode-acl.component.html",
  styleUrls: ["znode-acl.component.scss"]
})
export class ZNodeAclComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  aclForm: AclForm;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zNodeService: ZNodeService,
    private zPathService: ZPathService,
    private dialogService: DialogService,
    private aclFormFactory: AclFormFactory,
    public viewContainerRef: ViewContainerRef
  ) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = new Subscription(() => {});

    this.subscription.add(
      (<Observable<Either<Error, ZNodeWithChildren>>>this.route.parent.data.pipe(pluck("zNodeWithChildren")))
        .switchMap((either, index) =>
          either.caseOf({
            left: error =>
              this.dialogService
                .showError(error, this.viewContainerRef)
                .pipe(mapTo(null)),
            right: node =>
              of(this.aclFormFactory.newForm(node.acl, node.meta))
          })
        )
        .subscribe((form) => this.aclForm = form)
    );
  }

  onSubmit(recursive: boolean): void {
    let confirmation: Observable<boolean> = of(true);

    if (recursive) {
      confirmation = this.dialogService.showConfirm(
        {
          icon: "help",
          title: "Confirm recursive change",
          message: "Do you want to apply these settings to this node and its children?",
          acceptText: "Apply",
          cancelText: "Cancel"
        },
        this.viewContainerRef
      );
    }

    const values = this.aclForm.values;
    const version = this.aclForm.aclVersion;

    this.subscription.add(
      confirmation.subscribe(confirm => {
        if (confirm) {
          this.saveZNodeAcl(
            values,
            version,
            recursive
          );
        }
      })
    );
  }

  clearForm(): void {
    if (!this.aclForm.isDirty) {
      this.aclForm.clearAclFormArray();

      return;
    }

    this.subscription.add(
      this.dialogService
        .showConfirm(
          {
            icon: "help",
            title: "Confirm clearing the form",
            message: "Do you want to remove all ACL inputs? Changes will not be applied yet.",
            acceptText: "Clear",
            cancelText: "Cancel"
          },
          this.viewContainerRef
        )
        .subscribe(
          discard => {
            if (discard) {
              this.aclForm.clearAclFormArray();
            }
          }
        )
    );
  }

  private saveZNodeAcl(acl: ZNodeAcl, aclVersion: number, recursive: boolean): void {
    this.subscription.add(
      this.zNodeService
        .setAcl(
          this.currentPath,
          aclVersion,
          acl,
          recursive
        )
        .pipe(
          switchMap(newMeta => {
            this.aclForm.markAsPristine();

            // refresh node data in resolver
            const redirect = this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {
                sid: (parseInt(this.route.snapshot.queryParamMap.get("sid")) || 0) + 1
              },
              queryParamsHandling: "merge"
            });

            return from(redirect);
          }),
          catchError(error => this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY))),
          switchMap(() => this.dialogService.showSnackbar("Changes saved", this.viewContainerRef))
        )
        .subscribe()
    );
  }

  private get currentPath(): string | null {
    let uri = "/";

    if (this.route.snapshot.queryParamMap.has(EDITOR_QUERY_NODE_PATH)) {
      uri = decodeURI(this.route.snapshot.queryParamMap.get(EDITOR_QUERY_NODE_PATH));
    }

    return this.zPathService
      .parse(uri)
      .path;
  }
}
