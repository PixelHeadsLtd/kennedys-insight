import { Component, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../navigation/navigation.component';
import { RouterOutlet } from '@angular/router';
import { OverlayBackgroundComponent } from './overlay-background.component';
import { SearchBackgroundComponent } from './search-background.component';
import { CloseBtnComponent } from './close-btn.component';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    CommonModule, 
    NavigationComponent, 
    RouterOutlet, 
    OverlayBackgroundComponent, 
    SearchBackgroundComponent,
    CloseBtnComponent],
  templateUrl: './overlay.component.html',
})
export class OverlayComponent {
  // Krish: overlay open/close is controlled by the parent (AppComponent).
  // Parent decides when data is ready and toggles this flag.
  @Input() isOpen = false;

  // Minimal header/meta the overlay needs to render immediately.
  // Right now this is just labels/flag/colour. 
  // Feel free to extend with whatever you return from the API (counts, KPIs, etc.).
  // If you prefer, we can also switch this to a richer model (e.g. { meta, kpis, clients, ... }).
  @Input() regionData: { country: string; city?: string; flag?: string; region: string; elementColor: string } | null = null;

  // Parent listens to this to start the close animation.
  @Output() closeOverlay = new EventEmitter<void>();

  // Fired after the CSS transition finishes. Parent currently uses this to clear state + navigate.
  // If you want to cancel inflight requests or clear caches, that’s a convenient hook.
  @Output() afterClose = new EventEmitter<void>();

  @ViewChild('container', { static: true }) containerEl!: ElementRef<HTMLElement>;

  // UI close button -> delegate to parent so URL and state stay in sync.
  onCloseClick() {
    this.closeOverlay.emit();
  }

  // Esc to close (same as above).
  @HostListener('document:keydown.escape')
    handleEscape() {
      this.closeOverlay.emit();
    }

  // Krish: when opacity transition ends AND the overlay is closed,
  // we emit afterClose so the parent can do cleanup (it currently resets selection + navigates).
  onOverlayTransitionEnd(e: TransitionEvent) {
    if (!this.isOpen &&
        e.propertyName === 'opacity' &&
        e.target === this.containerEl.nativeElement) {
      this.afterClose.emit();
    }
  }
  
  // Map-style selection bubbling within the overlay (e.g., if we list cities inside).
  // Right now this is only logged. If you want in-overlay navigation like
  // /country/uk/leeds -> /country/uk/london, we can re-emit to parent and push a route.
  onRegionSelected(data: any) { console.log('Region selected:', data); }
}

