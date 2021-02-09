// @flow

import React from 'react';
import {
  compose,
  lifecycle,
  pure,
  setDisplayName,
  withHandlers,
  withState,
} from 'recompose';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

import { dismissNotification, removeNotification } from '@ncigdc/dux/bannerNotification';
import nciGdcLogo from '@ncigdc/theme/images/NHI_GDC_DataPortal-logo.svg';
import HomeLink from '@ncigdc/components/Links/HomeLink';
import AnalysisLink from '@ncigdc/components/Links/AnalysisLink';
import RepositoryLink from '@ncigdc/components/Links/RepositoryLink';
import CartLink from '@ncigdc/components/Links/CartLink';
import ExploreLink, { defaultExploreQuery } from '@ncigdc/components/Links/ExploreLink';
import ProjectsLink from '@ncigdc/components/Links/ProjectsLink';
import GDCAppsDropdown from '@ncigdc/components/GDCApps/GDCAppsDropdown';
import QuickSearch from '@ncigdc/components/QuickSearch/QuickSearch';
import LoginButton from '@ncigdc/components/LoginButton';
import UserDropdown from '@ncigdc/components/UserDropdown';
import Hidden from '@ncigdc/components/Hidden';
import { setModal } from '@ncigdc/dux/modal';
import { forceLogout } from '@ncigdc/dux/auth';

import SessionExpiredModal from '@ncigdc/components/Modals/SessionExpiredModal';
import withRouter from '@ncigdc/utils/withRouter';
import Banner from '@ncigdc/uikit/Banner';
import { withTheme } from '@ncigdc/theme';
import { AnalysisIcon } from '@ncigdc/theme/icons';
import DatabaseIcon from '@ncigdc/theme/icons/Database';
import ManageSetsLink from '@ncigdc/components/Links/ManageSetsLink';
import { Row } from '@ncigdc/uikit/Flex';

import './Header.css';

import features from '../../../features.json';

const styles = {
  activeNavLink: theme => ({
    backgroundColor: theme.greyScale2,
    color: theme.white,
  }),
  iconPadding: {
    paddingRight: '4px',
  },
};

const Header = ({
  dispatch,
  isCollapsed,
  isInSearchMode,
  notifications,
  setIsCollapsed,
  setIsInSearchMode,
  theme,
  user,
}) => (
  <header
    className="navbar navbar-default navbar-static-top"
    id="header"
    role="banner"
    >
    {notifications.map(n => (
      <Banner
        {...n}
        handleOnDismiss={() => dispatch(dismissNotification(n.id))}
        key={n.id}
        />
    ))}

    <div className="container-fluid">
      <div className="navbar-header">
        <button
          className="navbar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          type="button"
          >
          <span className="sr-only test-toggle-navigation">
              Toggle navigation
          </span>
          <span className="icon-bar" />
          <span className="icon-bar" />
          <span className="icon-bar" />
        </button>
        <div className="navbar-brand" style={{padding: 0}}>
          <img alt="Kidney Precision Medicine Project Atlas" src="img/logo.svg" className="logo"/>
        </div>
      </div>

      <nav
        aria-label="Site Navigation"
        className={`navbar-collapse ${isCollapsed ? 'collapse' : ''}`}
        data-uib-collapse="hc.isCollapsed"
        onClick={() => setIsCollapsed(true)}
        style={{ outline: 'none' }}
        tabIndex="-1"
        >
        {features.navTabs.active && (
            <ul className="nav navbar-nav">
              {features.navTabs.tabs.home && (
                  <React.Fragment>
                    <li>
                      <HomeLink activeStyle={styles.activeNavLink(theme)} exact>
                        <i className="fa fa-home" style={styles.iconPadding} />
                        <span className="header-hidden-sm">Home</span>
                        <Hidden>Home</Hidden>
                      </HomeLink>
                    </li>
                  </React.Fragment>
              )}
              {features.navTabs.tabs.projects && (
                  <React.Fragment>
                    <li>
                      <ProjectsLink activeStyle={styles.activeNavLink(theme)} exact>
                        <i className="icon-gdc-projects" style={styles.iconPadding} />
                        <span className="header-hidden-sm">Projects</span>
                        <Hidden>Projects</Hidden>
                      </ProjectsLink>
                    </li>
                  </React.Fragment>
              )}
              {features.navTabs.tabs.exploration && (
                  <React.Fragment>
                    <li>
                      <ExploreLink
                          activeStyle={styles.activeNavLink(theme)}
                          exact
                          query={defaultExploreQuery}
                      >
                        <i className="icon-gdc-data" style={styles.iconPadding} />
                        <span className="header-hidden-sm">Exploration</span>
                        <Hidden>Exploration</Hidden>
                      </ExploreLink>
                    </li>
                  </React.Fragment>
              )}
              {features.navTabs.tabs.analysis && (
                  <React.Fragment>
                    <li>
                      <AnalysisLink activeStyle={styles.activeNavLink(theme)} exact>
                        <Row
                            // needed for handling IE default svg style
                            style={{ alignItems: 'center' }}
                        >
                          <AnalysisIcon style={styles.iconPadding} />
                          <span className="header-hidden-sm">Analysis</span>
                          <Hidden>Analysis</Hidden>
                        </Row>
                      </AnalysisLink>
                    </li>
                  </React.Fragment>
              )}
              {features.navTabs.tabs.repository && (
                  <React.Fragment>
                    <li>
                      <RepositoryLink activeStyle={styles.activeNavLink(theme)} exact>
                        <DatabaseIcon style={styles.iconPadding} />
                        <span className="header-hidden-sm">Repository</span>
                        <Hidden>Repository</Hidden>
                      </RepositoryLink>
                    </li>
                  </React.Fragment>
              )}
            </ul>
        )}
        <ul className="nav navbar-nav navbar-right">
          {features.quickSearch && (
              <React.Fragment>
                <li>
                  <QuickSearch
                    isInSearchMode={isInSearchMode}
                    setIsInSearchMode={setIsInSearchMode}
                    tabIndex="0"
                    />
                </li>
              </React.Fragment>
          )}
          {!isInSearchMode && (
            <React.Fragment>
              {features.manageSets && (
                  <React.Fragment>
                    <li>
                      <ManageSetsLink activeStyle={styles.activeNavLink(theme)} />
                    </li>
                  </React.Fragment>
              )}
              {features.login && (user
                ? (
                  <li className="header-hidden-xs">
                    <UserDropdown />
                  </li>
                )
                : (
                  <li>
                    <LoginButton />
                  </li>
                ))
              }
              {features.cartLink && (
                  <React.Fragment>
              <li>
                <CartLink>
                  {count => (
                    <span>
                      <i
                        className="fa fa-shopping-cart"
                        style={styles.iconPadding}
                        />
                      <span
                        className="header-hidden-sm header-hidden-md"
                        style={styles.iconPadding}
                        >
                          Cart
                      </span>
                      <span className="label label-primary">
                        {count.toLocaleString()}
                      </span>
                    </span>
                  )}
                </CartLink>
              </li>
              </React.Fragment>)}
              {features.gdcApps && (
                  <React.Fragment>
              <li>
                <GDCAppsDropdown />
              </li>
                  </React.Fragment>
              )}
            </React.Fragment>
          )}
        </ul>
      </nav>
    </div>
  </header>
);

export default compose(
  setDisplayName('EnhancedHeader'),
  withState('isCollapsed', 'setIsCollapsed', true),
  withState('isInSearchMode', 'setIsInSearchMode', false),
  withRouter,
  connect(state => ({
    error: state.error,
    notifications: state.bannerNotification,
    user: state.auth.user,
  })),
  withHandlers({
    handleApiError: ({ dispatch }) => ({ status, user }) => {
      if (user && status === 401) {
        dispatch(removeNotification('LOGIN'));
        dispatch(setModal(<SessionExpiredModal />));
        dispatch(forceLogout());
      }
    },
  }),
  lifecycle({
    componentDidMount(): void {
      if (this.props.error) {
        this.props.handleApiError({
          ...this.props.error,
          user: this.props.user,
        });
      }
    },
    componentWillMount() {
      if (!this.props.user) {
        this.props.dispatch(removeNotification('LOGIN'));
      }
    },
    componentWillReceiveProps({
      error: nextError,
      user: nextUser,
    }: Object): void {
      const {
        error,
      } = this.props;
      if (nextError !== error) {
        this.props.handleApiError({
          ...nextError,
          user: nextUser,
        });
      }
    },
    shouldComponentUpdate({
      error: nextError,
      isCollapsed: nextIsCollapsed,
      isInSearchMode: nextIsInSearchMode,
      location: nextLocation,
      notifications: nextNotifications,
      user: nextUser,
    }) {
      const {
        error,
        isCollapsed,
        isInSearchMode,
        location,
        notifications,
        user,
      } = this.props;

      return !(
        nextError === error &&
        nextIsCollapsed === isCollapsed &&
        nextIsInSearchMode === isInSearchMode &&
        isEqual(nextNotifications, notifications) &&
        isEqual(nextLocation, location) &&
        nextUser === user
      );
    },
  }),
  withTheme,
  pure
)(Header);
