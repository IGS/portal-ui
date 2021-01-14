module ngApp.search.files.table.service {

    class SearchFilesTableService {
      filesTableModel: any;

      /* @ngInject */
      constructor(config: ngApp.IGDCConfig) {
          var searchConfig = config['search'];
          const filesTableTitle = searchConfig['files-table']['title'];
          const filesTableRowId = searchConfig['files-table']['row-id'];
          const filesTableDefaultSort = searchConfig['files-table']['default-sort'];
          const filesFields = searchConfig['files-fields'];
          const filesFacets = searchConfig['files-facets'];

          this.filesTableModel = {
            expand: [
              "summary.data_categories",
            ],
            title: filesTableTitle,
            rowId: filesTableRowId,
            fields: filesFields,
            facets: filesFacets,
            defaultSort: filesTableDefaultSort,
            headings: [{
                // For Files table
                th: '<add-to-cart-all-dropdown data-files="data" data-size="{{ paging.total }}" />',
                title: 'Add to Cart',
                field: "file_actions",
                show: true,
                sortable: false,
                tdClassName: 'text-center',
                td: row => '<add-to-cart-single-icon file="row" style="margin-right:5px"></add-to-cart-single-icon>'
              },
              {
                // For Cart table
                title: "Action",
                field: "file_actions",
                show: true,
                sortable: false,
                tdClassName: "text-center",
                td: row => '<remove-single-cart file="row" />'
              }]
          };

          const headingsCount = searchConfig['files-table']['headings'].length;
          for (var i=0; i<headingsCount; i++) {
            const headingName = searchConfig['files-table']['headings'][i]['name'];
            const headingId = searchConfig['files-table']['headings'][i]['id'];
            const headingSortable = searchConfig['files-table']['headings'][i]['sortable'];
            const headingShow = searchConfig['files-table']['headings'][i]['show'];
            var thClassName = searchConfig['files-table']['headings'][i]['th-classname'];
            var tdClassName = searchConfig['files-table']['headings'][i]['td-classname'];
            var headingTd: any;

            // Address columns with specific 'td' needs
            if (headingId == searchConfig['files-table']['row-id']) {
              headingTd = row => '<a href="files/' + row[headingId] + '">' + row[headingId] + '</a>';
            }
            else if (headingId.indexOf('.') != -1) {
              // For nested values like 'project.primary_site'
              //   heading = neo4j label (node)
              //   subheading = neo4j label property
              const headingIdList = headingId.split('\.');
              const heading = headingIdList[0];
              const subheading = headingIdList[1];

              if (subheading.indexOf("filename") != -1 || subheading.indexOf("file_name") != -1) {
                headingTd = row => '<a href="files/' + row[searchConfig['files-table']['row-id']] + '">' + row[heading][subheading] + '</a>';
              }
              else if (subheading.indexOf("private") != -1) {
                headingTd = row => {
                  var val = row[heading][subheading] === true ? 'Controlled' : 'Open';
                  return '<i class="fa fa-' + (row[heading][subheading] === true ? 'lock' : 'unlock-alt') + '"></i> ' + val;
                }
              }
              else if (subheading.indexOf("size") != -1) {
                headingTd = (row, $scope) => $scope.$filter("size")(row[heading][subheading]); 
              }
              else {
                headingTd = (row, $scope) => row[heading][subheading]; //&& $scope.$filter('humanify')(row[heading][subheading]);
              }
            }
            else {
              headingTd = (row, $scope) => row[headingId] && $scope.$filter('humanify')(row[headingId]);
            }

            //Build heading - ng-table expects specific properties. Notes provided for those renamed
            var heading = {
              title: headingName,                             //'name' changed to 'title'
              field: headingId,                               //'id' changed to 'field'
              td: headingTd,
              sortable: headingSortable ? headingId : false, //ng-table takes heading.field or false
              show: headingShow,                             //'hidden' changed to 'show': true/false
              thClassName: thClassName,
              tdClassName: tdClassName
            };

            //Add tooltip (if present)
            if (searchConfig['files-table']['headings'][i]['tooltip-text']) {
              const toolTipList = searchConfig['files-table']['headings'][i]['tooltip-text'].split('\.');
              const toolTipHeading = toolTipList[0];
              const toolTipSubheading = toolTipList[1];
              heading['tooltipText'] = row => row[toolTipHeading][toolTipSubheading];
            }

            //Add heading to 'headings' list
            this.filesTableModel['headings'].push(heading);
          }
      }

      withAnnotationFilter(value: number, filters: ngApp.components.ui.string.FilterField[], $filter: ngApp.components.ui.string.ICustomFilterService): string {
          var filterString = $filter("makeFilter")(filters, true);
          var href = 'annotations?filters=' + filterString;
          var val = '{{' + value + '|number:0}}';
          return "<a href='" + href + "'>" + val + '</a>';
      }

      withFilter(value: number, filters: ngApp.components.ui.string.FilterField[], $filter: ngApp.components.ui.string.ICustomFilterService): string {
          var filterString = $filter("makeFilter")(filters, true);
          var href = 'search/f?filters=' + filterString;
          var val = '{{' + value + '|number:0}}';
          return value ? "<a href='" + href + "'>" + val + '</a>' : '0';
      }

      getDataCategory(dataCategories: any[], dataCategory: string): number {
          var data = _.find(dataCategories, function(d){return d.data_category === dataCategory});
          return data ? data.file_count : 0;
      }

      // TODO: VSS.id may be causing trouble here. Investigate
      dataCategoryWithFilters(dataCategory: string, row: any, $filter: ngApp.components.ui.string.ICustomFilterService) {
          var fs = [
            {field: 'files.file_id', value: row.VSS.id},
            {field: 'files.data_category', value: dataCategory}
          ];
          return this.withFilter(this.getDataCategory(row.summary ? row.summary.data_categories : [], dataCategory), fs, $filter);
      }

      youngestDiagnosis(p: { age_at_diagnosis: number }, c: { age_at_diagnosis: number }): { age_at_diagnosis: number } {
        return c.age_at_diagnosis < p.age_at_diagnosis ? c : p
      }

      model(cart:boolean) {
      
        // by default, the model has both the first column for the files table and the first column for the cart table
        // if on the cart page, use same model, except remove the first column
        // else, on the files table, remove the second column
       
        var model = _.cloneDeep(this.filesTableModel);

        if (cart) {
            model.headings.splice(0, 1);
        } else {
            model.headings.splice(1, 1);// (model.headings.slice(0,1)).concat(model.headings.slice(2));
        }
        return model;
        
      } // end model
    } // end class SearchFilesTableService
    angular.module("search.files.table.service", ["ngApp.core"])
        .service("SearchFilesTableService", SearchFilesTableService);
}
