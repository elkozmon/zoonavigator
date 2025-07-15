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

import {Inject, Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";
import {defer, from, Observable, throwError} from "rxjs";
import {catchError, map, switchMap, switchMapTo, take, timeoutWith} from "rxjs/operators";
import {ConfigService} from "../../../config";
import {CONNECT_QUERY_RETURN_URL} from "../../../connect/connect-routing.constants";
import {ApiResponse} from "../response";
import {ConnectionManager} from "../../connection/manager";
import {DialogService} from "../../dialog";
import {ApiRequest} from "../request";
import {ApiService} from "./api.service";
import {APP_BASE_HREF} from "@angular/common";
import {environment} from "../../../../environments/environment";
import {HttpObserve} from "@angular/common/http/src/client";

@Injectable()
export class DefaultApiService implements ApiService {

  private static extractResponse<T>(body: any): ApiResponse<T> {
    return new ApiResponse(
      body.success,
      body.payload,
      body.message
    );
  }

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private connectionManager: ConnectionManager,
    private dialogService: DialogService,
    private configService: ConfigService,
    @Inject(APP_BASE_HREF) private baseHref: string
  ) {
  }

  dispatch<T>(apiRequest: ApiRequest<T>): Observable<ApiResponse<T>> {
    const config = this.configService.config;

    const url: string = this.baseHref.replace(/\/$/, "") + environment.apiHref.replace(/\/$/, "") + apiRequest.path;

    const options = {
      body: null,
      url: url,
      observe: "response" as HttpObserve,
      params: apiRequest.params,
      headers: apiRequest.headers || new HttpHeaders()
    };

    if (apiRequest.content) {
      options.body = apiRequest.content.data;

      if (apiRequest.content.type) {
        options.headers = options.headers.set("Content-Type", apiRequest.content.type);
      }
    }

    if (apiRequest.authToken) {
      options.headers = options.headers.set("Zoo-Authorization", apiRequest.authToken);
    }

    return <Observable<ApiResponse<T>>>this.httpClient
      .request(apiRequest.method, url, options)
      .pipe(
        timeoutWith(config.requestTimeoutMillis, defer(() => throwError("Request timed out"))),
        map((t: HttpResponse<Object>) => {
          if (t.headers.has("Content-Type") && t.headers.get("Content-Type").startsWith("application/json")) {
            return DefaultApiService.extractResponse<T>(t.body);
          } else {
            return { success: t.ok };
          }
        }),
        catchError(err => this.handleError(err))
      );
  }

  private handleError<T>(anyError: any): Observable<T> {
    let error: Error;

    if (typeof anyError === "string" || anyError instanceof String) {
      error = new Error(<string>anyError);
    } else if (anyError instanceof Error) {
      error = anyError;
    } else if (anyError instanceof HttpErrorResponse) {
      if (anyError.error.hasOwnProperty("success")) {
        error = new Error(DefaultApiService.extractResponse(anyError.error).message);
      } else {
        error = new Error(anyError.error || "Unable to receive a response");
      }

      if (anyError.status === 401) {
        const returnUrl = this.router.routerState.snapshot.url;

        this.dialogService.showError(error, null)
          .pipe(
            switchMapTo(this.connectionManager.removeConnection()),
            switchMapTo(from(
              this.router.navigate(["/"], {
                queryParams: {
                  [CONNECT_QUERY_RETURN_URL]: encodeURI(returnUrl)
                }
              })
            )),
            catchError(err => this.dialogService.showError(err, null)),
            take(1)
          )
          .subscribe();
      }
    } else {
      error = new Error("Unknown error occurred. See the console for details");
      console.error(anyError);
    }

    return throwError(error);
  }
}
