module ngApp.components.tables.models {
  export interface ITableColumn {
    key: string;
    name: string;
    sort: boolean;
    order: string;

    sortValue: any;
    sortMethod: any;
  }
}
