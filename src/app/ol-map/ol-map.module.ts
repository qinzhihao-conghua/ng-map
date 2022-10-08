import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OlMapRoutingModule } from './ol-map-routing.module';
import { OlMapComponent } from './ol-map.component';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';
import { OlServiceComponent } from './ol-service/ol-service.component';


@NgModule({
  declarations: [
    OlMapComponent,
    OlBdMapComponent,
    OlServiceComponent
  ],
  imports: [
    CommonModule,
    OlMapRoutingModule
  ]
})
export class OlMapModule { }
