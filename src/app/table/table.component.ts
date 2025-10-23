import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from './table.types';

type SortDir = 'asc' | 'desc';

@Component({
  standalone: true,
  selector: 'app-table',
  imports: [CommonModule],
  templateUrl: './table.component.html',
})
export class TableComponent<T = any> {
  @Input() rows: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() elementColor: string | null = null;
  @Input() maxHeight: number = 0;
  @Input() marginTop: number = 0;

  openRowIndex: number | null = null;
  toggleOpen(idx: number) { this.openRowIndex = this.openRowIndex === idx ? null : idx; }
  isOpen(idx: number) { return this.openRowIndex === idx; }

  // sorting
  sortKey: string | null = null;
  sortDir: SortDir | null = null;

  get tableRows(): T[] {
    if (!this.sortKey || !this.sortDir) return this.rows;
    const col = this.columns.find(c => c.key === this.sortKey);
    if (!col) return this.rows;

    const acc = col.accessor ?? ((r: any) => r?.[col.key]);
    const cmp = col.compare ?? this.defaultCompare;

    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...this.rows]
      .map((r, i) => ({ r, i }))
      .sort((A, B) => {
        const a = acc(A.r, A.i);
        const b = acc(B.r, B.i);
        const v = cmp(a, b, A.r, B.r);
        return v !== 0 ? dir * v : A.i - B.i;
      })
      .map(x => x.r);
  }

  sortBy(key: string) {
    if (this.sortKey !== key) { this.sortKey = key; this.sortDir = 'asc'; }
    else if (this.sortDir === 'asc') this.sortDir = 'desc';
    else { this.sortKey = null; this.sortDir = null; }
  }

  sortIcon(key: string): string {
    if (this.sortKey !== key || !this.sortDir) return 'unfold_more';
    return this.sortDir === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  valueOf(row: T, col: TableColumn<T>, idx: number) {
    try { return (col.accessor ?? ((r: any) => r?.[col.key]))(row, idx) ?? ''; }
    catch { return ''; }
  }

  private defaultCompare(a: any, b: any): number {
    // numeric
    const na = typeof a === 'number' || (a !== '' && !isNaN(+a)) ? +a : NaN;
    const nb = typeof b === 'number' || (b !== '' && !isNaN(+b)) ? +b : NaN;
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    // date-ish
    const da = Date.parse(a); const db = Date.parse(b);
    if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;
    // string
    return String(a ?? '').localeCompare(String(b ?? ''));
  }
}
