import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewContainerRef,
  Injector,
  ComponentRef,
  Renderer2
} from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { TooltipPosition } from './tooltip.enums';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input() appTooltip: string | string[] = '';
  @Input() position: TooltipPosition = TooltipPosition.DEFAULT;
  @Input() tooltipWidth: string = 'auto';
  @Input() tooltipStatus: string = '';
  @Input() elementColor: string = '';
  @Input() offsetX: string | number = 0; 

  private toPx(v: string | number): number {
    if (typeof v === 'number') return v || 0;
    const s = (v ?? '').toString().trim().toLowerCase();
    if (!s) return 0;
    if (s.endsWith('vw')) return (parseFloat(s) || 0) * (window.innerWidth / 100);
    if (s.endsWith('vh')) return (parseFloat(s) || 0) * (window.innerHeight / 100);
    if (s.endsWith('px')) return parseFloat(s) || 0;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }

  private _showDelay = 300;
  @Input() set showDelay(value: number) { this._showDelay = value ?? 300; }
  get showDelay(): number { return this._showDelay; }

  private _hideDelay = 500;
  @Input() set hideDelay(value: number) { this._hideDelay = value ?? 500; }
  get hideDelay(): number { return this._hideDelay; }

  private componentRef: ComponentRef<TooltipComponent> | null = null;
  private showTimeout?: number;
  private hideTimeout?: number;
  private touchTimeout?: number;

  constructor(
    private hostEl: ElementRef<HTMLElement>,
    private vcr: ViewContainerRef,
    private injector: Injector,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    window.clearTimeout(this.hideTimeout);
    if (this.componentRef) {
      this.componentRef.instance.tooltip = this.appTooltip;
      this.setTooltipComponentProperties();
      this.showTooltip();
      return;
    }
    this.initializeTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.setHideTooltipTimeout();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.componentRef && this.position === TooltipPosition.DYNAMIC) {
      this.componentRef.instance.left = event.clientX;
      this.componentRef.instance.top = event.clientY;
      this.componentRef.instance.tooltip = this.appTooltip;
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    window.clearTimeout(this.touchTimeout);
    this.touchTimeout = window.setTimeout(() => this.initializeTooltip(), 500);
  }

  @HostListener('touchend')
  onTouchEnd(): void {
    window.clearTimeout(this.touchTimeout);
    this.setHideTooltipTimeout();
  }

private initializeTooltip(): void {
  window.clearTimeout(this.hideTimeout);

  this.componentRef = this.vcr.createComponent(TooltipComponent, { injector: this.injector });
  this.componentRef.instance.tooltip = this.appTooltip;
  this.componentRef.instance.position = this.position;
  this.componentRef.instance.tooltipWidth = this.tooltipWidth;
  this.componentRef.instance.tooltipStatus = this.tooltipStatus;
  this.componentRef.instance.elementColor = this.elementColor;

  this.setTooltipComponentProperties();

  const el = this.componentRef.location.nativeElement;
  this.renderer.appendChild(document.body, el);

  if (this.showDelay <= 0) {
    this.showTooltip();
  } else {
    this.showTimeout = window.setTimeout(() => this.showTooltip(), this.showDelay);
  }
}


  private setTooltipComponentProperties(): void {
    if (!this.componentRef) return;

    const instance = this.componentRef.instance;
    instance.tooltip = this.appTooltip;
    instance.position = this.position;
    instance.tooltipWidth = this.tooltipWidth;
    instance.tooltipStatus = this.tooltipStatus;

    const { left, right, top, bottom } = this.hostEl.nativeElement.getBoundingClientRect();

    switch (this.position) {
      case TooltipPosition.BELOW:
        instance.left = Math.round((right - left) / 2 + left);
        instance.top  = Math.round(bottom);
        break;
      case TooltipPosition.ABOVE:
        instance.left = Math.round((right - left) / 2 + left);
        instance.top  = Math.round(top);
        break;
      case TooltipPosition.RIGHT:
        instance.left = Math.round(right);
        instance.top  = Math.round(top + (bottom - top) / 2);
        instance.left += this.toPx(this.offsetX);
        break;
      case TooltipPosition.LEFT:
        instance.left = Math.round(left);
        instance.top  = Math.round(top + (bottom - top) / 2);
        instance.left += this.toPx(this.offsetX);
        break;
      case TooltipPosition.DYNAMIC:
      default:
        break;
    }
  }

  private showTooltip(): void {
    if (this.componentRef) {
      this.componentRef.instance.showTooltip();
    }
  }

  private setHideTooltipTimeout(): void {
    if (!this.componentRef) return;

    if (this.hideDelay <= 0) {
      this.destroy(); 
      return;
    }

    this.componentRef.instance.hideTooltipWithDelay(this.hideDelay);
    this.hideTimeout = window.setTimeout(() => this.destroy(), this.hideDelay);
  }
  ngOnDestroy(): void {
    this.destroy();
  }

  private destroy(): void {
    if (!this.componentRef) return;
    window.clearTimeout(this.showTimeout);
    window.clearTimeout(this.hideTimeout);
    const el = this.componentRef.location.nativeElement;
    if (el && el.parentNode) {
      this.renderer.removeChild(document.body, el);
    }
    this.componentRef.destroy();
    this.componentRef = null;
  }
}
