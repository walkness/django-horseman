import './utils/publicPath'

/* globals window document */

import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import 'normalize.css';

import store from 'store';

import Root from './Root';


function runApp() {
  render(
    <AppContainer>
      <Root store={store} adminBase={store.getState().config.adminURLBase} />
    </AppContainer>,
    document.getElementById('root'));

  if (module.hot) {
    module.hot.accept('./Root.jsx', () => {
      const NextRoot = require('./Root').default; // eslint-disable-line global-require

      render(
        <AppContainer>
          <NextRoot store={store} adminBase={store.getState().config.adminURLBase} />
        </AppContainer>,
        document.getElementById('root'),
      );
    });

    console.error = (message) => { // eslint-disable-line no-console
      if (message && message.indexOf('You cannot change <Router routes>;') !== -1) {
        return;
      }
    };
  }
}

if (!global.Intl) {
  require.ensure([
    'intl',
    'intl/locale-data/jsonp/en.js',
  ], function (require) { // eslint-disable-line prefer-arrow-callback
    require('intl');
    require('intl/locale-data/jsonp/en');

    runApp();
  });
} else {
  runApp();
}
