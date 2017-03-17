/* globals window document */

import React, { PropTypes } from 'react';
import { Router, RouterContext, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';

import getRoutes from './config/routes';


const Root = ({ store }) => (
  <Provider store={store}>

    <IntlProvider
      locale='en'
      defaultFormats={{
        number: {
          fstop: {
            style: 'decimal',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          },
          iso: {
            style: 'decimal',
            useGrouping: false,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          },
          focalLength: {
            style: 'decimal',
            useGrouping: false,
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          },
          noDecimals: {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          },
        },
      }}
    >

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
