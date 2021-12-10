/* @flow */

import '@ncigdc/theme/global.css';
import '@ncigdc/theme/kpmp-override.css';

import React from 'react';
import Relay from 'react-relay/classic';
import PortalContainer from '@ncigdc/components/PortalContainer';

const PortalQuery = {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Root {
        File { hits { total} }
      }
    `,
  },
};

const Portal = Relay.createContainer(PortalContainer, PortalQuery);

export default Portal;
