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

import {Injectable, ViewContainerRef} from "@angular/core";
import {TdDialogService} from "@covalent/core";
import {MatDialog, MatSnackBar} from "@angular/material";
import {Observable, of, Subject} from "rxjs";
import {debounceTime, groupBy, map, mapTo, mergeMap, zip} from "rxjs/operators";
import {DialogService} from "./dialog.service";
import {
  ConfirmData,
  ConfirmDialogComponent,
  CreateZNodeData,
  CreateZNodeDialogComponent,
  DuplicateZNodeData,
  DuplicateZNodeDialogComponent,
  ImportZNodesData,
  ImportZNodesDialogComponent,
  InfoData,
  InfoDialogComponent,
  MoveZNodeData,
  MoveZNodeDialogComponent
} from "./dialogs";
import {Subscription} from "rxjs/Rx";
import {Maybe} from "tsmonad";

@Injectable()
export class DefaultDialogService extends DialogService {

  private debounceTime = 100;

  private subscription: Subscription;

  private showConfirmInput: Subject<[string, ConfirmData, ViewContainerRef]> = new Subject<[string, ConfirmData, ViewContainerRef]>();
  private showConfirmOutput: Subject<[string, boolean]> = new Subject<[string, boolean]>();

  private showInfoInput: Subject<[string, InfoData, ViewContainerRef]> = new Subject<[string, InfoData, ViewContainerRef]>();
  private showInfoOutput: Subject<string> = new Subject<string>();

  private showSnackbarInput: Subject<[string, ViewContainerRef]> = new Subject<[string, ViewContainerRef]>();
  private showSnackbarOutput: Subject<string> = new Subject<string>();

  constructor(
    private dialogService: TdDialogService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    super();

    this.subscription = new Subscription(() => {});

    this.subscription.add(
      this.showConfirmInput
        .pipe(
          groupBy(([id, confirmData, viewRef]) => id),
          mergeMap((observable) => observable.pipe(debounceTime(this.debounceTime))),
          mergeMap(([id, confirmData, viewRef]) => {
            const dialog = this.dialog.open(ConfirmDialogComponent, {
              data: confirmData,
              viewContainerRef: viewRef,
              role: "dialog",
              hasBackdrop: true,
              width: "500px",
              maxWidth: "80vw",
              height: "210px",
              maxHeight: "80vw",
              direction: "ltr",
              autoFocus: true
            });

            const closedObs: Observable<boolean> = dialog.afterClosed();

            return of(id).pipe(zip(closedObs));
          })
        )
        .subscribe(this.showConfirmOutput)
    );

    this.subscription.add(
      this.showInfoInput
        .pipe(
          groupBy(([id, infoData, viewRef]) => id),
          mergeMap((observable) => observable.pipe(debounceTime(this.debounceTime))),
          mergeMap(([id, infoData, viewRef]) => {
            const dialog = this.dialog.open(InfoDialogComponent, {
              data: infoData,
              viewContainerRef: viewRef,
              role: "dialog",
              hasBackdrop: true,
              width: "500px",
              maxWidth: "80vw",
              height: "210px",
              maxHeight: "80vw",
              direction: "ltr",
              autoFocus: true
            });

            return dialog.afterClosed().pipe(mapTo(id));
          })
        )
        .subscribe(this.showInfoOutput)
    );

    this.subscription.add(
      this.showSnackbarInput
        .pipe(
          groupBy(([message, viewRef]) => message),
          mergeMap((observable) => observable.pipe(debounceTime(this.debounceTime))),
          mergeMap(([message, viewRef]) => {
            const snackbar = this.snackBar.open(
              message,
              "Close",
              {
                duration: 3000,
                viewContainerRef: viewRef
              }
            );

            return snackbar.afterDismissed().pipe(mapTo(message));
          })
        )
        .subscribe(this.showSnackbarOutput)
    );
  }

  showDiscardChanges(
    viewRef?: ViewContainerRef
  ): Observable<boolean> {
    return this.showConfirm({
      icon: "help",
      title: "Discard changes?",
      message: "Unsaved changes detected. Do you want to discard them?",
      cancelText: "Cancel",
      acceptText: "Discard"
    }, viewRef);
  }

  showCreateZNode(
    defaults: CreateZNodeData,
    viewRef?: ViewContainerRef
  ): Observable<Maybe<CreateZNodeData>> {
    const dialog = this.dialog.open(CreateZNodeDialogComponent, {
      data: defaults,
      viewContainerRef: viewRef,
      role: "dialog",
      hasBackdrop: true,
      disableClose: true,
      width: "500px",
      maxWidth: "80vw",
      height: defaults.redirect === undefined ? "230px" : "260px",
      maxHeight: "80vw",
      direction: "ltr",
      autoFocus: true
    });

    return dialog.afterClosed().pipe(map((data: CreateZNodeData, index) => Maybe.maybe(data)));
  }

  showImportZNodes(
    defaults: ImportZNodesData,
    viewRef?: ViewContainerRef
  ): Observable<Maybe<ImportZNodesData>> {
    const dialog = this.dialog.open(ImportZNodesDialogComponent, {
      data: defaults,
      viewContainerRef: viewRef,
      role: "dialog",
      hasBackdrop: true,
      disableClose: true,
      width: "500px",
      maxWidth: "80vw",
      height: defaults.redirect === undefined ? "287px" : "325px",
      maxHeight: "100vw",
      direction: "ltr",
      autoFocus: true
    });

    return dialog.afterClosed().pipe(map((data: ImportZNodesData, index) => Maybe.maybe(data)));
  }

  showDuplicateZNode(
    defaults: DuplicateZNodeData,
    viewRef?: ViewContainerRef
  ): Observable<Maybe<DuplicateZNodeData>> {
    const dialog = this.dialog.open(DuplicateZNodeDialogComponent, {
      data: defaults,
      viewContainerRef: viewRef,
      role: "dialog",
      hasBackdrop: true,
      disableClose: true,
      width: "500px",
      maxWidth: "80vw",
      height: defaults.redirect === undefined ? "230px" : "260px",
      maxHeight: "80vw",
      direction: "ltr",
      autoFocus: true
    });

    return dialog.afterClosed().pipe(map((data: DuplicateZNodeData, index) => Maybe.maybe(data)));
  }

  showRecursiveDeleteZNode(
    message: string,
    viewRef?: ViewContainerRef
  ): Observable<boolean> {
    return this.showConfirm({
      icon: "help",
      title: "Confirm recursive delete",
      message: message,
      acceptText: "Delete",
      cancelText: "Cancel"
    }, viewRef);
  }

  showMoveZNode(
    defaults: MoveZNodeData,
    viewRef?: ViewContainerRef
  ): Observable<Maybe<MoveZNodeData>> {
    const dialog = this.dialog.open(MoveZNodeDialogComponent, {
      data: defaults,
      viewContainerRef: viewRef,
      role: "dialog",
      hasBackdrop: true,
      disableClose: true,
      width: "500px",
      maxWidth: "80vw",
      height: defaults.redirect === undefined ? "230px" : "260px",
      maxHeight: "80vw",
      direction: "ltr",
      autoFocus: true
    });

    return dialog.afterClosed().pipe(map((data: MoveZNodeData, index) => Maybe.maybe(data)));
  }

  showError(
    error: Error,
    viewRef?: ViewContainerRef
  ): Observable<void> {
    return this.showInfo(
      {
        icon: "error",
        title: "Error",
        message: error.message,
        dismissText: "Close"
      },
      viewRef
    );
  }

  showConfirm(
    options: ConfirmData,
    viewRef?: ViewContainerRef
  ): Observable<boolean> {
    return Observable.create(subscriber => {
      const id = options.title + options.message + options.acceptText;
      const sub = this.showConfirmOutput.subscribe(
        ([id2, confirm]) => {
          if (id2 == id) {
            subscriber.next(confirm);
            subscriber.complete();
          }
        },
        (error) => subscriber.error(error),
        () => subscriber.complete()
      );

      this.showConfirmInput.next([id, options, viewRef]);

      return () => sub.unsubscribe();
    });
  }

  showInfo(
    options: InfoData,
    viewRef?: ViewContainerRef
  ): Observable<void> {
    return Observable.create(subscriber => {
      const id = options.title + options.message;
      const sub = this.showInfoOutput.subscribe(
        ([id2]) => {
          if (id2 == id) {
            subscriber.next();
            subscriber.complete();
          }
        },
        (error) => subscriber.error(error),
        () => subscriber.complete()
      );

      this.showInfoInput.next([id, options, viewRef]);

      return () => sub.unsubscribe();
    });
  }

  showSnackbar(
    message: string,
    viewRef?: ViewContainerRef
  ): Observable<void> {
    return Observable.create(subscriber => {
      const sub = this.showSnackbarOutput.subscribe(
        ([message2]) => {
          if (message2 == message) {
            subscriber.next();
            subscriber.complete();
          }
        },
        (error) => subscriber.error(error),
        () => subscriber.complete()
      );

      this.showSnackbarInput.next([message, viewRef]);

      return () => sub.unsubscribe();
    });
  }
}
