import * as types from '../constants/ActionTypes';
import initialState from '../config/initialState';


export default function usersReducer(state = initialState.users, action) {
  function processUsers(users) {
    const byId = {};
    const ids = users.map(user => {
      byId[user.pk] = Object.assign({}, state.byId[user.pk], user);
      return user.pk;
    });
    return { byId, ids };
  }

  function processNodes(nodes) {
    const byId = {};
    nodes.forEach((node) => {
      if (node.revision && node.revision.created_by && node.revision.created_by.pk) {
        const user = node.revision.created_by;
        byId[user.pk] = Object.assign(
          {}, state.byId[user.pk], byId[user.pk], processUsers([user]).byId[user.pk]);
      }
    });
    return byId;
  }

  switch (action.type) {

    case types.USERS.SUCCESS: {
      const { byId, ids } = processUsers(action.response.results);
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, byId),
        ordered: Object.assign({}, state.ordered, {
          default: ids,
        }),
      });
    }

    case types.USER.SUCCESS:
    case types.USER_UPDATED:
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, processUsers([action.response || action.data]).byId),
      });

    case types.NODE.SUCCESS:
    case types.NODES.SUCCESS:
    case types.NODE_CREATED:
    case types.NODE_UPDATED: {
      const nodes = (action.response && action.response.results) || action.response || action.data;
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, processNodes(Array.isArray(nodes) ? nodes : [nodes])),
      });
    }

    case types.NODE_REVISIONS.SUCCESS: {
      const byId = {};
      action.response.results.forEach((revision) => {
        if (revision.created_by && revision.created_by.pk) {
          const user = revision.created_by;
          byId[user.pk] = Object.assign({}, state.byId[user.pk], byId[user.pk], user);
        }
      });
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, byId),
      });
    }

    case types.LOGIN.SUCCESS:
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, processUsers([action.response]).byId),
        current: action.response.pk,
        isLoggedIn: true,
      });

    default:
      return state;
  }
}
