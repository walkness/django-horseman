import * as types from '../constants/ActionTypes';
import initialState from '../config/initialState';


export default function usersReducer(state = initialState.users, action) {
  function processUsers(users) {
    const byId = {};
    users.forEach(user => {
      byId[user.pk] = Object.assign({}, state.byId[user.pk], user);
    });
    return byId;
  }

  switch (action.type) {

    case types.LOGIN.SUCCESS:
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, processUsers([action.response])),
        current: action.response.pk,
        isLoggedIn: true,
      });

    default:
      return state;
  }
}
