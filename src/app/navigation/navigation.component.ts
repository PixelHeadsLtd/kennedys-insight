import {
  Component,
  OnInit,
  Output,
  EventEmitter
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router, RouterLinkActive } from "@angular/router";
import { trigger, transition, style, animate } from "@angular/animations";
import { RegionDataService } from "../services/region-data.service";
import { normalize } from '../utils/slugify';

@Component({
  selector: "app-navigation",
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: "./navigation.component.html",
  animations: [
    trigger("expandCollapse", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("300ms ease-out", style({ height: "*", opacity: 1 })),
      ]),
      transition(":leave", [
        animate("200ms ease-in", style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class NavigationComponent implements OnInit {
  navDataItems: any[] = [];

  @Output() regionSelected = new EventEmitter<any>();

  constructor(
    private router: Router,
    private regionDataService: RegionDataService
  ) {}

  ngOnInit(): void {
    this.navDataItems = this.buildNavFromRegions();
  }

  // Main nav builder
  buildNavFromRegions() {
    const regions = this.regionDataService.getRegions();

    const grouped = regions.reduce((acc, region) => {
      const group = region.region;

      // Skip duplication if region == country (e.g., UK)
      if (region.name === region.region) return acc;

      if (!acc[group]) {
        acc[group] = [];
      }

      const country = {
        title: region.name,
        markerBgColor: region.markerBgColor,
        markerIsHollow: region.markerIsHollow,
        //routerLink: `/country/${normalize(region.name)}`,
        routerLink: ['/country', normalize(region.name)],
        isExpandable: Array.isArray(region.cities) && region.cities.length > 0,
        expanded: false,
        nestedItems: (region.cities || [])
          .filter((c) => !!c)
          .map((city) => ({
            title: city,
            //routerLink: `/country/${normalize(region.name)}/${city}`
            routerLink: ['/country', normalize(region.name), normalize(city)],
          })),
      };

      acc[group].push(country);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([region, countries]) => ({
      title: region,
      expanded: false,
      isExpandable: true,
      nestedItems: countries,
    }));
  }

  // Emit data to parent AppComponent
  onNavClick(item: any, parentRegion?: any): void {
    const isCity = !!parentRegion;
    const countryRegion = isCity ? parentRegion : item;

    this.regionSelected.emit({
      country: countryRegion.title,
      city: isCity ? item.title : undefined,
      region: this.findRegionName(countryRegion.title),
      flag: this.findRegionFlag(countryRegion.title),
      elementColor: countryRegion.markerBgColor,
    });
  }

  // Look up full region name
  findRegionName(country: string): string {
    const match = this.regionDataService.getRegions().find(
      (r) => r.name === country
    );
    return match?.region || "";
  }

  // Look up flag
  findRegionFlag(country: string): string {
    const match = this.regionDataService.getRegions().find(
      (r) => r.name === country
    );
    return match?.flag || "";
  }

  // Expand/collapse toggles
  toggle(item: any, event: Event): void {
    const toggleDiv = event.currentTarget as HTMLElement;
    const parentLi = toggleDiv.closest("li");
    if (!parentLi) return;

    const content = parentLi.querySelector("ul") as HTMLElement;
    if (!content) return;

    const isTopLevel = this.navDataItems.includes(item);

    // Collapse siblings if top-level
    if (isTopLevel) {
      this.navDataItems.forEach((other) => {
        if (other !== item && other.expanded) {
          other.expanded = false;

          const otherToggleDiv = document.querySelector(
            `.nav-toggle.level-0.is-active`
          ) as HTMLElement;

          if (otherToggleDiv) {
            const otherParentLi = otherToggleDiv.closest("li");
            if (otherParentLi) {
              const otherContent = otherParentLi.querySelector("ul") as HTMLElement;
              if (otherContent) {
                otherToggleDiv.classList.remove("is-active");
                otherContent.style.height = otherContent.scrollHeight + "px";
                requestAnimationFrame(() => {
                  otherContent.style.transition = "height 300ms ease";
                  otherContent.style.height = "0px";
                });
              }
            }
          }
        }
      });
    }

    item.expanded = !item.expanded;

    if (item.expanded) {
      toggleDiv.classList.add("is-active");
      content.style.height = "0px";
      requestAnimationFrame(() => {
        content.style.transition = "height 300ms ease";
        content.style.height = content.scrollHeight + "px";
      });
    } else {
      toggleDiv.classList.remove("is-active");
      content.style.height = content.scrollHeight + "px";
      requestAnimationFrame(() => {
        content.style.transition = "height 300ms ease";
        content.style.height = "0px";
      });
    }

    content.addEventListener(
      "transitionend",
      () => {
        if (item.expanded) content.style.height = "auto";
      },
      { once: true }
    );
  }
}
