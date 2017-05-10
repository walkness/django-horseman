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
export const NODE_CREATED = 'NODE_CREATED';
export const NODE_REVISIONS = createRequestTypes('NODE_REVISIONS');

export const NODES_CONFIGURATION = 'NODES_CONFIGURATION';

export const COMMENTS_CONFIGURATION = 'COMMENTS_CONFIGURATION';

export const IMAGES = createRequestTypes('IMAGES');
export const IMAGE = createRequestTypes('IMAGE');
export const IMAGE_RENDITIONS = createRequestTypes('IMAGE_RENDITIONS');
export const IMAGE_USAGE = createRequestTypes('IMAGE_USAGE');
export const CLEAR_IMAGE_RENDITIONS = 'CLEAR_IMAGE_RENDITIONS';
export const IMAGE_UPDATED = 'IMAGE_UPDATED';
export const IMAGES_UPDATED = 'IMAGES_UPDATED';
export const IMAGE_UPLOADED = 'IMAGE_UPLOADED';

export const USERS = createRequestTypes('USERS');
export const USER = createRequestTypes('USER');
export const USER_UPDATED = 'USER_UPDATED';

export const TIMEZONES = createRequestTypes('TIMEZONES');

export const LOGIN = createRequestTypes('LOGIN');
export const LOGOUT = createRequestTypes('LOGOUT');

export const UPDATE_CONFIG = 'UPDATE_CONFIG';
