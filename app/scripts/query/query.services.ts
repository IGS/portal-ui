module ngApp.query.services {

  export interface ITab {
    active: boolean;
    hasLoadedOnce: boolean;
  }

  export interface ITabs {
    summary: ITab;
    participants: ITab;
    files: ITab;
  }

  export interface IQueryState {
    tabs: ITabs;
    setActive(tab: string, key: string): void;
  }

  class QState implements IQueryState {
    tabs: ITabs = {
      summary: {
        active: false,
        hasLoadedOnce: false
      },
      participants: {
        active: false,
        hasLoadedOnce: false
      },
      files: {
        active: false,
        hasLoadedOnce: false
      }
    };

    setActive(tab: string, key: string) {
      if (tab) {
        if (key === "active") {
          _.forEach(this.tabs, (t: ITab) => {
            t.active = false;
          });

          this.tabs[tab].active = true;
        } else {
          this.tabs[tab].hasLoadedOnce = true;
        }
      }
    }
  }

  angular
      .module("query.services", [])
      .service("QState", QState);
}
