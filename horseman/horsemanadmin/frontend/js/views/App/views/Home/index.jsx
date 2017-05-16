import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import titleCase from 'title-case';
import Helmet from 'react-helmet';

import './styles.scss';


const Home = ({ nodes }) => {
  const sorted = Object.keys(nodes).map(type => nodes[type]);
  sorted.sort((a, b) => {
    const sortA = (a.configuration.app_admin_order * 10000) + a.configuration.admin_order;
    const sortB = (b.configuration.app_admin_order * 10000) + b.configuration.admin_order;
    if (sortA > sortB) return 1;
    if (sortA < sortB) return -1;
    return 0;
  });
  return (
    <main styleName='root'>

      <Helmet title='Dashboard' />

      <div styleName='node-overview'>

        { sorted.map(node => (
          <div key={node.configuration.node_type} styleName='node'>

            <Link to={node.configuration.admin_path} styleName='node-content'>

              <div styleName='count'>{node.num_nodes}</div>

              <h2 styleName='label'>{ titleCase(node.configuration.name_plural) }</h2>

            </Link>

            <Link
              to={`${node.configuration.admin_path}new/`}
              className='btn btn-primary'
              styleName='new'
            >
              Create new {node.configuration.name}
            </Link>

          </div>
        )) }

      </div>

    </main>
  );
};

Home.propTypes = {
  nodes: PropTypes.shape({
    [PropTypes.string]: PropTypes.shape({
      configuration: PropTypes.shape({
        node_type: PropTypes.string,
        admin_path: PropTypes.string,
        name_plural: PropTypes.string,
      }),
      num_nodes: PropTypes.number,
    }),
  }).isRequired,
};

const mapStateToProps = state => ({
  nodes: state.nodes,
});

export default connect(
  mapStateToProps, {
  })(Home);
