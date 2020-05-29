import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Containers
import { ReorientComponent } from './reorient/reorient.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProgressBarComponent } from './reorient/progress-bar/progress-bar.component';

const routes: Routes = [
  { path: 'progress-bar', component: ProgressBarComponent },
  { path: 'reorient', component: ReorientComponent },
  { path: 'dashboard', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }