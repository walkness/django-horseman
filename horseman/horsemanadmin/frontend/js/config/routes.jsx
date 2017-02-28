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

export default () => (
  <Route path='admin' component={App}>
    <IndexRoute component={Home} />

    <Route path='images' component={Images}>
      <IndexRoute component={ImageLibrary} />
      <Route path='upload' component={ImageUpload} />
      <Route path=':id' component={Image} />
    </Route>

    <Route path=':app'>
      <Route path=':model'>
        <IndexRoute component={NodeList} />
        <Route path=':id' component={NodeEdit} />
      </Route>
    </Route>

  </Route>
);
