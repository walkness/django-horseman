import * as types from '../constants/ActionTypes';
import initialState from '../config/initialState';


export default function nodesReducer(state = initialState.nodes, action) {
  function processNodes(nodes, type) {
    const byId = {};
    const ids = nodes.map((node) => {
      byId[node.pk] = Object.assign(
        {},
        (state[type].byId && state[type].byId[node.pk]),
        node,
      );
      return node.pk;
    });
    return { byId, ids };
  }

  switch (action.type) {

    case types.NODE.SUCCESS:
    case types.NODES.SUCCESS: {
      if (action.args && action.args.type) {
        const nodes = action.response.results || [action.response];
        const { byId, ids } = processNodes(nodes, action.args.type);
        const updates = { byId };
        if (action.response.results) {
          const order = action.args.order || 'default';
          const ordered = Object.assign({}, state[action.args.type].ordered, {
            [order]: {
              ids,
              next: action.response.next,
              previous: action.response.previous,
            },
          });
          updates['ordered'] = ordered;
          updates['num_nodes'] = action.response.count;
        }
        return Object.assign({}, state, {
          [action.args.type]: Object.assign({}, state[action.args.type], updates),
        });
      }
      return state;
    }

    case types.NODE_UPDATED: {
      const { byId } = processNodes([action.data], action.nodeType);
      return Object.assign({}, state, {
        [action.nodeType]: Object.assign({}, state[action.nodeType], { byId }),
      });
    }

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
