import * as types from 'constants/ActionTypes';
import initialState from 'config/initialState';


export default function timezonesReducer(state = initialState.timezones, action) {
  switch (action.type) {

    case types.TIMEZONES.SUCCESS:
      return action.response.slice(0);

    default:
      return state;
  }
}
