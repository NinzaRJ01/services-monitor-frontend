import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-container">
        <app-sidebar></app-sidebar>
        <div class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .dashboard-container {
      padding-top: 60px; /* Height of navbar */
      display: flex;
    }

    .main-content {
      flex: 1;
      margin-left: 250px; /* Width of sidebar */
      padding: 20px;
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class DashboardComponent {}
