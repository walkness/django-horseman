import React from 'react';
import { connect } from 'react-redux';
import titleCase from 'title-case';


const Home = ({ nodes }) => (
  <main className='home'>

    <div className='node-overview'>

      { Object.keys(nodes).map((nodeType) => {
        const node = nodes[nodeType];
        return (
          <div key={nodeType} className='node'>
            
            <div className='count'>{node.num_nodes}</div>

            <h2>{ titleCase(node.configuration.name_plural) }</h2>

          </div>
        );
      }) }

    </div>

  </main>
);

const mapStateToProps = state => ({
  nodes: state.nodes,
});

export default connect(
  mapStateToProps, {
  })(Home);
