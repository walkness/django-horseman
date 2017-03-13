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

function* watchNodeRevisionsRequest() {
  while (true) {
    const { pk, args } = yield take(types.NODE_REVISIONS.REQUEST);
    yield fork(callAPI, api.getNodeRevisions, actions.nodeRevisions, [pk, args]);
  }
}

function* watchImagesRequest() {
  while (true) {
    const { args } = yield take(types.IMAGES.REQUEST);
    yield fork(callAPI, api.getImages, actions.images, [args]);
  }
}

function* watchImageRequest() {
  while (true) {
    const { id } = yield take(types.IMAGE.REQUEST);
    yield fork(callAPI, api.getImage, actions.image, [id]);
  }
}

function* watchUsersRequest() {
  while (true) {
    const { args } = yield take(types.USERS.REQUEST);
    yield fork(callAPI, api.getUsers, actions.users, [args]);
  }
}

function* watchUserRequest() {
  while (true) {
    const { id } = yield take(types.USER.REQUEST);
    yield fork(callAPI, api.getUser, actions.user, [id]);
  }
}

function* watchTimezonesRequest() {
  while (true) {
    yield take(types.TIMEZONES.REQUEST);
    yield fork(callAPI, api.getTimezones, actions.timezones, []);
  }
}

export default function* rootSaga() {
  yield [
    watchNodesRequest(),
    watchNodeRequest(),
    watchNodeRevisionsRequest(),
    watchImagesRequest(),
    watchImageRequest(),
    watchUsersRequest(),
    watchUserRequest(),
    watchTimezonesRequest(),
  ];
}
