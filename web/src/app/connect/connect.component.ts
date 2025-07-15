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
import {ActivatedRoute, PRIMARY_OUTLET, Router} from "@angular/router";
import {catchError, finalize, switchMap} from "rxjs/operators";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoadingMode, LoadingType, TdLoadingService} from "@covalent/core";
import {AuthInfo, Scheme, ConnectionManager} from "../core";
import {CONNECT_QUERY_ERROR_MSG, CONNECT_QUERY_RETURN_URL} from "./connect-routing.constants";
import {Subscription} from "rxjs/Rx";
import {ConnectionPreset} from "../core/connection/connection-preset";
import {ConfigService} from "../config";
import {environment} from "../../environments/environment";

@Component({
  templateUrl: "./connect.component.html",
  styleUrls: ["./connect.component.scss"]
})
export class ConnectComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  private redirectUrl: string;

  private loadingFullscreenKey = "loadingFullscreen";

  errorMessage: any = null;

  cxnParamsForm: FormGroup;

  cxnPresetForm: FormGroup;

  appVersion: string = environment.appVersion;

  docsFaqsAuthUrl: string = environment.docsFaqsAuthUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private configService: ConfigService,
    private connectionManager: ConnectionManager,
    private loadingService: TdLoadingService
  ) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadingService.create({
      name: this.loadingFullscreenKey,
      mode: LoadingMode.Indeterminate,
      type: LoadingType.Linear,
      color: "accent",
    });

    this.subscription = new Subscription(() => {});

    this.subscription.add(
      this.route
        .queryParamMap
        .subscribe(paramMap => {
          if (paramMap.has(CONNECT_QUERY_ERROR_MSG)) {
            this.errorMessage = decodeURI(paramMap.get(CONNECT_QUERY_ERROR_MSG));
          } else {
            this.errorMessage = null;
          }

          if (paramMap.has(CONNECT_QUERY_RETURN_URL)) {
            this.redirectUrl = decodeURI(paramMap.get(CONNECT_QUERY_RETURN_URL));
          } else {
            this.redirectUrl = "/editor/data";
          }
        })
    );

    this.cxnParamsForm = this.newCxnParamsForm();
    this.cxnPresetForm = this.newCxnPresetForm();
  }

  onCxnParamsCredentialsChange(index: number): void {
    const isEmpty = this.isCxnParamsCredentialsFormGroupEmpty(index);
    const isLast = this.getCxnParamsCredentialsLastNonEmptyIndex() < index;

    if (isEmpty && !isLast) {
      this.cxnParamsCredentialsFormArray.removeAt(index);
      return;
    }

    if (!isEmpty && isLast) {
      this.cxnParamsCredentialsFormArray.push(this.newCxnParamsCredentialsFormGroup());
    }
  }

  get cxnParamsCredentialsFormArray(): FormArray {
    return <FormArray>this.cxnParamsForm.get("credentialsArray");
  }

  onCxnParamsSubmit(): void {
    this.errorMessage = null;
    this.startLoader();

    this.subscription.add(
      this.connectionManager
        .useConnection({
          connectionString: this.getCxnParamsConnectionStringFormValue(),
          authInfo: this.getCxnParamsAuthInfoFormValue()
        })
        .pipe(
          switchMap(() => this.router.navigateByUrl(this.redirectUrl)),
          finalize(() => this.stopLoader()),
          catchError(err => this.errorMessage = err.toString())
        )
        .subscribe()
    );
  }

  private newCxnParamsForm(): FormGroup {
    return this.formBuilder.group({
      connectionString: ["", [Validators.required]],
      credentialsArray: this.formBuilder.array([
        this.newCxnParamsCredentialsFormGroup()
      ])
    });
  }

  private newCxnParamsCredentialsFormGroup(): FormGroup {
    return this.formBuilder.group({
      username: [""],
      password: [""]
    });
  }

  private getCxnParamsCredentialsFormGroup(index: number): FormGroup {
    return <FormGroup>this.cxnParamsCredentialsFormArray.at(index);
  }

  private isCxnParamsCredentialsFormGroupEmpty(index: number): boolean {
    return this.getCxnParamsCredentialsUsernameFormValue(index).length + this.getCxnParamsCredentialsPasswordFormValue(index).length === 0;
  }

  private getCxnParamsCredentialsLastNonEmptyIndex(): number {
    // -2 since last row is always empty
    return this.cxnParamsCredentialsFormArray.controls.length - 2;
  }

  private getCxnParamsConnectionStringFormValue(): string {
    return this.cxnParamsForm.value.connectionString;
  }

  private getCxnParamsCredentialsUsernameFormValue(index: number): string {
    return this.getCxnParamsCredentialsFormGroup(index).get("username").value;
  }

  private getCxnParamsCredentialsPasswordFormValue(index: number): string {
    return this.getCxnParamsCredentialsFormGroup(index).get("password").value;
  }

  private getCxnParamsAuthInfoFormValue(): AuthInfo[] {
    const lastIndex: number = this.getCxnParamsCredentialsLastNonEmptyIndex();
    const authInfos: AuthInfo[] = [];

    for (let i = 0; i <= lastIndex; i++) {
      authInfos.push({
        id: `${this.getCxnParamsCredentialsUsernameFormValue(i)}:${this.getCxnParamsCredentialsPasswordFormValue(i)}`,
        scheme: <Scheme>"digest"
      });
    }

    return authInfos;
  }

  private newCxnPresetForm(): FormGroup {
    return this.formBuilder.group({
      connectionName: ["", [Validators.required]]
    });
  }

  get cxnPresetConnectionsArray(): ConnectionPreset[] {
    return this.configService.config.connections;
  }

  private getCxnPresetConnectionFormValue(): ConnectionPreset {
    return this.cxnPresetForm.value.connectionName;
  }

  onCxnPresetSubmit(): void {
    this.errorMessage = null;
    this.startLoader();

    const conn = this.getCxnPresetConnectionFormValue();

    this.subscription.add(
      this.connectionManager
        .useConnection(conn)
        .pipe(
          switchMap(() => this.router.navigateByUrl(this.redirectUrl)),
          finalize(() => this.stopLoader()),
          catchError(err => this.errorMessage = err.toString())
        )
        .subscribe()
    );
  }

  private startLoader(): void {
    this.loadingService.register(this.loadingFullscreenKey);
  }

  private stopLoader(): void {
    this.loadingService.resolve(this.loadingFullscreenKey);
  }
}
