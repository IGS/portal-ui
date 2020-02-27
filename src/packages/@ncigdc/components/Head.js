import React from 'react';
import { capitalize } from 'lodash';
import { Helmet } from 'react-helmet';

const Head = ({ title }) => (
  <Helmet>
    <meta
      content="A unique tool to foster important discoveries in Kidney Research"
      name="description"
      />
    <title>{capitalize(title) || 'KPMP Kidney Tissue Atlas'}</title>
    <link href="%PUBLIC_URL%/favicon.ico" rel="icon" />
  </Helmet>
);

export default Head;
