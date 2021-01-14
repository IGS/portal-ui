module ngApp.annotations.controllers {
  import ICoreService = ngApp.core.services.ICoreService;
  import IAnnotationsService = ngApp.annotations.services.IAnnotationsService;
  import TableiciousConfig = ngApp.components.tables.directives.tableicious.TableiciousConfig;
  import IFacetService = ngApp.components.facets.services.IFacetService;
  import IProjectsService = ngApp.projects.services.IProjectsService;


  export interface IAnnotationsController {
    annotations: any;
  }

  interface IAnnotationsScope extends ng.IScope {
    tableConfig:TableiciousConfig;
  }

  class AnnotationsController implements IAnnotationsController {
    annotations: any;

    /* @ngInject */
    constructor(private $scope: IAnnotationsScope, private $rootScope: IRootScope,
                private AnnotationsService: IAnnotationsService,
                private CoreService: ICoreService, private AnnotationsTableModel:TableiciousConfig,
                private FacetService: IFacetService
    ) {
      CoreService.setPageTitle("Annotations");
      $scope.$on("$locationChangeSuccess", (event, next: string) => {
        if (next.indexOf("annotations") !== -1) {
          this.refresh();
        }
      });
      $scope.$on("gdc-user-reset", () => {
        this.refresh();
      });

      $scope.tableConfig = AnnotationsTableModel;

      this.refresh();
    }

    refresh() {
      this.$rootScope.$emit('ShowLoadingScreen');
      this.AnnotationsService.getAnnotations({
        fields: this.AnnotationsTableModel.fields,
        facets: this.FacetService.filterFacets(this.AnnotationsTableModel.facets)
      }).then((data) => {
        this.$rootScope.$emit('ClearLoadingScreen');
        if (!data.hits.length) {
          this.CoreService.setSearchModelState(true);
        }
        this.annotations = data;
      });
    }

  }

  export interface IAnnotationController {
    annotation: any;
  }

  class AnnotationController implements IAnnotationController {
    /* @ngInject */
    constructor(public annotation: any,
                public ProjectsService: IProjectsService,
                private CoreService: ICoreService) {
      CoreService.setPageTitle("Annotation", annotation.annotation_id);
    }
  }

  angular
      .module("annotations.controller", [
        "annotations.services",
        "core.services",
        "annotations.table.model"
      ])
      .controller("AnnotationsController", AnnotationsController)
      .controller("AnnotationController", AnnotationController);
}
