import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServiceConfig {
  image?: string;
  tag: string;
  name: string;
  description: string;
  cronInterval: string;
  defaultStatus: 'operational' | 'degraded' | 'outage' | 'maintenance';
  categoryName: string;
  monitorType: 'http' | 'ping';
  httpConfig?: {
    timeout: number;
    method: 'GET' | 'POST';
    url: string;
    headers: string;
    body: string;
  };
  pingConfig?: {
    ipv4: string;
    ipv6: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ServiceManagementService {
  private apiUrl = environment.apiUrl+"/services"; // Use the API URL from environment.ts

  constructor(private http: HttpClient) {}

  addService(service: ServiceConfig): Observable<any> {
    return this.http.post(this.apiUrl, service);
  }

  getServices(): Observable<ServiceConfig[]> {
    return this.http.get<ServiceConfig[]>(this.apiUrl);
  }

  updateService(id: string, service: Partial<ServiceConfig>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, service);
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
