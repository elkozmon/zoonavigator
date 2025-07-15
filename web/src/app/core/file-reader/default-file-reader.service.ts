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
import {from, Observable} from "rxjs";
import {FileReaderService} from "./file-reader.service";

@Injectable()
export class DefaultFileReaderService implements FileReaderService {

  readAsText(file: File, encoding?: string): Observable<string> {
    const promise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(<string> reader.result);
      reader.onabort = ev => reject(ev);
      reader.onerror = ev => reject(ev);

      reader.readAsText(file, encoding);
    });

    return from(promise);
  }
}

