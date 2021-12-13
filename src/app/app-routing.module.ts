import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';
import { OlMapComponent } from './ol-map/ol-map.component';
import { ServiceDemo1Component } from './service-demo1/service-demo1.component';
import { ServiceDemo2Component } from './service-demo2/service-demo2.component';


const routes: Routes = [
  { path: 'ol', component: OlMapComponent },
  { path: 'bd', component: OlBdMapComponent },
  { path: 'demo1', component: ServiceDemo1Component },
  { path: 'demo2', component: ServiceDemo2Component },
  { path: '', redirectTo: 'ol', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
