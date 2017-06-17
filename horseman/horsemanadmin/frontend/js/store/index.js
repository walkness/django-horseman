/* globals window */

import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';

import defaultInitialState from 'config/initialState';
import reducer from 'reducers';
import usersReducer from 'reducers/UsersReducer';
import nodesReducer from 'reducers/NodesReducer';
import commentsReducer from 'reducers/CommentsReducer';
import configReducer from 'reducers/ConfigReducer';

import { LOGIN, NODES_CONFIGURATION, COMMENTS_CONFIGURATION, UPDATE_CONFIG } from 'constants/ActionTypes';

import rootSaga from 'sagas';


const initData = window.__INIT__; // eslint-disable-line no-underscore-dangle
const initialState = JSON.parse(JSON.stringify(defaultInitialState));

const runAction = (action) => {
  initialState.users = usersReducer(initialState.users, action);
  initialState.nodes = nodesReducer(initialState.nodes, action);
  initialState.comments = commentsReducer(initialState.comments, action);
  initialState.config = configReducer(initialState.config, action);
};

if (initData.isLoggedIn && initData.currentUser) {
  runAction({ type: LOGIN.SUCCESS, response: initData.currentUser });
}

if (initData.nodes) {
  runAction({ type: NODES_CONFIGURATION, nodes: initData.nodes });
}

if (initData.comments) {
  runAction({ type: COMMENTS_CONFIGURATION, comments: initData.comments });
}

if (initData.config) {
  runAction({ type: UPDATE_CONFIG, updates: initData.config });
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
  module.hot.accept('../reducers', () => {
    const nextReducer = require('../reducers').default; // eslint-disable-line global-require

    store.replaceReducer(nextReducer);
  });
}

sagaMiddleware.run(rootSaga);

export default store;
