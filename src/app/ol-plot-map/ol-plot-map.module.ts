import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OlPlotMapRoutingModule } from './ol-plot-map-routing.module';
import { OlPlotMapComponent } from './ol-plot-map.component';
import { OlPlotDemoComponent } from './ol-plot-demo/ol-plot-demo.component';


@NgModule({
  declarations: [OlPlotMapComponent, OlPlotDemoComponent],
  imports: [
    CommonModule,
    OlPlotMapRoutingModule
  ]
})
export class OlPlotMapModule { }
