import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TurfMapComponent } from './turf-map.component';


const routes: Routes = [
  {
    path: '',
    component: TurfMapComponent,
    // children: [
    //   { path: '', redirectTo: 'demo', pathMatch: 'full' },
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TurfMapRoutingModule { }
