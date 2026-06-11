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

import {of} from "rxjs";
import {ZNodeService} from "./znode.service";
import {PathSanitizingZNodeService} from "./path-sanitizing-znode.service";

describe("PathSanitizingZNodeService", () => {
  it("strips a trailing slash before reading a node", () => {
    const delegate = {
      getNode: jasmine.createSpy("getNode").and.returnValue(of(null))
    };
    const service = new PathSanitizingZNodeService(delegate as unknown as ZNodeService);

    service.getNode("/parent/child/").subscribe();

    expect(delegate.getNode).toHaveBeenCalledWith("/parent/child");
  });

  it("keeps the root path unchanged", () => {
    const delegate = {
      getNode: jasmine.createSpy("getNode").and.returnValue(of(null))
    };
    const service = new PathSanitizingZNodeService(delegate as unknown as ZNodeService);

    service.getNode("/").subscribe();

    expect(delegate.getNode).toHaveBeenCalledWith("/");
  });

  it("strips trailing slashes from both duplicate paths", () => {
    const delegate = {
      duplicateNode: jasmine.createSpy("duplicateNode").and.returnValue(of(null))
    };
    const service = new PathSanitizingZNodeService(delegate as unknown as ZNodeService);

    service.duplicateNode("/source/", "/destination/").subscribe();

    expect(delegate.duplicateNode).toHaveBeenCalledWith("/source", "/destination");
  });

  it("strips trailing slashes from exported paths", () => {
    const delegate = {
      exportNodes: jasmine.createSpy("exportNodes").and.returnValue(of(null))
    };
    const service = new PathSanitizingZNodeService(delegate as unknown as ZNodeService);

    service.exportNodes(["/one/", "/two/child/"]).subscribe();

    expect(delegate.exportNodes).toHaveBeenCalledWith(["/one", "/two/child"]);
  });
});
