import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OlMapComponent } from './ol-map/ol-map.component';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';

@NgModule({
  declarations: [
    AppComponent,
    OlMapComponent,
    OlBdMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
