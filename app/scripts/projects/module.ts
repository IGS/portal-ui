module ngApp.projects {
  "use strict";

  import IProjectsService = ngApp.projects.services.IProjectsService;

  /* ngInject */
  function projectsConfig($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider, config: ngApp.IGDCConfig) {
    $urlRouterProvider.when("/projects", "/projects/t");

    // Projects graph is disabled, so reroute /projects/g to .../t
    var displayGraphTab: boolean = config['projects']['display-graph-tab'];
    if (!displayGraphTab){
      $urlRouterProvider.when("/projects/g", "/projects/t");
    };

    $stateProvider.state("projects", {
      url: "/projects?filters",
      controller: "ProjectsController as prsc",
      templateUrl: "projects/templates/projects.html",
      reloadOnSearch: false
    });

    $stateProvider.state("projects.table", {
      url: "/t",
      data: {
        tab: "table"
      },
      reloadOnSearch: false
    });

    $stateProvider.state("projects.graph", {
      url: "/g",
      data: {
        tab: "graph"
      },
      reloadOnSearch: false
    });

    // DOLLEY: This note coincides with the one for ProjectController (projects.controller.ts)
    // This is not currently implemented and no complement API route exists.
    // Keeping for now in case someone wants the feature
    $stateProvider.state("project", {
      url: "/projects/:projectId",
      controller: "ProjectController as prc",
      templateUrl: "projects/templates/project.html",
      resolve: {
        project: ($stateParams: ng.ui.IStateParamsService, ProjectsService: IProjectsService): ng.IPromise<any> => {
          if (! $stateParams['projectId']) {
            throw Error('Missing route parameter: projectId. Redirecting to 404 page.');
          }
          return ProjectsService.getProject($stateParams["projectId"], {
            fields: [
              "name",
              "program.name",
              "primary_site",
              "project_id",
              "disease_type",
              "summary.case_count",
              "summary.file_count"
            ],
            expand: [
              "summary.data_categories",
              "summary.experimental_strategies"
            ]
          });
        }
      }
    });
  }

  angular
      .module("ngApp.projects", [
        "projects.controller",
        "ui.router.state"
      ])
      .config(projectsConfig);
}
