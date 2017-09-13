module ngApp.components.user.models {
  export interface IUser {
    username: string;
    projects: {gdc_ids: Object};
    token: string;
    isFiltered: boolean;
    queries: string[];
    hrefs: string[];
    scounts: string[];
    fcounts: string[];
    comments: string[];
  }
}
