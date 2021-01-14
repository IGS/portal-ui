module ngApp.search.cases.table.service {

    class SearchCasesTableService {
      casesTableModel: any;

      /* @ngInject */
      constructor(config: ngApp.IGDCConfig) {
          var searchConfig = config['search'];
          const casesTableTitle = searchConfig['cases-table']['title'];
          const casesTableRowId = searchConfig['cases-table']['row-id'];
          const casesTableDefaultSort = searchConfig['cases-table']['default-sort'];
          const casesFields = searchConfig['cases-fields'];
          const casesFacets = searchConfig['cases-facets'];

          this.casesTableModel = {
            expand: [
              "summary.data_categories",
            ],
            title: casesTableTitle,
            rowId: casesTableRowId,
            fields: casesFields,
            facets: casesFacets,
            defaultSort: casesTableDefaultSort,
            headings: [{
                  title: "Cart",
                  field: "add_to_cart_filtered",
                  td: row => '<add-to-cart-filtered row="row"></add-to-cart-filtered>',
                  show: true,
                  sortable: false,
                  tdClassName: 'text-center'
              }]
          };

          const headingsCount = searchConfig['cases-table']['headings'].length;
          for (var i=0; i<headingsCount; i++) {
            const headingName = searchConfig['cases-table']['headings'][i]['name'];
            const headingId = searchConfig['cases-table']['headings'][i]['id'];
            const headingSortable = searchConfig['cases-table']['headings'][i]['sortable'];
            const headingShow = searchConfig['cases-table']['headings'][i]['show'];
            var thClassName = searchConfig['cases-table']['headings'][i]['th-classname'];
            var tdClassName = searchConfig['cases-table']['headings'][i]['td-classname'];
            var headingTd: any;

            // TODO: mschor: This should be copied to the analogous files code
            // Address columns with specific 'td' needs
            if (headingId == searchConfig['cases-table']['linked-field']) {
              if (headingId.indexOf('.') != -1) {
                // For nested values like 'project.primary_site'
                const headingIdList = headingId.split('\.');
                const heading = headingIdList[0];
                const subheading = headingIdList[1];
                headingTd = row => '<a href="cases/' + row[casesTableRowId] + '">' + row[heading][subheading] + '</a>';
              }
              else {
                headingTd = row => '<a href="cases/' + row[headingId] + '">' + row[headingId] + '</a>';
              }
            }
            else if (headingId.indexOf('.') != -1) {
              // For nested values like 'project.primary_site'
              const headingIdList = headingId.split('\.');
              const heading = headingIdList[0];
              const subheading = headingIdList[1];

              headingTd = (row, $scope) => row[heading][subheading] && $scope.$filter('humanify')(row[heading][subheading]);
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
            if (searchConfig['cases-table']['headings'][i]['tooltip-text']) {
              const toolTipList = searchConfig['cases-table']['headings'][i]['tooltip-text'].split('\.');
              const toolTipHeading = toolTipList[0];
              const toolTipSubheading = toolTipList[1];
              heading['tooltipText'] = row => row[toolTipHeading][toolTipSubheading];
            }

            //Add heading to 'headings' list
            this.casesTableModel['headings'].push(heading);
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
          
          //return value ? "<a href='" + href + "'>" + val + '</a>' : '0';
          return "<a href='" + href + "'>" + val + '</a>';
      }

      getDataCategory(dataCategories: any[], dataCategory: string): number {
          var data = _.find(dataCategories, function(d){ return d.data_category === dataCategory});
          return data ? data.file_count : 0;
      }

      //TODO: mschor: not sure what this is doing, but probably want to just remove it
      dataCategoryWithFilters(dataCategory: string, row: any, $filter: ngApp.components.ui.string.ICustomFilterService) {
          var fs = [
            {field: 'cases.case_id', value: row.VSS.id},
            {field: 'files.data_category', value: dataCategory}
          ];
          return this.withFilter(this.getDataCategory(row.summary ? row.summary.data_categories : [], dataCategory), fs, $filter);
      }

      //TODO: mschor: not sure what this is doing, but probably want to just remove it
      youngestDiagnosis(p: { age_at_diagnosis: number }, c: { age_at_diagnosis: number }): { age_at_diagnosis: number } {
        return c.age_at_diagnosis < p.age_at_diagnosis ? c : p
      }

      model() {
        return this.casesTableModel;
      } // end model
    } // end class SearchCasesTableService
    angular.module("search.cases.table.service", ["ngApp.core"])
        .service("SearchCasesTableService", SearchCasesTableService);
}
