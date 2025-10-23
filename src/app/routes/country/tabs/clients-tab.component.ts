import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../table/table.component';
import { TableColumn } from '../../../table/table.types';
import { RegionDataService } from '../../../services/region-data.service';

@Component({
  standalone: true,
  selector: 'app-country-clients-tab',
  imports: [CommonModule, TableComponent],
  templateUrl: './clients-tab.component.html',
})
export class CountryClientsTabComponent {

  constructor(private regionDataService: RegionDataService) {}

    // === Clients table ===
  // Columns are typed with accessors/sorts. I’m sorting “revenue” numerically after stripping symbols.
  // If your API can return a numeric revenue field alongside the formatted label, I’ll bind that instead.
  clientColumns: TableColumn<any>[] = [
    { key: 'client',  header: 'Client' },
    { key: 'matters', header: 'Matters' },
    { 
      key: 'revenue', 
      header: 'Revenue',
      accessor: r => {
        const raw = (r?.['revenue'] ?? '').toString().replace(/[^0-9.]/g,'');
        return raw === '' ? NaN : +raw;
      },
      compare: (a, b) => 
        (isNaN(a) && isNaN(b)) ? 0 
        : (isNaN(a) ? 1 : isNaN(b) ? -1 : a - b)
    },
    { key: 'partner', header: 'Client Partner' },
  ];


  // Just demo rows — replace with your client list for this country (and city if provided).
  // I’m not opinionated on the shape; I’ll adapt the mapping once you define it.
  tableRows = [
    { client: 'AXA',             matters: 9,  revenue: '$21M', partner: 'Sarah Jones' },
    { client: 'Allianz',         matters: 5,  revenue: '$15M', partner: 'John Doe' },
    { client: 'Zurich',          matters: 7,  revenue: '$12M', partner: 'Jane Smith' },
    { client: 'MetLife',         matters: 6,  revenue: '$18M', partner: 'Michael Brown' },
    { client: 'Prudential',      matters: 12, revenue: '$25M', partner: 'Emily Davis' },
    { client: 'Generali',        matters: 4,  revenue: '$10M', partner: 'Chris Wilson' },
    { client: 'Aviva',           matters: 8,  revenue: '$13M', partner: 'Sophia Lee' },
    { client: 'Chubb',           matters: 10, revenue: '$19M', partner: 'Daniel Taylor' },
    { client: 'Liberty Mutual',  matters: 5,  revenue: '$14M', partner: 'Olivia Martinez' },
    { client: 'AIG',             matters: 11, revenue: '$22M', partner: 'James Anderson' },
    { client: 'Hiscox',          matters: 7,  revenue: '$9M',  partner: 'Rachel Green' },
    { client: 'CNA',             matters: 6,  revenue: '$11M', partner: 'Mark Thompson' },
    { client: 'Munich Re',       matters: 13, revenue: '$28M', partner: 'Laura White' },
    { client: 'Swiss Re',        matters: 9,  revenue: '$20M', partner: 'David Clark' },
    { client: 'Tokio Marine',    matters: 8,  revenue: '$17M', partner: 'Hannah Scott' },
    { client: 'QBE',             matters: 4,  revenue: '$8M',  partner: 'Anthony Lewis' },
    { client: 'RSA Insurance',   matters: 10, revenue: '$16M', partner: 'Grace Evans' },
    { client: 'MAPFRE',          matters: 12, revenue: '$23M', partner: 'Ethan Wright' },
    { client: 'Travelers',       matters: 5,  revenue: '$14M', partner: 'Natalie Young' },
    { client: 'Lloyd’s of London', matters: 9, revenue: '$21M', partner: 'Benjamin Harris' }
  ];
}
