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
import {StorageService} from "./storage.service";
import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {Subject, Subscription} from "rxjs/Rx";
import {Maybe} from "tsmonad";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class LocalStorageService implements StorageService {

  private subjects: Map<string, Subject<any>>;
  private subscription: Subscription;

  constructor() {
    this.subjects = new Map<string, Subject<Maybe<any>>>();
    this.subscription = new Subscription(() => {});
  }

  private getSubject(key: string): Subject<any> {
    const sub = this.subjects.get(key);

    if (sub) {
      return sub;
    }

    const newSub = new BehaviorSubject<Maybe<any>>(Maybe.maybe(localStorage.getItem(key) || null));

    this.subjects.set(key, newSub);
    this.subscription.add(newSub.subscribe(maybeValue => {
      maybeValue.caseOf({
        just: value => localStorage.setItem(key, value),
        nothing: () => localStorage.removeItem(key)
      })
    }));

    return newSub;
  }

  set(key: string, value: any): Observable<void> {
    return of(this.getSubject(key).next(Maybe.just(value)));
  }

  observe(key: string): Observable<any> {
    return this.getSubject(key).pipe(
      map(maybeValue => {
        return maybeValue.caseOf({
          just: value => value,
          nothing: () => null
        })
      })
    );
  }

  remove(key: string): Observable<void> {
    return of(this.getSubject(key).next(Maybe.nothing()));
  }
}
