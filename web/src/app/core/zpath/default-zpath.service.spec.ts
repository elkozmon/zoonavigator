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

import {DefaultZPathService} from "./default-zpath.service";
import {Maybe} from "tsmonad";

describe("Default zPath service tests", () => {
  const service = new DefaultZPathService();

  it("root path has no name", () => {
    expect(Maybe.isNothing(service.parse("/").name)).toBeTruthy();
  });

  it("root path is root", () => {
    expect(service.parse("/").isRoot).toBeTruthy();
  });

  it("one level deep path has a name", () => {
    expect(service.parse("/test").name.valueOr(null)).toBe("test");
  });
});
