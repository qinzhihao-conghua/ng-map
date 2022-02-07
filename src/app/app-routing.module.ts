import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'ol', loadChildren: () => import('../app/ol-map/ol-map.module').then(m => m.OlMapModule) },
  { path: 'turf', loadChildren: () => import('../app/turf-map/turf-map.module').then(m => m.TurfMapModule) },
  { path: 'ol-plot', loadChildren: () => import('../app/ol-plot-map/ol-plot-map.module').then(m => m.OlPlotMapModule) },
  { path: '', redirectTo: 'ol', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
