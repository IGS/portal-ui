module ngApp.projects.table.service {
  type IWithFilterFn = (value: number, filters: ngApp.components.ui.string.FilterField[], $filter: ngApp.components.ui.string.ICustomFilterService) => string;

  class ProjectsTableService {
    projectsTableModel: any;

    /* @ngInject */
    constructor(config: ngApp.IGDCConfig) {
      var projectsConfig = config['projects'];
      const projectsTableTitle = projectsConfig['projects-table']['title'];
      const projectsTableRowId = projectsConfig['projects-table']['row-id'];
      const projectsTableDefaultSort = projectsConfig['projects-table']['default-sort'];
      const projectsFields = projectsConfig['projects-fields'];
      const projectsFacets = projectsConfig['projects-facets'];

      this.projectsTableModel = {
        title: projectsTableTitle,
        rowId: projectsTableRowId,
        fields: projectsFields,
        facets: projectsFacets,
        defaultSort: projectsTableDefaultSort,
        headings: []
      };

      //Build the projects table model from the projects config
      const headingsCount = projectsConfig['projects-table']['headings'].length;
      for (var i = 0; i < headingsCount; i++) {
        const headingName = projectsConfig['projects-table']['headings'][i]['name'];
        const headingId = projectsConfig['projects-table']['headings'][i]['id'];
        const headingSortable = projectsConfig['projects-table']['headings'][i]['sortable'];
        var headingShow = projectsConfig['projects-table']['headings'][i]['show'];
        var thClassName = projectsConfig['projects-table']['headings'][i]['th-classname'];
        var tdClassName = projectsConfig['projects-table']['headings'][i]['td-classname'];
        var headingTd: any;

        // Now address columns with specific 'td' needs
        const linkField = projectsConfig['projects-table']['headings'][i]['link-filter-field'];
        const additionalFilters = projectsConfig['projects-table']['headings'][i]['additional-link-filters'];
        
        if (linkField) {
          // Columns with values that contain links
          if (headingId.indexOf("case") !== -1) {
            // case_count
            headingTd = (row, $scope) => {
              var fs = [{ field: linkField, value: row[projectsTableRowId] }]
              return this.withFilter(row[headingId], fs, $scope.$filter);
            };
          } else if (headingId.indexOf("file") !== -1) {
            // file_count
            headingTd = (row, $scope) => {
              var fs = [{ field: linkField, value: row[projectsTableRowId] }]
              return this.withFilterF(row[headingId], fs, $scope.$filter);
            };
          } else {
            // other columns with links (HMBR: study_level_matrix_count)
            headingTd = (row, $scope) => {
              var fs = [];

              if (additionalFilters) {
                var fields = additionalFilters.split(",");
                _.forEach(fields, field => {
                  if (field.indexOf(':') !== -1) {
                    var splitField = field.split(":");
                    var key = splitField[0];
                    var value = splitField[1];
                    fs.push({ field: key, value: value });
                  }
                }); 
              }
              fs.push({ field: linkField, value: row[projectsTableRowId] });

              return this.withFilterF(row[headingId], fs, $scope.$filter);
            };
          }
        } else {
          //All other columns just insert the value
          headingTd = row => row[headingId];
        }

        //Build heading - ng-table expects specific properties. Notes provided for those renamed 
        var heading = {
          title: headingName,                            //'name' changed to 'title'
          field: headingId,                              //'id' changed to 'field'
          td: headingTd,
          sortable: headingSortable ? headingId : false, //ng-table takes heading.field or false
          show: headingShow,                             // 'hidden' changed to 'show': true/false
          thClassName: thClassName,
          tdClassName: tdClassName
        };

        //Add tooltip (if present)
        if (projectsConfig['projects-table']['headings'][i]['tooltip-text']) {
          const tooltipText = projectsConfig['projects-table']['headings'][i]['tooltip-text'];

          if (tooltipText.indexOf('.') !== -1) {
            const toolTipList = projectsConfig['projects-table']['headings'][i]['tooltip-text'].split('\.');
            const toolTipHeading = toolTipList[0];
            const toolTipSubheading = toolTipList[1];
            heading['tooltipText'] = row => row[toolTipHeading][toolTipSubheading];
          } else {
            heading['tooltipText'] = row => row[tooltipText];
          }
        }

        //Add heading to 'headings' list
        this.projectsTableModel['headings'].push(heading);
      }

    } //end constructor

    filterFactory(url: string) : IWithFilterFn {
        return function(value: number, filters: ngApp.components.ui.string.FilterField[], $filter: ngApp.components.ui.string.ICustomFilterService)  {
          var filterString = _.isObject(filters) ? $filter("makeFilter")(filters, true) : null;
          var href = url + (filterString ? "?filters=" + filterString : "");
          var val = $filter("number")(value);
          return value ? "<a href='" + href + "'>" + val + '</a>' : '0';
        };
    }

    withFilterF : IWithFilterFn = this.filterFactory("search/f");
    withFilter : IWithFilterFn = this.filterFactory("search/c");

    model() {
      return this.projectsTableModel;
    }
  }

  angular.module("projects.table.service", [])
      .service("ProjectsTableService", ProjectsTableService);
}
