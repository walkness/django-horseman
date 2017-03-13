import * as types from '../constants/ActionTypes';
import initialState from '../config/initialState';


export default function nodesReducer(state = initialState.nodes, action) {
  function processNodes(nodes, type, latestRevision = false) {
    const byId = {};
    const relatedNodesById = {};
    const ids = nodes.map((node) => {
      Object.keys(node.related_nodes || {}).forEach((relatedNodeType) => {
        const relatedNodes = node.related_nodes[relatedNodeType];
        const processedNodes = processNodes(relatedNodes, relatedNodeType);

        if (relatedNodeType === type) {
          Object.assign(byId, processedNodes.byId);
        } else {
          if (!relatedNodesById[relatedNodeType]) relatedNodesById[relatedNodeType] = {};
          Object.assign(relatedNodesById[relatedNodeType], processedNodes.byId);
        }
      });

      const existingState = state[type].byId && state[type].byId[node.pk];
      if (node.revision) {
        byId[node.pk] = Object.assign({}, existingState, {
          revisionsById: Object.assign({}, existingState && existingState.revisionsById, {
            [node.revision.pk]: Object.assign(
              {},
              existingState && existingState.revisionsById && existingState.revisionsById[node.revision.pk],
              node,
            ),
          }),
        }, latestRevision && { latestRevision: node.revision.pk });
      } else {
        byId[node.pk] = Object.assign({}, existingState, node);
      }
      return node.pk;
    });
    return { byId, ids, relatedNodesById };
  }

  switch (action.type) {

    case types.NODE.SUCCESS:
    case types.NODES.SUCCESS: {
      if (action.args && action.args.type) {
        const nodes = action.response.results || [action.response];
        const { byId, ids, relatedNodesById } = processNodes(
          nodes, action.args.type, (action.args.revision === 'latest'));
        const updates = {
          byId: Object.assign({}, state[action.args.type].byId, byId),
        };
        const relatedUpdates = {};
        Object.keys(relatedNodesById).forEach((nodeType) => {
          relatedUpdates[nodeType] = Object.assign({}, state[nodeType], {
            byId: Object.assign(
              {}, state[nodeType] && state[nodeType].byId, relatedNodesById[nodeType]),
          });
        });
        if (action.response.results) {
          const order = action.args.order || 'default';
          const ordered = Object.assign({}, state[action.args.type].ordered, {
            [order]: {
              ids,
              next: action.response.next,
              previous: action.response.previous,
            },
          });
          updates.ordered = ordered;
          updates.num_nodes = action.response.count;
        }
        return Object.assign({}, state, relatedUpdates, {
          [action.args.type]: Object.assign({}, state[action.args.type], updates),
        });
      }
      return state;
    }

    case types.NODE_CREATED: {
      const { byId } = processNodes([action.data], action.nodeType, true);
      const existingState = state[action.nodeType];
      return Object.assign({}, state, {
        [action.nodeType]: Object.assign({}, existingState, {
          byId: Object.assign({}, existingState.byId, byId),
          ordered: Object.assign({}, existingState.ordered, {
            default: [action.data.pk, ...(existingState.ordered && existingState.ordered.default)],
          }),
        }),
      });
    }

    case types.NODE_UPDATED: {
      const { byId } = processNodes([action.data], action.nodeType, true);
      return Object.assign({}, state, {
        [action.nodeType]: Object.assign({}, state[action.nodeType], {
          byId: Object.assign({}, state[action.nodeType].byId, byId),
        }),
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

    case types.NODE_REVISIONS.SUCCESS: {
      const byId = {};
      const existingState = state[action.args.type];
      const existingNode = existingState && existingState.byId && existingState.byId[action.pk];
      const ids = action.response.results.map((revision) => {
        byId[revision.pk] = Object.assign(
          {},
          existingNode && existingNode.revisionsById && existingNode.revisionsById[revision.pk],
          { revision },
        );
        return revision.pk;
      });
      return Object.assign({}, state, {
        [action.args.type]: Object.assign({}, existingState, {
          byId: Object.assign({}, existingState && existingState.byId, {
            [action.pk]: Object.assign({}, existingNode, {
              revisions: ids,
              revisionsById: Object.assign({}, existingNode && existingNode.revisionsById, byId),
            }),
          }),
        }),
      });
    }

    default:
      return state;
  }
}
