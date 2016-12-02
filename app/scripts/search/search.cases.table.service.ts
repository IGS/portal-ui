module ngApp.search.cases.table.service {

    class SearchCasesTableService {

      /* @ngInject */
      constructor(private DATA_CATEGORIES) {}

      withAnnotationFilter(value: number, filters: Object[], $filter: ng.IFilterService): string {
          var filterString = $filter("makeFilter")(filters, true);
          var href = 'annotations?filters=' + filterString;
          var val = '{{' + value + '|number:0}}';
          return "<a href='" + href + "'>" + val + '</a>';
      }

      withFilter(value: number, filters: Object[], $filter: ng.IFilterService): string {
          var filterString = $filter("makeFilter")(filters, true);
          var href = 'search/f?filters=' + filterString;
          var val = '{{' + value + '|number:0}}';
          return value ? "<a href='" + href + "'>" + val + '</a>' : '0';
      }

      getDataCategory(dataCategories: Object[], dataCategory: string): number {
          var data = _.find(dataCategories, {data_category: dataCategory});
          return data ? data.file_count : 0;
      }

      dataCategoryWithFilters(dataCategory: string, row: Object[], $filter: ng.IFilterService) {
          var fs = [
            {field: 'cases.case_id', value: row.case_id},
            {field: 'files.data_category', value: dataCategory}
          ];
          return this.withFilter(this.getDataCategory(row.summary ? row.summary.data_categories : [], dataCategory), fs, $filter);
      }

      youngestDiagnosis(p: { age_at_diagnosis: number }, c: { age_at_diagnosis: number }): { age_at_diagnosis: number } {
        return c.age_at_diagnosis < p.age_at_diagnosis ? c : p
      }

      model() {
        return {
          title: 'Cases',
          rowId: 'case_id',
          headings: [{
              name: "Cart",
              id: "add_to_cart_filtered",
              td: row => '<add-to-cart-filtered row="row"></add-to-cart-filtered>',
              tdClassName: 'text-center'
          }, {
              name: "Sample ID",
              id: "case_id",
              td: row => '<a href="cases/'+row.case_id + '">' + row.case_id + '</a>',
              sortable: true,
          }, {
              name: "Primary Site",
              id: "project.primary_site",
              td: row => row.project && row.project.primary_site,
              sortable: true
          }, {
              name: 'Study Topic',
              id: 'project.disease_type',
              td: (row, $scope) => row.project && $scope.$filter("humanify")(row.project.disease_type),
              sortable: false,
          }],
          fields: [
            "Project_name",
            "Sample_fma_body_site",
            "Subject_gender",
          ],
          expand: [
            "summary.data_categories",
          ],
          facets: [
            {name: "Project_name", title: "OSDF Projects", collapsed: false, facetType: "terms", removable: false},
            {name: "Sample_fma_body_site", title: "Sample FMA Body Site", collapsed: false, facetType: "terms", removable: false},
            {name: "Subject_gender", title: "Gender", collapsed: false, facetType: "terms", removable: false},
          ]
        };
      }
    }
    angular.module("search.cases.table.service", ["ngApp.core"])
        .service("SearchCasesTableService", SearchCasesTableService);
}
