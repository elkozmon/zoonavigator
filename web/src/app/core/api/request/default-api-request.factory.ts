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

import {Injectable} from "@angular/core";
import {ApiRequest} from "./api-request";
import {ApiRequestFactory} from "./api-request.factory";
import {RequestContent} from "./request-content";
import {RequestMethods} from "./request-methods";
import {HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable()
export class DefaultApiRequestFactory implements ApiRequestFactory {

  getRequest<T>(
    path: string,
    params?: HttpParams,
    headers?: HttpHeaders,
    authToken?: string
  ): ApiRequest<T> {
    return new ApiRequest<T>(
      path,
      RequestMethods.Get,
      params,
      headers,
      null,
      authToken
    );
  }

  postRequest<T>(
    path: string,
    params?: HttpParams,
    headers?: HttpHeaders,
    content?: RequestContent,
    authToken?: string
  ): ApiRequest<T> {
    return new ApiRequest<T>(
      path,
      RequestMethods.Post,
      params,
      headers,
      content,
      authToken
    );
  }

  putRequest<T>(
    path: string,
    params?: HttpParams,
    headers?: HttpHeaders,
    content?: RequestContent,
    authToken?: string
  ): ApiRequest<T> {
    return new ApiRequest<T>(
      path,
      RequestMethods.Put,
      params,
      headers,
      content,
      authToken
    );
  }

  deleteRequest<T>(
    path: string,
    params?: HttpParams,
    headers?: HttpHeaders,
    authToken?: string
  ): ApiRequest<T> {
    return new ApiRequest<T>(
      path,
      RequestMethods.Delete,
      params,
      headers,
      null,
      authToken
    );
  }
}
