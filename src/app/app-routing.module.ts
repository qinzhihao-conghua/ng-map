import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapPlotComponent } from './components/map-plot/map-plot.component';
import { ImageMapComponent } from './components/image-map/image-map.component';
import { MapabcComponent } from './components/mapabc/mapabc.component';
import { MinemapComponent } from './components/minemap/minemap.component';
import { OlBdMapComponent } from './components/ol-bd-map/ol-bd-map.component';
import { XzqhComponent } from './components/xzqh/xzqh.component';
import { AreaMapComponent } from './components/area-map/area-map.component';
import { SvgMapComponent } from './components/svg-map/svg-map.component';
import { PlotUtilComponent } from './components/plot-util/plot-util.component';

const routes: Routes = [
  { path: 'bd-map', component: OlBdMapComponent },
  { path: 'new', component: MapPlotComponent },
  { path: 'mapabc', component: MapabcComponent },
  { path: 'minemap', component: MinemapComponent },
  { path: 'image', component: ImageMapComponent },
  { path: 'xzqh', component: XzqhComponent },
  { path: 'area-map', component: AreaMapComponent },
  { path: 'svg-map', component: SvgMapComponent },
  { path: 'plot-util', component: PlotUtilComponent },
  { path: '', redirectTo: 'new', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
