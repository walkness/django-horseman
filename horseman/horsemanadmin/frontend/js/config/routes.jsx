import React from 'react';
import { IndexRoute, Route } from 'react-router';

import App from 'views/App';
import Home from 'Views/Home';
import NodeList from 'Views/Node/List';
import NodeEdit from 'Views/Node/Edit';
import Images from 'Views/Images';
import ImageLibrary from 'Views/Images/Library';
import ImageUpload from 'Views/Images/Upload';
import Image from 'Views/Images/Image';
import UserList from 'Views/Users/List';
import UserEdit from 'Views/Users/Edit';
import Login from 'Views/Login';

export default (adminBase) => (
  <Route path={adminBase} component={App}>
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
