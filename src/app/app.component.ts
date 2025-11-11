

import { SortDescriptor, orderBy } from '@progress/kendo-data-query';

import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { SVGIcon, menuIcon } from '@progress/kendo-svg-icons';

import { ChartsModule } from '@progress/kendo-angular-charts';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { drawMultilineText, drawDottedLineWithSlantAndDot} from './utils/d3-helpers';
import { Feature, Geometry } from 'geojson';  

import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DrawerModule, TabStripModule } from '@progress/kendo-angular-layout';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
//import { ModalGridComponent } from './modal-grid/modal-grid.component';
import { WorldMapComponent } from './world-map/world-map.component';
//import { RevenueDialogComponent } from './revenue-dialog/revenue-dialog';
import { AngledNavComponent } from './angled-nav/angled-nav.component';
import { OverlayComponent } from './overlay/overlay.component';
import { RegionDataService } from './services/region-data.service';
import { normalize, denormalize } from './utils/slugify';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ChartsModule,
    GridModule,
    DialogsModule,
    DrawerModule,
    TabStripModule,
    ButtonsModule,
    //ModalGridComponent,
    WorldMapComponent,
    //RevenueDialogComponent,
    AngledNavComponent,
    OverlayComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent implements AfterViewInit, OnInit {
  showModal: boolean = false;
  showOverlay: boolean = false;
  currentMattersFilter: any = null;
  currentOfficeFilter: any = null;
  searchTerm: string | null = null;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private regionDataService: RegionDataService
  ) {
    // resize listener
    this.updateGridHeight = this.updateGridHeight.bind(this);
  }

  onQuickFilterChange(term: string | null) {
    this.searchTerm = term;
  }

  onMattersFilter(filter: any | null) {
    // Clear Office filters when Matters filter changes
    this.currentOfficeFilter = null;

    if (!filter) {
      this.currentMattersFilter = null;
      this.regionDataService.clearMattersCounts();
      this.cdr.markForCheck();
      return;
    }

    // Delay ensures UI model sync before counts update
    setTimeout(() => {
      this.currentMattersFilter = filter;
      this.cdr.markForCheck();
    });
  }

  onOfficeFilter(filter: any | null) {
    // Clear Matters filters when Office filter changes
    this.currentMattersFilter = null;

    if (!filter) {
      this.currentOfficeFilter = null;
      this.cdr.markForCheck();
      return;
    }

    // Delay ensures UI model sync before counts update
    setTimeout(() => {
      this.currentOfficeFilter = filter;
      this.cdr.markForCheck();
    });
  }

  ngOnInit() {
  // Krish: I’m listening for route changes here, so when a user lands on /country/uk/london
  // the app knows to open the overlay. This is where you’d probably hook in the API
  // to get the actual data for that country/region.
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      const url = event.urlAfterRedirects;
      this.updateSelectedRegionFromUrl(url);
    }
  });
}

onOverlayClose() {
  this.showOverlay = false;
  this.cdr.markForCheck();
}

onOverlayAfterClose() {
  this.selectedRegionData = null;
  this.cdr.markForCheck();

  this.router.navigate(['/'], { replaceUrl: true });
}

/**
 * Krish: This works out which region/country the URL refers to.
 * Right now I’m just using some static metadata (flags, colours etc.).
 * You’ll probably want to swap in a call here to pull the actual data for the overlay???
 */
updateSelectedRegionFromUrl(url: string) {
  const parts = url.split('/');
  if (parts[1] === 'country' && parts[2]) {
    const countrySlug = parts[2];
    const citySlug = parts[3];

    const region = this.regionDataService.getRegions().find(r =>
      normalize(r.name) === countrySlug
    );

    if (region) {
      console.log('City Slug:', citySlug);
      console.log('Denormalized City:', denormalize(citySlug));

      this.selectedRegionData = {
        country: region.name,
        city: citySlug ? denormalize(citySlug) : undefined,
        flag: region.flag,
        region: region.region,
        elementColor: region.elementColor
      };
      // This would be the point to fetch overlay data for the given country/city.
      this.showOverlay = true;
      this.cdr.markForCheck();
    }
  } else if (parts[1] === 'region') {
    const shortId = parts[2];
    const region = this.regionDataService.getRegions().find(r =>
      (shortId === 'uk' && r.name.toLowerCase() === 'united kingdom') ||
      (shortId === 'us' && r.name.toLowerCase() === 'united states')
    );
    if (region) {
      this.selectedRegionData = {
        country: region.name,
        flag: region.flag,
        region: region.region,
        elementColor: region.elementColor
      };

      // And here’s the equivalent if you want region-level data instead.
      this.showOverlay = true;
      this.cdr.markForCheck();
    }
  }
}

  // This is just the minimal info the overlay needs right now.
  // Krish: feel free to extend this with whatever your API returns (matters, staff counts, etc.).
  selectedRegionData: {
    country: string;
    city?: string;
    flag?: string;
    region: string;
    elementColor: string;
  } | null = null;

  /**
 * Called when the map is clicked. 
 * I’m updating the route here which in turn triggers updateSelectedRegionFromUrl.
 * Krish: If you prefer, you could start loading data right here on click.
 */
  onRegionSelected(data: any) {
    console.log('regionSelected data:', data);

  const normalizedCountry = normalize(data.country);
  const cityId = data.city ? normalize(data.city) : null;

  let route = `/country/${normalizedCountry}`;
  if (cityId) {
    route += `/${cityId}`;
  }

  this.router.navigate([route]).then(() => {
    this.selectedRegionData = data;
    this.showOverlay = true;
    this.cdr.markForCheck();
  });
}

  // ===== Revenue modal stuff =====
  // At the moment it’s just wired for UI. 
  // You’ll be the one to plug in the actual data (grid + chart).

  modalGridData: Array<{ Tc: any; Tn: any; MC: any; o: any; u: any }> = [];
  chartCategories: string[] = [];
  stackedChartSeries: Array<{ code: string; flag: string; Fee: number; Hard: number; Soft: number; Tax: number; Other: number }> = [];
  public revenueSort: SortDescriptor[] = [];
  revenueTabIndex: number = 0;

  onRevenueTabSelect(index: number): void {
    this.revenueTabIndex = index;
    if (this.showRevenueModal && index === 1) {
      //setTimeout(() => this.drawStackedChart(), 0);
    }
  }


  // drawStackedChart(): void {
  //   const getFlagUrl = this.getFlagUrl;
  //   const container = document.getElementById('bill-chart');
  //   if (!container) return;
  //   container.innerHTML = '';
  //   const chartData = this.stackedChartSeries;
  //   if (!chartData.length) return;
  //   const margin = { top: 40, right: 30, bottom: 80, left: 70 };
  //   const width = container.parentElement ? container.parentElement.offsetWidth : container.offsetWidth || 1200;
  //   let modalEl = container.closest('.matters-modal');

  //   let modalHeight = 600;
  //   if (modalEl && (modalEl as HTMLElement).offsetHeight) {
  //     modalHeight = (modalEl as HTMLElement).offsetHeight;
  //   }
  //   const height = Math.max(modalHeight - 410, 300);
  //   const svg = d3.select(container)
  //     .append('svg')
  //     .attr('width', '100%')
  //     .attr('height', height)
  //     .attr('viewBox', `0 0 ${width} ${height}`);


  //   const groups = chartData.map(d => d.code);
  //   const x = d3.scaleBand()
  //     .domain(groups)
  //     .range([margin.left, width - margin.right])
  //     .padding(0.18);
  //   const stackKeys = ['Fee', 'Hard', 'Soft', 'Tax', 'Other'];
  //   const colors: { [key: string]: string } = {
  //     Fee: '#6a51a3',
  //     Hard: '#3182bd',
  //     Soft: '#31a354',
  //     Tax: '#e6550d',
  //     Other: '#fd8d3c'
  //   };
  //   const stackedData = d3.stack()
  //     .keys(stackKeys)
  //     .value((d: any, key) => d[key] || 0)(chartData as any);
  //   const yMax = d3.max(chartData, d => stackKeys.reduce((sum, k) => sum + (typeof d[k as keyof typeof d] === 'number' ? (d[k as keyof typeof d] as number) : 0), 0)) || 1;
  //   const step = 500000000;
  //   const yDomainMax = (yMax % step === 0) ? yMax : Math.ceil(yMax / step) * step;
  //   const y = d3.scaleLinear()
  //     .domain([0, yDomainMax])
  //     .nice()
  //     .range([height - margin.bottom, margin.top]);
  //   const formatMillions = (domainValue: number | { valueOf(): number }, _idx: number) => {
  //     const val = typeof domainValue === 'number' ? domainValue : domainValue.valueOf();
  //     if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(0) + 'M';
  //     if (Math.abs(val) >= 1000) return (val / 1000).toFixed(0) + 'K';
  //     return val.toString();
  //   };
  //   svg.append('g')
  //     .selectAll('g')
  //     .data(stackedData)
  //     .join('g')
  //     .attr('fill', d => colors[d.key])
  //     .selectAll('rect')
  //     .data(d => d)
  //     .join('rect')
  //     .attr('x', (d, i) => x(chartData[i].code)!)
  //     .attr('y', d => y(d[1]))
  //     .attr('height', d => y(d[0]) - y(d[1]))
  //     .attr('width', x.bandwidth())
  //     .attr('class', 'bar-segment')
  //     .datum((d, i, nodes) => {

  //       let key = '';
  //       let parent: any = (nodes[i] as any)?.parentNode ?? null;
  //       if (parent && typeof parent === 'object' && parent.__data__ && typeof parent.__data__.key === 'string') {
  //         key = parent.__data__.key;
  //       } else {
  //         key = stackKeys[0];
  //       }
  //       const value = typeof chartData[i][key as keyof typeof chartData[0]] === 'number' ? chartData[i][key as keyof typeof chartData[0]] as number : 0;
  //       return { code: chartData[i].code, flag: chartData[i].flag, key, value };
  //     });
  //   const xAxis = svg.append('g')
  //     .attr('transform', `translate(0,${height - margin.bottom})`);
  //   xAxis.append('line')
  //     .attr('x1', margin.left)
  //     .attr('x2', width - margin.right)
  //     .attr('y1', 0)
  //     .attr('y2', 0)
  //     .attr('stroke', '#333')
  //     .attr('stroke-width', 1.5);
  //   xAxis.selectAll('text')
  //     .data(chartData)
  //     .join('text')
  //     .attr('x', d => x(d.code)! + x.bandwidth() / 2)
  //     .attr('y', 24)
  //     .attr('text-anchor', 'middle')
  //     .style('font-size', '13px')
  //     .style('font-weight', 'bold')
  //     .text(d => d.code.toUpperCase());
  //   svg.append('g')
  //     .attr('transform', `translate(${margin.left},0)`)
  //     .call(d3.axisLeft(y).tickFormat(formatMillions));
  //   svg.append('text')
  //     .attr('x', width / 2)
  //     .attr('y', margin.top - 15)
  //     .attr('text-anchor', 'middle')
  //     .style('font-size', '18px')
  //     .style('font-weight', 'bold')
  //     .text('Top 10 Paid by Country');
  //   const legend = svg.append('g')
  //     .attr('transform', `translate(${width - margin.right - 180},${margin.top})`);
  //   stackKeys.forEach((key, idx) => {
  //     legend.append('rect')
  //       .attr('x', 0)
  //       .attr('y', idx * 22)
  //       .attr('width', 32)
  //       .attr('height', 18)
  //       .attr('fill', colors[key]);
  //     legend.append('text')
  //       .attr('x', 36)
  //       .attr('y', idx * 22 + 13)
  //       .text(key)
  //       .style('font-size', '14px');
  //   });

  //   let tooltip: any = d3.select(container).select('.d3-tooltip');
  //   if (tooltip.empty()) {
  //     tooltip = d3.select(container)
  //       .append('div')
  //       .attr('class', 'd3-tooltip')
  //       .style('position', 'absolute')
  //       .style('pointer-events', 'none')
  //       .style('background', '#fff')
  //       .style('border', '1px solid #ccc')
  //       .style('padding', '6px 10px')
  //       .style('border-radius', '4px')
  //       .style('font-size', '13px')
  //       .style('box-shadow', '0 2px 8px rgba(0,0,0,0.08)')
  //       .style('display', 'none');
  //   }
  //   svg.selectAll('rect.bar-segment')
  //     .on('mouseover', function(event, datum) {
  //       const d = datum as { code: string; flag: string; key: string; value: number };
  //       const [xPos, yPos] = d3.pointer(event, container);
  //       const barColor = colors[d.key] || '#000';
  //       const flagUrl = getFlagUrl(d.code);
  //       let typeLabel = d.key;
  //       let amount = formatMillions(d.value, 0);
  //       tooltip.html(`
  //         <div style='display:flex;align-items:center;'>
  //           <img src='${flagUrl}' alt='${d.code}' style='width:32px;height:22px;object-fit:cover;border-radius:2px;box-shadow:0 1px 2px #ccc;margin-right:8px;'>
  //           <span style='font-weight:bold;font-size:15px;'>${d.code.toUpperCase()}</span>
  //         </div>
  //         <div style='margin-top:4px;'>
  //           <span style='font-size:13px;'>${typeLabel}</span><br>
  //           <span style='color:${barColor};font-weight:bold;'>${amount}</span>
  //         </div>
  //       `)
  //         .style('left', `${xPos + 20}px`)
  //         .style('top', `${yPos - 10}px`)
  //         .style('display', 'block');
  //     })
  //     .on('mousemove', function(event) {
  //       const [xPos, yPos] = d3.pointer(event, container);
  //       tooltip.style('left', `${xPos + 20}px`).style('top', `${yPos - 10}px`);
  //     })
  //     .on('mouseout', function() {
  //       tooltip.style('display', 'none');
  //     });
  // }

  // public onRevenueSortChange(sort: SortDescriptor[]): void {
  //   this.revenueSort = sort;
  //   const numericFields = ['B', 'F', 'H', 'S', 'T', 'O'];
  //   const data = this.revenueGridData.map(row => {
  //     const newRow = { ...row };
  //     numericFields.forEach(f => {
  //       newRow[f] = newRow[f] !== undefined && newRow[f] !== null && newRow[f] !== '' ? Number(newRow[f]) : 0;
  //     });
  //     return newRow;
  //   });
  //   this.revenueGridData = orderBy(data, this.revenueSort);
  // }

  // getFlagUrl(code: string): string {
  //   if (!code) return '';
  //   const c = code.length === 2 ? code.toLowerCase() : code.slice(0,2).toLowerCase();
  //   return `assets/svg/flags/${c}.svg`;
  // }
  
  formatMillionsAxis = (e: any) => this.formatMillions(e.value);
  revenueLoading = false;

  formatMillions = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '';
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(2) + 'K';
    }
    return value.toString();
  };

  formatMillionsLabel = (e: any) => this.formatMillions(e.value);
  get revenueCategories(): string[] {
    return Array.isArray(this.revenueGridData)
      ? this.revenueGridData.map(r => r.Of)
      : [];
  }
  drawerExpanded = false;
  showRevenueModal = false;
  menuSVG: SVGIcon = menuIcon;
  
  // Krish: you’ll provide these from the revenue API.
  revenueGridData: any[] = [];
  revenueChartData: any[] = [];

  drawerItems = [
    { text: '', separator: true },
    { text: 'Revenue', icon: 'k-i-dollar', iconType: 'font' },
  ];

  gridHeight: number = 250;

  // Totals are calculated client-side after revenueGridData is set.
  public revenueTotals: { B: number; F: number; H: number; S: number; T: number; O: number } = {
    B: 0,
    F: 0,
    H: 0,
    S: 0,
    T: 0,
    O: 0
  };

// getChartSeries(field: string): { category: string, value: number }[] {
//   if (!Array.isArray(this.revenueGridData) || this.revenueGridData.length === 0) return [];
//   const sorted = [...this.revenueGridData]
//     .map(row => ({
//       category: row.Of || row.category || row.name || '',
//       value: Number(row[field]) || 0
//     }))
//     .sort((a, b) => b.value - a.value)
//     .slice(0, 10);
//   return sorted;
// }

  // getMajorUnit(): number {
  //   if (!Array.isArray(this.revenueGridData) || this.revenueGridData.length === 0) return 1000;
  //   const fields = ['B', 'F', 'H', 'S', 'T', 'O'];
  //   let max = 0;
  //   for (const row of this.revenueGridData) {
  //     for (const f of fields) {
  //       const val = Number(row[f]);
  //       if (!isNaN(val) && val > max) max = val;
  //     }
  //   }
  //   if (max <= 10000) return 1000;
  //   if (max <= 100000) return 10000;
  //   if (max <= 1000000) return 100000;
  //   if (max <= 10000000) return 1000000;
  //   return Math.pow(10, Math.floor(Math.log10(max)) - 1);
  // }

  // toggleDrawer(): void {
  //   this.drawerExpanded = !this.drawerExpanded;
  // }

    // closeDrawer(): void {
    //     this.drawerExpanded = false;
    // }
    // public onItemSelect(e: any): void {
    //     console.log(`Selected: ${e.item.text}`);
    //     if (e.item.text === 'Matters') {
    //         this.showModal = true;
    //         setTimeout(() => this.updateGridHeight(), 0);
    //     } else if (e.item.text === 'Revenue') {
    //         this.showRevenueModal = true;
    //         this.fetchRevenueData();
    //         setTimeout(() => this.updateGridHeight(), 0);
    //     } else if (e.item.text === 'About' && e.item.path) {
    //         window.location.hash = e.item.path;
    //     }
    // }

    // async fetchRevenueData() {
    //     this.revenueLoading = true;
    //     this.cdr.markForCheck();
    //     try {
    //         const response = await fetch('/KennedysWorldMapAPI/RevenueData');
    //         if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    //         const data = await response.json();
    //         console.log('Fetched revenue data:', data);
    //         if (Array.isArray(data) && data.length > 0) {
    //             this.revenueGridData = data.slice(0, 100);
    //             const countryMap: { [code: string]: { Fee: number, Hard: number, Soft: number, Tax: number, Other: number, flag: string } } = {};
    //             for (const row of this.revenueGridData) {
    //               const code = row.C;
    //               if (!code) continue;
    //               if (!countryMap[code]) {
    //                 countryMap[code] = { Fee: 0, Hard: 0, Soft: 0, Tax: 0, Other: 0, flag: this.getFlagUrl(code) };
    //               }
    //               countryMap[code].Fee += Number(row.F) || 0;
    //               countryMap[code].Hard += Number(row.H) || 0;
    //               countryMap[code].Soft += Number(row.S) || 0;
    //               countryMap[code].Tax += Number(row.T) || 0;
    //               countryMap[code].Other += Number(row.O) || 0;
    //             }
    //             const sorted = Object.entries(countryMap)
    //               .map(([code, obj]) => ({ code, total: obj.Fee + obj.Hard + obj.Soft + obj.Tax + obj.Other, ...obj }))
    //               .sort((a, b) => b.total - a.total)
    //               .slice(0, 10);
    //             this.stackedChartSeries = sorted.map(c => ({ code: c.code, flag: c.flag, Fee: c.Fee, Hard: c.Hard, Soft: c.Soft, Tax: c.Tax, Other: c.Other }));
    //             this.chartCategories = sorted.map(c => c.code);
    //             setTimeout(() => {
    //               if (this.showRevenueModal && this.revenueTabIndex === 1) {
    //              //   this.drawStackedChart();
    //               }
    //             }, 0);
    //         } else {
    //             this.revenueGridData = [];
    //             this.stackedChartSeries = [];
    //             this.chartCategories = [];
    //         }
    //         this.calculateRevenueTotals();
    //     } catch (err) {
    //         console.error('Error fetching revenue data:', err);
    //         this.revenueGridData = [];
    //         this.revenueChartData = [];
    //         this.calculateRevenueTotals();
    //     } finally {
    //         this.revenueLoading = false;
    //         this.cdr.markForCheck();
    //     }
    // }

    ngAfterViewInit(): void {
    setTimeout(() => {
      const svg = d3.select<SVGSVGElement, unknown>('#bill-chart') as unknown as d3.Selection<SVGSVGElement | SVGGElement, unknown, null, undefined>;
      if (!svg.empty()) {
        drawMultilineText({
          svg,
          x: 100,
          y: 100,
          lines: ['Click for details'],
          onTextClick: () => {
            this.ngZone.run(() => {
              this.showModal = true;
              this.cdr.markForCheck();
            });
          }
        });
      }
    }, 0);
        //this.drawMap();
        this.updateGridHeight();
        window.addEventListener('resize', this.updateGridHeight);
        setTimeout(() => {
          if (this.showRevenueModal && this.revenueTabIndex === 1) {
          //  this.drawStackedChart();
          }
        }, 0);
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.updateGridHeight);
    }

    updateGridHeight(): void {

        const modalHeight = window.innerHeight - 200;
        const titleBar = 56;
        const tabStripHeader = 48;
        const gap = 10;
        const padding = 95;
        let gridHeight = modalHeight - titleBar - tabStripHeader - gap - padding;
        if (gridHeight < 120) gridHeight = 120;
        this.gridHeight = gridHeight;
    }

    // Called after revenueGridData is set to calculate totals.
    calculateRevenueTotals(): void {
      const fields = ['B', 'F', 'H', 'S', 'T', 'O'];
      const totals: { [key: string]: number } = { B: 0, F: 0, H: 0, S: 0, T: 0, O: 0 };
      if (Array.isArray(this.revenueGridData)) {
        for (const row of this.revenueGridData) {
          for (const f of fields) {
            const val = Number(row[f]);
            if (!isNaN(val)) totals[f] += val;
          }
        }
      }
      this.revenueTotals = totals as { B: number; F: number; H: number; S: number; T: number; O: number };
    }


    // drawMap(): void {
    //     const svgElement = document.querySelector("svg");
    //     if (!svgElement || !(svgElement instanceof SVGSVGElement)) {
    //         console.error("SVG element not found or incorrect type");
    //         return;
    //     }
    //     const svg = d3.select(svgElement as SVGSVGElement) as d3.Selection<SVGSVGElement, unknown, null, undefined>;

    //     const width = 900;
    //     const height = 540;

    //     const infoBox = svg.append('g')
    //         .attr('transform', 'translate(20, 500)')
    //         .style('opacity', 0);

    //     infoBox.append('rect')
    //         .attr('width', 180)
    //         .attr('height', 30)
    //         .attr('rx', 5)
    //         .style('fill', 'rgba(0,0,0,0.7)')
    //         .style('stroke', '#fdfdfd')
    //         .style('stroke-width', 1);

    //     const countryNameText = infoBox.append('text')
    //         .attr('x', 10)
    //         .attr('y', 20)
    //         .style('font-family', 'Segoe UI, sans-serif')
    //         .style('font-size', '14px')
    //         .style('fill', '#fdfdfd')
    //         .style('font-weight', 'bold');

    //     d3.json('assets/data/world.json').then((worldData: any) => {
    //         const projection = d3.geoNaturalEarth1().fitSize([width, height], worldData);
    //         const path = d3.geoPath().projection(projection);

    //         svg.append('g')
    //             .selectAll('path')
    //             .data(worldData.features as Feature<Geometry, any>[])
    //             .join('path')
    //             .attr('class', 'country')
    //             .attr('d', (d: Feature<Geometry, any>) => path(d) ?? '')
    //             .attr('fill', '#a8a8b2')
    //             .style('stroke', '#a8a8b2')
    //             .style('stroke-width', '0.5px')
    //             .on('click', function (event, d: Feature<Geometry, any>) {
    //                 svg.selectAll('.country').classed('selected', false);
    //                 d3.select(this).classed('selected', true);

    //                 const name = d.properties?.name ?? 'Unknown';
    //                 countryNameText.text(name);

    //                 const [x, y] = d3.pointer(event, this);
    //                 console.log("Clicked at SVG:", x, y);

    //                 const textNode = countryNameText.node() as SVGTextContentElement;
    //                 const textWidth = textNode.getComputedTextLength() + 20;

    //                 infoBox.select('rect').attr('width', textWidth);

    //                 infoBox.transition()
    //                     .style('opacity', 1)
    //                     .transition()
    //                     .delay(2000)
    //                     .duration(1000)
    //                     .style('opacity', 0);
    //             });

    //         this.fetchMatterData(svg);
    //         this.drawCountries(svg);
    //     }).catch(err => console.error('Error loading world.json:', err));
    // }

    // private async drawCountries(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    //     const AP_Col = "#ec6808";  
    //     const E_Col = "#019c42"; 
    //     const LA_Col = "#f4b227";
    //     const NA_Col = "#dd0b33";
    //     const UK_Col = "#06a3d7";

    //     const X = 0;
    //     const Y = 0;

    //     type SvgS = d3.Selection<SVGSVGElement | SVGGElement, unknown, null, undefined>;
       


    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 273, startY: 187, slantAngle: 90, slantLength: 174, horizLength1: 0, horizLength2: 140, direction1: 'right', direction2: 'left', dotColor: NA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 449, startY: 152, slantAngle: 90, slantLength: 139, horizLength1: 0, horizLength2: 130, direction1: 'right', direction2: 'left', dotColor: UK_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 174, startY: 156, slantAngle: 120, slantLength: 146, horizLength1: 0, horizLength2: 45, direction1: 'right', direction2: 'left', dotColor: NA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 285, startY: 210, slantAngle: 60, slantLength: 19, horizLength1: 65, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: NA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 205, startY: 251, slantAngle: 90, slantLength: 27, horizLength1: 0, horizLength2: 103, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 222, startY: 261, slantAngle: 180, slantLength: 121, horizLength1: 0, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 258, startY: 288, slantAngle: 180, slantLength: 157, horizLength1: 0, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 249, startY: 307, slantAngle: 240, slantLength: 19, horizLength1: 0, horizLength2: 59, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 260, startY: 338, slantAngle: 240, slantLength: 29, horizLength1: 0, horizLength2: 65, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 280, startY: 357, slantAngle: 240, slantLength: 54, horizLength1: 0, horizLength2: 71, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 280, startY: 406, slantAngle: 240, slantLength: 43, horizLength1: 0, horizLength2: 78, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 309, startY: 406, slantAngle: 270, slantLength: 25, horizLength1: 114, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 339, startY: 370, slantAngle: 0, slantLength: 55, horizLength1: 0, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 252, startY: 278, slantAngle: 0, slantLength: 103, horizLength1: 0, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 284, startY: 249, slantAngle: 0, slantLength: 63, horizLength1: 0, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 274, startY: 248, slantAngle: 60, slantLength: 18, horizLength1: 70, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: LA_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 534, startY: 209, slantAngle: 252, slantLength: 194, horizLength1: 0, horizLength2: 73, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 519, startY: 185, slantAngle: 252, slantLength: 167, horizLength1: 0, horizLength2: 67, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 484, startY: 183, slantAngle: 252, slantLength: 122, horizLength1: 0, horizLength2: 73, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 444, startY: 190, slantAngle: 180, slantLength: 72, horizLength1: 0, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 451, startY: 160, slantAngle: 180, slantLength: 79, horizLength1: 0, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 434, startY: 148, slantAngle: 90, slantLength: 17, horizLength1: 0, horizLength2: 65, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 459, startY: 154, slantAngle: 90, slantLength: 141, horizLength1: 65, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 470, startY: 128, slantAngle: 72, slantLength: 98, horizLength1: 66, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 474, startY: 141, slantAngle: 72, slantLength: 80, horizLength1: 99, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 485, startY: 131, slantAngle: 22, slantLength: 220, horizLength1: 65, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 495, startY: 148, slantAngle: 22, slantLength: 200, horizLength1: 65, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 723, startY: 186, slantAngle: 72, slantLength: 25, horizLength1: 115, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: AP_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 729, startY: 238, slantAngle: 0, slantLength: 115, horizLength1: 0, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: AP_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 713, startY: 298, slantAngle: 0, slantLength: 135, horizLength1: 0, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: AP_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 813, startY: 397, slantAngle: 240, slantLength: 26, horizLength1: 0, horizLength2: 75, direction1: 'right', direction2: 'left', dotColor: AP_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 863, startY: 411, slantAngle: 270, slantLength: 53, horizLength1: 0, horizLength2: 73, direction1: 'right', direction2: 'left', dotColor: AP_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 630, startY: 238, slantAngle: 270, slantLength: 74, horizLength1: 66, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: AP_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 615, startY: 229, slantAngle: 270, slantLength: 133, horizLength1: 80, horizLength2: 0, direction1: 'right', direction2: 'left', dotColor: AP_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 592, startY: 234, slantAngle: 270, slantLength: 204, horizLength1: 0, horizLength2: 48, direction1: 'right', direction2: 'left', dotColor: E_Col });
    //     drawDottedLineWithSlantAndDot({ svg: svg as SvgS, startX: 585, startY: 230, slantAngle: 270, slantLength: 168, horizLength1: 0, horizLength2: 41, direction1: 'right', direction2: 'left', dotColor: E_Col });

    //     drawMultilineText({ svg: svg as SvgS, x: 802, y: 35, lines: ['Kennedys'], fill: "white", textanchor: "start", stroke: "", fontSize: "35", flyDirection: "right" });
    //     drawMultilineText({ svg: svg as SvgS, x: 27, y: 352, lines: ['Asia Pacific'], fill: "white", textanchor: "start", stroke: "#ec6808", strokeWidth: 1, fontSize: "7", dotGap: 7 });
    //     drawMultilineText({ svg: svg as SvgS, x: 27, y: 363, lines: ['Europe, Middle East and Africa'], fill: "white", textanchor: "start", stroke: "#019c42", strokeWidth: 1, fontSize: "7", dotGap: 7 });
    //     drawMultilineText({ svg: svg as SvgS, x: 27, y: 374, lines: ['Latin America and the Caribbean'], fill: "white", textanchor: "start", stroke: "#f4b227", strokeWidth: 1, fontSize: "7", dotGap: 7 });
    //     drawMultilineText({ svg: svg as SvgS, x: 27, y: 385, lines: ['North America'], fill: "white", textanchor: "start", stroke: "#dd0b33", strokeWidth: 1, fontSize: "7", dotGap: 7 });
    //     drawMultilineText({ svg: svg as SvgS, x: 27, y: 396, lines: ['United Kingdom'], fill: "white", textanchor: "start", stroke: "#06a3d7", strokeWidth: 1, fontSize: "7", dotGap: 7 });
    //     drawMultilineText({ svg: svg as SvgS, x: 27, y: 413, lines: ['Offices'], fill: "white", textanchor: "start", stroke: "#fdfdfd", strokeWidth: 1, fontSize: "7", dotGap: 7 });
    //     drawMultilineText({ svg: svg as SvgS, x: 27, y: 425, lines: ['Associate offices'], fill: "#7b7a7f", textanchor: "start", stroke: "#7b7a7f", strokeWidth: 1.5, strokeFill: "none", fontSize: "7", fontstyle: "italic", dotGap: 7 });
    //     drawMultilineText({ svg: svg as SvgS, x: 27, y: 433, lines: ['and cooperations'], fill: "#7b7a7f", textanchor: "start", stroke: "", fontSize: "7", fontstyle: "italic", dotGap: 7 });
    //     svg.append("image").attr("xlink:href", "assets/svg/office.svg").attr("x", 315).attr("y", 495).attr("width", 20).attr("height", 20);
    //     drawMultilineText({ svg: svg as SvgS, x: 344, y: 509, lines: ['46'], fill: "#dd0b33", stroke: "", fontSize: "18", fontWeight: "bold" });
    //     drawMultilineText({ svg: svg as SvgS, x: 369, y: 509, lines: ['offices'], fill: "white", stroke: "", fontSize: "18" });
    //     drawMultilineText({ svg: svg as SvgS, x: 344, y: 519, lines: ['associate offices and cooperations'], fill: "white", stroke: "", fontSize: "7" });
    //     drawMultilineText({ svg: svg as SvgS, x: 344, y: 529, lines: ['around the world'], fill: "white", stroke: "", fontSize: "7" });
    //     svg.append("image").attr("xlink:href", "assets/svg/people.svg").attr("x", 481).attr("y", 496).attr("width", 20).attr("height", 20);
    //     drawMultilineText({ svg: svg as SvgS, x: 509, y: 509, lines: ['2,900+'], fill: "#06a3d7", stroke: "", fontSize: "18", fontWeight: "bold", flyDirection: "top" });
    //     drawMultilineText({ svg: svg as SvgS, x: 569, y: 509, lines: ['people'], fill: "white", stroke: "", fontSize: "18", flyDirection: "top" });
    //     drawMultilineText({ svg: svg as SvgS, x: 509, y: 519, lines: ['currently making a difference'], fill: "white", stroke: "", fontSize: "7", flyDirection: "top" });
    //     drawMultilineText({ svg: svg as SvgS, x: 509, y: 529, lines: ['to our clients'], fill: "white", stroke: "", fontSize: "7", flyDirection: "top" });
    //     svg.append("image").attr("xlink:href", "assets/svg/countries.svg").attr("x", 650).attr("y", 496).attr("width", 20).attr("height", 20);
    //     drawMultilineText({ svg: svg as SvgS, x: 679, y: 509, lines: ['19'], fill: "#019c42", stroke: "", fontSize: "18", fontWeight: "bold", flyDirection: "right" });
    //     drawMultilineText({ svg: svg as SvgS, x: 702, y: 509, lines: ['countries'], fill: "white", stroke: "", fontSize: "18", flyDirection: "right" });
    //     drawMultilineText({ svg: svg as SvgS, x: 679, y: 519, lines: ['in which we have an office'], fill: "white", stroke: "", fontSize: "7", flyDirection: "right" });
    // }

  //   private async fetchMatterData(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
  //       try {
  //           const response = await fetch("/KennedysWorldMapAPI/MatterData");
  //           if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

  //           const data = await response.json();
  //           document.getElementById('loading')!.style.display = 'none';

  //           const associates = ["Canada", "Guatemala", "Ecuador", "Bolivia", "Puerto Rico", "Panama", "Argentina", "Dominican Republic", "Turkey", "Italy", "Belgium", "Norway", "Sweden", "Poland", "China", "India", "Pakistan"];

  //           for (const item of data) {
  //               let stroke = '';
  //               let fontSize = "6.5px";
  //               let fill = "white";

  //               if (item.Cy === item.Ct) {
  //                   fontSize = "7px";
  //                   switch (item.R) {
  //                       case "AP": stroke = "#ec6808"; break;
  //                       case "E": stroke = "#019c42"; break;
  //                       case "LA": stroke = "#f4b227"; break;
  //                       case "NA": stroke = "#dd0b33"; break;
  //                       case "UK": stroke = "#06a3d7"; break;
  //                   }
  //                   fill = stroke;
  //               }

  //               drawMultilineText({
  //                   svg: svg as d3.Selection<SVGSVGElement | SVGGElement, unknown, null, undefined>,
  //                   x: item.x,
  //                   y: item.y,
  //                   lines: [item.Ct + (item.MC ? ` (${item.MC})` : '')],
  //                   fill,
  //                   textanchor: item.A === "R" ? "end" : "start",
  //                   stroke,
  //                   r: associates.includes(item.Ct) ? 2.1 : 2.8,
  //                   strokeFill: associates.includes(item.Ct) ? "none" : stroke,
  //                   strokeWidth: associates.includes(item.Ct) ? 1.5 : 0,
  //                   fontSize,
                    
  // onTextClick: () => {
  //   this.ngZone.run(() => {
  //     this.showModal = true;
  //     this.modalGridData = [];
  //     this.cdr.markForCheck();
  //     fetch(`/KennedysWorldMapAPI/TimeKeeperRateData?Office=${item.Ct}`)
  //       .then(response => response.json())
  //       .then(data => {
  //         this.ngZone.run(() => {
  //           this.modalGridData = (Array.isArray(data) ? data : []).map(item => ({
  //             Tc: item.Tc,
  //             Tn: item.Tn,
  //             MC: item.MC,
  //             o: item.o,
  //             u: item.u
  //           }));
  //           this.cdr.markForCheck();
  //         });
  //       });
  //   });
  // },
  //                   E: item.Cy === item.Ct ? "B" : "C" 
  //               });
  //           }

  //       } catch (err) {
  //           console.error('Error fetching data:', err);
  //           const loading = document.getElementById('loading');
  //           if (loading) loading.innerText = 'Error loading data';
  //       }
  //   }


    // private drawSvgButton(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    //     const BUTTON_WIDTH = 80;
    //     const BUTTON_HEIGHT = 18;

    //     const COLOR_PRIMARY = '#78866B';
    //     const COLOR_HOVER = '#667C26';
    //     const COLOR_ACTIVE = '#4B5320';
    //     const TEXT_COLOR = '#ffffff';

    //     const buttonGroup = svg.append('g')
    //         .attr('id', 'matters-button')
    //         .attr('transform', `translate(850, 10)`)
    //         .style('cursor', 'pointer');

    //     const rect = buttonGroup.append('rect')
    //         .attr('width', BUTTON_WIDTH)
    //         .attr('height', BUTTON_HEIGHT)
    //         .attr('rx', 6)
    //         .attr('fill', COLOR_PRIMARY)
    //         .style('transition', 'fill 0.2s ease')
    //         .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

    //     buttonGroup.append('text')
    //         .attr('x', BUTTON_WIDTH / 2)
    //         .attr('y', 12)
    //         .attr('text-anchor', 'middle')
    //         .attr('fill', TEXT_COLOR)
    //         .attr('font-size', '9px')
    //         .attr('font-family', 'Segoe UI, sans-serif')
    //         .text('Matters');

    //     buttonGroup
    //         .on('mouseover', () => rect.attr('fill', COLOR_HOVER))
    //         .on('mouseout', () => rect.attr('fill', COLOR_PRIMARY))
    //         .on('mousedown', () => rect.attr('fill', COLOR_ACTIVE))
    //         .on('mouseup', () => rect.attr('fill', COLOR_HOVER))
    //         .on('click', () => {
    //             console.log('Matters button clicked');
    //             this.showModal = true;
    //         });
    // }
}