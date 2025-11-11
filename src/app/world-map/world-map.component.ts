import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectionStrategy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  hoveredCity: string | null = null;
  private cityScrollPositions = new WeakMap<HTMLElement, number>();
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
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    // Krish: component consumes the stream; service decides where it comes from.
    this.stats$ = this.statsService.stats$;
  }

  getSafeSvg(region: any): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(region.svg?.raw || '');
  }

  onCitiesWheel(event: WheelEvent) {
    const container = event.currentTarget as HTMLElement;
    const inner = container.querySelector('.cities-inner') as HTMLElement;
    if (!inner) return;

    const style = window.getComputedStyle(container);
    const maxHeight = parseFloat(style.maxHeight || '0');
    if (!maxHeight || inner.scrollHeight <= container.clientHeight) return;

    event.preventDefault();

    const maxTranslate = inner.scrollHeight - container.clientHeight;
    const current = this.cityScrollPositions.get(container) ?? 0;
    const next = Math.min(Math.max(current + event.deltaY, -maxTranslate), 0);

    inner.style.transition = 'transform 0.25s ease-out';
    inner.style.transform = `translateY(${next}px)`;
    this.cityScrollPositions.set(container, next);

    this.updateCitiesFade(container);
  }
      
  updateCitiesFade(container: HTMLElement) {
    const inner = container.querySelector('.cities-inner') as HTMLElement;
    if (!inner) return;

    // Skip fade if content doesn't overflow
    if (inner.scrollHeight <= container.clientHeight) {
      inner.querySelectorAll<HTMLElement>('.region-link')
        .forEach(link => (link.style.opacity = '1'));
      return;
    }

    const rect = container.getBoundingClientRect();
    const centerY = rect.height / 2;
    const fadeDistance = rect.height * 0.9;
    const minOpacity = 0.5;
    const links = inner.querySelectorAll<HTMLElement>('.region-link');

    links.forEach(link => {
      const linkRect = link.getBoundingClientRect();
      const linkCenter = linkRect.top + linkRect.height / 2 - rect.top;
      const distance = Math.abs(linkCenter - centerY);
      const opacity = Math.max(minOpacity, 1 - distance / fadeDistance);
      link.style.opacity = opacity.toFixed(2);
    });
  }

  onCitiesMouseMove(event: MouseEvent) {
    const container = event.currentTarget as HTMLElement;
    const inner = container.querySelector('.cities-inner') as HTMLElement;
    if (!inner) return;

    // do nothing unless a max-height is set AND content overflows
    const style = window.getComputedStyle(container);
    const maxHeight = parseFloat(style.maxHeight || '0');
    if (!maxHeight || inner.scrollHeight <= container.clientHeight) return;

    const rect = container.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    const ratio = Math.min(Math.max(mouseY / rect.height, 0), 1);

    const maxTranslate = inner.scrollHeight - rect.height;
    const overscroll = rect.height * 0.1;
    const translateY = -(maxTranslate + 2 * overscroll) * ratio + overscroll;

    inner.style.transition = 'transform 0.3s ease-out';
    inner.style.transform = `translateY(${translateY}px)`;
    this.updateCitiesFade(container);
  }


  onCitiesMouseLeave(event: MouseEvent) {
    const container = event.currentTarget as HTMLElement;
    const inner = container.querySelector('.cities-inner') as HTMLElement;
    if (!inner) return;

    // Skip reset animation for short lists
    if (inner.scrollHeight <= container.clientHeight) return;

    inner.style.transition = 'transform 0.8s ease-out';
    inner.style.transform = 'translateY(0)';

    setTimeout(() => this.updateCitiesFade(container), 800);
  }

  ngAfterViewInit() {
    // Initialise all .cities containers once view has rendered
    const citiesContainers = document.querySelectorAll<HTMLElement>('.cities');

    citiesContainers.forEach(container => {
      const inner = container.querySelector('.cities-inner') as HTMLElement;
      if (!inner) return;

      // reset transform baseline
      inner.style.transform = 'translateY(0)';

      // ensure transition is defined for smooth wheel/hover
      inner.style.transition = 'transform 0.3s ease-out';

      // apply initial fade
      this.updateCitiesFade(container);

      // store initial scroll position (so wheel works right away)
      this.cityScrollPositions.set(container, 0);
    });
  }

  // --- Helpers for static map bindings ---
  // --- Region data lookup for static map bindings ---
  getRegionValue(regionId: string, key: string, cityName?: string): any {
    const region = this.regions?.find(r => r.id === regionId);
    if (!region) return undefined;

    // --- City-level count (e.g. officeCityCounts['Austin'])
    if (cityName && key.endsWith('CityCounts')) {
      const map = region[key] as Record<string, number>;
      return map ? map[cityName] : undefined;
    }

    // --- Region-level field (e.g. officeCount, staffCount)
    return region[key];
  }

  getRegion(id: string) {
    return this.regions.find(r => r.id === id);
  }

  // Add this anywhere inside your WorldMapComponent class
  manualCityClick(regionId: string, cityName: string, event?: MouseEvent): void {
    event?.stopPropagation();
    const region = this.getRegion(regionId);
    if (!region) return;

    this.regionSelected.emit({
      country: region.name,
      city: cityName,
      flag: region.flag,
      region: region.region,
      elementColor: region.elementColor
    });
  }

  cityClass(city: string): string {
    return city
      .toLowerCase()
      .replace(/\s+/g, '-')      // replace spaces with dashes
      .replace(/[^a-z0-9\-]/g, ''); // remove any non-alphanumeric chars
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
        this.cdr.markForCheck(); 
        this.reapplyCityEffects();
        return;
      }

      // Otherwise apply random mock counts
      this.updateMattersCounts();
      this.cdr.markForCheck();
      this.reapplyCityEffects();
    }

    if (changes['officeFilter']) {
      if (!this.officeFilter || !this.officeFilter.type) {
        // Clear counts
        this.regions = this.regionDataService.getRegions().map(r => ({
          ...r,
          officeCount: undefined,
          associatedCount: undefined,
          staffCount: undefined
        }));
        this.cdr.markForCheck();
        this.reapplyCityEffects();
        return;
      }

      const { type } = this.officeFilter;

      this.regions = this.regions.map(r => {
        const cities = r.cities || [];
        let cityMap: Record<string, number> = {};
        let total = 0;

        switch (type) {
          case 'offices':
            cityMap = cities.reduce((acc: any, city: string) => {
              acc[city] = Math.floor(Math.random() * 3) + 1;
              return acc;
            }, {});
            total = Object.values(cityMap).reduce((s: number, n: any) => s + n, 0);
            r.officeCityCounts = cityMap;
            r.officeCount = total;
            break;

          case 'associated':
            cityMap = cities.reduce((acc: any, city: string) => {
              acc[city] = Math.floor(Math.random() * 2);
              return acc;
            }, {});
            total = Object.values(cityMap).reduce((s: number, n: any) => s + n, 0);
            r.associatedCityCounts = cityMap;
            r.associatedCount = total;
            break;

          case 'staff':
            cityMap = cities.reduce((acc: any, city: string) => {
              acc[city] = Math.floor(Math.random() * 80) + 20;
              return acc;
            }, {});
            total = Object.values(cityMap).reduce((s: number, n: any) => s + n, 0);
            r.staffCityCounts = cityMap;
            r.staffCount = total;
            break;
        }

        return r;
      });

      this.cdr.markForCheck();
      this.reapplyCityEffects();
    }

  }

  private applySearchFilter(): void {
    const term = (this.searchTerm ?? '').toLowerCase().trim();

    // Start from all regions, keeping existing counts
    const baseRegions = this.regionDataService.getRegions().map(r => {
      const existing = this.regions.find(er => er.id === r.id);
      return { ...r, ...existing };
    });

    // Helper to sum per-city values from a given map
    const sumFor = (map: Record<string, number> | undefined, cities: string[]) => {
      if (!map) return undefined;
      return cities
        .map((c: string) => map[c] || 0)
        .reduce((sum: number, n: number) => sum + n, 0);
    };

    if (!term) {
      // Reset all regions & restore totals
      this.regions = baseRegions.map(r => {
        r.filteredCities = r.cities || [];
        if (r.cityCounts) {
          r.mattersCount = sumFor(r.cityCounts, r.cities || []);
        }
        if (r.officeCityCounts) {
          r.officeCount = sumFor(r.officeCityCounts, r.cities || []);
        }
        if (r.staffCityCounts) {
          r.staffCount = sumFor(r.staffCityCounts, r.cities || []);
        }
        return r;
      });
      this.cdr.markForCheck();
      this.reapplyCityEffects();
      return;
    }

    // Filter: keep only regions whose name or any city matches
    this.regions = baseRegions
      .filter(r =>
        r.name.toLowerCase().includes(term) ||
        (r.cities?.some((c: string) => c.toLowerCase().includes(term)))
      )
      .map(r => {
        const allCities = r.cities || [];
        const matchingCities = allCities.filter((c: string) =>
          c.toLowerCase().includes(term)
        );

        // Keep all cities visible in matched region
        r.filteredCities = allCities;

        // Dynamically recalc counts based on matching cities only
        // Dynamically recalc counts based on matching cities OR region match
        const regionMatches = r.name.toLowerCase().includes(term);

        if (r.cityCounts) {
          r.mattersCount = regionMatches
            ? sumFor(r.cityCounts, r.cities || [])
            : sumFor(r.cityCounts, matchingCities);
        }

        if (r.officeCityCounts) {
          r.officeCount = regionMatches
            ? sumFor(r.officeCityCounts, r.cities || [])
            : sumFor(r.officeCityCounts, matchingCities);
        }

        if (r.staffCityCounts) {
          r.staffCount = regionMatches
            ? sumFor(r.staffCityCounts, r.cities || [])
            : sumFor(r.staffCityCounts, matchingCities);
        }
        return r;
      });

    this.cdr.markForCheck();
    this.reapplyCityEffects();
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
    this.reapplyCityEffects();
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
  setHoveredRegion(regionId: string, color?: string): void {
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    this.hoveredRegion = regionId.toLowerCase().replace(/\s+/g, '-');
    if (color) this.elementColor = color;
  }

  clearHoveredRegion(immediate = false): void {
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    if (immediate) {
      this.hoveredRegion = null;
      this.hoveredCity = null;
    } else {
      this.clearTimer = setTimeout(() => {
        this.hoveredRegion = null;
        this.hoveredCity = null;
      }, 300);
    }
  }

  setHoveredCity(city: string): void {
    this.hoveredCity = city.toLowerCase().replace(/\s+/g, '-');
  }

  clearHoveredCity(): void {
    this.hoveredCity = null;
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

  private reapplyCityEffects(): void {
    setTimeout(() => {
      const containers = document.querySelectorAll<HTMLElement>('.cities');
      containers.forEach(container => {
        const inner = container.querySelector('.cities-inner') as HTMLElement;
        if (!inner) return;

        inner.style.transform = 'translateY(0)';
        inner.style.transition = 'transform 0.3s ease-out';
        this.updateCitiesFade(container);
        this.cityScrollPositions.set(container, 0);
      });
    }, 50);
  }

}
