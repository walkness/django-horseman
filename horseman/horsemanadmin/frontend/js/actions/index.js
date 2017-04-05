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

export const nodeRevisions = {
  request: (pk, args) => action(types.NODE_REVISIONS.REQUEST, { pk, args }),
  success: (pk, args, response) => action(types.NODE_REVISIONS.SUCCESS, { pk, args, response }),
  failure: (pk, args, error) => action(types.NODE_REVISIONS.FAILURE, { pk, args, error }),
};
export const nodeUpdated = (data, nodeType) => action(types.NODE_UPDATED, { data, nodeType });
export const nodeCreated = (data, nodeType) => action(types.NODE_CREATED, { data, nodeType });

export const images = {
  request: (args) => action(types.IMAGES.REQUEST, { args }),
  success: (args, response) => action(types.IMAGES.SUCCESS, { args, response }),
  failure: (args, error) => action(types.IMAGES.FAILURE, { args, error }),
};
export const image = {
  request: (id) => action(types.IMAGE.REQUEST, { id }),
  success: (id, response) => action(types.IMAGE.SUCCESS, { id, response }),
  failure: (id, error) => action(types.IMAGE.FAILURE, { id, error }),
};
export const imageRenditions = {
  request: (id) => action(types.IMAGE_RENDITIONS.REQUEST, { id }),
  success: (id, response) => action(types.IMAGE_RENDITIONS.SUCCESS, { id, response }),
  failure: (id, error) => action(types.IMAGE_RENDITIONS.FAILURE, { id, error }),
};
export const clearImageRenditions = id => action(types.CLEAR_IMAGE_RENDITIONS, { id });
export const imageUpdated = data => action(types.IMAGE_UPDATED, { data });
export const imageUploaded = data => action(types.IMAGE_UPLOADED, { data });

export const users = {
  request: (args) => action(types.USERS.REQUEST, { args }),
  success: (args, response) => action(types.USERS.SUCCESS, { args, response }),
  failure: (args, error) => action(types.USERS.FAILURE, { args, error }),
};
export const user = {
  request: (id) => action(types.USER.REQUEST, { id }),
  success: (id, response) => action(types.USER.SUCCESS, { id, response }),
  failure: (id, error) => action(types.USER.FAILURE, { id, error }),
};
export const userUpdated = data => action(types.USER_UPDATED, { data });

export const timezones = {
  request: () => action(types.TIMEZONES.REQUEST, {}),
  success: response => action(types.TIMEZONES.SUCCESS, { response }),
  failure: error => action(types.TIMEZONES.FAILURE, { error }),
};

export const login = {
  request: (username, password) => action(types.LOGIN.REQUEST, { username, password }),
  success: (username, password, response) => action(types.LOGIN.SUCCESS, { username, password, response }), // eslint-disable-line max-len
  failure: (username, password, error) => action(types.LOGIN.FAILURE, { username, password, error }),
};

export const logout = {
  request: () => action(types.LOGOUT.REQUEST, {}),
  success: response => action(types.LOGOUT.SUCCESS, { response }),
  failure: error => action(types.LOGOUT.FAILURE, { error }),
};
