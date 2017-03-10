import * as types from '../constants/ActionTypes';
import initialState from '../config/initialState';


export default function commentsReducer(state = initialState.comments, action) {
  switch (action.type) {

    case types.COMMENTS_CONFIGURATION: {
      const comments = {};
      action.comments.forEach((comment) => {
        comments[comment.node_type] = Object.assign({}, state[comment.node_type], {
          configuration: comment,
          num_nodes: comment.num_nodes,
        });
        delete comments[comment.node_type].configuration.num_nodes;
      });
      return Object.assign({}, state, comments);
    }

    default:
      return state;
  }
}
