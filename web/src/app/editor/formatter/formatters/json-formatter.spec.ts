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

import {firstValueFrom} from "rxjs";
import {JsonFormatter} from "./json-formatter";

describe("JsonFormatter", () => {
  const formatter = new JsonFormatter();

  it("formats valid JSON with four-space indentation", async () => {
    const formatted = await firstValueFrom(formatter.format("{\"name\":\"zk\",\"enabled\":true}"));

    expect(formatted).toBe("{\n    \"name\": \"zk\",\n    \"enabled\": true\n}");
  });

  it("rejects invalid JSON with a helpful error", async () => {
    spyOn(console, "error");

    await expectAsync(firstValueFrom(formatter.format("{"))).toBeRejectedWithError(
      "Invalid JSON (see console for more info)"
    );
  });
});
