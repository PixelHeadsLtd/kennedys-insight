// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DialogsModule } from '@progress/kendo-angular-dialog';
// import { TabStripModule } from '@progress/kendo-angular-layout';
// import { GridModule } from '@progress/kendo-angular-grid';

// @Component({
//   selector: 'app-revenue-dialog',
//   standalone: true,
//   imports: [CommonModule, DialogsModule, TabStripModule, GridModule],
//   templateUrl: './revenue-dialog.component.html'
// })
// export class RevenueDialogComponent {
//   @Input() visible = false;
//   @Input() revenueTabIndex = 0;
//   @Input() revenueLoading = false;
//   @Input() revenueGridData: any[] = [];
//   @Input() revenueSort: any[] = [];
//   @Input() revenueTotals: any = {};
//   @Input() gridHeight = 500; // number, not string
//   @Input() stackedChartSeries: any[] = [];

//   @Output() close = new EventEmitter<void>();
//   @Output() tabChange = new EventEmitter<number>();
//   @Output() sortChange = new EventEmitter<any>();

//   @Input() getFlagUrl!: (code: string) => string;

//   onTabSelect(index: number): void {
//     this.tabChange.emit(index);
//   }

//   onSortChange(event: any): void {
//     this.sortChange.emit(event);
//   }
// }
