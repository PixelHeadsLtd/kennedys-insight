export type TableColumn<T = any> = {
  key: string;
  header?: string;
  accessor?: (row: T, rowIndex: number) => any;
  compare?: (a: any, b: any, rowA?: T, rowB?: T) => number;
  sortable?: boolean;
};
