import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { ServiceManagementService, ServiceConfig } from '../../services/service-management.service';
import { finalize } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  hourlyStatus: Array<'operational' | 'degraded' | 'outage' | 'maintenance'>;
  detailedStatus: Array<{
    hour: number;
    intervals: Array<'operational' | 'degraded' | 'outage' | 'maintenance'>;
  }>;
}

@Component({
  selector: 'app-services-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogComponent,
    HttpClientModule
  ],
  providers: [ServiceManagementService],
  template: `
    <div class="services-management">
      <header class="page-header">
        <div>
          <h1>Services Management</h1>
          <p class="subtitle">Monitor and manage service status</p>
        </div>
        <div class="header-actions">
          <div class="refresh-section">
            <button 
              class="refresh-btn" 
              [class.spinning]="isRefreshing"
              (click)="refreshData()">
              ↻
            </button>
            <div class="refresh-info">
              <label class="auto-refresh-toggle">
                <input 
                  type="checkbox" 
                  [checked]="autoRefreshEnabled"
                  (change)="toggleAutoRefresh()">
                Auto-refresh
              </label>
              <span class="next-refresh" *ngIf="autoRefreshEnabled">
                Next refresh in {{ nextRefreshTime }}s
              </span>
            </div>
          </div>
          <button class="add-service-btn" (click)="openAddServiceDialog()">Add Service</button>
        </div>
      </header>

      <div class="services-grid">
        <div class="service-card" *ngFor="let service of services">
          <div class="service-header">
            <h3>{{ service.name }}</h3>
            <span class="status-badge" [class]="service.status">
              {{ service.status | titlecase }}
            </span>
          </div>

          <div class="status-timeline">
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
    </div>

    <!-- Detailed Status Dialog -->
    <app-dialog
      [isOpen]="showDetailedDialog"
      [title]="'Detailed Status - ' + getTimeLabel(selectedHour)"
      (closeDialog)="closeDetailedDialog()">
      <div class="detailed-status" *ngIf="selectedService">
        <div class="service-info">
          <h4>{{ selectedService.name }}</h4>
          <span class="status-badge" [class]="selectedService.status">
            {{ selectedService.status | titlecase }}
          </span>
        </div>

        <div class="interval-grid">
          <div 
            *ngFor="let interval of getDetailedIntervals(); let i = index"
            class="interval-segment"
            [class]="interval">
            <span class="interval-time">{{ getIntervalLabel(i) }}</span>
          </div>
        </div>

        <div class="status-legend">
          <div class="legend-item">
            <div class="legend-color operational"></div>
            <span>Operational</span>
          </div>
          <div class="legend-item">
            <div class="legend-color degraded"></div>
            <span>Degraded</span>
          </div>
          <div class="legend-item">
            <div class="legend-color outage"></div>
            <span>Outage</span>
          </div>
          <div class="legend-item">
            <div class="legend-color maintenance"></div>
            <span>Maintenance</span>
          </div>
        </div>
      </div>
    </app-dialog>

    <app-dialog [isOpen]="isAddServiceDialogOpen" title="Add New Service" (closeDialog)="closeAddServiceDialog()">
      
      <form [formGroup]="serviceForm" class="add-service-form">
        <div class="form-group">
          <label for="tag">Tag</label>
          <input 
            type="text" 
            id="tag" 
            formControlName="tag"
            placeholder="production">
          <div class="error-message" *ngIf="serviceForm.get('tag')?.touched && serviceForm.get('tag')?.errors">
            <span *ngIf="serviceForm.get('tag')?.errors?.['required']">Tag is required</span>
            <span *ngIf="serviceForm.get('tag')?.errors?.['minlength']">Tag must be at least 2 characters</span>
            <span *ngIf="serviceForm.get('tag')?.errors?.['maxlength']">Tag cannot exceed 20 characters</span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="name">Service Name</label>
          <input 
            type="text" 
            id="name" 
            formControlName="name"
            placeholder="API Service">
          <div class="error-message" *ngIf="serviceForm.get('name')?.touched && serviceForm.get('name')?.errors">
            <span *ngIf="serviceForm.get('name')?.errors?.['required']">Service name is required</span>
            <span *ngIf="serviceForm.get('name')?.errors?.['minlength']">Name must be at least 3 characters</span>
            <span *ngIf="serviceForm.get('name')?.errors?.['maxlength']">Name cannot exceed 50 characters</span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            formControlName="description"
            placeholder="Describe your service"></textarea>
          <div class="error-message" *ngIf="serviceForm.get('description')?.touched && serviceForm.get('description')?.errors">
            <span *ngIf="serviceForm.get('description')?.errors?.['required']">Description is required</span>
            <span *ngIf="serviceForm.get('description')?.errors?.['minlength']">Description must be at least 10 characters</span>
            <span *ngIf="serviceForm.get('description')?.errors?.['maxlength']">Description cannot exceed 500 characters</span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="cronInterval">Cron Interval</label>
          <input 
            type="text" 
            id="cronInterval" 
            formControlName="cronInterval">
          <small>Fixed to 5 minutes</small>
        </div>
        
        <div class="form-group">
          <label for="defaultStatus">Default Status</label>
          <select id="defaultStatus" formControlName="defaultStatus">
            <option value="operational">Operational</option>
            <option value="degraded">Degraded</option>
            <option value="outage">Outage</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <div class="error-message" *ngIf="serviceForm.get('defaultStatus')?.touched && serviceForm.get('defaultStatus')?.errors">
            <span *ngIf="serviceForm.get('defaultStatus')?.errors?.['required']">Default status is required</span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="categoryName">Category Name</label>
          <input 
            type="text" 
            id="categoryName" 
            formControlName="categoryName"
            placeholder="Infrastructure">
          <div class="error-message" *ngIf="serviceForm.get('categoryName')?.touched && serviceForm.get('categoryName')?.errors">
            <span *ngIf="serviceForm.get('categoryName')?.errors?.['required']">Category name is required</span>
            <span *ngIf="serviceForm.get('categoryName')?.errors?.['minlength']">Category must be at least 2 characters</span>
            <span *ngIf="serviceForm.get('categoryName')?.errors?.['maxlength']">Category cannot exceed 30 characters</span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="monitorType">Monitor Type</label>
          <select id="monitorType" formControlName="monitorType">
            <option value="http">HTTP</option>
            <option value="ping">Ping</option>
          </select>
          <div class="error-message" *ngIf="serviceForm.get('monitorType')?.touched && serviceForm.get('monitorType')?.errors">
            <span *ngIf="serviceForm.get('monitorType')?.errors?.['required']">Monitor type is required</span>
          </div>
        </div>

        <!-- HTTP Configuration Fields -->
        <div class="http-config config-section" *ngIf="serviceForm.get('monitorType')?.value === 'http'" formGroupName="httpConfig">
          <h3>HTTP Configuration</h3>
          
          <div class="form-group">
            <label for="timeout">Timeout (ms)</label>
            <input 
              type="number" 
              id="timeout" 
              formControlName="timeout"
              [max]="60000"
              [min]="1">
            <div class="error-message" *ngIf="serviceForm.get('httpConfig.timeout')?.touched && serviceForm.get('httpConfig.timeout')?.errors">
              <span *ngIf="serviceForm.get('httpConfig.timeout')?.errors?.['required']">Timeout is required</span>
              <span *ngIf="serviceForm.get('httpConfig.timeout')?.errors?.['min']">Timeout must be at least 1ms</span>
              <span *ngIf="serviceForm.get('httpConfig.timeout')?.errors?.['max']">Timeout cannot exceed 60000ms (1 minute)</span>
            </div>
            <small>Maximum 1 minute (60000ms)</small>
          </div>

          <div class="form-group">
            <label for="method">Method</label>
            <select id="method" formControlName="method">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <div class="error-message" *ngIf="serviceForm.get('httpConfig.method')?.touched && serviceForm.get('httpConfig.method')?.errors">
              <span *ngIf="serviceForm.get('httpConfig.method')?.errors?.['required']">Method is required</span>
            </div>
          </div>

          <div class="form-group">
            <label for="url">URL</label>
            <input 
              type="url" 
              id="url" 
              formControlName="url"
              placeholder="https://example.com/api">
            <div class="error-message" *ngIf="serviceForm.get('httpConfig.url')?.touched && serviceForm.get('httpConfig.url')?.errors">
              <span *ngIf="serviceForm.get('httpConfig.url')?.errors?.['required']">URL is required</span>
              <span *ngIf="serviceForm.get('httpConfig.url')?.errors?.['pattern']">Please enter a valid URL</span>
            </div>
          </div>

          <div class="form-group">
            <label for="headers">Headers</label>
            <textarea 
              id="headers" 
              formControlName="headers"
              placeholder='{"Content-Type": "application/json"}'></textarea>
            <div class="error-message" *ngIf="serviceForm.get('httpConfig.headers')?.touched && serviceForm.get('httpConfig.headers')?.errors">
              <span *ngIf="serviceForm.get('httpConfig.headers')?.errors?.['jsonFormat']">Please enter valid JSON format</span>
            </div>
            <small>Enter headers in JSON format</small>
          </div>

          <div class="form-group">
            <label for="body">Body</label>
            <textarea 
              id="body" 
              formControlName="body"
              placeholder='{"key": "value"}'></textarea>
            <div class="error-message" *ngIf="serviceForm.get('httpConfig.body')?.touched && serviceForm.get('httpConfig.body')?.errors">
              <span *ngIf="serviceForm.get('httpConfig.body')?.errors?.['jsonFormat']">Please enter valid JSON format</span>
            </div>
            <small>Enter request body in JSON format</small>
          </div>
        </div>

        <!-- Ping Configuration Fields -->
        <div class="ping-config config-section" *ngIf="serviceForm.get('monitorType')?.value === 'ping'" formGroupName="pingConfig">
          <h3>Ping Configuration</h3>
          
          <div class="form-group">
            <label for="ipv4">Host IPv4</label>
            <input 
              type="text" 
              id="ipv4" 
              formControlName="ipv4"
              placeholder="192.168.1.1">
            <div class="error-message" *ngIf="serviceForm.get('pingConfig.ipv4')?.touched && serviceForm.get('pingConfig.ipv4')?.errors">
              <span *ngIf="serviceForm.get('pingConfig.ipv4')?.errors?.['required']">IPv4 address is required</span>
              <span *ngIf="serviceForm.get('pingConfig.ipv4')?.errors?.['pattern']">Please enter a valid IPv4 address</span>
            </div>
            <small>Enter a valid IPv4 address</small>
          </div>

          <div class="form-group">
            <label for="ipv6">Host IPv6</label>
            <input 
              type="text" 
              id="ipv6" 
              formControlName="ipv6"
              placeholder="2001:0db8:85a3:0000:0000:8a2e:0370:7334">
            <div class="error-message" *ngIf="serviceForm.get('pingConfig.ipv6')?.touched && serviceForm.get('pingConfig.ipv6')?.errors">
              <span *ngIf="serviceForm.get('pingConfig.ipv6')?.errors?.['required']">IPv6 address is required</span>
              <span *ngIf="serviceForm.get('pingConfig.ipv6')?.errors?.['pattern']">Please enter a valid IPv6 address</span>
            </div>
            <small>Enter a valid IPv6 address</small>
          </div>
        </div>

        <div class="form-actions">
          <div class="validation-errors" *ngIf="!serviceForm.valid && (serviceForm.touched || serviceForm.dirty)">
            <div class="error-message" *ngFor="let error of getFormValidationErrors()">
              {{ error }}
            </div>
          </div>
          <button 
            type="button" 
            (click)="closeAddServiceDialog()"
            [disabled]="isLoading">
            Cancel
          </button>
          <button 
            type="submit" 
            (click)="addService()"
            [disabled]="!serviceForm.valid || isLoading"
            [title]="!serviceForm.valid ? 'Please fix the validation errors above' : ''">
            {{ isLoading ? 'Adding...' : 'Add Service' }}
          </button>
        </div>
      </form>
    </app-dialog>
  `,
  styles: [`
    .services-management {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    h1 {
      margin: 0;
      color: #1e293b;
      font-size: 1.875rem;
    }

    .subtitle {
      margin: 4px 0 0;
      color: #64748b;
    }

    .add-service-btn {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .add-service-btn:hover {
      background-color: #1d4ed8;
    }

    .services-grid {
      display: grid;
      gap: 24px;
    }

    .service-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }

    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .service-header h3 {
      margin: 0;
      color: #1e293b;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.875rem;
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

    .status-timeline {
      display: flex;
      flex-direction: column;
      gap: 4px;
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
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .status-segment:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .status-segment.operational {
      background-color: #22c55e;
    }

    .status-segment.degraded {
      background-color: #eab308;
    }

    .status-segment.outage {
      background-color: #ef4444;
    }

    .status-segment.maintenance {
      background-color: #0ea5e9;
    }

    .detailed-status {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .service-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .service-info h4 {
      margin: 0;
      color: #1e293b;
      font-size: 1.25rem;
    }

    .interval-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 4px;
      background: #f8fafc;
      border-radius: 8px;
      padding: 12px;
    }

    .interval-segment {
      position: relative;
      height: 40px;
      border-radius: 4px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 4px;
    }

    .interval-time {
      font-size: 0.75rem;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .interval-segment.operational {
      background-color: #22c55e;
    }

    .interval-segment.degraded {
      background-color: #eab308;
    }

    .interval-segment.outage {
      background-color: #ef4444;
    }

    .interval-segment.maintenance {
      background-color: #0ea5e9;
    }

    .status-legend {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #475569;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .legend-color.operational {
      background-color: #22c55e;
    }

    .legend-color.degraded {
      background-color: #eab308;
    }

    .legend-color.outage {
      background-color: #ef4444;
    }

    .legend-color.maintenance {
      background-color: #0ea5e9;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .refresh-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .refresh-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background-color: #f1f5f9;
      color: #64748b;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .refresh-btn:hover {
      background-color: #e2e8f0;
      color: #475569;
    }

    .refresh-btn.spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .refresh-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .auto-refresh-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .auto-refresh-toggle input {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .next-refresh {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .add-service-form {
      padding: 20px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #1e293b;
    }

    .close-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #1e293b;
    }

    .close-button:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }

    .close-button:active {
      transform: scale(0.95);
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-group textarea {
      min-height: 80px;
      resize: vertical;
    }

    .form-group small {
      display: block;
      color: #666;
      margin-top: 4px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }

    button.primary {
      background: #007bff;
      color: white;
    }

    button.secondary {
      background: #e9ecef;
      color: #333;
    }

    input:disabled {
      background: #f8f9fa;
      cursor: not-allowed;
    }

    .config-section {
      margin-top: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .config-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #333;
    }

    .http-config {
      background: #f8f9fa;
    }

    .ping-config {
      background: #f8f9fa;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }

    .error-message span {
      display: block;
      line-height: 1.4;
    }

    input.ng-invalid.ng-touched,
    select.ng-invalid.ng-touched,
    textarea.ng-invalid.ng-touched {
      border-color: #dc3545;
    }

    button[type="submit"]:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .validation-errors {
      margin-bottom: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
      background-color: #fff3f3;
      border: 1px solid #ffcdd2;
    }

    .error-message {
      color: #d32f2f;
      font-size: 0.875rem;
      margin: 0.25rem 0;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .form-actions button {
      margin: 0;
    }
  `],
})
export class ServicesManagementComponent implements OnInit, OnDestroy {
  showDetailedDialog = false;
  selectedService: ServiceStatus | null = null;
  selectedHour: number = 0;
  currentHour: number = new Date().getHours();
  
  autoRefreshEnabled = false;
  isRefreshing = false;
  nextRefreshTime = 180; // 3 minutes in seconds
  private refreshInterval?: number;
  private countdownInterval?: number;

  services: ServiceStatus[] = [
    {
      name: 'API Service',
      status: 'operational',
      hourlyStatus: this.generateHourlyStatus('operational'),
      detailedStatus: this.generateDetailedStatus()
    },
    {
      name: 'Web Dashboard',
      status: 'degraded',
      hourlyStatus: this.generateHourlyStatus('degraded'),
      detailedStatus: this.generateDetailedStatus()
    },
    {
      name: 'Database',
      status: 'operational',
      hourlyStatus: this.generateHourlyStatus('operational'),
      detailedStatus: this.generateDetailedStatus()
    }
  ];

  isAddServiceDialogOpen = false;
  isLoading = false;
  serviceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private serviceManagementService: ServiceManagementService
  ) {
    this.serviceForm = this.fb.group({
      tag: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      cronInterval: new FormControl({value: '*/5 * * * *', disabled: true}),
      defaultStatus: ['operational', Validators.required],
      categoryName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      monitorType: ['http', Validators.required],
      httpConfig: this.fb.group({
        timeout: [30000],
        method: ['GET'],
        url: [''],
        headers: [''],
        body: ['']
      }),
      pingConfig: this.fb.group({
        ipv4: [''],
        ipv6: ['']
      })
    });

    // Subscribe to monitor type changes to enable/disable validation
    this.serviceForm.get('monitorType')?.valueChanges.subscribe(type => {
      if (type === 'http') {
        this.addHttpValidation();
        (this.serviceForm.get('pingConfig') as FormGroup)?.disable();
        (this.serviceForm.get('httpConfig') as FormGroup)?.enable();
      } else {
        this.addPingValidation();
        (this.serviceForm.get('httpConfig') as FormGroup)?.disable();
        (this.serviceForm.get('pingConfig') as FormGroup)?.enable();
      }
    });

    // Set initial validation based on default monitor type
    if (this.serviceForm.get('monitorType')?.value === 'http') {
      this.addHttpValidation();
      (this.serviceForm.get('pingConfig') as FormGroup)?.disable();
    } else {
      this.addPingValidation();
      (this.serviceForm.get('httpConfig') as FormGroup)?.disable();
    }
  }

  ngOnInit() {
    // Initial data load
    this.refreshData();
    this.updateCurrentHour();
    
    // Set up auto-refresh if enabled
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    }
  }

  ngOnDestroy() {
    this.clearIntervals();
  }

  refreshData() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      this.services = [
        {
          name: 'API Service',
          status: 'operational',
          hourlyStatus: this.generateHourlyStatus('operational'),
          detailedStatus: this.generateDetailedStatus()
        },
        {
          name: 'Web Dashboard',
          status: 'degraded',
          hourlyStatus: this.generateHourlyStatus('degraded'),
          detailedStatus: this.generateDetailedStatus()
        },
        {
          name: 'Database',
          status: 'operational',
          hourlyStatus: this.generateHourlyStatus('operational'),
          detailedStatus: this.generateDetailedStatus()
        }
      ];
      
      this.isRefreshing = false;
      
      // Reset countdown if auto-refresh is enabled
      if (this.autoRefreshEnabled) {
        this.resetCountdown();
      }
    }, 1000); // Simulate 1s API delay
  }

  toggleAutoRefresh() {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.clearIntervals();
    }
  }

  private startAutoRefresh() {
    this.clearIntervals();
    
    // Start countdown
    this.nextRefreshTime = 180;
    this.countdownInterval = window.setInterval(() => {
      this.nextRefreshTime--;
      if (this.nextRefreshTime <= 0) {
        this.resetCountdown();
      }
    }, 1000);

    // Start refresh interval
    this.refreshInterval = window.setInterval(() => {
      this.refreshData();
    }, 180000); // 3 minutes
  }

  private resetCountdown() {
    this.nextRefreshTime = 180;
  }

  private clearIntervals() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  getTimeLabel(hour: number): string {
    const displayHour = (this.currentHour - (23 - hour) + 24) % 24;
    if (displayHour === 0) return '12 AM';
    if (displayHour === 12) return '12 PM';
    return displayHour > 12 
      ? `${displayHour - 12} PM` 
      : `${displayHour} AM`;
  }

  getShortTimeLabel(hour: number): string {
    const displayHour = (this.currentHour - (23 - hour) + 24) % 24;
    return displayHour.toString().padStart(2, '0');
  }

  getIntervalLabel(interval: number): string {
    const minutes = interval * 5;
    return `${minutes.toString().padStart(2, '0')}`;
  }

  showDetailedStatus(service: ServiceStatus, hour: number) {
    this.selectedService = service;
    this.selectedHour = hour;
    this.showDetailedDialog = true;
  }

  closeDetailedDialog() {
    this.showDetailedDialog = false;
    this.selectedService = null;
  }

  getDetailedIntervals(): Array<'operational' | 'degraded' | 'outage' | 'maintenance'> {
    if (!this.selectedService || this.selectedHour === undefined) return [];
    return this.selectedService.detailedStatus[this.selectedHour].intervals;
  }

  private generateHourlyStatus(baseStatus: 'operational' | 'degraded' | 'outage' | 'maintenance'): Array<'operational' | 'degraded' | 'outage' | 'maintenance'> {
    return Array.from({ length: 24 }, () => {
      const rand = Math.random();
      if (rand < 0.7) return baseStatus;
      if (rand < 0.8) return 'degraded';
      if (rand < 0.9) return 'outage';
      return 'maintenance';
    });
  }

  private generateDetailedStatus(): Array<{ hour: number; intervals: Array<'operational' | 'degraded' | 'outage' | 'maintenance'> }> {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      intervals: Array.from({ length: 12 }, () => {
        const rand = Math.random();
        if (rand < 0.7) return 'operational';
        if (rand < 0.8) return 'degraded';
        if (rand < 0.9) return 'outage';
        return 'maintenance';
      })
    }));
  }

  private updateCurrentHour() {
    this.currentHour = new Date().getHours();
  }

  openAddServiceDialog() {
    this.isAddServiceDialogOpen = true;
    this.serviceForm.reset({
      cronInterval: '*/5 * * * *',
      defaultStatus: 'operational',
      monitorType: 'http'
    }, { emitEvent: false });
    this.serviceForm.get('cronInterval')?.disable();
  }

  closeAddServiceDialog() {
    this.isAddServiceDialogOpen = false;
    this.serviceForm.reset({
      cronInterval: '*/5 * * * *',
      defaultStatus: 'operational',
      monitorType: 'http'
    }, { emitEvent: false });
    this.serviceForm.get('cronInterval')?.disable();
  }

  addService() {
    if (this.serviceForm.valid) {
      this.isLoading = true;
      const formValue = this.serviceForm.getRawValue(); // Use getRawValue to include disabled fields
      
      // Clean up the form data based on monitor type
      const serviceData: ServiceConfig = {
        tag: formValue.tag,
        name: formValue.name,
        description: formValue.description,
        cronInterval: formValue.cronInterval,
        defaultStatus: formValue.defaultStatus,
        categoryName: formValue.categoryName,
        monitorType: formValue.monitorType,
        ...(formValue.monitorType === 'http' ? {
          httpConfig: {
            timeout: Number(formValue.httpConfig.timeout || 30000),
            method: formValue.httpConfig.method || 'GET',
            url: formValue.httpConfig.url || '',
            headers: formValue.httpConfig.headers || '{}',
            body: formValue.httpConfig.body || '{}'
          }
        } : {
          pingConfig: {
            ipv4: formValue.pingConfig.ipv4 || '',
            ipv6: formValue.pingConfig.ipv6 || ''
          }
        })
      };

      this.serviceManagementService.addService(serviceData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Service added successfully:', response);
            this.closeAddServiceDialog();
            this.refreshData(); // Refresh the services list
          },
          error: (error) => {
            console.error('Error adding service:', error);
            // Here you might want to show an error message to the user
          }
        });
    } else {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.serviceForm.controls).forEach(key => {
        const control = this.serviceForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getFormValidationErrors(): string[] {
    const errors: string[] = [];
    const form = this.serviceForm;
    
    if (!form) return errors;

    // Check main form controls
    const formValue = form.getRawValue();
    Object.keys(formValue).forEach(key => {
      const control = form.get(key);
      if (control?.errors && control.touched) {
        if (key === 'tag') {
          if (control.errors['required']) errors.push('Tag is required');
          if (control.errors['minlength']) errors.push('Tag must be at least 2 characters');
          if (control.errors['maxlength']) errors.push('Tag must be at most 20 characters');
        }
        if (key === 'name') {
          if (control.errors['required']) errors.push('Service name is required');
          if (control.errors['minlength']) errors.push('Service name must be at least 3 characters');
          if (control.errors['maxlength']) errors.push('Service name must be at most 50 characters');
        }
        if (key === 'description') {
          if (control.errors['required']) errors.push('Description is required');
          if (control.errors['minlength']) errors.push('Description must be at least 10 characters');
          if (control.errors['maxlength']) errors.push('Description must be at most 500 characters');
        }
        if (key === 'categoryName') {
          if (control.errors['required']) errors.push('Category name is required');
          if (control.errors['minlength']) errors.push('Category name must be at least 2 characters');
          if (control.errors['maxlength']) errors.push('Category name must be at most 30 characters');
        }
      }
    });

    // Check HTTP config if it's enabled
    const httpConfig = this.serviceForm.get('httpConfig') as FormGroup;
    if (httpConfig && !httpConfig.disabled && httpConfig.errors) {
      if (httpConfig.errors['timeout']) errors.push('Timeout is required for HTTP monitor');
      if (httpConfig.errors['timeoutRange']) errors.push('Timeout must be between 1 and 60000ms');
      if (httpConfig.errors['method']) errors.push('HTTP method is required');
      if (httpConfig.errors['url']) errors.push('URL must be a valid HTTP/HTTPS URL');
      if (httpConfig.errors['jsonFormat']) errors.push('Headers and body must be valid JSON format');
    }

    // Check Ping config if it's enabled
    const pingConfig = this.serviceForm.get('pingConfig') as FormGroup;
    if (pingConfig && !pingConfig.disabled && pingConfig.errors) {
      if (pingConfig.errors['ipv4']) errors.push('Invalid IPv4 address format');
      if (pingConfig.errors['ipv6']) errors.push('Invalid IPv6 address format');
    }

    return errors;
  }

  private addHttpValidation() {
    const httpConfig = this.serviceForm.get('httpConfig') as FormGroup;
    if (httpConfig) {
      httpConfig.addValidators([
        (group: AbstractControl): ValidationErrors | null => {
          const timeout = group.get('timeout');
          const method = group.get('method');
          const url = group.get('url');
          const headers = group.get('headers');
          const body = group.get('body');

          if (!timeout?.value) return { timeout: true };
          if (timeout.value < 1 || timeout.value > 60000) return { timeoutRange: true };
          if (!method?.value) return { method: true };
          if (!url?.value || !/^https?:\/\/.*/.test(url.value)) return { url: true };
          
          try {
            if (headers?.value) JSON.parse(headers.value);
            if (body?.value) JSON.parse(body.value);
          } catch {
            return { jsonFormat: true };
          }

          return null;
        }
      ]);
    }
  }

  private addPingValidation() {
    const pingConfig = this.serviceForm.get('pingConfig') as FormGroup;
    if (pingConfig) {
      pingConfig.addValidators([
        (group: AbstractControl): ValidationErrors | null => {
          const ipv4 = group.get('ipv4');
          const ipv6 = group.get('ipv6');

          const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

          if (!ipv4?.value || !ipv4Pattern.test(ipv4.value)) return { ipv4: true };
          if (!ipv6?.value || !ipv6Pattern.test(ipv6.value)) return { ipv6: true };

          return null;
        }
      ]);
    }
  }
}
