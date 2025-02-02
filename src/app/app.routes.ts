import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ServicesManagementComponent } from './components/services-management/services-management.component';
import { TeamManagementComponent } from './components/team-management/team-management.component';
import { IncidentManagementComponent } from './components/incident-management/incident-management.component';
import { PublicPageComponent } from './components/public-page/public-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
          { path: '', redirectTo: 'services', pathMatch: 'full' },
          { path: 'services', component: ServicesManagementComponent },
          { path: 'team', component: TeamManagementComponent },
          { path: 'incidents', component: IncidentManagementComponent },
          { path: 'public', component: PublicPageComponent }
        ]
      }
    ]
  }
];
