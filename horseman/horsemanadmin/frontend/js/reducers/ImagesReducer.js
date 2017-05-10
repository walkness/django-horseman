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
      delete orderArgs.search;
      const order = queryString(orderArgs) || 'default';
      const orderState = state.ordered[order];
      const orderUpdates = Object.assign({}, orderState);
      const next = action.response.next && getPaginationParamsFromURI(action.response.next);
      const previous = action.response.previous && getPaginationParamsFromURI(
        action.response.previous);

      const isNextPage = existing => (
          (action.args && action.args.offset) ===
          (existing && existing.next && existing.next.offset)
      );

      if (action.args && action.args.search) {
        const search = (orderState && orderState.search) || {};
        const oldIds = (
          (search[action.args.search] && search[action.args.search].ids) || []
        ).slice(0);
        if (!orderUpdates.search) orderUpdates.search = {};
        if (!orderUpdates.search[action.args.search]) {
          orderUpdates.search[action.args.search] = {};
        }
        orderUpdates.search[action.args.search].ids = [...ids];
        orderUpdates.search[action.args.search].next = next;
        orderUpdates.search[action.args.search].previous = previous;
        if (isNextPage(search[action.args.search])) {
          orderUpdates.search[action.args.search].ids = [...oldIds, ...ids];
        }
      } else {
        const oldIds = ((orderState && orderState.ids) || []).slice(0);
        orderUpdates.ids = [...ids];
        orderUpdates.next = next;
        orderUpdates.previous = previous;
        if (isNextPage(orderState)) {
          orderUpdates.ids = [...oldIds, ...ids];
        }
      }

      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, byId),
        ordered: Object.assign({}, state.ordered, {
          [order]: orderUpdates,
        }),
      });
    }

    case types.IMAGE.SUCCESS:
    case types.IMAGE_UPDATED:
    case types.IMAGES_UPDATED: {
      const images = action.response || action.data;
      return Object.assign({}, state, {
        byId: Object.assign(
          {}, state.byId, processImages(Array.isArray(images) ? images : [images]).byId),
      });
    }

    case types.CLEAR_IMAGE_RENDITIONS:
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, {
          [action.id]: Object.assign({}, state.byId[action.id], {
            renditions: {},
          }),
        }),
      });

    case types.IMAGE_RENDITIONS.SUCCESS: {
      const renditions = {};
      const existingImage = state.byId[action.id];
      action.response.results.forEach((rendition) => {
        renditions[rendition.pk] = Object.assign(
          {},
          existingImage && existingImage.renditions && existingImage.renditions[rendition.pk],
          rendition,
        );
      });
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, {
          [action.id]: Object.assign({}, existingImage, {
            renditions: Object.assign({}, existingImage && existingImage.renditions, renditions),
          }),
        }),
      });
    }

    case types.IMAGE_USAGE.SUCCESS: {
      const usage = {};
      Object.keys(action.response).forEach((nodeType) => {
        const nodes = action.response[nodeType];
        usage[nodeType] = nodes.map(node => node.pk);
      });
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, {
          [action.id]: Object.assign({}, state.byId[action.id], { usage }),
        }),
      });
    }

    case types.IMAGE_UPLOADED: {
      const { byId, ids } = processImages([action.data]);
      const ordered = {};
      Object.keys(state.ordered).forEach((filterStr) => {
        const filteredState = state.ordered[filterStr];
        let search;
        if (filteredState.search) {
          search = {};
          Object.keys(filteredState.search).map((searchStr) => {
            search[searchStr] = Object.assign({}, filteredState.search[searchStr], {
              needsUpdate: true,
            });
          });
        }
        ordered[filterStr] = Object.assign({}, filteredState, {
          needsUpdate: true,
        }, search && { search });
      });
      const getNode = (filterStr) => {
        const node = state.ordered[filterStr];
        return Object.assign({}, node, ordered[filterStr], { ids: [...ids, ...((node && node.ids) || [])] });
      };
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, byId),
        ordered: Object.assign({}, ordered, {
          default: getNode('default'),
        }),
      });
    }

    default:
      return state;
  }
}
