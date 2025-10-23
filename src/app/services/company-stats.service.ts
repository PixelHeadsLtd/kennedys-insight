import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export interface StatItem {
  offices: string;
  title: string;
  desc: string;
  icon: string
  color: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyStatsService {
  // Krish to point this to API or a JSON
  private readonly url = '/api/company-stats-cards';

  private subject = new BehaviorSubject<StatItem[] | null>(null);
  readonly stats$ = this.subject.asObservable();

  constructor(private http: HttpClient) {
    // initial load + refresh every 6h
    timer(0, 6 * 60 * 60 * 1000).pipe(
      switchMap(() => this.http.get<StatItem[]>(this.url)),
      catchError(err => {
        console.error('Failed to load company stats', err);
        // fallback so UI still renders
        this.subject.next([
          { offices: '46',   title: 'offices',   desc: 'Around the world',                       icon: 'office',    color: 'red-100'   },
          { offices: '2900+',title: 'people',    desc: 'Making a difference for our clients',    icon: 'people',    color: 'blue-100'  },
          { offices: '19',   title: 'countries', desc: 'In which we have an office',             icon: 'countries', color: 'green-100' }
        ]);
        return [];
      })
    ).subscribe(data => {
      if (data && data.length) this.subject.next(data);
    });
  }
}
