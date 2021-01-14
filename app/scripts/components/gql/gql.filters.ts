module ngApp.components.gql.filters {

  function GqlHighlight() {
    return function (value: string, query: string): string {
      return (value || '').replace(query, '<strong>' + query + '</strong>');
    };
  }

  angular.module("gql.filters", [])
    .filter("gqlHighlight", GqlHighlight)
}
