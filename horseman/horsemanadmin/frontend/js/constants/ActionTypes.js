/* eslint-disable import/prefer-default-export */

export const REQUEST = 'REQUEST';
export const SUCCESS = 'SUCCESS';
export const FAILURE = 'FAILURE';

function createRequestTypes(base) {
  const res = {};
  [REQUEST, SUCCESS, FAILURE].forEach((type) => { res[type] = `${base}_${type}`; });
  return res;
}

export const NODES = createRequestTypes('NODES');
export const NODE = createRequestTypes('NODE');
export const NODE_UPDATED = 'NODE_UPDATED';

export const NODES_CONFIGURATION = 'NODES_CONFIGURATION';

export const IMAGES = createRequestTypes('IMAGES');
export const IMAGE_UPLOADED = 'IMAGE_UPLOADED';

export const LOGIN = createRequestTypes('LOGIN');
export const LOGOUT = createRequestTypes('LOGOUT');
