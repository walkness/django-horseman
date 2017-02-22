/* eslint-disable import/prefer-default-export, max-len */

import * as types from '../constants/ActionTypes';

function action(type, payload = {}) {
  return { type, ...payload };
}

export const login = {
  request: (email, password) => action(types.LOGIN.REQUEST, { email, password }),
  success: (email, password, response) => action(types.LOGIN.SUCCESS, { email, password, response }), // eslint-disable-line max-len
  failure: (email, password, error) => action(types.LOGIN.FAILURE, { email, password, error }),
};

export const logout = {
  request: () => action(types.LOGOUT.REQUEST, {}),
  success: response => action(types.LOGOUT.SUCCESS, { response }),
  failure: error => action(types.LOGOUT.FAILURE, { error }),
};
