/* globals window document */

import 'react-hot-loader/patch';
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import { AppContainer } from 'react-hot-loader';

import 'normalize.css';
import '../scss/main.scss';

import defaultInitialState from './config/initialState';
import reducer from './reducers';
import usersReducer from './reducers/UsersReducer';
import nodesReducer from './reducers/NodesReducer';

import { LOGIN, NODES_CONFIGURATION } from './constants/ActionTypes';

import rootSaga from './sagas';

import Root from './Root';


const initData = window.__INIT__; // eslint-disable-line no-underscore-dangle
const initialState = JSON.parse(JSON.stringify(defaultInitialState));

const runAction = (action) => {
  initialState.users = usersReducer(initialState.users, action);
  initialState.nodes = nodesReducer(initialState.nodes, action);
};

if (initData.isLoggedIn && initData.currentUser) {
  runAction({ type: LOGIN.SUCCESS, response: initData.currentUser });
}

if (initData.nodes) {
  runAction({ type: NODES_CONFIGURATION, nodes: initData.nodes });
}

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  reducer,
  initialState,
  compose(
    applyMiddleware(sagaMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f,
  ),
);

store.close = () => store.dispatch(END);

if (module.hot) {
  module.hot.accept('./reducers', () => {
    const nextReducer = require('./reducers').default; // eslint-disable-line global-require

    store.replaceReducer(nextReducer);
  });
}

sagaMiddleware.run(rootSaga);

function runApp() {
  render(
    <AppContainer>
      <Root store={store} />
    </AppContainer>,
    document.getElementById('root'));

  if (module.hot) {
    module.hot.accept('./Root.jsx', () => {
      const NextRoot = require('./Root').default; // eslint-disable-line global-require

      render(
        <AppContainer>
          <NextRoot store={store} />
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
