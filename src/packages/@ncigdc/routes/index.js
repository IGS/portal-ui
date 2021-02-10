import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Head from '@ncigdc/components/Head';
import NotFound from '@ncigdc/components/NotFound';
import LoadableWithLoading from '@ncigdc/components/LoadableWithLoading';

const RepositoryRoute = LoadableWithLoading({
  loader: () => import('@ncigdc/routes/RepositoryRoute'),
});

const Routes = () => (
  <span>
    <Route basename="/repository">
      {({ location: { pathname } }) => <Head title={pathname.split('/')[1]} />}
    </Route>
    <Switch> 
      <Route component={RepositoryRoute} path="/" />
      <Route component={NotFound} />
    </Switch>
  </span>
);

export default Routes;
