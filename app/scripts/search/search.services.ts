module ngApp.search.services {

  import ILocationService = ngApp.components.location.services.ILocationService;
  import IUserService = ngApp.components.user.services.IUserService;

  export interface ITab {
    active: boolean;
  }

  export interface ITabs {
    participants: ITab;
    files: ITab;
  }

  export interface ISearchState {
    tabs: ITabs;
    facets: ITabs;
    setActive(section: string, tab: string, key: string): void;
  }

  class State implements ISearchState {
    tabs: ITabs = {
      summary: {
        active: false,
        hasLoadedOnce: false
      },
      participants: {
        active: false,
        hasLoadedOnce: false
      },
      files: {
        active: false,
        hasLoadedOnce: false
      }
    };
    facets: ITabs = {
      participants: {
        active: false
      },
      files: {
        active: false
      }
    };

    setActive(section: string, tab: string, key: string) {
      if (section && tab) {
        if (key === "active") {
          _.each(this[section], function (section: ITab) {
            section.active = false;
          });

          if (!(section === "facets" && tab==="summary")) {
            this[section][tab].active = true;
          }
        } else {
          this[section][tab].hasLoadedOnce = true;
        }

      }
    }
  }


  export interface ISearchService {
    getSummary(filters?: Object): ng.IPromise<any>;
  }

  class SearchService implements ISearchService {

    /* @ngInject */
    constructor(private Restangular: restangular.IService, private LocationService: ILocationService,
                private UserService: IUserService) {
    }

    getSummary(filters: Object = this.LocationService.filters(), ignoreUserProjects: boolean = false) {
      if (!ignoreUserProjects) {
        filters = this.UserService.addMyProjectsFilter(filters, "cases.project.project_id");
      }

      return this.Restangular.all("ui/search/summary")
      .post({ filters: filters }, undefined, { 'Content-Type': 'application/json' })
      .then((response) => {
        return response;
      });
    }
  }

  class SearchChartConfigs {

    /* @ngInject */
    constructor($filter: ng.IFilterService) {
      this.projectIdChartConfig = {
        filterKey: "cases.Project.name",
        sortKey: "doc_count",
        displayKey: "key",
        defaultText: "project",
        pluralDefaultText: "projects",
        sortData: true,
        filters: {
          "default": {
            params: {
              filters: function(value) {
                return $filter("makeFilter")([
                  {
                    field: "cases.project_name",
                    value: [
                      value
                    ]
                  }
                ], true);
              }
            }
          }
        }
      };
      this.primarySiteChartConfig = {
        filterKey: "cases.project.primary_site",
        sortKey: "doc_count",
        displayKey: "key",
        defaultText: "body site",
        pluralDefaultText: "body sites",
        sortData: true,
        filters: {
          "default": {
            params: {
              filters: function(value) {
                return $filter("makeFilter")([
                  {
                    field: "cases.sample_body_site",
                    value: [
                      value
                    ]
                  }
                ], true);
              }
            }
          }
        }
      };
      this.accessChartConfig = {
        filterKey: "cases.study.name",
        sortKey: "doc_count",
        displayKey: "key",
        defaultText: "study",
        pluralDefaultText: "studies",
        sortData: true,
        filters: {
          "default": {
            params: {
              filters: function(value) {
                return $filter("makeFilter")([
                  {
                    field: "cases.study_name",
                    value: [
                      value
                    ]
                  }
                ], true);
              }
            }
          }
        }
      };
      this.dataTypeChartConfig = {
        filterKey: "cases.subject.gender",
        sortKey: "doc_count",
        displayKey: "key",
        defaultText: "gender",
        pluralDefaultText: "gender",
        sortData: true,
        filters: {
          "default": {
            params: {
              filters: function(value) {
                return $filter("makeFilter")([
                  {
                    field: "cases.subject_gender",
                    value: [
                      value
                    ]
                  }
                ], true);
              }
            }
          }
        }
      };
      this.dataFormatChartConfig = {
        filterKey: "cases.file.format",
        sortKey: "doc_count",
        displayKey: "key",
        defaultText: "file format",
        pluralDefaultText: "file formats",
        sortData: true,
        filters: {
          "default": {
            params: {
              filters: function(value) {
                return $filter("makeFilter")([
                  {
                    field: "files.file_format",
                    value: [
                      value
                    ]
                  }
                ], true);
              }
            }
          }
        }
      };
      this.expStratChartConfig = {
        filterKey: "cases.file.category",
        sortKey: "doc_count",
        displayKey: "key",
        defaultText: "file type",
        pluralDefaultText: "file types",
        sortData: true,
        filters: {
          "default": {
            params: {
              filters: function(value) {
                return $filter("makeFilter")([
                  {
                    field: "files.file_type",
                    value: [
                      value
                    ]
                  }
                ], true);
              }
            }
          }
        }
      };
    }
  }

  angular
      .module("search.services", [])
      .service("SearchState", State)
      .service("SearchChartConfigs", SearchChartConfigs)
      .service("SearchService", SearchService);
}
