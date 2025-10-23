import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { VersionService } from '../services/version.service';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';

@Component({
  selector: 'app-last-updated',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, DatePipe],
  template: `
    <ng-container *ngIf="vs.info$ | async as info">
        <span class="last-updated" *ngIf="info?.buildTime as bt" [attr.title]="bt | date:'medium'">
            Last updated {{ bt | timeAgo }}
            <small> (v{{info.version}} · {{info.commit}})</small>
        </span>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LastUpdatedComponent implements OnInit {
  constructor(public vs: VersionService) {}
  ngOnInit() { this.vs.startPolling(); }
}
