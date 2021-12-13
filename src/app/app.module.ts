import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OlMapComponent } from './ol-map/ol-map.component';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';
import { HttpClientModule } from '@angular/common/http';
import { ServiceDemo1Component } from './service-demo1/service-demo1.component';
import { ServiceDemo2Component } from './service-demo2/service-demo2.component';

@NgModule({
  declarations: [
    AppComponent,
    OlMapComponent,
    OlBdMapComponent,
    ServiceDemo1Component,
    ServiceDemo2Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
