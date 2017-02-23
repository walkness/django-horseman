import React from 'react';
import { connect } from 'react-redux';

import Sidebar from './components/Sidebar';


const App = ({ children, ...props }) => (
  <div id='app'>

    <main>
      { children }
    </main>

    <Sidebar {...props} />

  </div>
);

const mapStateToProps = state => ({
  nodes: state.nodes,
});

export default connect(
  mapStateToProps, {
  })(App);
