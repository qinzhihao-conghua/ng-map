import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AreaMapNewComponent } from './area-map-new/area-map-new.component';
import { ImageMapComponent } from './image-map/image-map.component';
import { MapabcComponent } from './mapabc/mapabc.component';
import { MinemapComponent } from './minemap/minemap.component';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';

@NgModule({
  declarations: [
    AppComponent,
    OlBdMapComponent,
    AreaMapNewComponent,
    MapabcComponent,
    MinemapComponent,
    ImageMapComponent
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
