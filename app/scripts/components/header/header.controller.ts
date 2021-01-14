module ngApp.components.header.controllers {

  import ICartService = ngApp.cart.services.ICartService;
  import ICoreService = ngApp.core.services.ICoreService;
  import IUserService = ngApp.components.user.services.IUserService;

  export interface IHeaderController {
    bannerDismissed: boolean;
    isCollapsed: boolean;
    currentLang: string;
    addedLanguages: boolean;
    languages: any;
    cookieEnabled: any;

    getToken(): void;
    collapse(event: any): void;
    toggleCollapsed(): void;
    setLanguage(): void;
    shouldShowOption(option: string): boolean;
    dismissBanner(): void;
    showBannerModal(): void;
    // getNumCartItems(): number;
  }

  class HeaderController implements IHeaderController {
    bannerDismissed: boolean;
    isCollapsed: boolean = true;
    currentLang: string = "en";
    addedLanguages: boolean = false;
    languages: any = {
      "en": "English",
      "fr": "French",
      "es": "Spanish"
    };
    cookieEnabled: any;

    /* @ngInject */
    constructor(
      private gettextCatalog,
      private CartService: ICartService,
      private $state: ng.ui.IStateService,
      private UserService: IUserService,
      private $uibModal: any,
      private $window: ng.IWindowService,
      private $rootScope: ngApp.IRootScope,
      private $uibModalStack,
      private config: any,
      private CoreService: ngApp.core.services.ICoreService
    ) {
      // this.config = this.CoreService.getComponentFromConfig('navbar');
      this.config = $rootScope.config;

      this.addedLanguages = !!_.keys(gettextCatalog.strings).length;
      this.cookieEnabled = navigator.cookieEnabled;
      this.bannerDismissed = true;
    }

    getToken(): void {
      this.UserService.getToken();
    }

    collapse(event: any): void {
      if (event.which === 1 || event.which === 13) {
        this.isCollapsed = true;
      }
    }

    toggleCollapsed(): void {
      this.isCollapsed = !this.isCollapsed;
    }

    setLanguage(): void {
      this.gettextCatalog.setCurrentLanguage(this.currentLang);
    }

    shouldShowOption(option: string): boolean {
      var showOption = true,
          currentState = (<any>_).get(this.$state, 'current.name', '').toLowerCase();

      switch(option.toLowerCase()) {
        case 'quick-search':
          if (currentState === 'home') {
            showOption = false;
          }
          break;
        case 'my-projects':
          if (currentState === 'home') {
            showOption = false;
          }
          break;
        default:
          break;
      }

      return showOption;
    }

    dismissBanner(): void {
      this.bannerDismissed = true;
      this.$rootScope.$emit('hideBanner');
    }

    showBannerModal(): void {
      if (!this.$uibModalStack.getTop()) {
        this.$uibModal.open({
          templateUrl: "core/templates/modal.html",
          controller: "WarningController",
          controllerAs: "wc",
          backdrop: "static",
          keyboard: false,
          backdropClass: "warning-backdrop",
          animation: false,
          size: "lg",
          windowClass: "banner-modal",
          resolve: {
            warning: () => `
              <div>
                <h2 class="banner-title">
                  Can't find your data?
                  <span class="banner-title-link">
                    You may be looking for the
                    <a href="https://gdc-portal.nci.nih.gov/legacy-archive/search/f" target="_blank">GDC Legacy Archive</a>.
                  </span>
                </h2>
                <div>
                  Data in the GDC Data Portal
                  has been harmonized using GDC Bioinformatics Pipelines whereas data in the
                  GDC Legacy Archive is an unmodified copy of data that was previously stored
                  in CGHub and in the TCGA Data Portal hosted by the TCGA Data Coordinating Center (DCC).
                  Certain previously available data types and formats are not currently supported by
                  the GDC Data Portal and are only distributed via the GDC Legacy Archive.
                  <br>
                  <br>
                  Check the <a href="https://gdc-docs.nci.nih.gov/Data/Release_Notes/Data_Release_Notes/" target="_blank">Data Release Notes</a> for additional details.
                </div>
              </div>
            `,
            header: null
          }
        });
      }
    }

  }

  angular
      .module("header.controller", ["cart.services", "user.services"])
      .controller("HeaderController", HeaderController);
}
