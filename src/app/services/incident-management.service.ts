import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Incident {
  id: string;
  title: string;
  description: string;
  service: string;
  severity: 'degraded-performance' | 'partial-outage' | 'major-outage' | 'maintenance';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'scheduled' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  notify?: boolean;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  service: string;
  severity: Incident['severity'];
  notify?: boolean;
  scheduledStart?: Date;
  scheduledEnd?: Date;
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  service?: string;
  severity?: Incident['severity'];
  status?: Incident['status'];
  notify?: boolean;
  scheduledStart?: Date;
  scheduledEnd?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class IncidentManagementService {
  private apiUrl = 'http://localhost:3000/api/incidents';

  constructor(private http: HttpClient) {}

  // Get all incidents
  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.apiUrl);
  }

  // Get active incidents (not resolved or completed)
  getActiveIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/active`);
  }

  // Get scheduled maintenance incidents
  getScheduledMaintenance(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/maintenance`);
  }

  // Create a new incident
  createIncident(incident: CreateIncidentRequest): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, incident);
  }

  // Create a maintenance incident
  scheduleMaintenance(maintenance: CreateIncidentRequest): Observable<Incident> {
    return this.http.post<Incident>(`${this.apiUrl}/maintenance`, maintenance);
  }

  // Update an incident
  updateIncident(id: string, updates: UpdateIncidentRequest): Observable<Incident> {
    return this.http.patch<Incident>(`${this.apiUrl}/${id}`, updates);
  }

  // Update incident status
  updateIncidentStatus(id: string, status: Incident['status']): Observable<Incident> {
    return this.http.patch<Incident>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Start maintenance
  startMaintenance(id: string): Observable<Incident> {
    return this.http.post<Incident>(`${this.apiUrl}/${id}/start`, {});
  }

  // Complete maintenance
  completeMaintenance(id: string): Observable<Incident> {
    return this.http.post<Incident>(`${this.apiUrl}/${id}/complete`, {});
  }

  // Delete an incident
  deleteIncident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get incident history
  getIncidentHistory(id: string): Observable<{
    timestamp: Date;
    status: Incident['status'];
    message: string;
  }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`);
  }

  // Get incident statistics
  getIncidentStats(startDate?: Date, endDate?: Date): Observable<{
    total: number;
    resolved: number;
    active: number;
    byService: { [key: string]: number };
    bySeverity: { [key: string]: number };
  }> {
    let url = `${this.apiUrl}/stats`;
    if (startDate && endDate) {
      url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    }
    return this.http.get<any>(url);
  }

  // Get affected services
  getAffectedServices(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/affected-services`);
  }
}
