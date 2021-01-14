module ngApp.participants.controllers {
  import ICoreService = ngApp.core.services.ICoreService;
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IGDCConfig = ngApp.IGDCConfig;

  export interface IParticipantController {
    participant: any;
    annotationIds: string[];
    clinicalFileId: string;
    // DownloadClinicalXML(): void; //NOTE: removed to resolve typescript error. ParticipantController incorrectly implements interface
  }

  class ParticipantController implements IParticipantController {
    annotationIds: string[];
    clinicalFileId: string;

    pluck: any; //type for function?
    activeClinicalTab: string;
    setClinicalTab: any; //type for function?
    clinicalFile: any;
    clinicalDataExportFilters: Object;
    clinicalDataExportExpands: Object[];
    hasNoClinical: boolean;
    clinicalDataExportFileName: string;
    expStratConfig: Object;
    dataCategoriesConfig: Object;
    participantPageConfig: any;

    /* @ngInject */
    constructor(
      public participant: any,
      private CoreService: ICoreService,
      private LocationService: ILocationService,
      private $filter: ngApp.components.ui.string.ICustomFilterService,
      private ExperimentalStrategyNames: string[],
      // private DATA_CATEGORIES,
      private config: IGDCConfig
    ) {

      // Get custom 'cases-page' config
      this.participantPageConfig = CoreService.getComponentFromConfig('cases-page');

      // Flatten sample and subject objects for better accessing their properties in participant.html template
      var flatParticipant = {};
      _.forEach(this.participant, (val, key) => {
        if (typeof (val) === 'object' && key !== 'files') {
          _.forEach(val, (obj_val, obj_prop) => {
            let newFieldName = key + '_' + obj_prop;
            flatParticipant[newFieldName] = obj_val;
          });
        } else {
          flatParticipant[key] = val;
        }
      });
      this.participant = flatParticipant;
      CoreService.setPageTitle(this.participantPageConfig['page-title'], participant.case_id);

      this.pluck = (array, property) => array.map(x => x[property]);

      this.activeClinicalTab = 'demographic';
      this.setClinicalTab = (tab) => {
        this.activeClinicalTab = tab;
      };

      this.annotationIds = _.map(this.participant.annotations, (annotation) => {
        console.log('annotation_id: ', String(annotation.id));
        return String(annotation.id);
      });

      this.clinicalFile = _.find(this.participant.files, (file) => {
        return (file.data_subtype || '').toLowerCase() === "clinical data";
      });
/*
      this.experimentalStrategies = _.reduce(ExperimentalStrategyNames.slice(), function(result, name) {
        var strat = _.find(participant.summary.experimental_strategies, (item) => {
          return item.experimental_strategy.toLowerCase() === name.toLowerCase();
        });

        if (strat) {
          result.push(strat);
        }

        return result;
      }, []);
*/

      this.clinicalDataExportFilters = {
        'cases.case_id': participant.case_id
      };
      this.clinicalDataExportExpands = ['demographic', 'diagnoses', 'diagnoses.treatments', 'family_histories', 'exposures'];
      this.hasNoClinical = ! this.clinicalDataExportExpands.some((field: string) => (participant[field] || []).length > 0);
      this.clinicalDataExportFileName = 'clinical.case-' + participant.case_id;

      // DOLLEY: Not used. Removed, yet remaining for now
      /*
      this.dataCategories = Object.keys(this.DATA_CATEGORIES).reduce((acc, key) => {
        var type = _.find(participant.summary.data_categories, (item) =>
          item.data_category === this.DATA_CATEGORIES[key].full
        );

        return acc.concat(type || {
          data_category: this.DATA_CATEGORIES[key].full,
          file_count: 0
        });
      }, []);
      */

      this.expStratConfig = {
        sortKey: "file_count",
        displayKey: "experimental_strategy",
        defaultText: "experimental strategy",
        pluralDefaultText: "experimental strategies",
        hideFileSize: true,
        noResultsText: "No files with Experimental Strategies",
        state: {
          name: "search.files"
        },
        filters: {
          "default": {
            params: {
              filters: function(value) {
                return $filter("makeFilter")([
                  {
                    field: "cases.case_id",
                    value: [
                      participant.case_id
                    ]
                  },
                  {
                    field: "files.experimental_strategy",
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

      this.dataCategoriesConfig = {
        sortKey: "file_count",
        displayKey: "data_category",
        defaultText: "data category",
        hideFileSize: true,
        pluralDefaultText: "data categories",
        state: {
          name: "search.files"
        },
        blacklist: ["structural rearrangement", "dna methylation"],
        filters: {
          "default": {
            params: {
              filters: function(value) {
                return $filter("makeFilter")([
                  {
                    field: "cases.case_id",
                    value: [
                      participant.case_id
                    ]
                  },
                  {
                    field: "files.data_category",
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

/*
      // add project information to files for checking cart access
      this.participant.files = this.participant.files.map(x =>
        _.extend(x, { cases: [{ project: this.participant.project }] })
      )
*/

    }

  }

  angular
      .module("participants.controller", [
        "participants.services",
        "core.services"
      ])
      .controller("ParticipantController", ParticipantController);
}
