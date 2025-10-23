import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, timer, of } from 'rxjs';
import { switchMap, distinctUntilChanged, catchError } from 'rxjs/operators';

export interface VersionInfo { version: string; commit: string; buildTime: string; }

@Injectable({ providedIn: 'root' })
export class VersionService {
  private readonly url = 'assets/version.json'; // ← no leading slash
  private readonly _info$ = new BehaviorSubject<VersionInfo | null>(null);
  readonly info$ = this._info$.asObservable();

  constructor(private http: HttpClient) {}

  startPolling(intervalMs = 5 * 60_000) {
    timer(0, intervalMs).pipe(
      switchMap(() => this.fetch()),
      distinctUntilChanged((a, b) => a?.commit === b?.commit && a?.buildTime === b?.buildTime),
      catchError(() => of(null)) // ← emit null on error
    ).subscribe(info => this._info$.next(info));
  }

  private fetch() {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache', Pragma: 'no-cache' });
    const bust = `?_=${Date.now()}`;
    return this.http.get<VersionInfo>(`${this.url}${bust}`, { headers });
  }
}
