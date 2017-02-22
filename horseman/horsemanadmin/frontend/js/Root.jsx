/* globals window document */

import React, { PropTypes } from 'react';
import { Router, RouterContext, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';

import getRoutes from './config/routes';


const Root = ({ store }) => (
  <Provider store={store}>

    <IntlProvider locale='en'>

      <Router
        history={browserHistory}
        routes={getRoutes()}
      />

    </IntlProvider>

  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

export default Root;
