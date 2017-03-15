import { combineReducers } from 'redux';

import users from './UsersReducer';
import nodes from './NodesReducer';
import nodeRevisions from './NodeRevisionsReducer';
import comments from './CommentsReducer';
import images from './ImagesReducer';
import timezones from './TimezonesReducer';

export default combineReducers({
  users,
  nodes,
  nodeRevisions,
  comments,
  images,
  timezones,
});
