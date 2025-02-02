import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-backdrop" *ngIf="isOpen" (click)="onBackdropClick()">
      <div class="dialog-container" [class.open]="isOpen" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ title }}</h2>
          <button class="close-button" (click)="onClose()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="dialog-content">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      margin: 20px;
      opacity: 0;
      transform: scale(0.95);
      animation: slideIn 0.3s ease-out forwards;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid #eef2f6;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .close-button {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 8px;
      color: #64748b;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      background-color: #f1f5f9;
      color: #334155;
    }

    .dialog-content {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(90vh - 150px);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Custom scrollbar for webkit browsers */
    .dialog-content::-webkit-scrollbar {
      width: 8px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class DialogComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closeDialog = new EventEmitter<void>();

  onClose() {
    this.closeDialog.emit();
  }

  onBackdropClick() {
    this.closeDialog.emit();
  }
}