/* eslint-disable import/prefer-default-export, max-len */

import * as types from '../constants/ActionTypes';

function action(type, payload = {}) {
  return { type, ...payload };
}

export const nodes = {
  request: (args) => action(types.NODES.REQUEST, { args }),
  success: (args, response) => action(types.NODES.SUCCESS, { args, response }),
  failure: (args, error) => action(types.NODES.FAILURE, { args, error }),
};

export const node = {
  request: (pk, args) => action(types.NODE.REQUEST, { pk, args }),
  success: (pk, args, response) => action(types.NODE.SUCCESS, { pk, args, response }),
  failure: (pk, args, error) => action(types.NODE.FAILURE, { pk, args, error }),
};

export const nodeUpdated = (data, nodeType) => action(types.NODE_UPDATED, { data, nodeType });

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
