import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AreaMapNewComponent } from './area-map-new/area-map-new.component';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';
import { OlMapComponent } from './ol-map.component';
import { OlServiceComponent } from './ol-service/ol-service.component';


const routes: Routes = [
  {
    path: '',
    component: OlMapComponent,
    children: [
      { path: 'bd-map', component: OlBdMapComponent },
      { path: 'ol-service', component: OlServiceComponent },
      { path: 'new', component: AreaMapNewComponent },
      { path: '', redirectTo: 'ol-service', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OlMapRoutingModule { }
