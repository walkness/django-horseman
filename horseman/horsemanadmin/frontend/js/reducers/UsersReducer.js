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
