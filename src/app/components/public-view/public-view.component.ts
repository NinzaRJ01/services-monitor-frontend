import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusGridComponent, TimelineData } from '../shared/status-grid/status-grid.component';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  timeline: TimelineData[];
}

@Component({
  selector: 'app-public-view',
  standalone: true,
  imports: [CommonModule, StatusGridComponent],
  template: `
    <div class="public-view">
      <header class="header">
        <h1>Service Status</h1>
        <div class="current-time">{{ getCurrentTime() }}</div>
      </header>

      <div class="services-grid">
        <div class="service-row" *ngFor="let service of services">
          <div class="service-info">
            <h3>{{ service.name }}</h3>
            <span class="status-badge" [class]="service.status">
              {{ service.status | titlecase }}
            </span>
          </div>
          <app-status-grid [hours]="service.timeline"></app-status-grid>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .public-view {
      padding: 24px;
      background-color: #f8fafc;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header h1 {
      color: #1e293b;
      margin: 0;
      font-size: 1.875rem;
    }

    .current-time {
      color: #64748b;
      font-size: 1rem;
    }

    .services-grid {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }

    .service-row {
      display: flex;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .service-row:last-child {
      border-bottom: none;
    }

    .service-info {
      width: 200px;
      flex-shrink: 0;
    }

    .service-info h3 {
      margin: 0 0 4px 0;
      color: #334155;
      font-size: 1rem;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.operational {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-badge.degraded {
      background-color: #fef9c3;
      color: #854d0e;
    }

    .status-badge.outage {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .status-badge.maintenance {
      background-color: #e0f2fe;
      color: #075985;
    }
  `]
})
export class PublicViewComponent {
  services: ServiceStatus[] = [
    {
      name: 'API Service',
      status: 'operational',
      timeline: this.generateTimeline('operational')
    },
    {
      name: 'Web Dashboard',
      status: 'degraded',
      timeline: this.generateTimeline('degraded')
    },
    {
      name: 'Database',
      status: 'operational',
      timeline: this.generateTimeline('operational')
    },
    {
      name: 'Authentication',
      status: 'outage',
      timeline: this.generateTimeline('outage')
    }
  ];

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  }

  private generateTimeline(baseStatus: 'operational' | 'degraded' | 'outage' | 'maintenance'): TimelineData[] {
    return Array.from({ length: 24 }, (_, i) => {
      const value = Math.floor(Math.random() * 100);
      let status = baseStatus;
      
      // Add some variation
      if (value < 60) status = 'outage';
      else if (value < 80) status = 'degraded';
      else status = 'operational';

      return {
        timestamp: Date.now() - (23 - i) * 3600000, // Last 24 hours
        value,
        status
      };
    });
  }
}
