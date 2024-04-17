import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapPlotComponent } from './map-plot/map-plot.component';
import { ImageMapComponent } from './image-map/image-map.component';
import { MapabcComponent } from './mapabc/mapabc.component';
import { MinemapComponent } from './minemap/minemap.component';
import { OlBdMapComponent } from './ol-bd-map/ol-bd-map.component';
import { XzqhComponent } from './xzqh/xzqh.component';
import { AreaMapComponent } from './area-map/area-map.component';

const routes: Routes = [
  { path: 'bd-map', component: OlBdMapComponent },
  { path: 'new', component: MapPlotComponent },
  { path: 'mapabc', component: MapabcComponent },
  { path: 'minemap', component: MinemapComponent },
  { path: 'image', component: ImageMapComponent },
  { path: 'xzqh', component: XzqhComponent },
  { path: 'area-map', component: AreaMapComponent },
  { path: '', redirectTo: 'new', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
