import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'active' | 'invited';
  tags?: string[];
}

export interface InviteTeamMemberRequest {
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamManagementService {
  private apiUrl = environment.apiUrl+"/team"; // Use the API URL from environment.ts

  constructor(private http: HttpClient) {}

  // Get all team members
  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/members`);
  }

  // Invite a new team member
  inviteMember(request: InviteTeamMemberRequest): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}/members/invite`, request);
  }

  // Resend invitation to a team member
  resendInvite(memberId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/members/${memberId}/resend-invite`, {});
  }

  // Remove a team member
  removeMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/members/${memberId}`);
  }

  // Get available roles
  getAvailableRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/roles`);
  }

  // Update member role
  updateMemberRole(memberId: string, role: string): Observable<TeamMember> {
    return this.http.patch<TeamMember>(`${this.apiUrl}/members/${memberId}/role`, { role });
  }

  // Get member profile
  getMemberProfile(memberId: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.apiUrl}/members/${memberId}`);
  }

  // Update member profile
  updateMemberProfile(memberId: string, updates: Partial<TeamMember>): Observable<TeamMember> {
    return this.http.patch<TeamMember>(`${this.apiUrl}/members/${memberId}`, updates);
  }
}
