module ngApp.files.controllers {
  import ICoreService = ngApp.core.services.ICoreService;
  import ICartService = ngApp.cart.services.ICartService;
  import IFilesService = ngApp.files.services.IFilesService;
  import IGqlService = ngApp.components.gql.IGqlService;

  interface ITableFilters {
    assocEntity: string;
    readGroup: string;
  }

  export interface IFileController {
    file: any;
    isInCart(): boolean;
    handleCartButton(): void;
    archiveCount: number;
    annotationIds: string[];
    tablesToDisplay: string[];
    makeSearchPageLink(files: any[]): string;
  }
  
  class FileController implements IFileController {
    archiveCount: number = 0;
    annotationIds: string[] = [];
    tablesToDisplay: string[];
    tableFilters: ITableFilters = {
      assocEntity: '',
      readGroup: ''
    };
    filePageConfig: Object;

    /* @ngInject */
    constructor(
      public file: any,
      public $scope: ng.IScope,
      private CoreService: ICoreService,
      private CartService: ICartService,
      private FilesService: IFilesService,
      // private $filter: ng.IFilterService
      private $filter: ngApp.components.ui.string.ICustomFilterService
    ) {

      setTimeout(() => {
        // long-scrollable-table should become its own directive
        // --
        // this function moves the "sticky" header columns which do not scroll
        // naturally with the table
        $('.long-scrollable-table-container').scroll(function () {
          let el = $(this);
          let div = el.find('.sticky div');
          div.css({ transform: `translateX(-${el.scrollLeft()}px)` });
        });
      });

      // Get custom 'files-page' config
      this.filePageConfig = this.CoreService.getComponentFromConfig('files-page');
      
      // Flatten objects for better accessing their properties in file.html template
      var flatFile = {};
      _.forEach(this.file, (val, key) => {
        if ( typeof(val) === 'object' ) {
          _.forEach(val, (obj_val, obj_prop) => {
            let newFieldName = key + '_' + obj_prop;
            flatFile[newFieldName] = obj_val;
          });
        } else {
          flatFile[key] = val;
        }
      });
      this.file = flatFile;

      CoreService.setPageTitle(this.filePageConfig['page-title'], this.file['file_file_name']);

      var toDisplayLogic = {
        'Raw Sequencing Data': ['analysis', 'referenceGenome', 'readGroup', 'downstreamAnalysis'],
        'Transcriptome Profiling': ['analysis', 'referenceGenome', 'downstreamAnalysis'],
        'Simple Nucleotide Variation': ['analysis', 'referenceGenome', 'downstreamAnalysis'],
        'Copy Number Variation': ['analysis', 'referenceGenome', 'downstreamAnalysis'],
        'Structural Rearrangement': ['analysis', 'referenceGenome', 'downstreamAnalysis'],
        'DNA Methylation': ['analysis', 'referenceGenome', 'downstreamAnalysis'],
        'Clinical': [],
        'Biospecimen': []
      }
      this.tablesToDisplay = (toDisplayLogic[file.data_category] || []).reduce((acc, t) => {
        acc[t] = true;
        return acc;
      }, {});

      if (this.file.archive) {
        this.FilesService.getFiles({
          fields: [
            "archive.archive_id"
          ],
          filters: {"op": "=", "content": {"field": "files.archive.archive_id", "value": [file.archive['archive_id']]}}
        }).then((data) => this.archiveCount = data.pagination.total);
      } else {
        this.archiveCount = 0;
      }

      // TODO: DOLLEY removed for now. Relating to GQL removal
      // _.every(file.associated_entities, (entity: any) => {
      //   entity.annotations = _.filter(file.annotations, (annotation: any) => {
      //     return annotation.entity_id === entity.entity_id;
      //   });
        
      //   if (entity.annotations) {
      //     entity.annotations = _.map(entity.annotations, "annotation_id");
      //   }
      // });
      //
      // //insert project into top level because it's in the properties table
      // file.projects = _.reject(_.uniq(file.cases.map(c => (c.project || {}).project_id)),
      //                             p => _.isUndefined(p) || _.isNull(p));

      //insert cases into related_files for checking isUserProject when downloading
      _.forEach(file.related_files, (related_file) => {
        related_file['cases'] = file.cases;
      });

      if (file.downstream_analyses) {
        file.downstream_analyses = file.downstream_analyses.reduce(
          (prev, curr) =>
            prev.concat((curr.output_files || []).map(x =>
              _.extend({}, x, {
                workflow_type: curr.workflow_type,
                cases: file.cases.slice()
              }))
            ),
          []
        );
      }
    }

	//TODO: mschor: hard-coded file_id throughout is field that adds files to cart
    isInCart(): boolean {
      return this.CartService.isInCart(this.file.file_id);
    }

    handleCartButton(): void {
      if (this.CartService.isInCart(this.file.file_id)) {
        this.CartService.remove([this.file]);
      } else {
        this.CartService.addFiles([this.file], true);
      }
    }

    canBAMSlice(): boolean {
      return (this.file.data_type || '').toLowerCase() === 'aligned reads' &&
             (this.file.index_files || []).length != 0 &&
             (this.file.data_format.name || '').toLowerCase() === 'bam';
    }

    makeSearchPageLink(files: any[] = []): any {
      if (files.length) {
        var filterString = this.$filter("makeFilter")([{
          field: 'files.file_id',
          value: files.map(f => f.file_id)
        }], true);
        var href = 'search/f?filters=' + filterString;
        return files.length ? "<a href='" + href + "'>" + files.length + '</a>' : '0';
      }
    }

  }

  class BAMSlicingController {

    exampleShowing: boolean = false;
    /* @ngInject */
    constructor (private $uibModalInstance,
                 private $scope: ng.IScope,
                 private FilesService: IFilesService,
                 public file: any,
                 private GqlService: IGqlService,
                 public completeCallback: any,
                 private inProgress: any,
                 private downloader: any
    ) {
      this.$scope['bedModel'] = "";
    }

    submit(): void {
      this.FilesService.sliceBAM(
        this.file.file_id,
        this.$scope['bedModel'],
        this.completeCallback,
        this.inProgress,
        this.downloader);
      this.$uibModalInstance.close('slicing');
    }

    allowTab($event: any): void {
      if ($event.keyCode === 9) {
        $event.preventDefault();

        // current caret pos
        var start = $event.target.selectionStart;
        var end = $event.target.selectionEnd;

        var oldValue = this.$scope['bedModel'];
        this.$scope['bedModel'] = oldValue.substring(0, start) + '\t' + oldValue.substring(end);
        // put caret in correct place
        this.GqlService.setPos($event.target, start+1);
      }
    }

    toggleExample() {
      this.exampleShowing = !this.exampleShowing;
    }

    closeModal(): void {
      this.$uibModalInstance.close('cancelled');
    }
  }

  class BAMFailedModalController {
    errorBlobString: string;
    msg400: string = "Invalid BED Format. Please refer to the examples described in the BAM Slicing pop-up.";
    /* @ngInject */
    constructor(private $uibModalInstance,
                public errorStatus: string,
                public errorStatusText: string,
                private errorBlob: Blob) {
      this.errorBlobString = "";
      var reader = new FileReader();
      reader.addEventListener("loadend", () => {
        this.errorBlobString = (<any>_).get(JSON.parse(String(reader.result)), "error", "Error slicing");
      });
      reader.readAsText(errorBlob);
    }
  }

  angular
      .module("files.controller", [
        "files.services"
      ])
      .controller("BAMSlicingController", BAMSlicingController)
      .controller("BAMFailedModalController", BAMFailedModalController)
      .controller("FileController", FileController);
}
