// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DialogsModule } from '@progress/kendo-angular-dialog';
// import { GridModule } from '@progress/kendo-angular-grid';

// @Component({
//   selector: 'app-modal-grid',
//   standalone: true,
//   imports: [
//     CommonModule, 
//     DialogsModule,
//     GridModule
//   ],
//   template: `
//     <kendo-dialog *ngIf="visible" (close)="close.emit()" title="Matters per Time keeper" class="matters-modal" width="calc(100vw - 200px)" height="calc(100vh - 200px)">
//       <kendo-grid [data]="data">
//         <kendo-grid-column field="u" title="Country"></kendo-grid-column>
//         <kendo-grid-column field="o" title="Office"></kendo-grid-column>
//         <kendo-grid-column field="Tc" title="Code"></kendo-grid-column>
//         <kendo-grid-column field="Tn" title="Time Keeper"></kendo-grid-column>
//         <kendo-grid-column field="MC" title="Matter Count"></kendo-grid-column>

//       </kendo-grid>
//     </kendo-dialog>
//   `
// })
// export class ModalGridComponent {
//   @Input() data: any[] = [];
//   @Input() visible = false;
//   @Output() close = new EventEmitter<void>();
// }
