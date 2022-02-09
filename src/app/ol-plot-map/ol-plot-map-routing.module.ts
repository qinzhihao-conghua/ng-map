import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OlPlotDemoComponent } from './ol-plot-demo/ol-plot-demo.component';
import { OlPlotMapComponent } from './ol-plot-map.component';


const routes: Routes = [
  {
    path: '',
    component: OlPlotMapComponent,
    children: [
      { path: 'ol-plot', component: OlPlotDemoComponent },
      { path: '', redirectTo: 'ol-plot', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OlPlotMapRoutingModule { }
