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

import {NgModule} from "@angular/core";
import {RouterModule, RunGuardsAndResolvers} from "@angular/router";
import {EditorComponent} from "./editor.component";
import {EditorGuard} from "./editor.guard";
import {ZNodeWithChildrenResolver} from "./znode/znode-with-children.resolver";
import {
  CanDeactivateZNodeAclComponent,
  CanDeactivateZNodeDataComponent,
  ZNodeAclComponent,
  ZNodeDataComponent,
  ZNodeMetaComponent
} from "./content";

const editorRoutes = [
  {
    path: "editor",
    component: EditorComponent,
    canActivate: [EditorGuard],
    canActivateChild: [EditorGuard],
    runGuardsAndResolvers: <RunGuardsAndResolvers>"paramsOrQueryParamsChange",
    resolve: {
      zNodeWithChildren: ZNodeWithChildrenResolver
    },
    children: [
      {
        path: "data",
        component: ZNodeDataComponent,
        canDeactivate: [CanDeactivateZNodeDataComponent],
        runGuardsAndResolvers: <RunGuardsAndResolvers>"paramsOrQueryParamsChange"
      },
      {
        path: "acl",
        component: ZNodeAclComponent,
        canDeactivate: [CanDeactivateZNodeAclComponent],
        runGuardsAndResolvers: <RunGuardsAndResolvers>"paramsOrQueryParamsChange"
      },
      {
        path: "meta",
        component: ZNodeMetaComponent
      },
      {
        path: "**",
        redirectTo: "data"
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(editorRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    EditorGuard,
    ZNodeWithChildrenResolver
  ]
})
export class EditorRoutingModule {
}
