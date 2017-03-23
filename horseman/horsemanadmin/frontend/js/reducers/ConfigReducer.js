import * as types from '../constants/ActionTypes';
import initialState from '../config/initialState';


export default function configReducer(state = initialState.config, action) {
  switch (action.type) {

    case types.UPDATE_CONFIG:
      return Object.assign({}, state, action.updates);

    default:
      return state;
  }
}
