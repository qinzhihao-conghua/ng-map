import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OlMapRoutingModule } from './ol-map-routing.module';
import { OlMapComponent } from './ol-map.component';
import { OlMapDemoComponent } from './ol-map-demo/ol-map-demo.component';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';
import { ServiceDemo1Component } from './service-demo1/service-demo1.component';


@NgModule({
  declarations: [
    OlMapComponent,
    OlMapDemoComponent,
    OlBdMapComponent,
    ServiceDemo1Component,
  ],
  imports: [
    CommonModule,
    OlMapRoutingModule
  ]
})
export class OlMapModule { }
