import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineData {
  timestamp: number;
  value: number;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
}

@Component({
  selector: 'app-status-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-grid-container">
      <div class="grid-wrapper">
        <div class="uptime-grid">
          <div 
            *ngFor="let hour of hours; let i = index" 
            class="grid-bar"
            [style.height.%]="hour.value"
            [class]="getBarClass(hour)"
            [title]="getTimeTooltip(i, hour)">
          </div>
        </div>
        <div class="time-labels">
          <div class="label" *ngFor="let label of timeLabels">{{ label }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-grid-container {
      width: 100%;
      padding: 8px 0;
    }

    .grid-wrapper {
      width: 100%;
    }

    .uptime-grid {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 4px;
      height: 40px;
      align-items: end;
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 4px;
      margin-bottom: 4px;
    }

    .grid-bar {
      width: 100%;
      min-height: 4px;
      border-radius: 2px;
      transition: height 0.2s ease;
    }

    .grid-bar.operational {
      background-color: #22c55e;
    }

    .grid-bar.degraded {
      background-color: #eab308;
    }

    .grid-bar.outage {
      background-color: #ef4444;
    }

    .grid-bar.maintenance {
      background-color: #3b82f6;
    }

    .time-labels {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 4px;
    }

    .time-labels .label {
      text-align: center;
      color: #64748b;
      font-size: 0.75rem;
    }
  `]
})
export class StatusGridComponent {
  @Input() hours: TimelineData[] = [];

  timeLabels = Array.from({ length: 24 }, (_, i) => 
    i === 0 ? '12am' : 
    i === 12 ? '12pm' : 
    i > 12 ? `${i-12}pm` : `${i}am`
  );

  getBarClass(hour: TimelineData): string {
    return hour.status;
  }

  getTimeTooltip(index: number, hour: TimelineData): string {
    const timeLabel = this.timeLabels[index];
    return `${timeLabel}: ${hour.value}% - ${hour.status}`;
  }
}
