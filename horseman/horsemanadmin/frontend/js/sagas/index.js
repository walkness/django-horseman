/* eslint no-constant-condition: ["error", { "checkLoops": false }]*/

import { call, put, take, fork } from 'redux-saga/effects';

import * as types from '../constants/ActionTypes';
import * as actions from '../actions';
import * as api from '../services/api';


function* callAPI(endpoint, action, args) {
  const { response, error, pagination } = yield call(endpoint, ...args);
  if (response) {
    yield put(action.success(...args, response, pagination));
  } else {
    yield put(action.failure(...args, error));
  }
}

function* watchNodesRequest() {
  while (true) {
    const { args } = yield take(types.NODES.REQUEST);
    yield fork(callAPI, api.getNodes, actions.nodes, [args]);
  }
}

function* watchNodeRequest() {
  while (true) {
    const { pk, args } = yield take(types.NODE.REQUEST);
    yield fork(callAPI, api.getNode, actions.node, [pk, args]);
  }
}

function* watchImagesRequest() {
  while (true) {
    const { args } = yield take(types.IMAGES.REQUEST);
    yield fork(callAPI, api.getImages, actions.images, [args]);
  }
}

export default function* rootSaga() {
  yield [
    watchNodesRequest(),
    watchNodeRequest(),
    watchImagesRequest(),
  ];
}
