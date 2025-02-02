import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from '../shared/dialog/dialog.component';

interface Incident {
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

@Component({
  selector: 'app-incident-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  template: `
    <div class="incident-management">
      <header class="page-header">
        <div>
          <h1>Incident Management</h1>
          <p class="subtitle">Track and manage service incidents</p>
        </div>
        <div class="header-actions">
          <button class="create-btn" (click)="openCreateDialog()">Create Incident</button>
          <button class="maintenance-btn" (click)="openMaintenanceDialog()">Schedule Maintenance</button>
        </div>
      </header>

      <div class="incidents-list">
        <div class="incident-card" *ngFor="let incident of incidents">
          <div class="incident-header">
            <div class="incident-title">
              <h3>{{ incident.title }}</h3>
              <div class="badges">
                <span class="badge service">{{ incident.service }}</span>
                <span class="badge severity" [class]="incident.severity">
                  {{ incident.severity | titlecase }}
                </span>
                <span class="badge status" [class]="incident.status">
                  {{ incident.status | titlecase }}
                </span>
              </div>
            </div>
            <div class="incident-actions">
              <button 
                class="action-btn update-btn" 
                (click)="openUpdateStatusDialog(incident)"
                *ngIf="incident.severity !== 'maintenance'">
                Update Status
              </button>
              <button 
                class="action-btn start-btn" 
                (click)="openUpdateStatusDialog(incident)"
                *ngIf="incident.severity === 'maintenance' && incident.status === 'scheduled'">
                Start Maintenance
              </button>
              <button 
                class="action-btn complete-btn" 
                (click)="openUpdateStatusDialog(incident)"
                *ngIf="incident.severity === 'maintenance' && incident.status === 'in-progress'">
                Complete Maintenance
              </button>
              <button 
                class="action-btn edit-btn" 
                (click)="openEditDialog(incident)">
                Edit
              </button>
              <button 
                class="action-btn delete-btn" 
                (click)="openDeleteDialog(incident)">
                Delete
              </button>
            </div>
          </div>
          <p class="description">{{ incident.description }}</p>
          <div class="incident-footer">
            <span class="timestamp">Created: {{ incident.createdAt | date:'medium' }}</span>
            <span class="timestamp">Updated: {{ incident.updatedAt | date:'medium' }}</span>
            <span *ngIf="incident.scheduledStart" class="timestamp">Scheduled Start: {{ incident.scheduledStart | date:'medium' }}</span>
            <span *ngIf="incident.scheduledEnd" class="timestamp">Scheduled End: {{ incident.scheduledEnd | date:'medium' }}</span>
          </div>
        </div>
      </div>
    </div>

    <app-dialog
      [isOpen]="showCreateDialog"
      [title]="'Create New Incident'"
      (closeDialog)="closeCreateDialog()">
      <div class="create-incident-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            type="text"
            id="title"
            [(ngModel)]="newIncident.title"
            class="form-input"
            placeholder="Brief description of the incident">
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            [(ngModel)]="newIncident.description"
            class="form-input"
            rows="3"
            placeholder="Detailed description of the incident"></textarea>
        </div>

        <div class="form-group">
          <label for="service">Affected Service</label>
          <select
            id="service"
            [(ngModel)]="newIncident.service"
            class="form-input">
            <option value="">Select a service</option>
            <option *ngFor="let service of services" [value]="service">
              {{ service }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="severity">Severity</label>
          <select
            id="severity"
            [(ngModel)]="newIncident.severity"
            class="form-input">
            <option value="">Select severity</option>
            <option value="degraded-performance">Degraded Performance</option>
            <option value="partial-outage">Partial Outage</option>
            <option value="major-outage">Major Outage</option>
          </select>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" (click)="closeCreateDialog()">Cancel</button>
          <button
            class="create-btn"
            [disabled]="!isValidIncident()"
            (click)="createIncident()">
            Create Incident
          </button>
        </div>
      </div>
    </app-dialog>

    <app-dialog
      [isOpen]="showUpdateStatusDialog"
      [title]="getUpdateStatusTitle()"
      (closeDialog)="closeUpdateStatusDialog()">
      <div class="update-status-form">
        <div class="form-group" *ngIf="selectedIncident?.severity !== 'maintenance'">
          <label for="newStatus">New Status</label>
          <select
            id="newStatus"
            [(ngModel)]="newStatus"
            class="form-input">
            <option value="">Select a status</option>
            <option value="investigating">Investigating</option>
            <option value="identified">Identified</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" (click)="closeUpdateStatusDialog()">Cancel</button>
          <button
            class="update-btn"
            [disabled]="!isValidStatusUpdate()"
            (click)="updateIncidentStatus()">
            {{ getUpdateStatusButtonText() }}
          </button>
        </div>
      </div>
    </app-dialog>

    <app-dialog
      [isOpen]="showEditDialog"
      [title]="'Edit ' + (selectedIncident?.severity === 'maintenance' ? 'Maintenance' : 'Incident')"
      (closeDialog)="closeEditDialog()">
      <div class="edit-form">
        <div class="form-group">
          <label for="editTitle">Title</label>
          <input
            type="text"
            id="editTitle"
            [(ngModel)]="editData.title"
            class="form-input">
        </div>

        <div class="form-group">
          <label for="editDescription">Description</label>
          <textarea
            id="editDescription"
            [(ngModel)]="editData.description"
            class="form-input"
            rows="3"></textarea>
        </div>

        <div class="form-group">
          <label for="editService">Service</label>
          <select
            id="editService"
            [(ngModel)]="editData.service"
            class="form-input">
            <option value="">Select a service</option>
            <option *ngFor="let service of services" [value]="service">
              {{ service }}
            </option>
          </select>
        </div>

        <div class="form-group" *ngIf="selectedIncident?.severity !== 'maintenance'">
          <label for="editSeverity">Severity</label>
          <select
            id="editSeverity"
            [(ngModel)]="editData.severity"
            class="form-input">
            <option value="">Select severity</option>
            <option value="degraded-performance">Degraded Performance</option>
            <option value="partial-outage">Partial Outage</option>
            <option value="major-outage">Major Outage</option>
          </select>
        </div>

        <ng-container *ngIf="selectedIncident?.severity === 'maintenance'">
          <div class="form-row">
            <div class="form-group">
              <label for="editStartDate">Start Date</label>
              <input
                type="date"
                id="editStartDate"
                [(ngModel)]="editData.startDate"
                class="form-input"
                [min]="minDate">
            </div>

            <div class="form-group">
              <label for="editStartTime">Start Time</label>
              <input
                type="time"
                id="editStartTime"
                [(ngModel)]="editData.startTime"
                class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editEndDate">End Date</label>
              <input
                type="date"
                id="editEndDate"
                [(ngModel)]="editData.endDate"
                class="form-input"
                [min]="editData.startDate || minDate">
            </div>

            <div class="form-group">
              <label for="editEndTime">End Time</label>
              <input
                type="time"
                id="editEndTime"
                [(ngModel)]="editData.endTime"
                class="form-input">
            </div>
          </div>

          <div class="form-group">
            <label for="editNotify">
              <input
                type="checkbox"
                id="editNotify"
                [(ngModel)]="editData.notify"
                class="form-checkbox">
              Send notification to affected users
            </label>
          </div>
        </ng-container>

        <div class="form-actions">
          <button class="cancel-btn" (click)="closeEditDialog()">Cancel</button>
          <button
            class="update-btn"
            [disabled]="!isValidEdit()"
            (click)="updateIncident()">
            Update
          </button>
        </div>
      </div>
    </app-dialog>

    <app-dialog
      [isOpen]="showDeleteDialog"
      [title]="'Delete Incident'"
      (closeDialog)="closeDeleteDialog()">
      <div class="delete-confirmation" *ngIf="selectedIncident">
        <div class="warning-message">
          <i class="warning-icon">⚠️</i>
          <p>Are you sure you want to delete this incident?</p>
        </div>
        
        <div class="incident-summary">
          <h4>{{ selectedIncident.title }}</h4>
          <div class="badges">
            <span class="badge service">{{ selectedIncident.service }}</span>
            <span class="badge severity" [class]="selectedIncident.severity">
              {{ selectedIncident.severity }}
            </span>
          </div>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" (click)="closeDeleteDialog()">Cancel</button>
          <button
            class="delete-btn"
            (click)="deleteIncident()">
            Delete Incident
          </button>
        </div>
      </div>
    </app-dialog>

    <app-dialog
      [isOpen]="showMaintenanceDialog"
      [title]="'Schedule Maintenance'"
      (closeDialog)="closeMaintenanceDialog()">
      <div class="maintenance-form">
        <div class="form-group">
          <label for="maintenanceTitle">Title</label>
          <input
            type="text"
            id="maintenanceTitle"
            [(ngModel)]="maintenanceData.title"
            class="form-input"
            placeholder="Brief description of the maintenance">
        </div>

        <div class="form-group">
          <label for="maintenanceDescription">Description</label>
          <textarea
            id="maintenanceDescription"
            [(ngModel)]="maintenanceData.description"
            class="form-input"
            rows="3"
            placeholder="Detailed description of the maintenance work"></textarea>
        </div>

        <div class="form-group">
          <label for="maintenanceService">Affected Service</label>
          <select
            id="maintenanceService"
            [(ngModel)]="maintenanceData.service"
            class="form-input">
            <option value="">Select a service</option>
            <option *ngFor="let service of services" [value]="service">
              {{ service }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              [(ngModel)]="maintenanceData.startDate"
              class="form-input"
              [min]="minDate">
          </div>

          <div class="form-group">
            <label for="startTime">Start Time</label>
            <input
              type="time"
              id="startTime"
              [(ngModel)]="maintenanceData.startTime"
              class="form-input">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              [(ngModel)]="maintenanceData.endDate"
              class="form-input"
              [min]="maintenanceData.startDate || minDate">
          </div>

          <div class="form-group">
            <label for="endTime">End Time</label>
            <input
              type="time"
              id="endTime"
              [(ngModel)]="maintenanceData.endTime"
              class="form-input">
          </div>
        </div>

        <div class="form-group">
          <label for="maintenanceNotify">
            <input
              type="checkbox"
              id="maintenanceNotify"
              [(ngModel)]="maintenanceData.notify"
              class="form-checkbox">
            Send notification to affected users
          </label>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" (click)="closeMaintenanceDialog()">Cancel</button>
          <button
            class="create-btn"
            [disabled]="!isValidMaintenance()"
            (click)="scheduleMaintenance()">
            Schedule Maintenance
          </button>
        </div>
      </div>
    </app-dialog>
  `,
  styles: [`
    .incident-management {
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

    .header-actions {
      display: flex;
      gap: 16px;
    }

    .create-btn {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .create-btn:hover {
      background-color: #1d4ed8;
    }

    .maintenance-btn {
      background-color: #6366f1;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .maintenance-btn:hover {
      background-color: #4f46e5;
    }

    .incidents-list {
      display: grid;
      gap: 24px;
    }

    .incident-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }

    .incident-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .incident-title h3 {
      margin: 0 0 8px;
      color: #1e293b;
      font-size: 1.25rem;
    }

    .badges {
      display: flex;
      gap: 8px;
    }

    .badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge.service {
      background-color: #e0f2fe;
      color: #075985;
    }

    .badge.severity.degraded-performance {
      background-color: #fef9c3;
      color: #854d0e;
    }

    .badge.severity.partial-outage {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .badge.severity.major-outage {
      background-color: #7f1d1d;
      color: white;
    }

    .badge.severity.maintenance {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge.status.investigating {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .badge.status.identified {
      background-color: #fef9c3;
      color: #854d0e;
    }

    .badge.status.monitoring {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge.status.resolved {
      background-color: #f1f5f9;
      color: #475569;
    }

    .badge.status.scheduled {
      background-color: #f1f5f9;
      color: #475569;
    }

    .description {
      color: #475569;
      margin: 0 0 16px;
    }

    .incident-footer {
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 0.875rem;
    }

    .incident-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
    }

    .action-btn:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #334155;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: #e2e8f0;
    }

    .action-btn.edit-btn {
      background-color: #6366f1;
      color: white;
      border: none;
    }

    .action-btn.edit-btn:hover:not(:disabled) {
      background-color: #4f46e5;
    }

    .action-btn.delete-btn {
      background-color: #ef4444;
      color: white;
      border: none;
    }

    .action-btn.delete-btn:hover:not(:disabled) {
      background-color: #dc2626;
    }

    .action-btn.update-btn {
      background-color: #2563eb;
      color: white;
      border: none;
    }

    .action-btn.update-btn:hover:not(:disabled) {
      background-color: #1d4ed8;
    }

    .action-btn.start-btn {
      background-color: #6366f1;
      color: white;
    }

    .action-btn.start-btn:hover {
      background-color: #4f46e5;
    }

    .action-btn.complete-btn {
      background-color: #10b981;
      color: white;
    }

    .action-btn.complete-btn:hover {
      background-color: #059669;
    }

    .create-incident-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      color: #1e293b;
      font-weight: 500;
    }

    .form-input {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #1e293b;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 1px #2563eb;
    }

    textarea.form-input {
      resize: vertical;
      min-height: 80px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    .cancel-btn {
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      color: #64748b;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cancel-btn:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #334155;
    }

    .update-btn {
      padding: 8px 16px;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .update-btn:hover:not(:disabled) {
      background-color: #1d4ed8;
    }

    .update-btn:disabled {
      background-color: #94a3b8;
      cursor: not-allowed;
    }

    .current-status {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .current-status h4 {
      margin: 0;
      color: #1e293b;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .update-status-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .delete-confirmation {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .warning-message {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #991b1b;
    }

    .warning-icon {
      font-size: 24px;
    }

    .incident-summary {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: 6px;
      padding: 16px;
    }

    .incident-summary h4 {
      margin: 0 0 8px;
      color: #1e293b;
    }

    .delete-warning {
      margin: 12px 0 0;
      color: #991b1b;
      font-size: 0.875rem;
      font-style: italic;
    }

    .delete-btn {
      padding: 8px 16px;
      background-color: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .delete-btn:hover {
      background-color: #dc2626;
    }

    .maintenance-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-checkbox {
      margin-right: 8px;
    }

    input[type="date"],
    input[type="time"] {
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
    }
  `]
})
export class IncidentManagementComponent {
  showCreateDialog = false;
  showUpdateStatusDialog = false;
  showEditDialog = false;
  showDeleteDialog = false;
  showMaintenanceDialog = false;
  services = ['API Service', 'Web Dashboard', 'Database', 'Authentication'];
  selectedIncident: Incident | null = null;
  newStatus: 'investigating' | 'identified' | 'monitoring' | '' = '';
  statusNote: string = '';
  editedIncident: Partial<Incident> = {};
  
  newIncident: Partial<Incident> = {
    title: '',
    description: '',
    service: '',
    severity: undefined,
    status: 'investigating'
  };

  minDate = new Date().toISOString().split('T')[0];
  
  maintenanceData = {
    title: '',
    description: '',
    service: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    notify: false
  };

  editData = {
    title: '',
    description: '',
    service: '',
    severity: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    notify: false
  };

  incidents: Incident[] = [
    {
      id: '1',
      title: 'API Performance Degradation',
      description: 'Users are experiencing increased latency in API responses.',
      service: 'API Service',
      severity: 'degraded-performance',
      status: 'investigating',
      createdAt: new Date('2025-02-01T10:30:00'),
      updatedAt: new Date('2025-02-01T11:15:00')
    },
    {
      id: '2',
      title: 'Database Scheduled Maintenance',
      description: 'Scheduled database optimization and index rebuilding. Service interruption expected.',
      service: 'Database',
      severity: 'maintenance',
      status: 'scheduled',
      createdAt: new Date('2025-02-01T09:00:00'),
      updatedAt: new Date('2025-02-01T09:00:00'),
      scheduledStart: new Date('2025-02-03T02:00:00'),
      scheduledEnd: new Date('2025-02-03T06:00:00'),
      notify: true
    },
    {
      id: '3',
      title: 'Authentication System Update',
      description: 'Deploying security patches and system updates to the authentication service.',
      service: 'Authentication',
      severity: 'maintenance',
      status: 'scheduled',
      createdAt: new Date('2025-02-01T14:00:00'),
      updatedAt: new Date('2025-02-01T14:00:00'),
      scheduledStart: new Date('2025-02-02T23:00:00'),
      scheduledEnd: new Date('2025-02-03T01:00:00'),
      notify: true
    },
    {
      id: '4',
      title: 'Dashboard UI Deployment',
      description: 'Rolling out new UI features and performance improvements.',
      service: 'Web Dashboard',
      severity: 'maintenance',
      status: 'scheduled',
      createdAt: new Date('2025-02-01T16:30:00'),
      updatedAt: new Date('2025-02-01T16:30:00'),
      scheduledStart: new Date('2025-02-04T04:00:00'),
      scheduledEnd: new Date('2025-02-04T05:00:00'),
      notify: false
    }
  ];

  openCreateDialog() {
    this.showCreateDialog = true;
    this.resetNewIncident();
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
    this.resetNewIncident();
  }

  resetNewIncident() {
    this.newIncident = {
      title: '',
      description: '',
      service: '',
      severity: undefined,
      status: 'investigating'
    };
  }

  isValidIncident(): boolean {
    return !!(
      this.newIncident.title &&
      this.newIncident.description &&
      this.newIncident.service &&
      this.newIncident.severity
    );
  }

  createIncident() {
    if (!this.isValidIncident()) return;

    const incident: Incident = {
      id: Date.now().toString(),
      title: this.newIncident.title!,
      description: this.newIncident.description!,
      service: this.newIncident.service!,
      severity: this.newIncident.severity!,
      status: 'investigating',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.incidents = [incident, ...this.incidents];
    this.closeCreateDialog();
  }

  openUpdateStatusDialog(incident: Incident) {
    this.selectedIncident = incident;
    this.newStatus = '';
    this.statusNote = '';
    this.showUpdateStatusDialog = true;
  }

  closeUpdateStatusDialog() {
    this.showUpdateStatusDialog = false;
    this.selectedIncident = null;
    this.newStatus = '';
    this.statusNote = '';
  }

  getUpdateStatusTitle(): string {
    if (!this.selectedIncident) return 'Update Status';
    
    if (this.selectedIncident.severity === 'maintenance') {
      return this.selectedIncident.status === 'scheduled' 
        ? 'Start Maintenance' 
        : 'Complete Maintenance';
    }
    
    return 'Update Status';
  }

  getUpdateStatusButtonText(): string {
    if (!this.selectedIncident) return 'Update';
    
    if (this.selectedIncident.severity === 'maintenance') {
      return this.selectedIncident.status === 'scheduled' 
        ? 'Start Maintenance' 
        : 'Complete Maintenance';
    }
    
    return 'Update Status';
  }

  isValidStatusUpdate(): boolean {
    if (!this.selectedIncident) return false;

    if (this.selectedIncident.severity === 'maintenance') {
      return true; // Always valid for maintenance status transitions
    }

    return !!this.newStatus;
  }

  updateIncidentStatus() {
    if (!this.selectedIncident || !this.isValidStatusUpdate()) return;

    const updatedIncidents = this.incidents.map(incident => {
      if (incident.id === this.selectedIncident?.id) {
        if (incident.severity === 'maintenance') {
          const newStatus = incident.status === 'scheduled' ? 'in-progress' : 'completed';
          return {
            ...incident,
            status: newStatus as 'scheduled' | 'in-progress' | 'completed',
            updatedAt: new Date()
          };
        }

        return {
          ...incident,
          status: this.newStatus as 'investigating' | 'identified' | 'monitoring' | 'resolved',
          updatedAt: new Date()
        };
      }
      return incident;
    });

    this.incidents = updatedIncidents;
    this.closeUpdateStatusDialog();
  }

  openEditDialog(incident: Incident) {
    this.selectedIncident = incident;
    this.editData = {
      title: incident.title,
      description: incident.description,
      service: incident.service,
      severity: incident.severity,
      startDate: incident.scheduledStart?.toISOString().split('T')[0] || '',
      startTime: incident.scheduledStart?.toISOString().split('T')[1].substring(0, 5) || '',
      endDate: incident.scheduledEnd?.toISOString().split('T')[0] || '',
      endTime: incident.scheduledEnd?.toISOString().split('T')[1].substring(0, 5) || '',
      notify: incident.notify || false
    };
    this.showEditDialog = true;
  }

  closeEditDialog() {
    this.showEditDialog = false;
    this.selectedIncident = null;
    this.editData = {
      title: '',
      description: '',
      service: '',
      severity: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      notify: false
    };
  }

  isValidEdit(): boolean {
    const { title, description, service } = this.editData;
    
    if (!title?.trim() || !description?.trim() || !service) {
      return false;
    }

    if (this.selectedIncident?.severity === 'maintenance') {
      const { startDate, startTime, endDate, endTime } = this.editData;
      
      if (!startDate || !startTime || !endDate || !endTime) {
        return false;
      }

      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const now = new Date();

      return (this.selectedIncident.status === 'scheduled' ? start > now : true) && end > start;
    }

    return true;
  }

  updateIncident() {
    if (!this.selectedIncident || !this.isValidEdit()) return;

    const updatedIncidents = this.incidents.map(incident => {
      if (incident.id === this.selectedIncident?.id) {
        if (incident.severity === 'maintenance') {
          return {
            ...incident,
            title: this.editData.title,
            description: this.editData.description,
            service: this.editData.service,
            scheduledStart: new Date(`${this.editData.startDate}T${this.editData.startTime}`),
            scheduledEnd: new Date(`${this.editData.endDate}T${this.editData.endTime}`),
            notify: this.editData.notify,
            updatedAt: new Date()
          };
        }

        return {
          ...incident,
          title: this.editData.title,
          description: this.editData.description,
          service: this.editData.service,
          severity: this.editData.severity as 'degraded-performance' | 'partial-outage' | 'major-outage',
          updatedAt: new Date()
        };
      }
      return incident;
    });

    this.incidents = updatedIncidents;
    this.closeEditDialog();
  }

  openDeleteDialog(incident: Incident) {
    this.selectedIncident = incident;
    this.showDeleteDialog = true;
  }

  closeDeleteDialog() {
    this.showDeleteDialog = false;
    this.selectedIncident = null;
  }

  deleteIncident() {
    if (!this.selectedIncident) return;

    this.incidents = this.incidents.filter(
      incident => incident.id !== this.selectedIncident!.id
    );
    
    this.closeDeleteDialog();
  }

  resolveIncident(incident: Incident) {
    const index = this.incidents.findIndex(inc => inc.id === incident.id);
    if (index !== -1) {
      this.incidents = [
        ...this.incidents.slice(0, index),
        {
          ...incident,
          status: 'resolved',
          updatedAt: new Date()
        },
        ...this.incidents.slice(index + 1)
      ];
    }
  }

  openMaintenanceDialog() {
    this.resetMaintenanceForm();
    this.showMaintenanceDialog = true;
  }

  closeMaintenanceDialog() {
    this.showMaintenanceDialog = false;
    this.resetMaintenanceForm();
  }

  resetMaintenanceForm() {
    this.maintenanceData = {
      title: '',
      description: '',
      service: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      notify: false
    };
  }

  isValidMaintenance(): boolean {
    const { title, description, service, startDate, startTime, endDate, endTime } = this.maintenanceData;
    
    if (!title?.trim() || !description?.trim() || !service || !startDate || !startTime || !endDate || !endTime) {
      return false;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const now = new Date();

    return start > now && end > start;
  }

  scheduleMaintenance() {
    if (!this.isValidMaintenance()) return;

    const { title, description, service, startDate, startTime, endDate, endTime, notify } = this.maintenanceData;
    
    const maintenance: Incident = {
      id: Date.now().toString(),
      title,
      description,
      service,
      severity: 'maintenance',
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledStart: new Date(`${startDate}T${startTime}`),
      scheduledEnd: new Date(`${endDate}T${endTime}`),
      notify
    };

    this.incidents = [...this.incidents, maintenance];
    this.closeMaintenanceDialog();
  }
}
