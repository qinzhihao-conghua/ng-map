import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OlMapRoutingModule } from './ol-map-routing.module';
import { OlMapComponent } from './ol-map.component';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';
import { OlServiceComponent } from './ol-service/ol-service.component';
import { AreaMapNewComponent } from './area-map-new/area-map-new.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    OlMapComponent,
    OlBdMapComponent,
    OlServiceComponent,
    AreaMapNewComponent
  ],
  imports: [
    CommonModule,
    OlMapRoutingModule,
    FormsModule
  ]
})
export class OlMapModule { }
