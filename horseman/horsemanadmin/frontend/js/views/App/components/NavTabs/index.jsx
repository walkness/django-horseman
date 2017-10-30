import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

const NavTabs = ({ children }) => (
  <nav styleName='root'>
    { children }
  </nav>
);

NavTabs.propTypes = {
  children: PropTypes.node,
};

export default NavTabs;
