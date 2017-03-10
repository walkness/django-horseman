import { combineReducers } from 'redux';

import users from './UsersReducer';
import nodes from './NodesReducer';
import comments from './CommentsReducer';
import images from './ImagesReducer';
import timezones from './TimezonesReducer';

export default combineReducers({
  users,
  nodes,
  comments,
  images,
  timezones,
});
