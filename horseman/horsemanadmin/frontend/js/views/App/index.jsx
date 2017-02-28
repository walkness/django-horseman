import React from 'react';
import { connect } from 'react-redux';

import Sidebar from './components/Sidebar';

import styles from './styles.css';


const App = ({ children, ...props }) => (
  <div id='app' styleName='styles.app'>

    <main styleName='styles.main-wrapper'>
      <div styleName='styles.main'>
        { children }
      </div>
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
