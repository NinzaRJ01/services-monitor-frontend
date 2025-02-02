import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="app-title">Services Monitor</span>
      </div>
      <div class="navbar-user">
        <div class="dropdown" (click)="toggleDropdown()" [class.active]="isDropdownOpen">
          <button class="dropdown-button">
            <svg class="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
            </svg>
            <span class="username">John Doe</span>
            <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              [class.open]="isDropdownOpen">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="dropdown-menu" *ngIf="isDropdownOpen">
            <a class="dropdown-item" (click)="viewProfile()">Profile</a>
            <a class="dropdown-item" (click)="openSettings()">Settings</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item logout" (click)="logout()">Logout</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background-color: #2c3e50;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: 500;
      color: white;
      text-decoration: none;
    }

    .navbar-user {
      position: relative;
    }

    .dropdown {
      position: relative;
    }

    .dropdown-button {
      background: none;
      border: none;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    }

    .dropdown-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .user-icon {
      width: 24px;
      height: 24px;
    }

    .username {
      margin: 0 4px;
    }

    .dropdown-arrow {
      width: 16px;
      height: 16px;
      transition: transform 0.2s;
    }

    .dropdown-arrow.open {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      overflow: hidden;
    }

    .dropdown-item {
      display: block;
      padding: 12px 16px;
      color: #333;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .dropdown-item:hover {
      background-color: #f5f5f5;
    }

    .dropdown-divider {
      height: 1px;
      background-color: #eee;
      margin: 4px 0;
    }

    .logout {
      color: #dc3545;
    }

    .logout:hover {
      background-color: #dc35451a;
    }
  `]
})
export class NavbarComponent {
  isDropdownOpen = false;

  constructor(private router: Router) {}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  viewProfile(): void {
    // Add profile navigation logic
    this.isDropdownOpen = false;
  }

  openSettings(): void {
    // Add settings navigation logic
    this.isDropdownOpen = false;
  }

  logout(): void {
    this.isDropdownOpen = false;
    this.router.navigate(['/login']);
  }
}
