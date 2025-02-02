import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  uptimeSegments: Array<'operational' | 'degraded' | 'outage' | 'maintenance'>;
  hourlyStatus: Array<'operational' | 'degraded' | 'outage' | 'maintenance'>;
}

export interface SystemStatus {
  overallStatus: 'operational' | 'degraded' | 'outage' | 'maintenance';
  lastUpdated: Date;
  services: ServiceStatus[];
}

export interface IncidentHistory {
  date: Date;
  incidents: {
    title: string;
    description: string;
    status: string;
    resolvedAt?: Date;
    service: string;
    updates: {
      timestamp: Date;
      status: string;
      message: string;
    }[];
  }[];
}

export interface ServiceUptime {
  service: string;
  uptime: number;
  lastDowntime?: Date;
  downtimeHistory: {
    startTime: Date;
    endTime: Date;
    duration: number;
    reason: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PublicPageService {
  private apiUrl = 'http://localhost:3000/api/public';

  constructor(private http: HttpClient) {}

  // Get current system status including all services
  getSystemStatus(): Observable<SystemStatus> {
    return this.http.get<SystemStatus>(`${this.apiUrl}/status`);
  }

  // Get detailed status for a specific service
  getServiceStatus(serviceName: string): Observable<ServiceStatus> {
    return this.http.get<ServiceStatus>(`${this.apiUrl}/services/${encodeURIComponent(serviceName)}`);
  }

  // Get historical status for a service
  getServiceHistory(serviceName: string, days: number = 30): Observable<{
    hourlyStatus: Array<'operational' | 'degraded' | 'outage' | 'maintenance'>;
    uptimePercentage: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/services/${encodeURIComponent(serviceName)}/history`, {
      params: { days: days.toString() }
    });
  }

  // Get all past incidents
  getIncidentHistory(page: number = 1, limit: number = 10): Observable<IncidentHistory[]> {
    return this.http.get<IncidentHistory[]>(`${this.apiUrl}/incidents/history`, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    });
  }

  // Get incidents for a specific service
  getServiceIncidents(serviceName: string, page: number = 1, limit: number = 10): Observable<IncidentHistory[]> {
    return this.http.get<IncidentHistory[]>(
      `${this.apiUrl}/services/${encodeURIComponent(serviceName)}/incidents`,
      {
        params: {
          page: page.toString(),
          limit: limit.toString()
        }
      }
    );
  }

  // Get uptime statistics
  getUptimeStats(days: number = 30): Observable<ServiceUptime[]> {
    return this.http.get<ServiceUptime[]>(`${this.apiUrl}/uptime`, {
      params: { days: days.toString() }
    });
  }

  // Get service uptime for a specific period
  getServiceUptime(serviceName: string, startDate: Date, endDate: Date): Observable<ServiceUptime> {
    return this.http.get<ServiceUptime>(
      `${this.apiUrl}/services/${encodeURIComponent(serviceName)}/uptime`,
      {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    );
  }

  // Subscribe to status updates (returns webhook URL)
  subscribeToUpdates(email: string, services?: string[]): Observable<{ webhookUrl: string }> {
    return this.http.post<{ webhookUrl: string }>(`${this.apiUrl}/subscribe`, {
      email,
      services
    });
  }

  // Unsubscribe from status updates
  unsubscribeFromUpdates(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/unsubscribe`, { email });
  }

  // Get system metrics
  getSystemMetrics(): Observable<{
    totalIncidents: number;
    avgResolutionTime: number;
    uptimeLastMonth: number;
    serviceHealth: {
      [key: string]: {
        status: string;
        uptime: number;
        incidents: number;
      };
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/metrics`);
  }

  // Check if maintenance is scheduled
  getScheduledMaintenance(): Observable<{
    scheduledStart: Date;
    scheduledEnd: Date;
    services: string[];
    description: string;
  }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/maintenance`);
  }

  // Get overall system health score
  getSystemHealthScore(): Observable<{
    score: number;
    trend: 'improving' | 'stable' | 'degrading';
    components: {
      name: string;
      score: number;
      impact: number;
    }[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/health-score`);
  }
}
