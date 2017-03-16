import React from 'react';
import { IndexRoute, Route } from 'react-router';

import App from '../views/App';
import Home from '../views/App/views/Home';
import NodeList from '../views/App/views/Node/List';
import NodeEdit from '../views/App/views/Node/Edit';
import Images from '../views/App/views/Images';
import ImageLibrary from '../views/App/views/Images/Library';
import ImageUpload from '../views/App/views/Images/Upload';
import Image from '../views/App/views/Images/Image';
import UserList from '../views/App/views/Users/List';
import UserEdit from '../views/App/views/Users/Edit';
import Login from '../views/App/views/Login';

export default () => (
  <Route path='admin' component={App}>
    <IndexRoute component={Home} />

    <Route path='images' component={Images}>
      <IndexRoute component={ImageLibrary} />
      <Route path='upload' component={ImageUpload} />
      <Route path=':id' component={Image} />
    </Route>

    <Route path='users'>
      <IndexRoute component={UserList} />
      <Route path=':id' component={UserEdit} />
    </Route>

    <Route path='login' component={Login} unauthed />

    <Route path=':app'>
      <Route path=':model'>
        <IndexRoute component={NodeList} />
        <Route path='new' component={NodeEdit} />
        <Route path=':id' component={NodeEdit} />
      </Route>
    </Route>

  </Route>
);
