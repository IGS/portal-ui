import React from 'react';
import { capitalize } from 'lodash';
import { Helmet } from 'react-helmet';

const Head = ({ title }) => (
  <Helmet>
    <meta
      content="A publicly available atlas with clinical, imaging, cellular, and molecular data used together to help define disease subgroups and identify cells, pathways, and targets for novel therapies"
      name="description"
      />
    <title>{capitalize(title) || 'KPMP Kidney Tissue Atlas'}</title>
    <link href="%PUBLIC_URL%/favicon.ico" rel="icon" />
  </Helmet>
);

export default Head;
