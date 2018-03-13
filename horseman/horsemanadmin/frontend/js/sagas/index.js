/* eslint no-constant-condition: ["error", { "checkLoops": false }]*/

import { call, put, take, fork, all } from 'redux-saga/effects';

import * as types from 'constants/ActionTypes';
import * as actions from 'actions';
import * as api from 'services/api';


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

function* watchImageRenditionsRequest() {
  while (true) {
    const { id } = yield take(types.IMAGE_RENDITIONS.REQUEST);
    yield fork(callAPI, api.getImageRenditions, actions.imageRenditions, [id]);
  }
}

function* watchImageUsageRequest() {
  while (true) {
    const { id } = yield take(types.IMAGE_USAGE.REQUEST);
    yield fork(callAPI, api.getImageUsage, actions.imageUsage, [id]);
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

function* watchLogin() {
  while (true) {
    const { username, password } = yield take(types.LOGIN.REQUEST);
    yield fork(callAPI, api.login, actions.login, [username, password]);
  }
}

function* watchLogout() {
  while (true) {
    yield take(types.LOGOUT.REQUEST);
    yield fork(callAPI, api.logout, actions.logout, []);
  }
}

function* watchTimezonesRequest() {
  while (true) {
    yield take(types.TIMEZONES.REQUEST);
    yield fork(callAPI, api.getTimezones, actions.timezones, []);
  }
}

export default function* rootSaga() {
  yield all([
    watchNodesRequest(),
    watchNodeRequest(),
    watchNodeRevisionsRequest(),
    watchImagesRequest(),
    watchImageRequest(),
    watchImageRenditionsRequest(),
    watchImageUsageRequest(),
    watchUsersRequest(),
    watchUserRequest(),
    watchLogin(),
    watchLogout(),
    watchTimezonesRequest(),
  ]);
}
