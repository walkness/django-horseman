import * as types from '../constants/ActionTypes';
import initialState from '../config/initialState';


export default function nodesReducer(state = initialState.nodes, action) {
  switch (action.type) {

    case types.NODES_CONFIGURATION: {
      const nodes = {};
      action.nodes.forEach(node => {
        nodes[node.node_type] = Object.assign({}, state[node.node_type], {
          configuration: node,
          num_nodes: node.num_nodes,
        });
        delete nodes[node.node_type].configuration.num_nodes;
      });
      return Object.assign({}, state, nodes);
    }

    default:
      return state;
  }
}
