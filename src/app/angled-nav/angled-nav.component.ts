import { Component, ViewChild, AfterViewInit, OnInit, Inject, Output, EventEmitter } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import {
    DatePickerComponent,
    DateInputsModule,
} from "@progress/kendo-angular-dateinputs";
import { DOCUMENT } from "@angular/common";

type Theme = "dark-mode" | "light-mode" | "colour-mode";
const THEME_KEY = "app-theme";

@Component({
    selector: "app-angled-nav",
    standalone: true,
    imports: [CommonModule, FormsModule, DateInputsModule],
    templateUrl: "./angled-nav.component.html",
})
export class AngledNavComponent implements AfterViewInit, OnInit {
    @ViewChild("picker") picker!: DatePickerComponent;
    @Output() quickFilterChange = new EventEmitter<string | null>();
    searchTerm: string = '';
    searchDebounce: any = null;

    @Output() mattersFilterChange = new EventEmitter<{
        range: string | null;
        status: string[];
        from: Date;
        to: Date;
    } | null>();

    @Output() officeFilterChange = new EventEmitter<{ 
        type: 'offices' | 'associated' | 'staff' | null 
    } | null>();


    theme: Theme = "dark-mode";
    fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    toDate = new Date();

    selectedRange: string | null = null;
    selectedStatuses: string[] = [];
    selectedOfficeType: 'offices' | 'associated' | 'staff' | null = null;

    constructor(@Inject(DOCUMENT) private doc: Document) {}

    onSearchChange() {
        this.quickFilterChange.emit(this.searchTerm.trim() || null);
    }

    clearSearch() {
        this.searchTerm = '';
        this.quickFilterChange.emit(null);
    }

    clearAllFilters() {
        // Reset model state
        this.selectedRange = null;
        this.selectedStatuses = [];
        this.selectedOfficeType = null;
        this.searchTerm = '';
        this.quickFilterChange.emit(null);

        const now = new Date();
        this.fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        this.toDate = now;

        // Reset all radios & checkboxes in DOM (in case Angular doesn't auto-sync)
        const radios = document.querySelectorAll<HTMLInputElement>('input[type="radio"][name="range"]');
        radios.forEach(r => r.checked = r.value === '12m');

        const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
        checkboxes.forEach(c => c.checked = c.value === 'Open');

        requestAnimationFrame(() => {
            document
                .querySelectorAll<HTMLInputElement>('input[name="range"]')
                .forEach(radio => radio.checked = false);

            document
                .querySelectorAll<HTMLInputElement>('input[name="officeRange"]')
                .forEach(radio => radio.checked = false);

            document
                .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
                .forEach(cb => cb.checked = false);
        });

        // Emit null to clear all filters and counts
        this.mattersFilterChange.emit(null);
        this.officeFilterChange.emit(null);
    }

    ngOnInit(): void {
        // restore saved theme (or keep default)
        const saved = (localStorage.getItem(THEME_KEY) as Theme) || this.theme;
        this.applyTheme(saved);
    }

    setTheme(theme: Theme) {
        this.applyTheme(theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    private applyTheme(theme: Theme) {
        this.theme = theme; // keeps radios in sync
        const body = this.doc.body;
        body.classList.remove("dark-mode", "light-mode", "colour-mode");
        body.classList.add(theme);
    }

    // ---------- Matters filters ----------
    onRangeSelect(range: string) {
        this.selectedOfficeType = null;
        this.selectedStatuses = [];
        this.selectedRange = range;
        const now = new Date();

        // visually uncheck all "officeRange" radios
        document.querySelectorAll<HTMLInputElement>('input[name="officeRange"]').forEach(r => (r.checked = false));

        switch (range) {
            case '12m':
            this.fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
            case '3y':
            this.fromDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            break;
            case 'all':
            this.fromDate = new Date(2000, 0, 1);
            break;
            case 'custom':
            break;
        }

        setTimeout(() => this.emitMattersChange());
    }

    toggleStatus(status: string, checked: boolean) {
        this.selectedOfficeType = null;
        if (checked) this.selectedStatuses.push(status);
        else this.selectedStatuses = this.selectedStatuses.filter(s => s !== status);
        this.emitMattersChange();
    }

    emitMattersChange() {
        this.mattersFilterChange.emit({
        range: this.selectedRange,
        status: this.selectedStatuses,
        from: this.fromDate,
        to: this.toDate
        });
    }

    onOfficeFilterChange(type: 'offices' | 'associated' | 'staff' | null) {
        this.selectedRange = null;
        this.selectedStatuses = [];
        this.selectedOfficeType = type;
        // visually uncheck all "range" radios and checkboxes
        document
            .querySelectorAll<HTMLInputElement>('input[name="range"]')
            .forEach(r => (r.checked = false));
        document
            .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
            .forEach(c => (c.checked = false));

        this.officeFilterChange.emit(type ? { type } : null);
    }

    ngAfterViewInit(): void {}
}

// --------------  KEEP THE POPUP OPEN FOR STYLING ONLY  ---------------

//   ngAfterViewInit(): void {
//     const forcePopupOpen = () => {
//       if (this.picker && !this.picker.popupRef?.popupOpen) {
//         this.picker.toggle(true);
//       }
//     };
//     setInterval(forcePopupOpen, 500)
//     setTimeout(() => this.picker.toggle(true), 100);
//   }
