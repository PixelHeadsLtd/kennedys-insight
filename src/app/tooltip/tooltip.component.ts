import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
  Input,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipPosition } from './tooltip.enums';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TooltipComponent implements OnDestroy {
  @Input() position: TooltipPosition = TooltipPosition.DEFAULT;
  @Input() tooltip: string | string[] = '';
  @Input() tooltipWidth: string = 'auto';
  @Input() tooltipStatus: string = '';
  @Input() elementColor: string = '';
  @Input() left = 0;
  @Input() top = 0;

  visible = false;
  private hideTimer: any;

  constructor(private cdr: ChangeDetectorRef) {}

  getTooltipClasses(): { [klass: string]: boolean } {
    return {
      'tooltip--visible': this.visible,
      [`tooltip--${this.position}`]: true,
      [this.tooltipStatus]: !!this.tooltipStatus,
      [this.elementColor]: !!this.elementColor
    };
  }

  showTooltip(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.visible = true;
    this.cdr.detectChanges();
  }

  // hideTooltipWithDelay(delay: number): void {
  //   if (this.hideTimer) clearTimeout(this.hideTimer);
  //   this.hideTimer = setTimeout(() => {
  //     this.visible = false;
  //     this.hideTimer = null;
  //     this.cdr.detectChanges();
  //   }, delay);
  // }

    hideTooltipWithDelay(delay: number): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);

    if (delay <= 0) {
      this.visible = false;
      this.hideTimer = null;
      this.cdr.detectChanges();
      return;
    }

    this.hideTimer = window.setTimeout(() => {
      this.visible = false;
      this.hideTimer = null;
      this.cdr.detectChanges();
    }, delay);
  }

  ngOnDestroy(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
}
