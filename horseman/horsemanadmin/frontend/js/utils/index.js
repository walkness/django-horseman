export const getNodeTypeFromURLComponents = (nodes, appLabel, modelName) => {
  return Object.keys(nodes).reduce((prev, curr) => {
    const node = nodes[curr];
    if (
      node.configuration &&
      node.configuration.app_label === appLabel &&
      node.configuration.model_name === modelName
    ) {
      return curr;
    }
    return prev;
  }, null);
};
