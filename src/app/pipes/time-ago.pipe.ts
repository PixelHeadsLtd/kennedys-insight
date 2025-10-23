import { Pipe, PipeTransform, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true, pure: false })
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer: ReturnType<typeof setTimeout> | null = null; // <- fix

  constructor(private cdRef: ChangeDetectorRef, private ngZone: NgZone) {}

  transform(value?: Date | string | number | null): string {
    this.clearTimer();
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const diffSeconds = Math.max(0, Math.round((+now - +date) / 1000));

    const ms = this.msUntilNextUpdate(diffSeconds);
    if (ms > 0 && typeof window !== 'undefined') {
      this.timer = this.ngZone.runOutsideAngular(() =>
        setTimeout(() => {
          this.ngZone.run(() => this.cdRef.markForCheck());
        }, ms)
      );
    }

    return this.format(diffSeconds);
  }

  ngOnDestroy() { this.clearTimer(); }

  private clearTimer() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private msUntilNextUpdate(diff: number): number {
    if (diff < 60) return 1_000;
    if (diff < 3_600) return (60 - (diff % 60)) * 1_000;
    if (diff < 86_400) return (3_600 - (diff % 3_600)) * 1_000;
    return (86_400 - (diff % 86_400)) * 1_000;
  }

  private format(diff: number): string {
    if (diff < 5) return 'just now';
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    if (diff < 60) return rtf.format(-diff, 'second');
    const mins = Math.floor(diff / 60);
    if (mins < 60) return rtf.format(-mins, 'minute');
    const hours = Math.floor(mins / 60);
    if (hours < 24) return rtf.format(-hours, 'hour');
    const days = Math.floor(hours / 24);
    if (days < 7) return rtf.format(-days, 'day');
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return rtf.format(-weeks, 'week');
    const months = Math.floor(days / 30);
    if (months < 12) return rtf.format(-months, 'month');
    const years = Math.floor(days / 365);
    return rtf.format(-years, 'year');
  }
}
