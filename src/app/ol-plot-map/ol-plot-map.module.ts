import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OlPlotMapRoutingModule } from './ol-plot-map-routing.module';
import { OlPlotMapComponent } from './ol-plot-map.component';


@NgModule({
  declarations: [OlPlotMapComponent],
  imports: [
    CommonModule,
    OlPlotMapRoutingModule
  ]
})
export class OlPlotMapModule { }
