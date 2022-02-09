import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TurfMapRoutingModule } from './turf-map-routing.module';
import { TurfMapComponent } from './turf-map.component';
import { TurfDemoComponent } from './turf-demo/turf-demo.component';


@NgModule({
  declarations: [TurfMapComponent, TurfDemoComponent],
  imports: [
    CommonModule,
    TurfMapRoutingModule
  ]
})
export class TurfMapModule { }
