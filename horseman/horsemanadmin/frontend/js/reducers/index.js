import { combineReducers } from 'redux';

import users from './UsersReducer';
import nodes from './NodesReducer';

export default combineReducers({
  users,
  nodes,
});
