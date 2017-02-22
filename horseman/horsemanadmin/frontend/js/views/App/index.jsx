import React from 'react';
import { connect } from 'react-redux';

import Sidebar from './components/Sidebar';


const App = ({ children, ...props }) => (
  <div className='app'>

    { children }

    <Sidebar {...props} />

  </div>
);

const mapStateToProps = state => ({
  nodes: state.nodes,
});

export default connect(
  mapStateToProps, {
  })(App);
