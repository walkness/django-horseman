import React from 'react';
import { connect } from 'react-redux';


const Home = () => (
  <main className='home'>

  </main>
);

const mapStateToProps = state => ({
  nodes: state.nodes,
});

export default connect(
  mapStateToProps, {
  })(Home);
