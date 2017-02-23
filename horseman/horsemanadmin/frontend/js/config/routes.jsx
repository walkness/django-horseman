import React from 'react';
import { IndexRoute, Route } from 'react-router';

import App from '../views/App';
import Home from '../views/App/views/Home';
import NodeList from '../views/App/views/Node/List';
import NodeEdit from '../views/App/views/Node/Edit';

export default () => (
  <Route path='admin' component={App}>
    <IndexRoute component={Home} />

    <Route path=':app'>
      <Route path=':model'>
        <IndexRoute component={NodeList} />
        <Route path=':id' component={NodeEdit} />
      </Route>
    </Route>

  </Route>
);
