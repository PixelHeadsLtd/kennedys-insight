import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../table/table.component';
import { TableColumn } from '../../../table/table.types';
import { RegionDataService } from '../../../services/region-data.service';

type SearchMode = 'matter' | 'office-type' | 'office-pick';

type FilterType = 'text' | 'select';
interface FilterDef {
  key: keyof RateRowFilters;
  label: string;
  type: FilterType;
  options?: string[]; // fallback list; dynamic list will override
}

type RateRow = {
  matter: string;
  billable: string;
  timeKeeper: string;
  maxWorkDate: string;
  office: string;
  country: string;
  section: string;
  title: string;
  rateClass: string;
  currency: string;
  wipRate: number;
  stdCurr: string;
  stdRate: number;
};

type RateRowFilters = Partial<{
  matter: string;
  billable: string;
  timeKeeper: string;
  maxWorkDate: string;
  office: string;
  country: string;
  section: string;
  title: string;
  rateClass: string;
  currency: string;
  wipRate: string;
  stdCurr: string;
  stdRate: string;
}>;

@Component({
  standalone: true,
  selector: 'app-country-rate-card-checker-tab',
  imports: [CommonModule, TableComponent],
  templateUrl: './rate-card-checker-tab.component.html',
})
export class CountryRateCardCheckerTabComponent {
  elementColor: string | null = null;

  // ===== SEARCH STATE =====
  searchMode: SearchMode = 'matter';

  // ===== FILTER TABS =====
  filterDefs: FilterDef[] = [
    { key: 'matter',    label: 'Matter',       type: 'text' },
    { key: 'billable',  label: 'Billable',     type: 'select', options: ['Yes','No'] },
    { key: 'timeKeeper',label: 'Time Keeper',  type: 'text' },
    { key: 'office',    label: 'Office',       type: 'select', options: ['Chelmsford','Manchester','London'] },
    { key: 'country',   label: 'Country',      type: 'select', options: ['UK','United States','Mexico','Chile'] },
    { key: 'section',   label: 'Section',      type: 'text' },
    { key: 'title',     label: 'Title',        type: 'select', options: ['Partner','Solicitor'] },
    { key: 'rateClass', label: 'Rate Class',   type: 'text' },
    { key: 'currency',  label: 'Currency',     type: 'select', options: ['GBP','USD','EUR'] }, // fallback
    { key: 'wipRate',   label: 'Wip Rate',     type: 'text' },
    { key: 'stdCurr',   label: 'Std Curr',     type: 'select', options: ['GBP','USD','EUR'] }, // fallback
    { key: 'stdRate',   label: 'Std Rate',     type: 'text' },
  ];
  activeFilter: FilterDef['key'] | null = null;
  filterValues: Record<string, string> = {};

  get activeFilterDef() {
    return this.activeFilter ? this.filterDefs.find(f => f.key === this.activeFilter) : undefined;
  }

  // ===== DATA =====
  private allRows: RateRow[] = [
    {
      matter: 'Matter: 1000027 - [A10712] - ARGO - TPA INSTRUCTION - PERSONAL INJURY (HOURLY)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '25-Sep-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 175,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1000106 - [S1525] - SOMPO INTERNATIONAL INSURANCE - UK (REGIONAL) - GENERAL CASUALTY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '29-Aug-2022',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Employers Liability and Public Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 175,
      stdCurr: 'GBP',
      stdRate: 301.99,
    },
    {
      matter: 'Matter: 1000135 - [R1573] - RIVERSTONE INSURANCE (UK) – SEDGWICK – INJURY 130/120/85/79/59',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '07-Aug-2022',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 120,
      stdCurr: 'GBP',
      stdRate: 381.99,
    },
    {
      matter: 'Matter: 1000520 - [A09506] - AVIVA - PUBLIC LIABILITY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '05-Oct-2021',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 160,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1000414 - [S1525] - SOMPO INTERNATIONAL INSURANCE - UK (REGIONAL) - GENERAL CASUALTY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '25-Sep-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 175,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1000728 - [G4597] - GALLAGHER BASSETT - LONDON BOROUGH OF HACKNEY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '27-Aug-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 150,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1000743 - [A10714] - ARGO - TPA INSTRUCTION - PERSONAL INJURY (FIXED FEE)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '27-Aug-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 1,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001161 - [N251] - NEW INDIA ASSUR CO LTD - ACC & INJ',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '07-Oct-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 150,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001532 - [D4597] - DIRECT COMMERCIAL LIMITED - SMALL CLAIMS NON-INJURY (FIXED FEE/BUREAU)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '15-Oct-2021',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 1,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001596 - [S1918] - SOMPO INTERNATIONAL INSURANCE - UK - GENERAL CASUALTY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '15-Jun-2021',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 175,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001547 - [N2713] - AXIS CAPITAL - CASUALTY/INTERNATIONAL/PROPERTY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '03-Aug-2022',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Employers Liability and Public Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 185,
      stdCurr: 'GBP',
      stdRate: 381.99,
    },
    {
      matter: 'Matter: 1001668 - TRADEX INSURANCE COMPANY LIMITED (OLD CONTRACT)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '03-Aug-2004',
      office: 'Chelmsford',
      country: 'UK',
      section: 'TEAM 13',
      title: 'Solicitor',
      rateClass: 'ZZZ - DO NOT USE/Trainee £55',
      currency: 'GBP',
      wipRate: 55,
      stdCurr: 'GBP',
      stdRate: 55,
    },
    {
      matter: 'Matter: 1001684 - [C272] - CHINA TAIPING INSURANCE (UK) CO LTD (HOURLY)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '28-Jun-2022',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 150,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001851 - [S1918] - ENERVED LTD',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '27-Jan-2021',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 187,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001848 - [A10714] - ARGO - TPA INSTRUCTION - PERSONAL INJURY (FIXED FEE)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '24-Feb-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 0,
      stdCurr: 'GBP',
      stdRate: 381.99,
    },
    {
      matter: 'Matter: 1000414 - [S1525] - SOMPO INTERNATIONAL INSURANCE - UK (REGIONAL) - GENERAL CASUALTY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '25-Sep-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 175,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1000728 - [G4597] - GALLAGHER BASSETT - LONDON BOROUGH OF HACKNEY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '27-Aug-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 150,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1000743 - [A10714] - ARGO - TPA INSTRUCTION - PERSONAL INJURY (FIXED FEE)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '27-Aug-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 1,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001161 - [N251] - NEW INDIA ASSUR CO LTD - ACC & INJ',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '07-Oct-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 150,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001532 - [D4597] - DIRECT COMMERCIAL LIMITED - SMALL CLAIMS NON-INJURY (FIXED FEE/BUREAU)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '15-Oct-2021',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 1,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001596 - [S1918] - SOMPO INTERNATIONAL INSURANCE - UK - GENERAL CASUALTY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '15-Jun-2021',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 175,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001547 - [N2713] - AXIS CAPITAL - CASUALTY/INTERNATIONAL/PROPERTY',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '03-Aug-2022',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Employers Liability and Public Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 185,
      stdCurr: 'GBP',
      stdRate: 381.99,
    },
    {
      matter: 'Matter: 1001668 - TRADEX INSURANCE COMPANY LIMITED (OLD CONTRACT)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '03-Aug-2004',
      office: 'Chelmsford',
      country: 'UK',
      section: 'TEAM 13',
      title: 'Solicitor',
      rateClass: 'ZZZ - DO NOT USE/Trainee £55',
      currency: 'GBP',
      wipRate: 55,
      stdCurr: 'GBP',
      stdRate: 55,
    },
    {
      matter: 'Matter: 1001684 - [C272] - CHINA TAIPING INSURANCE (UK) CO LTD (HOURLY)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '28-Jun-2022',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 150,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001851 - [S1918] - ENERVED LTD',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '27-Jan-2021',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 187,
      stdCurr: 'GBP',
      stdRate: 144.99,
    },
    {
      matter: 'Matter: 1001848 - [A10714] - ARGO - TPA INSTRUCTION - PERSONAL INJURY (FIXED FEE)',
      billable: 'No',
      timeKeeper: 'JOY MIDDLETON - JKC',
      maxWorkDate: '24-Feb-2020',
      office: 'Chelmsford',
      country: 'UK',
      section: 'Chelmsford Liability',
      title: 'Partner',
      rateClass: 'LLAPTR - PARTNER',
      currency: 'GBP',
      wipRate: 0,
      stdCurr: 'GBP',
      stdRate: 381.99,
    },
  ];

  /** immutable snapshot */
  private originalRows: RateRow[] = this.allRows.map(r => ({ ...r }));

  /** last search result (pre-chip) */
  private lastSearchRows: RateRow[] = [...this.originalRows];

  /** bound to table */
  tableRows: RateRow[] = [...this.originalRows];

  constructor(private regionDataService: RegionDataService) {}

  // ===== COLUMNS =====
  clientColumns: TableColumn<any>[] = [
    {
      key: 'matter',
      header: 'Matter',
      accessor: r => {
        const s = (r?.['matter'] ?? '').toString();
        const m = s.match(/(\d{4,})/);
        return m ? +m[1] : s.toLowerCase();
      },
      compare: (a, b) => {
        const an = typeof a === 'number' && !Number.isNaN(a) ? a : NaN;
        const bn = typeof b === 'number' && !Number.isNaN(b) ? b : NaN;
        if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
        return String(a ?? '').localeCompare(String(b ?? ''));
      }
    },
    { key: 'billable', header: 'Billable' },
    { key: 'timeKeeper', header: 'Time Keeper' },
    { key: 'maxWorkDate', header: 'Max Work Date' },
    { key: 'office', header: 'Office' },
    { key: 'country', header: 'Country' },
    { key: 'section', header: 'Section' },
    { key: 'title', header: 'Title' },
    { key: 'rateClass', header: 'Rate Class' },
    { key: 'currency', header: 'Currency', sortable: false },
    {
      key: 'wipRate',
      header: 'Wip Rate',
      accessor: r => +r?.['wipRate'],
      compare: (a, b) =>
        (isNaN(a) && isNaN(b)) ? 0 : (isNaN(a) ? 1 : isNaN(b) ? -1 : a - b)
    },
    { key: 'stdCurr', header: 'Std Curr', sortable: false },
    {
      key: 'stdRate',
      header: 'Std Rate',
      accessor: r => +r?.['stdRate'],
      compare: (a, b) =>
        (isNaN(a) && isNaN(b)) ? 0 : (isNaN(a) ? 1 : isNaN(b) ? -1 : a - b)
    },
  ];

  // ===== SEARCH =====
  onModeChange(evt: Event) {
    const select = evt.target as HTMLSelectElement | null;
    this.searchMode = (select?.value as SearchMode) ?? 'matter';
  }

  onSubmit(evt: Event) {
    evt.preventDefault();
    const form = evt.target as HTMLFormElement;
    const raw = Object.fromEntries(new FormData(form).entries());
    const val = (k: string) => (raw[k]?.toString()?.trim() ?? '');
    const ci  = (s: string) => s.toLowerCase();

    let rows: RateRow[] = this.originalRows;

    if (this.searchMode === 'matter') {
      const q = ci(val('matterNo'));
      if (q) rows = rows.filter(r => ci(r.matter).includes(q));
    }

    if (this.searchMode === 'office-type') {
      const country = ci(val('country'));
      const office  = ci(val('office'));
      const tk      = ci(val('timekeeper'));
      const partner = ci(val('clientPartner'));
      rows = rows.filter(r =>
        (!country || ci(r.country) === country) &&
        (!office  || ci(r.office)  === office)  &&
        (!tk      || ci(r.timeKeeper).includes(tk)) &&
        (!partner || ci((r as any).clientPartner ?? '').includes(partner))
      );
    }

    if (this.searchMode === 'office-pick') {
      const country = ci(val('country_alt'));
      const office  = ci(val('office_alt'));
      const tk      = ci(val('timekeeper_alt'));
      const partner = ci(val('clientPartner_alt'));
      rows = rows.filter(r =>
        (!country || ci(r.country) === country) &&
        (!office  || ci(r.office)  === office)  &&
        (!tk      || ci(r.timeKeeper).includes(tk)) &&
        (!partner || ci((r as any).clientPartner ?? '').includes(partner))
      );
    }

    this.lastSearchRows = rows.slice();
    this.setTableRowsSafe(this.applyColumnFilters(this.lastSearchRows));
  }

  onReset() {
    this.filterValues = {};
    this.activeFilter = null;
    this.lastSearchRows = this.originalRows.slice();
    this.setTableRowsSafe(this.originalRows);
  }

  // ===== CHIP UI =====
  setActiveFilter(key: FilterDef['key']) {
    this.activeFilter = key;
  }

  onFilterInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input || !this.activeFilter) return;
    this.updateFilter(this.activeFilter, input.value ?? '');
  }

  onFilterSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    if (!select || !this.activeFilter) return;
    this.updateFilter(this.activeFilter, select.value ?? '');
  }

  updateFilter(key: string, value: string) {
    this.filterValues = { ...this.filterValues, [key]: value };
    const filtered = this.applyColumnFilters(this.lastSearchRows);
    this.setTableRowsSafe(filtered);
  }

  clearOne(key: string) {
    if (!(key in this.filterValues)) return;
    const { [key]: _, ...rest } = this.filterValues;
    this.filterValues = rest;
    this.setTableRowsSafe(this.applyColumnFilters(this.lastSearchRows));
  }

  clearAllFilters() {
    this.filterValues = {};
    this.activeFilter = null;
    this.setTableRowsSafe(this.lastSearchRows);
  }

  hasAnyFilter(): boolean {
    return Object.values(this.filterValues).some(v => !!(v && v.trim()));
  }

  // ===== OPTIONS (dynamic) =====
  /** Build distinct options for a field from the current lastSearchRows. Falls back to static list. */
  getOptionsFor(key: keyof RateRowFilters): string[] {
    const def = this.filterDefs.find(f => f.key === key);
    const fromRows = this.distinctFromRows(key);
    if (fromRows.length) return fromRows;
    return def?.options ?? [];
  }

  private distinctFromRows(key: keyof RateRowFilters): string[] {
    const set = new Set<string>();
    for (const r of this.lastSearchRows) {
      const v = (r as any)[key];
      if (v != null && String(v).trim() !== '') {
        set.add(String(v));
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  // ===== FILTERING CORE =====
  private applyColumnFilters(input: RateRow[]): RateRow[] {
    if (!Array.isArray(input)) return [];
    const base = input.slice(); // fresh copy

    const activeKeys = Object.keys(this.filterValues).filter(
      k => (this.filterValues[k] ?? '').trim() !== ''
    );
    if (activeKeys.length === 0) return base;

    const ci = (s: string) => s.toLowerCase();

    const out = base.filter(row =>
      activeKeys.every(k => {
        const v  = this.filterValues[k];
        const rv = (row as any)[k];
        if (rv == null) return false;
        return ci(String(rv)).includes(ci(String(v)));
      })
    );

    return out.slice(); // always fresh instance
  }

  /** Build a single dummy row so the table always has at least one renderable row */
  private buildEmptyRow(): RateRow {
    const blank: any = {};
    // Preserve all keys so the table layout stays intact
    for (const col of this.clientColumns) {
      blank[col.key as keyof RateRow] = '';
    }
    // Put a friendly message in the first column
    blank[this.clientColumns[0].key as keyof RateRow] = '— no matches —';
    return blank as RateRow;
  }

  /** Ensure the table never receives an empty array (some table impls break on []) */
  private ensureRenderable(rows: RateRow[]): RateRow[] {
    if (Array.isArray(rows) && rows.length > 0) return rows.slice();
    return [this.buildEmptyRow()];
  }

  /** Hand rows to the table on the next microtask, always as a renderable array */
  private setTableRowsSafe(rows: RateRow[]) {
    const safe = this.ensureRenderable(rows);
    Promise.resolve().then(() => (this.tableRows = safe));
  }

}
