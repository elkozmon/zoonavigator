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
import {TextMode} from "../mode";
import {GzipCompression} from "./gzip-compression";

describe("GzipCompression", () => {
  const compression = new GzipCompression();
  const textMode = new TextMode();

  it("detects gzip bytes after compression", async () => {
    const compressed = await firstValueFrom(compression.compress(textMode.encodeData("hello zookeeper")));

    expect(compression.isCompressed(compressed)).toBeTrue();
  });

  it("round-trips compressed bytes", async () => {
    const data = textMode.encodeData("hello zookeeper");
    const compressed = await firstValueFrom(compression.compress(data));
    const decompressed = await firstValueFrom(compression.decompress(compressed));

    expect(textMode.decodeData(decompressed)).toBe("hello zookeeper");
  });
});
