import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MapPlotComponent } from './map-plot/map-plot.component';
import { ImageMapComponent } from './image-map/image-map.component';
import { MapabcComponent } from './mapabc/mapabc.component';
import { MinemapComponent } from './minemap/minemap.component';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';
import { XzqhComponent } from './xzqh/xzqh.component';
import { AreaMapComponent } from './area-map/area-map.component';
import { SvgMapComponent } from './svg-map/svg-map.component';

@NgModule({
  declarations: [
    AppComponent,
    OlBdMapComponent,
    MapPlotComponent,
    MapabcComponent,
    MinemapComponent,
    ImageMapComponent,
    XzqhComponent,
    AreaMapComponent,
    SvgMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
