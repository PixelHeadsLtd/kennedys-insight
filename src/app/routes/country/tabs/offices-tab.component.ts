import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../table/table.component';
import { TableColumn } from '../../../table/table.types';
import { RegionDataService } from '../../../services/region-data.service';

@Component({
  standalone: true,
  selector: 'app-country-offices-tab',
  imports: [CommonModule, TableComponent],
  templateUrl: './offices-tab.component.html',
})
export class CountryOfficesTabComponent {
    constructor(private regionDataService: RegionDataService) {}
  
      // === Clients table ===
    // Columns are typed with accessors/sorts. I’m sorting “revenue” numerically after stripping symbols.
    // If your API can return a numeric revenue field alongside the formatted label, I’ll bind that instead.
    officeColumns: TableColumn<any>[] = [
    { key: 'office', header: 'Office' },
    { key: 'matters', header: 'Matters' },
    { key: 'client',  header: 'Client' },
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
      { office: 'London',    matters: 9,  client: 'AXA',             revenue: '$21M', partner: 'Sarah Jones' },
      { office: 'New York',  matters: 5,  client: 'Allianz',         revenue: '$15M', partner: 'John Doe' },
      { office: 'Zurich',    matters: 7,  client: 'Zurich',          revenue: '$12M', partner: 'Jane Smith' },
      { office: 'New York',  matters: 6,  client: 'MetLife',         revenue: '$18M', partner: 'Michael Brown' },
      { office: 'London',    matters: 12, client: 'Prudential',      revenue: '$25M', partner: 'Emily Davis' },
      { office: 'Milan',     matters: 4,  client: 'Generali',        revenue: '$10M', partner: 'Chris Wilson' },
      { office: 'London',    matters: 8,  client: 'Aviva',           revenue: '$13M', partner: 'Sophia Lee' },
      { office: 'Chicago',   matters: 10, client: 'Chubb',           revenue: '$19M', partner: 'Daniel Taylor' },
      { office: 'Boston',    matters: 5,  client: 'Liberty Mutual',  revenue: '$14M', partner: 'Olivia Martinez' },
      { office: 'New York',  matters: 11, client: 'AIG',             revenue: '$22M', partner: 'James Anderson' },
      { office: 'London',    matters: 7,  client: 'Hiscox',          revenue: '$9M',  partner: 'Rachel Green' },
      { office: 'Chicago',   matters: 6,  client: 'CNA',             revenue: '$11M', partner: 'Mark Thompson' },
      { office: 'Munich',    matters: 13, client: 'Munich Re',       revenue: '$28M', partner: 'Laura White' },
      { office: 'Zurich',    matters: 9,  client: 'Swiss Re',        revenue: '$20M', partner: 'David Clark' },
      { office: 'Tokyo',     matters: 8,  client: 'Tokio Marine',    revenue: '$17M', partner: 'Hannah Scott' },
      { office: 'Sydney',    matters: 4,  client: 'QBE',             revenue: '$8M',  partner: 'Anthony Lewis' },
      { office: 'London',    matters: 10, client: 'RSA Insurance',   revenue: '$16M', partner: 'Grace Evans' },
      { office: 'Madrid',    matters: 12, client: 'MAPFRE',          revenue: '$23M', partner: 'Ethan Wright' },
      { office: 'Hartford',  matters: 5,  client: 'Travelers',       revenue: '$14M', partner: 'Natalie Young' },
      { office: 'London',    matters: 9,  client: 'Lloyd’s of London', revenue: '$21M', partner: 'Benjamin Harris' }
    ];
}
