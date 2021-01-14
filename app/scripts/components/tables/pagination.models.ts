module ngApp.components.tables.pagination.models {
  export interface IPagination {
    //NOTE made optional to resolve TS errors
    count?: number;
    total?: number;
    size?: number;
    from?: number;
    page?: number;
    pages?: number;
    sort?: any;
  }
}
