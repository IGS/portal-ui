module ngApp.projects.table.service {
  import ILocationService = ngApp.components.location.ILocationService;

  type IWithFilterFn = (value: number, filters: Object[], $filter: ng.IFilterService) => string;

  type DataCategory = {
    case_count: number
  }

  type Summary = {
    data_categories: DataCategory[]
  }

  type Row = {
    project_id: string;
    summary: Summary;
  }

  type Rows = Row[];

  class ProjectsTableService {

    /* @ngInject */
    constructor(private DATA_CATEGORIES) {}

    filterFactory(url: string) : IWithFilterFn {
        return function(value: number, filters: Object[], $filter: ng.IFilterService)  {
          var filterString = _.isObject(filters) ? $filter("makeFilter")(filters, true) : null;
          var href = url + (filterString ? "?filters=" + filterString : "");
          var val = $filter("number")(value);
          return value ? "<a href='" + href + "'>" + val + '</a>' : '0';
        };
    }

    withFilterF : IWithFilterFn = this.filterFactory("search/f");
    withFilter : IWithFilterFn = this.filterFactory("search/c");

    getdataCategory(dataCategories: DataCategory[], dataCategory:string): number {
      var data = _.find(dataCategories, {data_category: dataCategory});
      return data ? data.case_count : 0;
    }

    dataCategoryWithFilters(dataCategory: string, row: Row, $filter: ng.IFilterService): string {
      var fs = [{field: 'cases.project.project_id', value: row.project_id},
                {field: 'files.data_category', value: dataCategory}];
      return this.withFilter(this.getdataCategory(row.summary.data_categories, dataCategory), fs, $filter);
    }

    dataCategoryTotalWithFilters(dataCategory: string, data: Rows, $filter: ng.IFilterService): string {
    var fs = [{field: 'files.data_category', value: [dataCategory]},
              {field: 'cases.project.project_id', value: data.map(d => d.project_id)}];
      return this.withFilter(_.sum(_.map(data, row => this.getdataCategory(row.summary.data_categories, dataCategory))), fs, $filter);
    }

    withCurrentFilters(value: number, $filter: ng.IFilterService, LocationService: ILocationService) {
      var fs = _.map(LocationService.filters().content, x => ({
        field: x.content.field.indexOf("summary") === 0 ? "files." + x.content.field.split(".")[2] : "cases.project." + x.content.field,
        value: x.content.value
      }));
      return this.withFilter(value, fs, $filter);
    }

    hasFilters(LocationService: ILocationService) : boolean {
      var filters = _.get(LocationService.filters(), 'content', null),
          hasFiltersFlag = false;

      if (! filters) {
        return hasFiltersFlag;
      }

      for (var i = 0; i < filters.length; i++) {
        var field = _.get(filters[i], 'content.field', false);

        if (! field) {
          continue;
        }

        hasFiltersFlag = true;
        break;
      }

      return hasFiltersFlag;
    }

    withProjectFilters(data: Object[], $filter: ng.IFilterService, LocationService: ILocationService, withFilterFn?: IWithFilterFn) : string {

      var wFilterFn : IWithFilterFn = withFilterFn || this.withFilter;
      var projectIDs = data.map(d => d.project_id);

      var countKey = withFilterFn !== this.withFilter ? 'file_count' : 'case_count';

      var fs = this.hasFilters(LocationService) && projectIDs.length
        ? [{ field: 'cases.project.project_id', value: projectIDs }]
        : [];

      var totalCount = data.reduce((acc, val) => acc + val.summary[countKey], 0);

      return wFilterFn(totalCount, fs, $filter);
    }

    model() {
      return {
        title: 'Studies',
        rowId: 'project_id',
        headings: [
          {
            name: "ID",
            id: "project_id",
            td: row => row.project_id,
            toolTipText: row => row.study_full_name,
            sortable: true,
            hidden: false,
            draggable: true,
            colSpan: 4
          }, {
            name: "Description",
            id: "disease_type",
            td: row => row.disease_type,
            sortable: true,
            hidden: false,
            draggable: true
          }, {
            name: "Project",
            id: "project_name",
            td: row => row.project_name,
            sortable: true,
            hidden: false
          }, {
            name: "Samples",
            id: "summary.case_count",
            td: (row, $scope) => {
              var fs = [{field: 'cases.study_name', value: row.project_id}]
              return this.withFilter(row.summary.case_count, fs, $scope.$filter);
            },
            sortable: true,
            hidden: false,
            thClassName: 'text-right',
            tdClassName: 'text-right'
          }, {
            name: "Files",
            id: "summary.file_count",
            td: (row, $scope) => {
              var fs = [{field: 'cases.study_name', value: row.project_id}]
              return this.withFilterF(row.summary.file_count, fs, $scope.$filter);
            },
            sortable: true,
            thClassName: 'text-right',
            tdClassName: 'text-right'
          }
        ],
        fields: [
          "disease_type",
          "state",
          "primary_site",
          "project_id",
          "name",
          "program.name",
          "summary.case_count",
          "summary.file_count",
          "summary.file_size",
          "summary.data_categories.data_category",
          "summary.data_categories.case_count",
        ],
        facets: [
          {
            name: 'project_id',
            facetType: 'free-text'
          }, {
            name: 'disease_type',
            facetType: 'terms'
          }, {
            name: 'program.name',
            facetType: 'terms'
          }, {
            name: 'primary_site',
            facetType: 'terms'
          }, {
            name: 'summary.experimental_strategies.experimental_strategy',
            facetType: 'terms'
          }, {
            name: 'summary.data_categories.data_category',
            facetType: 'terms'
        }]
      };
    }
  }

  angular.module("projects.table.service", [])
      .service("ProjectsTableService", ProjectsTableService);
}
