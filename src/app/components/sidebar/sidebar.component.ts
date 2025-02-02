import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-content">
        <ul class="menu-items">
          <li class="menu-item" routerLinkActive="active">
            <a [routerLink]="['/dashboard/services']">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
              </svg>
              <span>Services Management</span>
            </a>
          </li>
          <li class="menu-item" routerLinkActive="active">
            <a [routerLink]="['/dashboard/team']">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <span>Team Management</span>
            </a>
          </li>
          <li class="menu-item" routerLinkActive="active">
            <a [routerLink]="['/dashboard/incidents']">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>Incident Management</span>
            </a>
          </li>
          <li class="menu-item" routerLinkActive="active">
            <a [routerLink]="['/dashboard/public']">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
              <span>Public Page View</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: calc(100vh - 60px);
      background-color: white;
      border-right: 1px solid #eee;
      position: fixed;
      top: 60px;
      left: 0;
      overflow-y: auto;
    }

    .sidebar-content {
      padding: 20px 0;
    }

    .menu-items {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .menu-item {
      margin: 4px 0;
    }

    .menu-item a {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: #333;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .menu-item:hover a {
      background-color: #f5f5f5;
      color: #2c3e50;
    }

    .menu-item.active a {
      background-color: #2c3e50;
      color: white;
    }

    .menu-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .menu-item span {
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class SidebarComponent {}
