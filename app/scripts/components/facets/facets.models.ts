module ngApp.components.facets.models {
  import IFacet = ngApp.core.models.IFacet;

  export interface IFacetScope extends ng.IScope {
    facet: IFacet;
    title: string;
    name: string;
    collapsed: boolean;
    expanded: boolean;
    displayCount: number;
    add(facet: string, term: string, event: any): void;
    remove(facet: string, term: string, event: any): void;
    clear(facet: string): void;
    field: any;
    sort: string;
  }

  export interface IFacetAttributes extends ng.IAttributes {
    collapsed: boolean;
    expanded: boolean;
    displayCount: number;
  }

  export interface IFreeTextFacetsScope extends ng.IScope {
    field: any;
    entity: string;
  }

  export interface IRangeFacetScope extends ng.IScope {
    facet: IFacet;
    field: any;
    title: string;
    upperBound: number;
    upperBoundFinal: number;
    lowerBound: number;
    lowerBoundFinal: number;
    ranges: {lower?: number; upper?: number; checked: boolean}[];
    max: number;
    min: number;
    data: any;
    unitsMap: Object[];
    convertDays: boolean;
  }

  export interface IDateFacetScope extends ng.IScope {
    name: string;
    opened: boolean;
    date: any;
    dateOptions: Object;
  }

}
