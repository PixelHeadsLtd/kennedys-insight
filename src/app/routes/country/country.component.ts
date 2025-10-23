import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RegionDataService } from "../../services/region-data.service";
import { normalize } from '../../utils/slugify';
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { Tabs } from "../../tabs/tabs.component";

@Component({
  selector: "app-country",
  standalone: true,
  imports: [CommonModule, RouterOutlet, Tabs],
  templateUrl: "./country.component.html",
})
export class CountryComponent implements OnInit {
  countryData: any;
  city: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private regionDataService: RegionDataService
  ) {}

  // add more here for tab pages
  onChildActivate(child: any) {
    if ('city' in child) {
      child.city = this.city;
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get("id");
      this.city = params.get("city"); // optional

      if (id) {
        this.countryData = this.regionDataService.getRegions().find(region =>
          normalize(region.name) === id
        );
      }
    });
  }
}
