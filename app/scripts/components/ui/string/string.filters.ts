/*

Custom filters are defined here. Each filter must be defined twice if it is to be used in directives/controllers AND in the templates. 

Why: The original writers use the filters in both the directives/controllers AND templates. Originally, the filters were written as classes for the templates (and they worked well). They also called these filter classes in the directives/controllers, but this resulted in TypeScript errors.

Solution (meant to temporary): Add a function for each filter to be used by the directives/controllers. See github post below:

  https://gist.github.com/bcherny/8f35f5e5ff62b09ce7b3ef9cbf637ee9

(UPDATE 1-7-2020 DOLLEY: The classes used in the templates have been converted to functions. This is because the typings for AngularJS have been upgraded)

Example: humanify filter:
  1) humanify - Used by angular directives and controllers 
           - defined as function humanify()
            useage: $filter('humanify)(item.name)
  2) Humanify - Used in templates 
        - defined as function Humanify()
        - useage: {{ item.name | humanify }}

*/

module ngApp.components.ui.string {
  import IFilterService = ng.IFilterService;

  export class FilterField {
    field: string;
    value: string | any;
  }

  // differs from angular's uppercase by not uppering miRNA
  function Capitalize() {
    return (original: string) => {
      return original.split(' ').map(function (word) {
        return word.indexOf("miRNA") === -1
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word
      }).join(' ');
    };
  }

  function Superscript() {
    return (original: string): string => original.replace(/\^(\d*)/, '<sup>$1</sup>');
  }

  /* 
    The following functions are used within the AngularJS code (controllers/directives)
  */
  export function humanify(original: any, capitalize: boolean = true, facetTerm: boolean = false) {
    return function () {
      // use `--` for null, undefined and empty string
      if (original === null || original === undefined || (angular.isString(original) && original.length === 0)) {
        return '--';
        // return all other non-strings
      } else if (!angular.isString(original)) return original;

      var humanified = "";

      if (facetTerm) {
        // Splits on capital letters followed by lowercase letters to find
        // words squished together in a string.
        original = original.split(/(?=[A-Z][a-z])/).join(" ");
        humanified = original.replace(/\./g, " ").replace(/_/g, " ").trim();
      } else {
        var split = original.split(".");
        humanified = split[split.length - 1].replace(/_/g, " ").trim();

        // Special case 'name' to include any parent nested for sake of
        // specificity in the UI
        if (humanified === "name" && split.length > 1) {
          humanified = split[split.length - 2] + " " + humanified;
        }
      }

      return capitalize
        ? Capitalize()(humanified) : humanified;
    }
  }

  export function ellipsicate(fullstring: string, length: number = 50) {
    return function () {
      if (fullstring) {
        return (fullstring.length <= length) ? fullstring : fullstring.substring(0, length) + "…";
      } else {
        return '';
      }
    };
  }

  export function facetTitlefy(original: string) {
    return function () {
      // chop string until last biospec entity
      var biospecEntities = ['samples', 'portions', 'slides', 'analytes', 'aliquots'];
      var startAt = biospecEntities.reduce((lastIndex, b) => {
        var indexOf = original.indexOf(b);
        return indexOf > lastIndex ? indexOf : lastIndex;
      }, 0);
      var chopped = original.substring(startAt);
      // Splits on capital letters followed by lowercase letters to find
      // words squished together in a string.
      return Capitalize()(chopped.split(/(?=[A-Z][a-z])/)
        .join(" ")
        .replace(/\./g, ' ')
        .replace(/_/g, ' ')
        .trim());
    }
  }

  export function titlefy(s:string) {
    return function () {
      s = (s === undefined || s === null) ? '' : s;
      return s.toString().toLowerCase().replace(/\b([a-z])/g, function (ch) {
        return ch.toUpperCase();
      });
    }
  }

  export function spaceReplace(s: string, replaceWith: string) {
    return function () {
      return s.toString().replace(/\s+/g, replaceWith || '');
    };
  }

  export function dotReplace(s: string, replaceWith: string) {
    return function () {
      return s.toString().replace(/\.+/g, replaceWith || '');
    };
  }

  export function replace(s: string, substr: string, newSubstr: string) {
    return function () {
      return s.toString().replace(substr, newSubstr);
    };
  }

  export function ageDisplay(ageInDays: number, yearsOnly: boolean = false, defaultValue: string = '--') {
    var gettextCatalog: any; //not sure. This was argument of the constructor
    const oneYear = 365.25;
    const leapThenPair = (years: number, days: number): number[] => (days === 365) ? [years + 1, 0] : [years, days];
    const timeString = (number: number, singular: string, plural: string): string =>
      ('' + number + ' ' + gettextCatalog.getPlural(number, singular, plural || singular + 's'));
    // if ES6 is ever used, use `...` instead.
    const _timeString = (<any>_).spread(timeString);

    return function (): string {
      if (!ageInDays) {
        return defaultValue;
      }
      return _.zip(leapThenPair(Math.floor(ageInDays / oneYear), Math.ceil(ageInDays % oneYear)), ['year', 'day'])
        .filter(p => yearsOnly ? p[1] === 'year' : p[0] > 0)
        .map(p => !yearsOnly ? _timeString(p) : p[0])
        .join(' ')
        .trim();
    }
  }

  export function makeFilter(fields: FilterField[], noEscape: boolean) {
    return function () {
      var contentArray = _.map(fields, function (item) {
        var value;

        if (_.isArray(item.value)) {
          value = item.value;
        } else if (item.value) {
          value = item.value.split(",");
        }

        return {
          "op": "in",
          "content": {
            "field": item.field,
            "value": value
          }
        };
      });

      if (contentArray.length === 0) {
        return angular.toJson({});
      }

      var ret = angular.toJson({
        "op": "and",
        "content": contentArray
      });

      if (noEscape) {
        return ret;
      }

      // Still unsure why this causes problems with ui-sref if the stringified
      // JSON doesn't have quotes and other things escaped, but switching to
      // this works in all known cases
      return angular.toJson(ret);
    };
  }

  /*
    These were formerly classes. They were converted to functions when I updated the typings for AngularJS 1.5.
    The following functions are used by the templates.
  */

  function Ellipsicate() {
    return function (fullstring: string, length: number = 50) {
      if (fullstring) {
        return (fullstring.length <= length) ? fullstring : fullstring.substring(0, length) + "…";
      } else {
        return '';
      }
    };
  }

  function Humanify() {
    return function (original: any, capitalize: boolean = true, facetTerm: boolean = false) {
      // use `--` for null, undefined and empty string
      if (original === null || original === undefined || (angular.isString(original) && original.length === 0)) {
        return '--';
      // return all other non-strings
      } else if (!angular.isString(original)) return original;

      var humanified = "";

      if (facetTerm) {
        // Splits on capital letters followed by lowercase letters to find
        // words squished together in a string.
        original = original.split(/(?=[A-Z][a-z])/).join(" ");
        humanified = original.replace(/\./g, " ").replace(/_/g, " ").trim();
      } else {
        var split = original.split(".");
        humanified = split[split.length - 1].replace(/_/g, " ").trim();

        // Special case 'name' to include any parent nested for sake of
        // specificity in the UI
        if (humanified === "name" && split.length > 1) {
          humanified = split[split.length - 2] + " " + humanified;
        }
      }

      return capitalize
        ? Capitalize()(humanified): humanified;
    };
  }

  function FacetTitlefy() {
    return function(original: string) {
      // chop string until last biospec entity
      var biospecEntities = ['samples', 'portions', 'slides', 'analytes', 'aliquots'];
      var startAt = biospecEntities.reduce((lastIndex, b) => {
        var indexOf = original.indexOf(b);
        return indexOf > lastIndex ? indexOf : lastIndex;
      }, 0);
      var chopped = original.substring(startAt);
      // Splits on capital letters followed by lowercase letters to find
      // words squished together in a string.
      return Capitalize()(chopped.split(/(?=[A-Z][a-z])/)
                                  .join(" ")
                                  .replace(/\./g, ' ')
                                  .replace(/_/g, ' ')
                                  .trim());
    }
  }

  function Titlefy() {
    return function(s) {
      s = ( s === undefined || s === null ) ? '' : s;
      return s.toString().toLowerCase().replace( /\b([a-z])/g, function(ch) {
        return ch.toUpperCase();
      });
    }
  }

  function SpaceReplace() {
    return function(s: string, replaceWith: string) {
      return s.toString().replace(/\s+/g, replaceWith || '');
    };
  }

  function DotReplace() {
    return function(s: string, replaceWith: string) {
      return s.toString().replace(/\.+/g, replaceWith || '');
    };
  }

  function Replace() {
    return function(s: string, substr: string, newSubstr: string) {
      return s.toString().replace(substr, newSubstr);
    };
  }

  function AgeDisplay(gettextCatalog: any) {
    const oneYear = 365.25;
    const leapThenPair = (years: number, days: number): number[] => (days === 365) ? [years + 1, 0] : [years, days];
    const timeString = (number: number, singular: string, plural: string): string =>
      ('' + number + ' ' + gettextCatalog.getPlural(number, singular, plural || singular + 's'));
    // if ES6 is ever used, use `...` instead.
    const _timeString = (<any>_).spread(timeString);

    return (ageInDays: number, yearsOnly: boolean = false, defaultValue: string = '--'): string => {
      if (!ageInDays) {
        return defaultValue;
      }
      return _.zip(leapThenPair(Math.floor(ageInDays / oneYear), Math.ceil(ageInDays % oneYear)), ['year', 'day'])
      .filter(p => yearsOnly ? p[1] === 'year' : p[0] > 0)
      .map(p => !yearsOnly ? _timeString(p) : p[0])
      .join(' ')
      .trim();
    }
  }

  function MakeFilter() {
    return function (fields: FilterField[], noEscape: boolean) {
      var contentArray = _.map(fields, function (item) {
        var value;

        if (_.isArray(item.value)) {
          value = item.value;
        } else if (item.value) {
          value = item.value.split(",");
        }

        return {
          "op": "in",
          "content": {
            "field": item.field,
            "value": value
          }
        };
      });

      if (contentArray.length === 0) {
        return angular.toJson({});
      }

      var ret = angular.toJson({
        "op": "and",
        "content": contentArray
      });

      if (noEscape) {
        return ret;
      }

      // Still unsure why this causes problems with ui-sref if the stringified
      // JSON doesn't have quotes and other things escaped, but switching to
      // this works in all known cases
      return angular.toJson(ret);
    };
  }

  //Register for TypeScript (type check)
  export interface ICustomFilterService extends IFilterService {
    (name: "humanify"): typeof humanify;
    (name: "ellipsicate"): typeof ellipsicate;
    (name: "facetTitlefy"): typeof facetTitlefy;
    (name: "titlefy"): typeof titlefy;
    (name: "spaceReplace"): typeof spaceReplace;
    (name: "dotReplace"): typeof dotReplace;
    (name: "replace"): typeof replace;
    (name: "ageDisplay"): typeof ageDisplay;
    (name: "makeFilter"): typeof makeFilter;
    (name: "capitalize"): typeof Capitalize;
    (name: "superscript"): typeof Superscript;
  }

  //Register for AngularJS
  angular.module("string.filters", [])
    // Register functions for use in controllers/directives
    .filter("humanify", () => humanify)
    .filter("ellipsicate", () => ellipsicate)
    .filter("facetTitlefy", () => facetTitlefy)
    .filter("titlefy", () => titlefy)
    .filter("spaceReplace", () => spaceReplace)
    .filter("dotReplace", () => dotReplace)
    .filter("replace", () => replace)
    .filter("ageDisplay", () => ageDisplay)
    .filter("makeFilter", () => makeFilter)
    .filter("capitalize", () => Capitalize)
    .filter("superscript", () => Superscript)
    
    //Register functions for use in templates
    .filter("ellipsicate", Ellipsicate)
    .filter("titlefy", Titlefy)
    .filter("spaceReplace", SpaceReplace)
    .filter("dotReplace", DotReplace)
    .filter("replace", Replace)
    .filter("humanify", Humanify)
    .filter("facetTitlefy", FacetTitlefy)
    .filter("capitalize", Capitalize)
    .filter("ageDisplay", AgeDisplay)
    .filter("superscript", Superscript)
    .filter("makeFilter", MakeFilter);
}