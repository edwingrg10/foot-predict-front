import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ModelStatsComponent } from './components/model-stats/model-stats.component';

export const routes: Routes = [
  { path: '',       component: DashboardComponent },
  { path: 'stats',  component: ModelStatsComponent },
  { path: '**',     redirectTo: '' },
];
