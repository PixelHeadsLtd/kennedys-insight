import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectionStrategy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RegionDataService } from '../services/region-data.service';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { TooltipPosition } from '../tooltip/tooltip.enums';
import { CompanyStatsService, StatItem } from '../services/company-stats.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './world-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMapComponent implements OnInit {

  // Krish: map rendering uses this array. Right now it comes from RegionDataService
  // (static). To drive regions from the API, swapping that service
  // to fetch from your endpoint should be enough — the template binds to the same shape.
  regions: any[] = [];
  

  TooltipPosition = TooltipPosition;
  elementColor: string = '';
  hoveredRegion: string | null = null;
  private clearTimer: any = null;

  // Krish: top-level headline stats under the map (offices/people/countries).
  // CompanyStatsService exposes an observable so the UI reacts when data arrives.
  // You can point that service at your API and keep the component as-is.
  stats$!: Observable<StatItem[] | null>;

  // internal mapping from string keys in region config to tooltip enum - 
  // might wanna extract this into a seperate enums file?
  private readonly posKeyToEnum: Record<string, TooltipPosition> = {
    left: TooltipPosition.LEFT,
    right: TooltipPosition.RIGHT,
    above: TooltipPosition.ABOVE,
    below: TooltipPosition.BELOW,
    dynamic: TooltipPosition.DYNAMIC
  };

  // --- Tooltip helpers ---
  tooltipPosOf(region: any): TooltipPosition {
    const key = (region?.tooltipPosition || 'right').toLowerCase();
    return this.posKeyToEnum[key] ?? TooltipPosition.RIGHT;
  }

  tooltipOffsetXOf(region: any): string | number {
    return region?.tooltipOffsetX ?? 0;
  }

  // Krish: tooltips are currently placeholder HTML with fixed numbers.
  // Once you surface real metrics per region/city (revenue, matters, offices, staff),
  // we can either:
  //  - enrich each region item in `regions` with those values and render them here, or
  //  - look them up from a store/service by region id.
  regionTooltip(region: any): string {
    return `<section>
      <header>
        <h5>${region.name}</h5>
      </header>
      <div class="tooltip-content">
        <ul>
          <li><span>Revenue:</span><strong>11.5M</strong></li>
          <li><span>Matters:</span><strong>12</strong></li>
          <li><span>Offices:</span><strong>1</strong></li>
          <li><span>Staff:</span><strong>46</strong></li>
        <ul>
      </div>
    </section>`;
  }

  // Same idea as above but at city granularity.
  // If your API returns city-level stats, we’ll thread them through the region model
  // (or request on demand) and populate this template accordingly.
  cityTooltip(region: any, city: string): string {
    return `<section>
      <header>
        <h5>${region.name} : ${city}</h5>
      </header>
      <div class="tooltip-content">
        <ul>
          <li><span>Revenue:</span><strong>11.5M</strong></li>
          <li><span>Matters:</span><strong>12</strong></li>
          <li><span>Offices:</span><strong>1</strong></li>
          <li><span>Staff:</span><strong>46</strong></li>
        <ul>
      </div>
    </section>`;
  }

  // Parent (AppComponent) listens to this and updates the route,
  // which then triggers the overlay load. If you want prefetching on click,
  // we can extend the payload here to carry ids your API likes.
  @Input() mattersFilter: {
    range: string;
    status: string[];
    from: Date;
    to: Date;
  } | null = null;

  @Output() regionSelected = new EventEmitter<{
    country: string;
    region: string;
    elementColor: string;
    city?: string;
    flag?: string;
  }>();

  @Input() officeFilter: { type: 'offices' | 'associated' | 'staff' | null } | null = null;
  @Input() searchTerm: string | null = null;

  // purely visual (for the dotted legend under the map)
  dashes = Array(60);

  constructor(
    private regionDataService: RegionDataService,
    private statsService: CompanyStatsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    // Krish: component consumes the stream; service decides where it comes from.
    this.stats$ = this.statsService.stats$;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      this.applySearchFilter();
    }

    if (changes['mattersFilter']) {
      if (!this.mattersFilter) {
        // Filter cleared – remove counts
        this.regions = this.regionDataService.getRegions().map(r => ({
          ...r,
          mattersCount: undefined
        }));
        this.cdr.markForCheck(); // 🔹 force re-render
        return;
      }

      // Otherwise apply random mock counts
      this.updateMattersCounts();
      this.cdr.markForCheck();
    }

    if (changes['officeFilter']) {
      if (!this.officeFilter || !this.officeFilter.type) {
        // Filter cleared — remove counts
        this.regions = this.regionDataService.getRegions().map(r => ({
          ...r,
          officeCount: undefined,
          associatedCount: undefined,
          staffCount: undefined
        }));
        this.cdr.markForCheck();
        return;
      }

      const { type } = this.officeFilter;

      switch (type) {
        case 'offices':
          this.regions = this.regions.map(r => ({
            ...r,
            officeCount: Math.floor(Math.random() * 5) + 1
          }));
          break;

        case 'associated':
          this.regions = this.regions.map(r => ({
            ...r,
            associatedCount: Math.floor(Math.random() * 3)
          }));
          break;

        case 'staff':
          this.regions = this.regions.map(r => ({
            ...r,
            staffCount: Math.floor(Math.random() * 500) + 50
          }));
          break;
      }

      this.cdr.markForCheck();
    }
  }

  private applySearchFilter(): void {
    const term = (this.searchTerm ?? '').toLowerCase().trim();

    // Always start fresh from full list (so deletions re-expand)
    const baseRegions = this.regionDataService.getRegions().map(r => {
      const existing = this.regions.find(er => er.id === r.id);
      return { ...r, ...existing };
    });

    if (!term) {
      // 🟢 Reset to full list with totals restored
      this.regions = baseRegions.map(r => {
        if (r.cityCounts) {
          r.filteredCities = r.cities || [];
          r.mattersCount = Object.values(r.cityCounts)
            .reduce((sum: number, n: any) => sum + (n as number), 0);
        }
        return r;
      });
      this.cdr.markForCheck();
      return;
    }

    // Filter cities for each region and recalc counts
    this.regions = baseRegions.map(r => {
      const allCities = r.cities || [];
      const filteredCities = allCities.filter((c: string) =>
        c.toLowerCase().includes(term)
      );

      // Recalculate per-region total based only on visible cities
      let filteredCount = r.mattersCount;
      if (r.cityCounts) {
        filteredCount = filteredCities
          .map((c: string) => r.cityCounts[c] || 0)
          .reduce((sum: number, n: number) => sum + n, 0);
      }

      return { ...r, filteredCities, mattersCount: filteredCount };
    });

    this.cdr.markForCheck();
  }

  filteredCities(region: any): string[] {
    // No search term = show all cities
    if (!this.searchTerm) return region.cities || [];

    const term = this.searchTerm.toLowerCase().trim();
    return (region.cities || []).filter((city: string) =>
      city.toLowerCase().includes(term)
    );
  }

  highlightMatch(city: string): string {
    if (!this.searchTerm) return city;
    const regex = new RegExp(`(${this.searchTerm})`, 'ig');
    return city.replace(regex, `<span class="highlighted">$1</span>`);
  }
  
  private updateMattersCounts(): void {
    // Mock count generation until API arrives
    this.regions = this.regions.map(r => {
      const cityCounts = (r.cities || []).reduce((acc: any, city: string) => {
        acc[city] = Math.floor(Math.random() * 10) + 1; // random per city
        return acc;
      }, {});

      const total = Object.values(cityCounts).reduce((sum: number, n: any) => sum + (n as number), 0);

      return { ...r, cityCounts, mattersCount: total };
    });

    this.cdr.markForCheck();
  }

  private describeRange(range: string): string {
    switch (range) {
      case '12m': return 'Last 12 m';
      case '3y': return 'Last 3 yrs';
      case 'all': return 'All time';
      case 'custom': return 'Custom range';
      default: return '';
    }
  }

  ngOnInit(): void {
  // Krish: regions currently come from a local service method.
  // If you flip RegionDataService.getRegions() to hit your API (and cache if needed),
  // the rest of this component won’t need changes.
    this.regions = this.regionDataService.getRegions();
  }

  // --- Static “stats tiles” (under the map)
  // These are currently static; the live ones should already come via stats$ above.
  // We can drop/replace this once your service feeds the real values.
  stats = [
    {
      offices: '46',
      title: 'offices',
      desc: 'Around the world',
      icon: 'office',
      color: 'red-100'
    },
    {
      offices: '2900+',
      title: 'people',
      desc: 'Making a difference for our clients',
      icon: 'people',
      color: 'blue-100'
    },
    {
      offices: '19',
      title: 'countries',
      desc: 'In which we have an office',
      icon: 'countries',
      color: 'green-100'
    }
  ];

  // --- Hover highlights (UI only) ---
  setHoveredRegion(id: string, color?: string): void {
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    this.hoveredRegion = id;
    if (color) this.elementColor = color;
  }

  clearHoveredRegion(immediate = false): void {
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    if (immediate) {
      this.hoveredRegion = null;
      this.elementColor = '';
      return;
    }
    const expected = this.hoveredRegion;
    this.clearTimer = setTimeout(() => {
      if (this.hoveredRegion === expected) {
        this.hoveredRegion = null;
        this.elementColor = '';
      }
      this.clearTimer = null;
    }, 100);
  }


  // --- Click handlers ---
  // These emit a minimal selection model (country/region/city).
  // The parent will push the route; overlay then takes over for data loading.
  onCityClick(region: any, cityName: string) {
    this.regionSelected.emit({
      country: region.name,
      city: cityName,
      flag: region.flag,
      region: region.region,
      elementColor: region.elementColor
    });
  }

  onRegionNameClick(region: any) {
    this.regionSelected.emit({
      country: region.name,
      flag: region.flag,
      region: region.region,
      elementColor: region.elementColor
    });
  }

  onCountryClick(regionId: string) {
    const region = this.regions.find(r => r.id === regionId);
    if (region) {
      this.regionSelected.emit({
        country: region.name,
        flag: region.flag,
        region: region.region,
        elementColor: region.elementColor
      });
    }
  }
}
