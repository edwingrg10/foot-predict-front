import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ModelStatsComponent } from './components/model-stats/model-stats.component';
import { PredictionsComponent } from './components/predictions/predictions.component';
import { ChatComponent } from './components/chat/chat.component';
import { AdminComponent } from './components/admin/admin.component';
import { VerifyComponent } from './components/verify/verify.component';
import { PlanesComponent } from './components/planes/planes.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'predicciones', component: PredictionsComponent },
  { path: 'stats', component: ModelStatsComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'planes', component: PlanesComponent },
  { path: 'planes/exito', component: PaymentSuccessComponent },
  { path: '**', redirectTo: '' },
];
