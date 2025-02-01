import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MapPlotComponent } from './components/map-plot/map-plot.component';
import { ImageMapComponent } from './components/image-map/image-map.component';
import { MapabcComponent } from './components/mapabc/mapabc.component';
import { MinemapComponent } from './components/minemap/minemap.component';
import { OlBdMapComponent } from './components/ol-bd-map/ol-bd-map.component';
import { XzqhComponent } from './components/xzqh/xzqh.component';
import { AreaMapComponent } from './components/area-map/area-map.component';
import { SvgMapComponent } from './components/svg-map/svg-map.component';
import { PlotUtilComponent } from './components/plot-util/plot-util.component';

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
    SvgMapComponent,
    PlotUtilComponent
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
