/* globals window document */

import React from 'react';
import PropTypes from 'prop-types';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';

import getRoutes from 'config/routes';


const Root = ({ store, adminBase }) => (
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
          noSeparator: {
            style: 'decimal',
            useGrouping: false,
          },
          noDecimals: {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          },
          oneDecimal: {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          },
        },
      }}
    >

      <Router
        history={browserHistory}
        routes={getRoutes(adminBase)}
      />

    </IntlProvider>

  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired,
  adminBase: PropTypes.string,
};

export default Root;
