import { combineReducers } from 'redux';

import users from './UsersReducer';
import nodes from './NodesReducer';
import images from './ImagesReducer';

export default combineReducers({
  users,
  nodes,
  images,
});
