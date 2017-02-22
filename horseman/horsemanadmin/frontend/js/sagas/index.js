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

export default function* rootSaga() {
  yield [
  ];
}
