import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../table/table.component';
import { TableColumn } from '../../../table/table.types';
import { RegionDataService } from '../../../services/region-data.service';

@Component({
  standalone: true,
  selector: 'app-country-people-tab',
  imports: [CommonModule, TableComponent],
  templateUrl: './people-tab.component.html',
})
export class CountryPeopleTabComponent {
      constructor(private regionDataService: RegionDataService) {}
  
      // === Clients table ===
    // Columns are typed with accessors/sorts. I’m sorting “revenue” numerically after stripping symbols.
    // If your API can return a numeric revenue field alongside the formatted label, I’ll bind that instead.
    peopleColumns: TableColumn<any>[] = [
    { key: 'people', header: 'People' },
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
      { people: 120, office: 'London',    matters: 9,  client: 'AXA',              revenue: '$21M', partner: 'Sarah Jones' },
      { people: 85,  office: 'New York',  matters: 5,  client: 'Allianz',          revenue: '$15M', partner: 'John Doe' },
      { people: 60,  office: 'Zurich',    matters: 7,  client: 'Zurich',           revenue: '$12M', partner: 'Jane Smith' },
      { people: 70,  office: 'New York',  matters: 6,  client: 'MetLife',          revenue: '$18M', partner: 'Michael Brown' },
      { people: 95,  office: 'London',    matters: 12, client: 'Prudential',       revenue: '$25M', partner: 'Emily Davis' },
      { people: 40,  office: 'Milan',     matters: 4,  client: 'Generali',         revenue: '$10M', partner: 'Chris Wilson' },
      { people: 55,  office: 'London',    matters: 8,  client: 'Aviva',            revenue: '$13M', partner: 'Sophia Lee' },
      { people: 65,  office: 'Chicago',   matters: 10, client: 'Chubb',            revenue: '$19M', partner: 'Daniel Taylor' },
      { people: 45,  office: 'Boston',    matters: 5,  client: 'Liberty Mutual',   revenue: '$14M', partner: 'Olivia Martinez' },
      { people: 90,  office: 'New York',  matters: 11, client: 'AIG',              revenue: '$22M', partner: 'James Anderson' },
      { people: 30,  office: 'London',    matters: 7,  client: 'Hiscox',           revenue: '$9M',  partner: 'Rachel Green' },
      { people: 50,  office: 'Chicago',   matters: 6,  client: 'CNA',              revenue: '$11M', partner: 'Mark Thompson' },
      { people: 100, office: 'Munich',    matters: 13, client: 'Munich Re',        revenue: '$28M', partner: 'Laura White' },
      { people: 75,  office: 'Zurich',    matters: 9,  client: 'Swiss Re',         revenue: '$20M', partner: 'David Clark' },
      { people: 80,  office: 'Tokyo',     matters: 8,  client: 'Tokio Marine',     revenue: '$17M', partner: 'Hannah Scott' },
      { people: 35,  office: 'Sydney',    matters: 4,  client: 'QBE',              revenue: '$8M',  partner: 'Anthony Lewis' },
      { people: 60,  office: 'London',    matters: 10, client: 'RSA Insurance',    revenue: '$16M', partner: 'Grace Evans' },
      { people: 55,  office: 'Madrid',    matters: 12, client: 'MAPFRE',           revenue: '$23M', partner: 'Ethan Wright' },
      { people: 50,  office: 'Hartford',  matters: 5,  client: 'Travelers',        revenue: '$14M', partner: 'Natalie Young' },
      { people: 110, office: 'London',    matters: 9,  client: 'Lloyd’s of London', revenue: '$21M', partner: 'Benjamin Harris' }
    ];
}
