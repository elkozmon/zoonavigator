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

import {APP_INITIALIZER, NgModule} from "@angular/core";
import {APP_BASE_HREF, Location, LocationStrategy, PathLocationStrategy} from "@angular/common";
import {BrowserModule, Title} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {CovalentCommonModule} from "@covalent/core";
import {AngularFontAwesomeModule} from "angular-font-awesome";
import {ConfigService, getConfigLoader} from "./config";
import {AppComponent} from "./app.component";
import {AppRoutingModule} from "./app-routing.module";
import {CoreModule} from "./core";
import {ConnectModule} from "./connect";
import {EditorModule} from "./editor";

@NgModule({
  imports: [
    BrowserAnimationsModule,
    AngularFontAwesomeModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    CovalentCommonModule,
    CoreModule,
    ConnectModule,
    EditorModule,
    AppRoutingModule
  ],
  providers: [
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: getConfigLoader,
      deps: [ConfigService],
      multi: true
    },
    Title,
    Location,
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },
    {
      provide: APP_BASE_HREF,
      useValue: window['base-href']
    }
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
