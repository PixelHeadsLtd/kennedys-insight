import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './tabs.component.html',
})
export class Tabs {
  tabs = [
    { path: 'overview', label: 'Overview', icon: 'visibility' },
    { path: 'matters', label: 'Matters', icon: 'gavel' },
    { path: 'offices', label: 'Offices', icon: 'business' },
    { path: 'people', label: 'People', icon: 'groups' },
    { path: 'clients', label: 'Clients', icon: 'contact_phone' },
    { path: 'rate-card-checker', label: 'Rate Card Checker', icon: 'multiline_chart' },
    // { path: 'data-explorer', label: 'Data Explorer', icon: 'multiline_chart' }
  ];
}
