import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'ol', loadChildren: () => import('../app/ol-map/ol-map.module').then(m => m.OlMapModule) },
  { path: '', redirectTo: 'ol', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
