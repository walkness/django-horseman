/* eslint-disable import/prefer-default-export */
/* globals document fetch FormData */

import 'isomorphic-fetch';

const API_ROOT = '/api/v1/';

export const getCsrf = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split('; csrftoken=');
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};


function baseApi(fullUrl, request) {
  return fetch(fullUrl, request).then(response =>
      response.json().then(json => ({ json, response })).catch(ex => ({ ex, response })),
    ).then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json);
      }

      let pagination = {};
      const linkHeader = response.headers.get('link');
      if (linkHeader) {
        pagination = getPageFromLink(linkHeader);
      }
      const countHeader = response.headers.get('x-total-count');
      pagination.count = countHeader && parseInt(countHeader, 10);

      return { json, pagination };
    }).then(
      ({ json, pagination }) => ({ response: json, pagination }),
      error => ({ error: error || 'no error message' }),
    );
}

function callApi(endpoint) {
  const fullUrl = API_ROOT + endpoint;

  const request = {
    credentials: 'same-origin',
  };
  return baseApi(fullUrl, request);
}

function callUrl(fullUrl) {
  const request = {
    credentials: 'same-origin',
  };
  return baseApi(fullUrl, request);
}

export function sendApi(endpoint, method, data = {}) {
  const fullUrl = API_ROOT + endpoint;

  const request = {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrf(),
    },
    method,
    body: JSON.stringify(data),
  };
  return baseApi(fullUrl, request);
}

function uploadApi(endpoint, method, data) {
  const fullUrl = API_ROOT + endpoint;

  const request = {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-CSRFToken': getCsrf(),
    },
    method,
    body: data,
  };
  return baseApi(fullUrl, request);
}

const queryString = (_args, defaults) => {
  const args = Object.assign({}, defaults, _args);
  return Object.keys(args).map(key => `${key}=${args[key]}`).join('&');
};

export const getNodes = (args) => callApi(`nodes/?${queryString(args)}`);
export const getNode = (pk, args) => callApi(`nodes/${pk}/?${queryString(args)}`);
export const updateNode = (pk, data, args) => sendApi(`nodes/${pk}/?${queryString(args)}`, 'PATCH', data);
