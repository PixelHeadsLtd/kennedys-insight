import {
  Component,
  OnInit,
  NgZone,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { RegionDataService } from "../../../services/region-data.service";
import { normalize, denormalize } from "../../../utils/slugify";
import { LastUpdatedComponent } from "../../../shared/last-updated.component";
import { Observable } from "rxjs";
import { ChartsModule } from "@progress/kendo-angular-charts";
import { TableComponent } from '../../../table/table.component';
import { TableColumn } from '../../../table/table.types';

type MatterRow = {
  Cy?: string;
  Ct?: string;
  country?: string;
  R?: string;
  MC?: number;
  [k: string]: any;
};

type DonutPoint = {
  name: string;
  valueRaw: number;
  valueVis: number;
  color?: string;
  elementColor?: string; 
  isHomeRegion?: boolean;
};

@Component({
  standalone: true,
  selector: "app-overview-clients-tab",
  imports: [CommonModule, LastUpdatedComponent, ChartsModule, TableComponent],
  templateUrl: "./overview-tab.component.html",
})
export class CountryOverviewTabComponent implements OnInit, AfterViewInit, OnDestroy {
  // Krish: these three are derived from the URL and RegionDataService (static).
  city: string | null = null;
  region: string | null = null;
  countryName: string | null = null;
  elementColor: string | null = null;

  // Placeholder stream for any “last updated / summary bits”.
  // Currently bound to route params just to keep the template reactive.
  // Feel free to replace with your own observable once you have an endpoint.
  items$?: Observable<unknown>;

  // Donut chart data (key regions contributing to matters/clients/revenue etc.)
  // I’m computing this locally right now; see fetchMatterData() below for where you’d feed real data.
  donutData: DonutPoint[] = [];
  donutTotal = 0;
  donutHoleSize = 82;

  @ViewChild('donutWrap', { static: true }) donutWrap?: ElementRef<HTMLElement>;
  private ro?: ResizeObserver;

  private readonly MIN_SHARE = 0.03;
  private readonly VIS_BASE = 100;

  constructor(
    private route: ActivatedRoute,
    private regionDataService: RegionDataService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.updateHoleSizeFromCSS();
    if ('ResizeObserver' in window && this.donutWrap?.nativeElement) {
      this.ro = new ResizeObserver(() => this.updateHoleSizeFromCSS());
      this.ro.observe(this.donutWrap.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  @HostListener('window:resize')
  onWinResize() {
    this.updateHoleSizeFromCSS();
  }

  private updateHoleSizeFromCSS(): void {
    const cssVal = getComputedStyle(document.documentElement)
      .getPropertyValue('--donut-hole-ratio')
      .trim();
    const ratio = parseFloat(cssVal);

    if (!Number.isFinite(ratio) || !this.donutWrap) return;

    const el = this.donutWrap.nativeElement;
    const box = Math.max(0, Math.min(el.clientWidth || 0, el.clientHeight || 0));
    const px = Math.round(box * ratio);
    const clamped = Math.max(24, Math.min(px, box - 12));

    this.ngZone.run(() => {
      if (this.donutHoleSize !== clamped) {
        this.donutHoleSize = clamped;
        this.cdr.markForCheck();
      }
    });
  }

  // === Clients table ===
  // Columns are typed with accessors/sorts. I’m sorting “revenue” numerically after stripping symbols.
  // If your API can return a numeric revenue field alongside the formatted label, I’ll bind that instead.
  clientColumns: TableColumn<any>[] = [
    { key: 'client',  header: 'Client' },
    { key: 'revenue', header: 'Revenue',
      accessor: r => {
        const raw = (r?.['revenue'] ?? '').toString().replace(/[^0-9.]/g,'');
        return raw === '' ? NaN : +raw;
      },
      compare: (a, b) => (isNaN(a) && isNaN(b)) ? 0 : (isNaN(a) ? 1 : isNaN(b) ? -1 : a - b)
    },
    { key: 'matters', header: 'Matters' },
    { key: 'partner', header: 'Client Partner' },
  ];

  focusRegion: string | null = null;
  trackRegion = (_: number, d: DonutPoint) => d.name;

  // Just demo rows — replace with your client list for this country (and city if provided).
  // I’m not opinionated on the shape; I’ll adapt the mapping once you define it.
  tableRows = [
    { client: 'AXA', revenue: '$21M', matters: 9, partner: 'Sarah Jones' },
    { client: 'Allianz', revenue: '$15M', matters: 5, partner: 'John Doe' },
    { client: 'Zurich', revenue: '$12M', matters: 7, partner: 'Jane Smith' },
    { client: 'MetLife', revenue: '$18M', matters: 6, partner: 'Michael Brown' },
    { client: 'Prudential', revenue: '$25M', matters: 12, partner: 'Emily Davis' },
    { client: 'Generali', revenue: '$10M', matters: 4, partner: 'Chris Wilson' },
    { client: 'Aviva', revenue: '$13M', matters: 8, partner: 'Sophia Lee' },
    { client: 'Chubb', revenue: '$19M', matters: 10, partner: 'Daniel Taylor' },
    { client: 'Liberty Mutual', revenue: '$14M', matters: 5, partner: 'Olivia Martinez' },
    { client: 'AIG', revenue: '$22M', matters: 11, partner: 'James Anderson' }
  ];

  // === Mini bar (yearly trend) ===
  // Using fixed values right now. If you’ve got a per-year KPI (e.g. revenue or matters),
  // I can bind to that and drop this local array.
  barCategories = ["2021", "2022", "2023", "2024", "2025"];
  private barValues = [0.531, 2.0, 2.71, 3.97, 5.28];
  barData: Array<{ value: number; color: string }> = [];
  private buildBarSeries(): void {
    const col = this.regionDataService.colorFromClass(this.elementColor || "");
    this.barData = this.barValues.map((v) => ({ value: v, color: col }));
  }

  onRowClick(e: { index: number; row: any }) {
    console.log('row clicked:', e);
  }

  // === Roles heatmap (very simple visual) ===
  // Also placeholder — if you have role counts for the selected country/city,
  // I’ll map them into this structure.
  cellsPerRow = 10;
  roles = [
    { name: 'Associates',  count: 13, color: '#ffb81c' },
    { name: 'Paralegals',  count: 8,  color: '#ffb81c' },
    { name: 'Partners',    count: 5,  color: '#ffb81c' },
    { name: 'Admin',       count: 7,  color: '#ffb81c' },
  ];
  get cellIndexes() { return Array.from({ length: this.cellsPerRow }, (_, i) => i); }

  // === Donut helpers (visual smoothing + region lookups) ===
  private regionDisplayOrder(): string[] {
    return [
      "Asia Pacific",
      "Europe, Middle East & Africa",
      "Latin America & the Caribbean",
      "North America",
      "United Kingdom",
    ];
  }

  private normCountryName(s: any): string {
    const x = String(s ?? "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (/^(uk|gb|great britain|united kingdom|all uk regions)$/.test(x)) return "united kingdom";
    if (/^(usa|us|u s a|united states of america|united states)$/.test(x)) return "united states";
    if (/^chile$/.test(x)) return "chili";
    return x;
  }

  private pickRegionName(row: MatterRow): string | undefined {
    const code = String(row?.R ?? "").toUpperCase();
    return this.regionDataService.regionNameByCode[code];
    // Krish: if your API already returns a human region name, I’ll skip this mapping.
  }

  private toSafeNumber(x: unknown, fallback = 0): number {
    const n = Number(x);
    if (!Number.isFinite(n) || n < 0) return fallback;
    return n;
  }

  private pickCount(row: MatterRow): number {
  // MC = “matter count” in the demo data. If your field is different,
  // I’ll adjust this accessor.
    const n = this.toSafeNumber(row?.MC, NaN);
    return Number.isNaN(n) ? 1 : n;
  }

  private applyMinShare(rawValues: number[]): number[] {
    // Keeps tiny segments visible in the donut by flooring shares and re-scaling.
    const raw = rawValues.map((v) => this.toSafeNumber(v, 0));
    const n = raw.length;
    const totalRaw = raw.reduce((s, v) => s + v, 0);
    if (!(totalRaw > 0)) return new Array(n).fill(this.VIS_BASE / n);
    const shares = raw.map((v) => v / totalRaw);
    const floored = shares.map((s) => Math.max(this.toSafeNumber(s, 0), this.MIN_SHARE));
    const floorSum = floored.reduce((s, v) => s + v, 0);
    let visShares: number[];
    if (floorSum > 0 && floorSum <= 1) {
      const multiplier = 1 / floorSum;
      visShares = floored.map((v) => v * multiplier);
    } else if (floorSum === 0) {
      visShares = new Array(n).fill(1 / n);
    } else {
      visShares = new Array(n).fill(1 / n);
    }
    return visShares.map((s) => this.toSafeNumber(s * this.VIS_BASE, this.VIS_BASE / n));
  }

  private hash(s: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  private buildFallbackDonut(countryName: string, homeRegionName: string): DonutPoint[] {
    // Purely cosmetic fallback so the donut isn’t empty if no data returns.
    // Once you provide real numbers, this won’t be used.
    const order = this.regionDisplayOrder();
    const seedBase = this.hash(countryName.toLowerCase());

    const targetTotal = 9 + (seedBase % 9); // mock data
    // const targetTotal = 99908; // I'm testing layoout if more than 3 digits
    
    const weights = order.map((name, i) => {
      const w = 1 + ((this.hash(countryName + "|" + name) >> i % 7) % 7);
      return name === homeRegionName ? w + 3 : w;
    });
    const sumW = weights.reduce((s, n) => s + n, 0) || 1;
    let counts = weights.map((w) => Math.max(0, Math.round(targetTotal * (w / sumW))));
    let diff = targetTotal - counts.reduce((s, n) => s + n, 0);
    if (diff !== 0) {
      const idx = Math.max(0, order.indexOf(homeRegionName));
      counts[idx] = Math.max(0, counts[idx] + diff);
    }
    const vis = this.applyMinShare(counts);
    return order.map((name, i) => ({
      name,
      valueRaw: this.toSafeNumber(counts[i], 0),
      valueVis: this.toSafeNumber(vis[i], this.VIS_BASE / order.length),
      color: this.regionDataService.colorFromRegionName(name),
      elementColor: this.regionDataService.classByRegionName[name],
      isHomeRegion: name === homeRegionName,
    }));
  }

  // === DATA INTEGRATION POINT (Matters by region) ===
  // This is where I’m pulling demo data. If you expose an endpoint that
  // gives us matters (or any count you prefer) for the selected country/city,
  // It can be wired here (or can be moved into a service).
  private async fetchMatterData(): Promise<MatterRow[]> {
    try {
      const res = await fetch("/KennedysWorldMapAPI/MatterData");
      if (!res.ok) {
        console.warn("[MatterData] HTTP error", res.status, res.statusText);
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? (data as MatterRow[]) : [];
    } catch (err) {
      console.warn("[MatterData] fetch failed:", err);
      return [];
    }
  }

  // Build donut from real data if available; otherwise use the fallback above.
  // May have to switch the grouping logic to whatever your payload looks like.
  private async buildDonutForCountry(countryName: string, homeRegionName: string) {
    const all = await this.fetchMatterData();
    const normalizedCountry = this.normCountryName(countryName);
    const rowsForCountry = all.filter((r) => {
      const inRow = this.normCountryName(r.Cy || r.country || r.Ct);
      return inRow === normalizedCountry;
    });
    const rows = rowsForCountry.length ? rowsForCountry : all;
    
    // Group by region and count “MC” (matter count) per region.
    // If you return a different metric (e.g. revenue), can pivot on that instead.
    const order = this.regionDisplayOrder();
    const byRegion: Record<string, number> = Object.fromEntries(order.map((n) => [n, 0]));
    for (const r of rows) {
      const regionName = this.pickRegionName(r);
      if (!regionName) continue;
      byRegion[regionName] = this.toSafeNumber(byRegion[regionName], 0) + this.pickCount(r);
    }
    const raw = order.map((name) => this.toSafeNumber(byRegion[name], 0));
    const totalRaw = raw.reduce((s, v) => s + v, 0);
    let points: DonutPoint[];
    if (totalRaw > 0) {
      const vis = this.applyMinShare(raw);
      points = order.map((name, i) => ({
        name,
        valueRaw: this.toSafeNumber(raw[i], 0),
        valueVis: this.toSafeNumber(vis[i], this.VIS_BASE / order.length),
        color: this.regionDataService.colorFromRegionName(name),
        elementColor: this.regionDataService.classByRegionName[name],
        isHomeRegion: name === homeRegionName,
      }));
    } else {
      points = this.buildFallbackDonut(countryName, homeRegionName);
    }
    const finalTotal = points.reduce((s, d) => s + this.toSafeNumber(d.valueRaw, 0), 0);
    this.ngZone.run(() => {
      this.donutData = points;
      this.donutTotal = finalTotal;
      this.cdr.markForCheck();
    });
    if (this.countryName && this.region) {
      this.buildBarSeries();
    }
  }

  // Top widgets (offices/staff/revenue/matters/key-regions).
  // Currently mocked. If you have a single “overview” endpoint, we can bind these
  // straight from it?
  widgetsData = [
    { widgetType: "offices",  widgetTitle: "Offices",  widgetCount: "5",  widgetSubtitle: "Based in",             showRegion: true,  isFocused: false },
    { widgetType: "staff",    widgetTitle: "Assigned", widgetCount: "94", widgetSubtitle: "Assigned staff",       showRegion: false, isFocused: false },
    { widgetType: "revenue",  widgetTitle: "Revenue",  widgetCount: "64M",widgetSubtitle: "Revenue-year-to-date", showRegion: false, isFocused: true  },
    { widgetType: "matters",  widgetTitle: "Matters",  widgetCount: "38", widgetSubtitle: "Open Matters",         showRegion: false, isFocused: false },
    { widgetType: "key-regions", widgetTitle: "Key Regions", widgetCount: "3", widgetSubtitle: "USA, UK & France", showRegion: false, isFocused: false }
  ];

  ngOnInit(): void {
    // I’m reading /country/:id/[:city] from the parent route.
    // That gives us the country we’re in; RegionDataService maps it to display metadata.
    const parentParams$ = this.route.parent!.paramMap;
    this.items$ = parentParams$;
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get("id");
      const citySlug = params.get("city");
      this.city = citySlug ? denormalize(citySlug) : null;
      if (!id) return;

      // Local metadata lookup (flag/colour/pretty names).
      // If you prefer, we can replace this with API metadata and keep the rest intact.
      const match = this.regionDataService
        .getRegions()
        .find((r) => normalize(r.name) === id || r.id === id);
      this.region = match?.region ?? null;
      this.countryName = match?.name ?? null;
      this.elementColor = match?.elementColor ?? null;

      // This is where the donut gets its data.
      // Swap fetchMatterData() for your endpoint and we’re good.
      if (this.countryName && this.region) {
        this.buildDonutForCountry(this.countryName, this.region).then(
          () => Promise.resolve().then(() => this.buildBarSeries())
        );
      } else {
        // Fallback visuals if we can’t resolve the country.
        const order = this.regionDisplayOrder();
        const vis = new Array(order.length).fill(this.VIS_BASE / order.length);
        this.ngZone.run(() => {
          this.donutData = order.map((name, i) => ({
            name,
            valueRaw: 0,
            valueVis: this.toSafeNumber(vis[i], this.VIS_BASE / order.length),
            color: this.regionDataService.colorFromRegionName(name),
            elementColor: this.regionDataService.classByRegionName[name],
            isHomeRegion: false,
          }));
          this.donutTotal = 0;
          this.cdr.markForCheck();
        });
        Promise.resolve().then(() => this.buildBarSeries());
      }
    });
  }
}
