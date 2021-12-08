// @flow

import React from 'react';
import Color from 'color';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withTheme } from '@ncigdc/theme';

const styles = {
  footer: theme => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 100,
    height: 'auto',
    backgroundColor: "#283C5E",
    borderTop: "6px solid #283C5E",
    borderBottom: 'none',
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'left',
  }),
  outerContainer: {
    fontSize: '85.714%',
    padding: '15px 0px 15px 15px',
    color: '#97abb6',
    textAlign: 'left',
  },
  innerContainer: {
    margin: '5px auto 0',
    textAlign: 'left',
  },
  link: {
    color: '#c2cfd5',
  },
};


export default compose(
  connect(state => state.versionInfo),
  withTheme,
)(
  ({
    theme,
    uiVersion,
    uiCommitHash,
    apiVersion,
    apiCommitHash,
    dataRelease,
  }) => (
  
      <div id='footer' className="fixed-bottom px-3 py-1">
          <a
            className="text-light small"
            href="https://kpmp.org"
            target="_blank"
            rel="noopener noreferrer">
              &copy; Kidney Precision Medicine Project</a>
        
      </div>

    
  ),
);
