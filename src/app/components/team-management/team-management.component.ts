import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from '../shared/dialog/dialog.component';

interface TeamMember {
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'active' | 'invited';
  tags?: string[];
}

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  template: `
    <div class="team-container">
      <h1>Team Management</h1>
      <div class="content-card">
        <div class="team-controls">
          <button class="invite-member-btn" (click)="openInviteDialog()">Invite Team Member</button>
        </div>
        <div class="team-list">
          <div class="team-member" *ngFor="let member of teamMembers">
            <div class="member-avatar" [class.invited]="member.status === 'invited'" [class.ai]="member.tags?.includes('ai')">
              {{ getInitials(member.name || member.email) }}
            </div>
            <div class="member-info">
              <div class="member-header">
                <h3>{{ member.name || member.email }}</h3>
                <span class="status-badge" *ngIf="member.status === 'invited'">Invited</span>
                <span class="tag-badge ai" *ngIf="member.tags?.includes('ai')">AI Assistant</span>
                <span class="tag-badge me" *ngIf="member.tags?.includes('me')">Me</span>
              </div>
              <p>{{ member.role }}</p>
            </div>
            <div class="member-actions">
              <button class="action-btn" *ngIf="member.status === 'invited'" (click)="resendInvite(member)">Resend</button>
              <button 
                class="action-btn remove" 
                *ngIf="!member.tags?.includes('me')"
                (click)="removeMember(member)">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-dialog 
      [isOpen]="showInviteDialog"
      [title]="'Invite Team Member'"
      (closeDialog)="closeInviteDialog()">
      <div class="invite-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            [(ngModel)]="inviteEmail"
            placeholder="Enter email address"
            class="form-input">
        </div>
        <div class="form-group">
          <label for="role">Role</label>
          <select 
            id="role" 
            [(ngModel)]="selectedRole"
            class="form-input">
            <option value="">Select a role</option>
            <option *ngFor="let role of availableRoles" [value]="role">
              {{ role | titlecase }}
            </option>
          </select>
        </div>
        <div class="form-actions">
          <button 
            class="cancel-btn" 
            (click)="closeInviteDialog()">
            Cancel
          </button>
          <button 
            class="invite-btn" 
            [disabled]="!inviteEmail || !selectedRole"
            (click)="sendInvite()">
            Send Invite
          </button>
        </div>
      </div>
    </app-dialog>
  `,
  styles: [`
    .team-container {
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

    .team-controls {
      margin-bottom: 20px;
    }

    .invite-member-btn {
      background-color: #2c3e50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .invite-member-btn:hover {
      background-color: #34495e;
    }

    .team-member {
      display: flex;
      align-items: center;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .member-avatar {
      width: 40px;
      height: 40px;
      background-color: #2c3e50;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 15px;
    }

    .member-avatar.invited {
      background-color: #95a5a6;
    }

    .member-avatar.ai {
      background: linear-gradient(135deg, #3498db, #2980b9);
    }

    .member-info {
      flex: 1;
    }

    .member-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .member-info h3 {
      margin: 0;
      color: #2c3e50;
    }

    .member-info p {
      margin: 5px 0 0;
      color: #666;
    }

    .status-badge {
      background-color: #f1c40f;
      color: #34495e;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .tag-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .tag-badge.ai {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
    }

    .tag-badge.me {
      background-color: #2ecc71;
      color: white;
    }

    .member-actions {
      display: flex;
      gap: 10px;
    }

    .action-btn {
      padding: 6px 12px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #f5f5f5;
    }

    .action-btn.remove {
      color: #e74c3c;
      border-color: #e74c3c;
    }

    .action-btn.remove:hover {
      background-color: #fdf2f2;
    }

    /* Invite Dialog Styles */
    .invite-form {
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
      font-weight: 500;
      color: #2c3e50;
    }

    .form-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      border-color: #2c3e50;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 10px;
    }

    .cancel-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cancel-btn:hover {
      background: #f5f5f5;
    }

    .invite-btn {
      padding: 8px 16px;
      background-color: #2c3e50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .invite-btn:hover:not(:disabled) {
      background-color: #34495e;
    }

    .invite-btn:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
  `]
})
export class TeamManagementComponent {
  showInviteDialog = false;
  inviteEmail = '';
  selectedRole = '';
  availableRoles = ['admin', 'reporter', 'service-manager'];

  teamMembers: TeamMember[] = [
    { 
      name: 'John Doe', 
      email: 'john@example.com', 
      role: 'Admin', 
      avatar: 'JD', 
      status: 'active',
      tags: ['me']
    },
    { 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      role: 'Service Manager', 
      avatar: 'JS', 
      status: 'active' 
    }
  ];

  openInviteDialog() {
    this.showInviteDialog = true;
    this.inviteEmail = '';
    this.selectedRole = '';
  }

  closeInviteDialog() {
    this.showInviteDialog = false;
  }

  sendInvite() {
    // Create new team member with invited status
    const newMember: TeamMember = {
      name: '',
      email: this.inviteEmail,
      role: this.selectedRole,
      avatar: this.getInitials(this.inviteEmail),
      status: 'invited'
    };

    // Add to team members list
    this.teamMembers = [...this.teamMembers, newMember];

    // Close the dialog
    this.closeInviteDialog();
  }

  removeMember(member: TeamMember) {
    if (confirm(`Are you sure you want to remove ${member.name || member.email} from the team?`)) {
      this.teamMembers = this.teamMembers.filter(m => m !== member);
    }
  }

  resendInvite(member: TeamMember) {
    // TODO: Implement resend invite functionality
    console.log(`Resending invite to ${member.email}`);
  }

  getInitials(text: string): string {
    if (!text) return '';
    
    // For email addresses, use first two characters
    if (text.includes('@')) {
      return text.substring(0, 2).toUpperCase();
    }
    
    // For names, use first letter of each word
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
