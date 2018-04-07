import { isEqual } from 'lodash';

import * as types from 'constants/ActionTypes';
import initialState from 'config/initialState';

import { getPaginationParamsFromURI } from '../utils';


export default function nodesReducer(state = initialState.nodes, action) {
  function processNodes(nodes, type, latestRevision = false, activeRevision = false) {
    const byId = {};
    const relatedNodesById = {};
    const ids = nodes.map((node) => {
      const revisionsById = {};
      const existingState = state[type].byId && state[type].byId[node.pk];

      function processRevision(revision, nodeAsRevision) {
        return Object.assign(
          {}, (
            existingState &&
            existingState.revisionsById &&
            existingState.revisionsById[node.revision.pk]
          ),
          revisionsById[revision.pk],
          nodeAsRevision, {
            revision: Object.assign(
              {}, (
                existingState &&
                existingState.revisionsById &&
                existingState.revisionsById[node.revision.pk] &&
                existingState.revisionsById[node.revision.pk].revision
              ),
              revision, {
                created_by: revision.created_by.pk || revision.created_by,
              },
            ),
          },
        );
      }

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

      if (node.revision) {
        revisionsById[node.revision.pk] = processRevision(node.revision, node);
      }
      if (node.latest_revision) {
        revisionsById[node.latest_revision.pk] = processRevision(node.latest_revision);
      }
      if (node.active_revision) {
        revisionsById[node.active_revision.pk] = processRevision(node.active_revision);
      }

      byId[node.pk] = Object.assign({}, existingState, !node.revision && node, {
        revisionsById: Object.assign(
          {}, existingState && existingState.revisionsById, revisionsById),
        latest_revision: (
          (node.latest_revision && (node.latest_revision.pk || node.latest_revision)) ||
          (latestRevision && node.revision && node.revision.pk) ||
          (existingState && existingState.latest_revision)
        ) || null,
        active_revision: (
          (node.active_revision && (node.active_revision.pk || node.active_revision)) ||
          (activeRevision && node.revision && node.revision.pk) ||
          (existingState && existingState.active_revision)
        ) || null,
      });
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
          const { next, previous } = action.response;
          let allIds = ids;
          let newNext = next && getPaginationParamsFromURI(next);
          let newPrevious = previous && getPaginationParamsFromURI(previous);
          const existingState = state[action.args.type].ordered;
          const existingStateOrder = existingState && existingState[order];
          const oldNext = existingStateOrder && existingStateOrder.next;
          const oldPrevious = existingStateOrder && existingStateOrder.next;
          if (
            oldNext && action.args.offset && oldNext.offset === action.args.offset &&
            existingStateOrder && existingStateOrder.ids
          ) {
            allIds = [...existingStateOrder.ids, ...ids];
          } else if (existingStateOrder && existingStateOrder.ids) {
            const existingSlice = existingStateOrder.ids.slice(
              action.args.offset || 0,
              ids.length,
            );
            if (isEqual(existingSlice, ids)) {
              allIds = existingStateOrder.ids.slice(0);
              newNext = oldNext;
              newPrevious = oldPrevious;
            }
          }
          const ordered = Object.assign({}, existingState, {
            [order]: {
              ids: allIds,
              next: newNext,
              previous: newPrevious,
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
      byId[action.data.pk].revisions = [
        ...(state[action.nodeType].byId[action.data.pk].revisions || []),
        action.data.revision.pk,
      ];
      byId[action.data.pk].latest_revision = action.data.revision.pk;
      if (action.data.revision.active) {
        byId[action.data.pk].active_revision = action.data.revision.pk;
        const revisionsById = byId[action.data.pk].revisionsById;
        Object.keys(revisionsById).forEach((id) => {
          if (revisionsById[id] && revisionsById[id].revision) {
            revisionsById[id].revision.active = id === action.data.revision.pk;
          }
        });
      }
      return Object.assign({}, state, {
        [action.nodeType]: Object.assign({}, state[action.nodeType], {
          byId: Object.assign({}, state[action.nodeType].byId, byId),
        }),
      });
    }

    case types.NODE_DELETED: {
      const byId = Object.assign({}, state[action.nodeType].byId);
      delete byId[action.nodeType];
      const ordered = Object.assign({}, state[action.nodeType].ordered);
      Object.keys(ordered).forEach((order) => {
        const index = ordered[order].ids.indexOf(action.pk);
        if (index !== -1) ordered[order].ids.splice(index, 1);
      });
      return Object.assign({}, state, {
        [action.nodeType]: Object.assign({}, state[action.nodeType], { byId, ordered }),
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
          existingNode && existingNode.revisionsById && existingNode.revisionsById[revision.pk], {
            revision: Object.assign({}, revision, {
              created_by: revision.created_by.pk || revision.created_by,
            }),
          },
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

    case types.IMAGE_USAGE.SUCCESS: {
      const byType = {};
      Object.keys(action.response).forEach((nodeType) => {
        const existingState = state[nodeType];
        const byId = {};
        const nodes = action.response[nodeType];
        nodes.forEach((node) => {
          byId[node.pk] = Object.assign(
            {}, existingState && existingState.byId && existingState.byId[node.pk], node);
        });
        byType[nodeType] = Object.assign({}, existingState, {
          byId: Object.assign({}, existingState && existingState.byId, byId),
        });
      });
      return Object.assign({}, state, byType);
    }

    default:
      return state;
  }
}
