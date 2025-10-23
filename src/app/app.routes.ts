// app.routes.ts
import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { CountryComponent } from './routes/country/country.component';
import { CountryOverviewTabComponent } from './routes/country/tabs/overview-tab.component';
import { CountryOfficesTabComponent } from './routes/country/tabs/offices-tab.component';
import { CountryPeopleTabComponent } from './routes/country/tabs/people-tab.component';
import { CountryMattersTabComponent } from './routes/country/tabs/matters-tab.component';
import { CountryClientsTabComponent } from './routes/country/tabs/clients-tab.component';
import { CountryRateCardCheckerTabComponent } from './routes/country/tabs/rate-card-checker-tab.component';
import { CountryDataExplorerTabComponent } from './routes/country/tabs/data-explorer-tab.component';

export const routes: Routes = [
  { path: 'about', component: AboutComponent },

  // Country view (no city)
  {
    path: 'country/:id',
    component: CountryComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: CountryOverviewTabComponent },
      { path: 'offices', component: CountryOfficesTabComponent },
      { path: 'people', component: CountryPeopleTabComponent },
      { path: 'matters', component: CountryMattersTabComponent },
      { path: 'clients', component: CountryClientsTabComponent },
      { path: 'rate-card-checker', component: CountryRateCardCheckerTabComponent },
      { path: 'data-explorer', component: CountryDataExplorerTabComponent }
    ],
  },

  // Country + City view (same tabs, if you want them scoped to a city)
  {
    path: 'country/:id/:city',
    component: CountryComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: CountryOverviewTabComponent },
      { path: 'offices', component: CountryOfficesTabComponent },
      { path: 'people', component: CountryPeopleTabComponent },
      { path: 'matters', component: CountryMattersTabComponent },
      { path: 'clients', component: CountryClientsTabComponent },
      { path: 'rate-card-checker', component: CountryRateCardCheckerTabComponent },
      { path: 'data-explorer', component: CountryDataExplorerTabComponent }
    ],
  },
];
