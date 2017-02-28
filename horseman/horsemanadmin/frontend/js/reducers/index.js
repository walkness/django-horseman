import { combineReducers } from 'redux';

import users from './UsersReducer';
import nodes from './NodesReducer';
import images from './ImagesReducer';
import timezones from './TimezonesReducer';

export default combineReducers({
  users,
  nodes,
  images,
  timezones,
});
