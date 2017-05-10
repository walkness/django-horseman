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

export const parseQueryString = (queryString) => {
  const assoc = {};
  const decode = s => decodeURIComponent(s.replace(/\+/g, ' '));
  const keyValues = queryString.split('&');

  keyValues.forEach((param) => {
    const keyValue = param.split('=');
    if (keyValue.length > 0) {
      const key = decode(keyValue[0]);
      if (key.length === 1) {
        assoc[key] = true;
      } else {
        assoc[key] = decode(keyValue[1]);
      }
    }
  });

  return assoc;
};


export const getPaginationParamsFromURI = (uri) => {
  const components = uri.split('?');
  if (components.length === 2) {
    const params = parseQueryString(components[1]);
    return { limit: parseInt(params.limit, 10), offset: parseInt(params.offset, 10) };
  }
  return { next: null, prev: null };
};


export const flattenErrors = (errors, fieldMessage = (fieldName, error) => `${fieldName}: ${error.message}`) => {
  if (errors.field_errors || errors.non_field_errors) {
    const fieldErrors = [];
    (Object.keys(errors.field_errors)).forEach((fieldName) => {
      errors.field_errors[fieldName].forEach((error) => {
        fieldErrors.push(Object.assign({}, error, {
          field: fieldName,
          message: fieldMessage(fieldName, error),
        }));
      });
    });
    return [...errors.non_field_errors, ...fieldErrors];
  }
  return [];
};
