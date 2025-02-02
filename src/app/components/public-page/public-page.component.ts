import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  uptimeSegments: Array<'operational' | 'degraded' | 'outage' | 'maintenance'>;
  hourlyStatus: Array<'operational' | 'degraded' | 'outage' | 'maintenance'>;
}

@Component({
  selector: 'app-public-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="public-page-container">
      <h1>Public Status Page</h1>
      <div class="content-card">
        <div class="status-header">
          <div class="overall-status">
            <div class="status-indicator operational"></div>
            <h2>All Systems Operational</h2>
          </div>
          <p class="last-updated">Last updated: {{ getCurrentTime() }}</p>
        </div>
        
        <div class="services-status">
          <h3>Current Status</h3>
          <div class="service-status-item" *ngFor="let service of services">
            <div class="status-info">
              <span class="service-name">{{ service.name }}</span>
              <span class="status-badge" [class]="service.status">
                {{ service.status | titlecase }}
              </span>
            </div>
            <div class="service-timeline">
              <div class="timeline-labels">
                <div 
                  *ngFor="let status of service.hourlyStatus; let i = index" 
                  class="hour-label">
                  {{ getShortTimeLabel(i) }}
                </div>
              </div>
              <div class="timeline-bars">
                <div 
                  *ngFor="let status of service.hourlyStatus; let i = index" 
                  class="status-segment" 
                  [class]="status"
                  (click)="showDetailedStatus(service, i)"
                  [title]="getTimeLabel(i)">
                </div>
              </div>
            </div>
          </div>

          <div class="time-labels">
            <div class="time-label" *ngFor="let hour of timeLabels; let i = index">
              {{ i % 6 === 0 ? hour : '' }}
            </div>
          </div>
        </div>

        <div class="incident-history">
          <h3>Past Incidents</h3>
          <div class="incident-item">
            <div class="incident-date">January 31, 2025</div>
            <div class="incident-details">
              <h4>API Service Degraded Performance</h4>
              <p>Resolved - The API service is now operating normally</p>
              <p class="incident-time">Resolved at 15:45 IST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .public-page-container {
      padding: 20px;
    }

    h1 {
      margin-bottom: 20px;
      color: #2c3e50;
    }

    .content-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }

    .status-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }

    .overall-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .status-indicator {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    .status-indicator.operational {
      background-color: #2ecc71;
    }

    .last-updated {
      color: #666;
      font-size: 0.9rem;
    }

    .services-status {
      margin-bottom: 30px;
    }

    .service-status-item {
      margin: 15px 0;
    }

    .status-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }

    .service-name {
      font-weight: 500;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .status-badge.operational {
      background-color: #2ecc71;
      color: white;
    }

    .status-badge.degraded {
      background-color: #f1c40f;
      color: white;
    }

    .status-badge.outage {
      background-color: #e74c3c;
      color: white;
    }

    .status-badge.maintenance {
      background-color: #3498db;
      color: white;
    }

    .uptime-bar {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 2px;
      height: 8px;
      background: #f8fafc;
      border-radius: 4px;
      padding: 2px;
    }

    .uptime-segment {
      height: 100%;
      border-radius: 2px;
      transition: all 0.2s ease;
    }

    .uptime-segment.operational {
      background-color: #2ecc71;
    }

    .uptime-segment.degraded {
      background-color: #f1c40f;
    }

    .uptime-segment.outage {
      background-color: #e74c3c;
    }

    .uptime-segment.maintenance {
      background-color: #3498db;
    }

    .service-timeline {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 12px;
    }

    .timeline-labels {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 2px;
      padding: 0 4px;
    }

    .hour-label {
      font-size: 0.625rem;
      color: #64748b;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .timeline-bars {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 2px;
      height: 24px;
      background: #f8fafc;
      border-radius: 6px;
      padding: 4px;
    }

    .status-segment {
      height: 100%;
      border-radius: 2px;
      transition: all 0.2s ease;
    }

    .status-segment.operational {
      background-color: #2ecc71;
    }

    .status-segment.degraded {
      background-color: #f1c40f;
    }

    .status-segment.outage {
      background-color: #e74c3c;
    }

    .status-segment.maintenance {
      background-color: #3498db;
    }

    .time-labels {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 2px;
      margin-top: 4px;
      padding: 0 2px;
      font-size: 0.7rem;
      color: #64748b;
    }

    .time-label {
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
    }

    .incident-history {
      margin-top: 30px;
    }

    .incident-item {
      margin: 20px 0;
    }

    .incident-date {
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .incident-details h4 {
      margin: 0 0 5px 0;
      color: #2c3e50;
    }

    .incident-time {
      color: #666;
      font-size: 0.9rem;
      margin-top: 5px;
    }
  `]
})
export class PublicPageComponent implements OnInit {
  currentHour: number = new Date().getHours();
  timeLabels: string[] = [];
  
  services: ServiceStatus[] = [
    {
      name: 'API Service',
      status: 'operational',
      uptimeSegments: this.generateUptimeSegments('operational'),
      hourlyStatus: this.generateUptimeSegments('operational')
    },
    {
      name: 'Web Dashboard',
      status: 'degraded',
      uptimeSegments: this.generateUptimeSegments('degraded'),
      hourlyStatus: this.generateUptimeSegments('degraded')
    },
    {
      name: 'Database',
      status: 'operational',
      uptimeSegments: this.generateUptimeSegments('operational'),
      hourlyStatus: this.generateUptimeSegments('operational')
    },
    {
      name: 'Authentication',
      status: 'maintenance',
      uptimeSegments: this.generateUptimeSegments('maintenance'),
      hourlyStatus: this.generateUptimeSegments('maintenance')
    }
  ];

  ngOnInit() {
    this.generateTimeLabels();
  }

  generateTimeLabels() {
    this.timeLabels = Array.from({ length: 24 }, (_, i) => {
      const hour = (this.currentHour - (23 - i) + 24) % 24;
      return this.formatHour(hour);
    });
  }

  formatHour(hour: number): string {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  }

  getTimeLabel(index: number): string {
    const hour = (this.currentHour - (23 - index) + 24) % 24;
    const status = this.services[0].uptimeSegments[index];
    return `${this.formatHour(hour)}: ${status}`;
  }

  getShortTimeLabel(hour: number): string {
    const displayHour = (this.currentHour - (23 - hour) + 24) % 24;
    return displayHour.toString().padStart(2, '0');
  }

  private generateUptimeSegments(baseStatus: 'operational' | 'degraded' | 'outage' | 'maintenance'): Array<'operational' | 'degraded' | 'outage' | 'maintenance'> {
    return Array.from({ length: 24 }, () => {
      const rand = Math.random();
      if (rand < 0.7) return baseStatus;
      if (rand < 0.8) return 'degraded';
      if (rand < 0.9) return 'outage';
      return 'maintenance';
    });
  }

  showDetailedStatus(service: ServiceStatus, index: number) {
    console.log(`Show detailed status for ${service.name} at ${index}`);
  }
}
