import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OlPlotMapComponent } from './ol-plot-map.component';


const routes: Routes = [
  {
    path: '',
    component: OlPlotMapComponent,
    // children: [
    //   { path: '', redirectTo: 'demo', pathMatch: 'full' },
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OlPlotMapRoutingModule { }
