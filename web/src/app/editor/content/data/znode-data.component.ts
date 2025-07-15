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

import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewContainerRef} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {combineLatest, EMPTY, from, Observable, of, Subject, throwError, zip} from "rxjs";
import {bufferCount, catchError, filter, finalize, map, mapTo, pluck, switchMap, take, tap} from "rxjs/operators";
import {Either, Maybe} from "tsmonad";
import {Buffer} from "buffer";
import {DialogService, ZNodeMeta, ZNodeService, ZNodeWithChildren, ZPathService} from "../../../core";
import {PreferencesService} from "../../preferences";
import {Mode, ModeId, ModeProvider} from "./mode";
import {Formatter, FormatterProvider} from "../../formatter";
import {Compression, CompressionId, CompressionProvider} from "./compression";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subscription} from "rxjs/Subscription";

@Component({
  templateUrl: "znode-data.component.html",
  styleUrls: ["znode-data.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZNodeDataComponent implements OnInit, OnDestroy {

  static defaultMode = ModeId.Text;
  static defaultWrap = true;

  private subscription: Subscription;

  editorNode: Subject<Maybe<ZNodeWithChildren>>;

  editorDataTxt: Subject<string>;
  editorDataRaw: Observable<string>;
  editorFormatter: Observable<Maybe<Formatter>>;

  isEditorFormatterAvailable: Observable<boolean>;
  isEditorDataPristine: Observable<boolean>;
  isEditorReady: Observable<boolean>;
  isSubmitReady: Observable<boolean>;
  isSubmitOngoing: Subject<boolean>;

  editorWrap: Subject<boolean>;
  editorModeId: Subject<ModeId>;
  editorCompId: Subject<Maybe<CompressionId>>;

  editorMode: Observable<Mode>;
  editorComp: Observable<Maybe<Compression>>;

  modeIds: ModeId[] = Object.keys(ModeId).map(k => ModeId[k]);
  compIds: CompressionId[] = Object.keys(CompressionId).map(k => CompressionId[k]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zPathService: ZPathService,
    private zNodeService: ZNodeService,
    private dialogService: DialogService,
    private preferencesService: PreferencesService,
    private modeProvider: ModeProvider,
    private compressionProvider: CompressionProvider,
    private formatterProvider: FormatterProvider,
    public viewContainerRef: ViewContainerRef,
  ) {
  }

  ngOnDestroy(): void {
    this.editorNode.complete();
    this.editorDataTxt.complete();
    this.isSubmitOngoing.complete();
    this.editorWrap.complete();
    this.editorModeId.complete();
    this.editorCompId.complete();
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    // setup
    this.subscription = new Subscription(() => {});
    this.editorNode = new BehaviorSubject(Maybe.nothing());
    this.editorDataTxt = new BehaviorSubject("");
    this.isSubmitOngoing = new BehaviorSubject(false);
    this.editorWrap = new BehaviorSubject(ZNodeDataComponent.defaultWrap);
    this.editorModeId = new BehaviorSubject(ZNodeDataComponent.defaultMode);
    this.editorCompId = new BehaviorSubject(Maybe.nothing());

    this.subscription.add(
      this.route.parent.data
        .pipe(
          pluck("zNodeWithChildren"),
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
        )
        .subscribe(maybeNode => this.editorNode.next(maybeNode))
    );

    // update editor ready
    this.isEditorReady =
      combineLatest([this.editorNode, this.editorModeId, this.editorCompId, this.editorWrap])
        .pipe(map(([n, m, c, w]) => n != null && n.valueOr(null) != null && m != null && c != null && w != null));

    // init rest of the observables and subjects
    this.editorMode =
      this.editorModeId.pipe(map(id => this.modeProvider.getMode(id)));

    this.editorComp =
      this.editorCompId.pipe(map(mId => mId.map(id => this.compressionProvider.getCompression(id))));

    // update raw data on change of: txtData or mode or comp
    this.editorDataRaw =
      combineLatest([this.editorDataTxt, this.editorMode, this.editorComp])
        .pipe(switchMap(([txtData, mode, mComp]) => ZNodeDataComponent.encodeToRawData(txtData, mode, mComp)));

    // update txt data on change of: mode
    this.subscription.add(
      this.editorMode
        .pipe(
          bufferCount(2, 1),
          switchMap(([oldMode, newMode]) => combineLatest([this.editorDataTxt, of(oldMode), of(newMode)]).pipe(take(1))),
          map(([txt, oldMode, newMode]) => ZNodeDataComponent.translateDataMode(txt, oldMode, newMode))
        )
        .subscribe(data => this.editorDataTxt.next(data))
    );

    // update formatter
    this.editorFormatter =
      this.editorModeId.pipe(map(mode => this.formatterProvider.getFormatter(mode)));

    this.isEditorFormatterAvailable =
      this.editorFormatter.pipe(map(maybe => maybe.map(() => true).valueOr(false)));

    // update pristine flag (note: if node not available -> editor is pristine)
    this.isEditorDataPristine =
      combineLatest([this.editorNode, this.editorDataRaw])
        .pipe(map(([node, rawData]) => node.map(n => n.data == rawData).valueOr(true)));

    // update submit ready flag
    this.isSubmitReady =
      combineLatest([this.isEditorDataPristine, this.isSubmitOngoing])
        .pipe(map(([isEditorDataPristine, isSubmitOngoing]) => !isEditorDataPristine && !isSubmitOngoing));

    // on change of node do following
    this.subscription.add(
      this.editorNode
        .pipe(
          map(maybeNode => maybeNode.valueOr(null)),
          filter(nullableNode => nullableNode != null),
          switchMap(node => {
            // change compression
            const o1 = ZNodeDataComponent.inferCompression(node.data, this.compIds, this.compressionProvider)
              .pipe(
                tap(comp => this.editorCompId.next(comp))
              );

            // change mode
            const o2 = this.preferencesService
              .getModeFor(node.path, node.meta.creationId)
              .pipe(
                map(maybeModeId => maybeModeId.valueOr(ZNodeDataComponent.defaultMode)),
                tap(mode => this.editorModeId.next(mode))
              );

            // change wrap
            const o3 = this.preferencesService
              .getWrapFor(node.path, node.meta.creationId)
              .pipe(
                map(maybeWrap => maybeWrap.valueOr(ZNodeDataComponent.defaultWrap)),
                tap(wrap => this.editorWrap.next(wrap))
              );

            return zip(of(node), o1, o2, o3).pipe(take(1));
          }),
          // update data txt
          switchMap(([node]) => combineLatest([of(node), this.editorMode, this.editorComp]).pipe(take(1))),
          switchMap(([node, mode, mComp]) => ZNodeDataComponent.decodeFromRawData(node.data, mode, mComp))
        )
        .subscribe(data => this.editorDataTxt.next(data))
    );
  }

  onSubmit(): void {
    this.subscription.add(
      combineLatest([this.editorNode, this.isSubmitReady])
        .pipe(
          take(1),
          map(([maybeNode, ready]) => [maybeNode.valueOr(null), ready]),
          filter(([node, ready]) => node != null && ready),
          tap(() => this.isSubmitOngoing.next(true)),
          switchMap(([node, ready]) => combineLatest(of(node), this.editorDataRaw)),
          take(1),
          switchMap(([node, rawData]) =>
            this.zNodeService.setData(
              node.path,
              node.meta.dataVersion,
              rawData
            )
          ),
          switchMap((newMeta: ZNodeMeta) => {
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
          tap(() => this.isSubmitOngoing.next(false)),
          catchError(error => {
            this.isSubmitOngoing.next(false);

            return this.dialogService.showError(error, this.viewContainerRef).pipe(mapTo(EMPTY));
          }),
          switchMap(() => this.dialogService.showSnackbar("Changes saved", this.viewContainerRef))
        )
        .subscribe()
    );
  }

  onCompressionChange(newComp: Maybe<CompressionId>): void {
    this.editorCompId.next(newComp);
  }

  onModeChange(newMode: ModeId): void {
    this.subscription.add(
      this.editorNode
        .pipe(
          take(1),
          map((maybeNode) => maybeNode.valueOr(null)),
          filter(node => node != null),
          switchMap(node =>
            this.preferencesService.setModeFor(
              node.path,
              node.meta.creationId,
              Maybe.just(newMode)
            )
          ),
          mapTo(newMode)
        )
        .subscribe(newMode => this.editorModeId.next(newMode))
    );
  }

  onWrapChange(newWrap: boolean): void {
    this.subscription.add(
      this.editorNode
        .pipe(
          take(1),
          map((maybeNode) => maybeNode.valueOr(null)),
          filter(node => node != null),
          switchMap(node =>
            this.preferencesService.setWrapFor(
              node.path,
              node.meta.creationId,
              Maybe.just(newWrap)
            )
          ),
          mapTo(newWrap)
        )
        .subscribe(newMode => this.editorWrap.next(newMode))
    );
  }

  onFormatData(): void {
    this.subscription.add(
      combineLatest([this.editorDataTxt, this.editorFormatter])
        .pipe(
          take(1),
          switchMap(([txtData, maybeFormatter]) =>
            maybeFormatter.caseOf<Observable<string>>({
              just: fmt => fmt.format(txtData),
              nothing: () => throwError(new Error("Formatter unavailable"))
            })
          ),
          tap(data => this.editorDataTxt.next(data)),
          catchError(error => this.dialogService.showSnackbar("Error:  " + error.message, this.viewContainerRef))
        )
        .subscribe()
    );
  }

  static inferCompression(base64: string, compIds: CompressionId[], compProvider: CompressionProvider): Observable<Maybe<CompressionId>> {
    const raw = Buffer
      .from(base64, "base64")
      .buffer;

    return of(
      Maybe.maybe(
        compIds.find(c => compProvider.getCompression(c).isCompressed(raw) || null)
      )
    );
  }

  static translateDataMode(data: string, oldMode: Mode, newMode: Mode): string {
    const encodedData = oldMode.encodeData(data);

    return newMode.decodeData(encodedData);
  }

  static decodeFromRawData(base64: string, mode: Mode, maybeComp: Maybe<Compression>): Observable<string> {
    const raw: ArrayBuffer = Buffer
      .from(base64, "base64")
      .buffer;

    const decompressedRx = maybeComp
      .map(c => c.decompress(raw))
      .valueOr(of(raw));


    return decompressedRx.pipe(
      map(decompressed => mode.decodeData(decompressed))
    );
  }

  static encodeToRawData(text: string, mode: Mode, maybeComp: Maybe<Compression>): Observable<string> {
    const encoded = mode.encodeData(text);

    const compressedRx = maybeComp
      .map(c => c.compress(encoded))
      .valueOr(of(encoded));

    return compressedRx.pipe(
      map(compressed =>
        Buffer
          .from(compressed)
          .toString("base64")
      )
    );
  }
}
