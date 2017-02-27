import * as types from '../constants/ActionTypes';
import initialState from '../config/initialState';


export default function imagesReducer(state = initialState.nodes, action) {
  function processImages(images) {
    const byId = {};
    const ids = images.map((image) => {
      byId[image.pk] = Object.assign({}, state.byId[image.pk], image);
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
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, byId),
        ordered: Object.assign({}, state.ordered, {
          default: ids,
        }),
      });
    }

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
