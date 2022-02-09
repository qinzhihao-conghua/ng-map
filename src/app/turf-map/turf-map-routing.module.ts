import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TurfDemoComponent } from './turf-demo/turf-demo.component';
import { TurfMapComponent } from './turf-map.component';


const routes: Routes = [
  {
    path: '',
    component: TurfMapComponent,
    children: [
      { path: 'turf', component: TurfDemoComponent },
      { path: '', redirectTo: 'turf', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TurfMapRoutingModule { }
