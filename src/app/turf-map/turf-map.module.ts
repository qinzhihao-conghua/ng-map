import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TurfMapRoutingModule } from './turf-map-routing.module';
import { TurfMapComponent } from './turf-map.component';


@NgModule({
  declarations: [TurfMapComponent],
  imports: [
    CommonModule,
    TurfMapRoutingModule
  ]
})
export class TurfMapModule { }
