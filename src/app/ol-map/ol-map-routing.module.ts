import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';
import { OlMapDemoComponent } from './ol-map-demo/ol-map-demo.component';
import { OlMapComponent } from './ol-map.component';
import { ServiceDemo1Component } from './service-demo1/service-demo1.component';


const routes: Routes = [
  {
    path: '',
    component: OlMapComponent,
    children: [
      { path: 'ol-map', component: OlMapDemoComponent },
      { path: 'bd-map', component: OlBdMapComponent },
      { path: 'demo', component: ServiceDemo1Component },
      { path: '', redirectTo: 'demo', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OlMapRoutingModule { }
