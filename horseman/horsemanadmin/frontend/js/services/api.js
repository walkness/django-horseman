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

function xhrUploadApi(endpoint, data, method = 'POST', completion = () => {}, onProgress = () => {}) {
  const fullUrl = API_ROOT + endpoint;
  const xhr = new XMLHttpRequest();

  xhr.open(method, fullUrl, true);

  xhr.withCredentials = true;
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('X-CSRFToken', getCsrf());

  if (onProgress) {
    xhr.upload.onprogress = onProgress;
  }

  xhr.onload = function () {
    let response;
    let error;
    try {
      response = JSON.parse(this.response);
    } catch (e) {
      response = null;
      error = e;
    }

    if (this.status >= 400 || error) {
      completion({ error: error || response });
    } else {
      completion({ response, error: null });
    }
  };

  xhr.send(data);
}

const queryString = (_args, defaults) => {
  const args = Object.assign({}, defaults, _args);
  return Object.keys(args).map(key => `${key}=${args[key]}`).join('&');
};

export const getNodes = (args) => callApi(`nodes/?${queryString(args)}`);
export const getNode = (pk, args) => callApi(`nodes/${pk}/?${queryString(args)}`);
export const updateNode = (pk, data, args) => sendApi(`nodes/${pk}/?${queryString(args)}`, 'PATCH', data);

export const getImages = (args) => callApi(`images/?${queryString(args)}`);
export const getImage = (id) => callApi(`images/${id}/`);
export const updateImage = (id, data) => sendApi(`images/${id}/`, 'PATCH', data);
export const uploadImage = (data, completion, onProgress) => xhrUploadApi(
  'images/', data, 'POST', completion, onProgress);

export const getTimezones = () => callApi('timezones/');
