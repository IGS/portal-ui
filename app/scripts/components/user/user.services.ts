module ngApp.components.user.services {
  import IUser = ngApp.components.user.models.IUser;
  import ILocationService = ngApp.components.location.ILocationService;
  import IGDCConfig = ngApp.IGDCConfig;
  import INotifyService = ng.cgNotify.INotifyService;

  interface WindowService extends ng.IWindowService {
    saveAs: any;
    moment: any;
  }  
  
  export interface IUserService {
    login(): void;
    setUser(user: IUser): void;
    addToQueries(q:string): void;
    addToHrefs(h:string): void;
    addToScounts(s:string): void;
    addToFcounts(f:string): void;
    addToComments(c:string): void;
    addToTimestamps(t:string): void;
    toggleFilter(): void;
    addMyProjectsFilter(filters: any, key: string): any;
    isUserProject(file: any): boolean;
    currentUser: IUser;
    userCanDownloadFiles(files: any[]): boolean;
    getToken(): void;
    hasProjects(): boolean;

    setUserProjectsTerms(terms: any): void;
    userCanDownloadFile(file: any): any;
  }

  const broadcastReset = (context) => {
    context.$rootScope.$broadcast("gdc-user-reset");
  };

  class UserService implements IUserService {
    currentUser: IUser;
    isFetching: boolean = false;



    /* @ngInject */
    constructor(private AuthRestangular: Restangular.IService,
                private $rootScope: ng.IRootScopeService,
                private LocationService: ILocationService,
                private $cookies: ng.cookies.ICookiesService,
                // private $window: ng.IWindowService, //NOTE removed to resolve saveAs and moment TS errors
                private $window: WindowService,
                private $uibModal: any,
                private notify: INotifyService,
                private config: IGDCConfig,
                private $log: ng.ILogService) {
      if (!config['site-wide']['fake-auth']) {
        this.setUser({
          username: "USER",
          projects: {
            // phs_ids: { //NOTE Dustin removed to resolve TS error.
            //   phs000178: ["_member_", "read", "delete"]
            // },
            gdc_ids: {
              "TCGA-LAML": ["read", "delete", "read_report", "_member_"],
              "CGCI-BLGSP": ["read_report"],
              "TCGA-DEV1": ["read", "delete", "_member_"]
            }
          }
        });
      }
    }

    login(): void {
      if (!this.isFetching) {
        this.isFetching = true;
        this.AuthRestangular.all("user")
        .withHttpConfig({
          withCredentials: true
        })
        .post({}, {})
        .then((data) => {
            this.setUser(data);
        // }, (response) => { //changed to due 1.7.0
        }).catch( (response) => {
          if (response && response.status === 401) {
            if (this.currentUser) {
              this.currentUser = undefined;
              this.notify({
                message: "",
                messageTemplate: "<span data-translate>Session expired or unauthorized.</span>",
                container: "#notification",
                classes: "alert-warning"
              });
            }
          } else {
            const status = (response || {status: undefined}).status;
            this.$log.error(`Error logging in, response status ${status}`);
          }
        })
        .finally(() => this.isFetching = false);
      }
    }

    loginPromise() {
      return this.AuthRestangular.all("user")
        .withHttpConfig({
          withCredentials: true
        })
        .post({}, {});
    }

    logout(): void {
      broadcastReset(this);
      this.currentUser = undefined;
    }

    getToken(): void {
      // TODO: We need to come up with a solution for exporting/downloading
      // that will work with IE9 when auth tokens are required.
      // TODO: Make this code reusable.
      if (this.$window.URL && this.$window.URL.createObjectURL) {
        this.AuthRestangular.all("token")
        .withHttpConfig({
          // responseType: "blob", //NOTE TS semantic error: responseType type: string is not assignable to parameter of type 'IRequestConfig'
          withCredentials: true
        })
        .getList("", {})
        .then((file) => {
          // This endpoint receives the header 'content-disposition' which our Restangular
          // setup alters the data.
          this.$window.saveAs(file['data'], "gdc-user-token." + this.$window.moment().format() + ".txt");
        // }, (response) => { //changed to due 1.7.0
        }).catch((response) => {
          console.log('User session has expired.', response);

          const modalInstance = this.$uibModal.open({ //NOTE added 'this' to resolve TS error
            templateUrl: "core/templates/session-expired.html",
            controller: "LoginToDownloadController",
            controllerAs: "wc",
            backdrop: true,
            keyboard: true,
            //scope: scope, //NOTE. removed to resolve TS error. Only place 'scope' is used. TS semantic error cannot find name 'scope'
            size: "lg",
            animation: false
          });

          // modalInstance.result.then(() => UserService.logout());
          modalInstance.result.then(() => this.logout()); //NOTE resolves TS error
          });
      }
    }

    setUser(user: IUser): void {
      if (user.queries == null) {
        user.queries = [];
      }
      if (user.hrefs == null) {
        user.hrefs = [];
      }
      if (user.scounts == null) {
        user.scounts = [];
      }
      if (user.fcounts == null) {
        user.fcounts = [];
      }
      if (user.comments == null) {
        user.comments = [];
      }
      if (user.timestamps == null) {
        user.timestamps = [];
      }

      this.currentUser = {
        username: user.username,
        isFiltered: (<any>_).get(this, 'currentUser.isFiltered', false),
        queries: user.queries,
        hrefs: user.hrefs,
        scounts: user.scounts,
        fcounts: user.fcounts,
        comments: user.comments,
        timestamps: user.timestamps,
        projects: {
          gdc_ids: (<any>_).reduce(user.projects.gdc_ids || {}, (acc, p, key) => {
            if (p.indexOf("_member_") !== -1) {
              acc.push(key);
            }
            return acc;
          }, [])
        }
      };

      broadcastReset(this);
    }

    addToQueries(q:string): void {
      this.currentUser.queries.push(q);
    }

    addToHrefs(h:string): void {
      this.currentUser.hrefs.push(h);
    }

    addToScounts(s:string): void {
      this.currentUser.scounts.push(s);
    }

    addToFcounts(f:string): void {
      this.currentUser.fcounts.push(f);
    }

    addToComments(c:string): void {
      this.currentUser.comments.push(c);
    }

    addToTimestamps(t:string): void {
      this.currentUser.timestamps.push(t);
    }

    toggleFilter(): void {
      broadcastReset(this);
    }

    hasProjects(): boolean {
      if(!this.currentUser) {
        return false;
      }
      var projects = (<any>_).get(this.currentUser.projects, 'gdc_ids', []);
      return projects.length > 0;
    }

    isUserProject(file: any): boolean {
      if (!this.currentUser) {
        return false;
      }

      var projectIds;

      // Support multiple use cases
      if (file.projects) {
        projectIds = (<any>_).uniq((<any>_).map(file.projects, p => p.project_id || p));
      } else {
        projectIds = (<any>_).uniq((<any>_).map(file.cases, (participant) => {
          return participant.project.project_id;
        }));
      }

      return !!(<any>_).intersection(projectIds, this.currentUser.projects.gdc_ids).length;
    }

    setUserProjectsTerms(terms) {
      if (!this.currentUser || !this.currentUser.isFiltered) {
        return terms;
      }

      return (<any>_).filter(terms, (term) => {
        return this.isUserProject({
          cases: [
            {
              project: {
                project_id: term.key
              }
            }
          ]
        });
      });
    }

    userCanDownloadFile(file: any) {
      return this.userCanDownloadFiles([file]);
    }

    userCanDownloadFiles(files: any[]) {
      return (<any>_).every(files, (file) => {
        if (file.access === "open") {
          return true;
        }

        if (file.access !== "open" && !this.currentUser) {
          return false;
        }

        if (this.isUserProject(file)) {
          return true;
        }
      });
    }

	//TODO: mschor: important: search for addMyProjectsFilter on *.ts to find who is calling this and fix hardcoded calls
    addMyProjectsFilter(filters: any, key: string): any {
      if (this.currentUser && this.currentUser.isFiltered &&
          (<any>_).get(this.currentUser.projects, "gdc_ids", []).length) {
        var userProjects = {
          content: {
            field: key,
            value: this.currentUser.projects.gdc_ids
          },
          op: "in"
        };

        if (!filters.content) {
          filters.content = [userProjects];
          filters.op = "and";
        } else {
          var projectFilter = _.find(filters.content, (filter: any) => {
            if (filter.content.field === key) {
              return filter;
            }

            return null;
          });

          if (!projectFilter) {
            filters.content.push(userProjects);
          } else {
            var projects = this.currentUser.projects.gdc_ids;

            var sharedValues = (<any>_).intersection(projectFilter.content.value, projects);

            // If any of the projects selected belong to the user, stick with those rather then defaulting
            // to all of the users projects.
            if (sharedValues.length) {
              projectFilter.content.value = sharedValues;
            } else {
              // User is trying to search on only projects that aren't in their list.
              projectFilter.content.value = [""];
            }
          }
        }

      }
      return filters;
    }

  }

  angular
      .module("user.services", ["restangular", "location.services", "ngCookies", "ui.bootstrap"])
      .service("UserService", UserService);
}
