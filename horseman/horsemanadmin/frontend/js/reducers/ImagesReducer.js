import * as types from '../constants/ActionTypes';
import initialState from '../config/initialState';

import { getPaginationParamsFromURI } from '../utils';
import { queryString } from '../services/api';


export default function imagesReducer(state = initialState.nodes, action) {
  function processImages(images) {
    const byId = {};
    const ids = images.map((image) => {
      const existingImage = state.byId[image.pk];
      byId[image.pk] = Object.assign({}, existingImage, image, {
        renditions: Object.assign({}, existingImage && existingImage.renditions, image.renditions),
      });
      return image.pk;
    });
    return { byId, ids };
  }

  function processNodes(nodes) {
    const byId = {};
    nodes.forEach((node) => {
      if (node.related_images) {
        Object.assign(byId, processImages(node.related_images).byId);
      }
    });
    return byId;
  }

  switch (action.type) {

    case types.NODE.SUCCESS:
    case types.NODES.SUCCESS:
      return Object.assign({}, state, {
        byId: Object.assign(
          {}, state.byId, processNodes(action.response.results || [action.response])),
      });

    case types.NODE_UPDATED:
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, processNodes([action.data])),
      });

    case types.IMAGES.SUCCESS: {
      const { byId, ids } = processImages(action.response.results);
      const orderArgs = Object.assign({}, action.args);
      delete orderArgs.limit;
      delete orderArgs.offset;
      const order = queryString(orderArgs) || 'default';
      const oldIds = ((state.ordered[order] && state.ordered[order].ids) || []).slice(0);
      let allIds = [...ids];
      if (
        (action.args && action.args.offset) ===
        (state.ordered[order] && state.ordered[order].next && state.ordered[order].next.offset)
      ) {
        allIds = [...oldIds, ...ids];
      }
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, byId),
        ordered: Object.assign({}, state.ordered, {
          [order]: {
            ids: allIds,
            next: action.response.next && getPaginationParamsFromURI(action.response.next),
            previous: action.response.previous && getPaginationParamsFromURI(
              action.response.previous),
          },
        }),
      });
    }

    case types.IMAGE.SUCCESS:
    case types.IMAGE_UPDATED:
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, processImages([action.response || action.data]).byId),
      });

    case types.IMAGE_UPLOADED: {
      const { byId, ids } = processImages([action.data]);
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, byId),
        ordered: Object.assign({}, state.ordered, {
          default: [...ids, ...((state.ordered && state.ordered.default) || [])],
        }),
      });
    }

    default:
      return state;
  }
}
