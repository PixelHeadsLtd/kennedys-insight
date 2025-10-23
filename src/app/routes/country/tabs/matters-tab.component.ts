import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../table/table.component';
import { TableColumn } from '../../../table/table.types';
import { RegionDataService } from '../../../services/region-data.service';

@Component({
  standalone: true,
  selector: 'app-country-matters-tab',
  imports: [CommonModule, TableComponent],
  templateUrl: './matters-tab.component.html',
})
export class CountryMattersTabComponent {

  constructor(private regionDataService: RegionDataService) {}

    // === Clients table ===
  // Columns are typed with accessors/sorts. I’m sorting “revenue” numerically after stripping symbols.
  // If your API can return a numeric revenue field alongside the formatted label, I’ll bind that instead.
  matterColumns: TableColumn<any>[] = [
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
    { matters: 9, client: 'AXA', revenue: '$21M', partner: 'Sarah Jones' },
    { matters: 5, client: 'Allianz', revenue: '$15M', partner: 'John Doe' },
    { matters: 7, client: 'Zurich', revenue: '$12M', partner: 'Jane Smith' },
    { matters: 6, client: 'MetLife', revenue: '$18M', partner: 'Michael Brown' },
    { matters: 12, client: 'Prudential', revenue: '$25M', partner: 'Emily Davis' },
    { matters: 4, client: 'Generali', revenue: '$10M', partner: 'Chris Wilson' },
    { matters: 8, client: 'Aviva', revenue: '$13M', partner: 'Sophia Lee' },
    { matters: 10, client: 'Chubb', revenue: '$19M', partner: 'Daniel Taylor' },
    { matters: 5, client: 'Liberty Mutual', revenue: '$14M', partner: 'Olivia Martinez' },
    { matters: 11, client: 'AIG', revenue: '$22M', partner: 'James Anderson' },
    { matters: 7, client: 'Hiscox', revenue: '$9M', partner: 'Rachel Green' },
    { matters: 6, client: 'CNA', revenue: '$11M', partner: 'Mark Thompson' },
    { matters: 13, client: 'Munich Re', revenue: '$28M', partner: 'Laura White' },
    { matters: 9, client: 'Swiss Re', revenue: '$20M', partner: 'David Clark' },
    { matters: 8, client: 'Tokio Marine', revenue: '$17M', partner: 'Hannah Scott' },
    { matters: 4, client: 'QBE', revenue: '$8M', partner: 'Anthony Lewis' },
    { matters: 10, client: 'RSA Insurance', revenue: '$16M', partner: 'Grace Evans' },
    { matters: 12, client: 'MAPFRE', revenue: '$23M', partner: 'Ethan Wright' },
    { matters: 5, client: 'Travelers', revenue: '$14M', partner: 'Natalie Young' },
    { matters: 9, client: 'Lloyd`s of London', revenue: '$21M', partner: 'Benjamin Harris' }
  ];

}
